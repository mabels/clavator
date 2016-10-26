#ifndef __SystemCmd__
#define __SystemCmd__

#include <vector>
#include <string>
#include <sstream>
#include <algorithm>

#define ELPP_THREAD_SAFE
#include <easylogging++.h>

#include <unistd.h>
#include <sys/types.h>
#include <sys/wait.h>

// #include <boost/process/context.hpp>
#include <boost/optional.hpp>
#include <boost/asio.hpp>
#include <boost/asio/buffer.hpp>
#include <boost/asio/placeholders.hpp>
//#include <boost/process.hpp>
#include <boost/array.hpp>
#include <boost/bind.hpp>


#include <security/pam_appl.h>
#include <security/pam_modules.h>

#include <pwd.h>
#include <unistd.h>
#include <fcntl.h>

namespace PamClavator {
//#include "run_as.hpp"

// #include <ipaddress/result.hpp>
//
// using ipaddress::Result;
// using ipaddress::Err;
// using ipaddress::Ok;

class FileDescriptor {
  int fd;
public:
  int getFd() const { return fd; }
  FileDescriptor(int fd) : fd(fd) {}
  ~FileDescriptor() { close(fd); }
  void nonBlocking() const {
    int saved_flags = fcntl(this->fd, F_GETFL);
    fcntl(this->fd, F_SETFL, saved_flags & ~O_NONBLOCK);
  }
  bool operator==(const FileDescriptor& obj) const {
    return this->fd == obj.fd;
  }
};

class Pipe {
  std::shared_ptr<FileDescriptor> read;
  std::shared_ptr<FileDescriptor> write;
public:
  bool operator==(const Pipe& obj) const {
    return this->read == obj.read &&
           this->write == obj.write;
  }

  int getRead() const { return read->getFd(); }
  int getWrite() const { return write->getFd(); }
  static boost::optional<Pipe> create() {
    int pipeFds[2];
    if (pipe(pipeFds)) {
        return boost::none; //Err<Pipe>("Can't create the pipe");
    }
    Pipe ret;
    ret.read = std::shared_ptr<FileDescriptor>(new FileDescriptor(pipeFds[0]));
    ret.write = std::shared_ptr<FileDescriptor>(new FileDescriptor(pipeFds[1]));
    return ret;
  }
  void nonBlocking() const {
    read->nonBlocking();
    //read->nonBlocking();
  }
};

class DuringExec {
  public:
    std::atomic<ssize_t> completed{4};
    boost::asio::io_service io_service;
    void handle_completed(const char *tag) {
      --this->completed;
      LOG(INFO) << "handle_completed:" << this->completed << ":" << tag;
      if (this->completed <= 0) {
        this->io_service.stop();
      }
    }
};

class SystemResult {
  public:
  // gcc 4.8 is has a explict deleted constructor in std::stringstream
  std::shared_ptr<std::stringstream> _sout;
  std::shared_ptr<std::stringstream> _serr;
  std::string cmd;
  bool ok;
  int statusCode;
  int exitCode;
  int waitPid;
  SystemResult() : _sout(new std::stringstream()), _serr(new std::stringstream()),
    ok(false), statusCode(-1), exitCode(-1), waitPid(-1) {}
  std::stringstream& getSout() { return *_sout; }
  const std::stringstream& getSout() const  { return *_sout; }
  std::stringstream& getSerr() { return *_serr; }
  const std::stringstream& getSerr() const { return *_serr; }
  static SystemResult err() {
    SystemResult ret;
    ret.ok = false;
    return ret;
  }
};

class SystemCmd {
private:
  const struct passwd *pwd;
  std::vector<std::string> args;
  std::vector<std::string> envs;
  std::stringstream sin;
  const std::string exec;
  boost::optional<int> status;
public:
  SystemCmd(const struct passwd *pwd, const std::string &cmd) : pwd(pwd), exec(cmd) {
      arg(exec);
  }
  SystemCmd(const struct passwd *pwd, const char *cmd) : pwd(pwd), exec(cmd) {
      arg(exec);
  }

  boost::optional<int> getStatus() {
    return status;
  }

  SystemCmd &env(const char *key, const char *value)  {
    std::string kv(key);
    kv += "=";
    kv += value;
    envs.push_back(kv);
    return *this;
  }

  template<typename Y>
  SystemCmd &arg(Y part) { args.push_back(std::to_string(part)); return *this; }
  SystemCmd &arg(const char *part) { args.push_back(part); return *this; }
  SystemCmd &arg(const std::string &part) { args.push_back(part); return *this;}

  SystemCmd &pushSin(const char *part) { sin << part ; return *this; } 
  SystemCmd &pushSin(const std::string &part) { sin << part ; return *this; } 

  std::string dump() const {
    std::stringstream ret;
    const char *space = "";
    for (auto &v : envs) {
        ret << space << v;
        space = " ";
    }
    ret << space << exec;
    space = " ";
    bool first = true;
    for (auto &v : args) {
      if (!first) {
        ret << space << v;
        space = " ";
      }
      first = false;
    }
    if (status) {
      ret << "=>" << *status;
    }
    return ret.str();
  }


  template<std::size_t N>
  static void write_stdin(DuringExec &de, size_t &ofs, boost::asio::posix::stream_descriptor &ds, std::array<char, N> &buf, std::stringstream &sin) {
    auto data_str = sin.str();
    auto data_len = data_str.length();
    if (data_len <= 0) { 
      LOG(ERROR) << "no stdin closing:" << ds.native_handle();
      ds.close(); 
      de.handle_completed("stdin");
      return; 
    }
    //LOG(ERROR) << "write_stdin:" << data_str;
    std::function<void(size_t &)> writer = [&writer, &buf, &sin, data_len, &ds, &de](size_t &ofs) {
      size_t wlen = std::min(data_len, buf.size());
      auto di = buf.begin();
      auto sinStr = sin.str();
      auto si = sinStr.begin()+ofs;
      std::string sbuf;
      for (size_t i = 0; i < wlen; ++i) {
         sbuf += *si;
         LOG(ERROR) << "[" << sbuf << "][" << *si << "][" << sinStr << "]";
         *di++ = *si++; 
      }
      LOG(ERROR) << "async_write setup:[" << sbuf << "]:" << wlen << ":" << ofs << ":" << data_len << ":ds=" << ds.native_handle();
      boost::asio::write(ds, boost::asio::buffer(buf.begin(), wlen),
                            [writer, &ofs, &sin, wlen, data_len, &ds, &de](boost::system::error_code &ec, std::size_t bytes_transferred) -> bool {
                              if (ec) {
                                LOG(ERROR) << "async_write failed:" << ec;
                                ds.close();
                                de.handle_completed("stdin");
                                return false;
                              } else {
                                if (bytes_transferred != wlen) {
                                  LOG(ERROR) << "async_write incomplete:" << bytes_transferred << ":" << wlen << ":" 
                                     << ofs << ":" << data_len;
                                  return false;
                                }
                                LOG(ERROR) << "async_write ok:" << bytes_transferred << ":" << wlen << ":" 
                                     << ofs << ":" << data_len;
                                ofs += bytes_transferred;
                                if (ofs < data_len) {
                                  LOG(ERROR) << "next loop";
                                  (writer)(ofs);
                                  return true;
                                } else {
                                  LOG(ERROR) << "close stdin:" << ds.native_handle() << ":[" << sin.str() << "]";
                                  //close(ds.native_handle());
                                  //ds.release();
                                  ds.close(); 
                                  de.handle_completed("stdin");
                                  return true;
                                }
                              }
                            });
    };
    (writer)(ofs);
  }


  template<std::size_t N>
  static void register_read(DuringExec &de, boost::asio::posix::stream_descriptor &ds,
                            std::array<char, N> &buf,
                            std::stringstream &output) {

        //LOG(ERROR) << "register_read:" << ds.native_handle();
        boost::asio::async_read(ds, boost::asio::buffer(buf.begin(), buf.size()), [&ds, &buf, &output, &de]
                      (boost::system::error_code ec, std::size_t bytes_transferred) {
                      // LOG(INFO) << "read:" << ec << ":" << bytes_transferred << std::endl;
                      if (ec == boost::asio::error::eof || !ec) {
                        std::string s(buf.begin(), bytes_transferred);
                        //std::cout << "Hello:" << bytes_transferred << ":" << s << std::endl;
                        LOG(ERROR) << "Read(" << bytes_transferred << ")[" << s << "]";
                        output << s;
                        if (!ec) {
                          register_read(de, ds, buf, output);
                        } else {
                          de.handle_completed("std...");
                        }
                      } else if (ec) {
                        LOG(ERROR) << "register_read failed:" << ec << ":" << bytes_transferred;
                        de.handle_completed("std...");
                        return;
                      }
                    });
  }

  pid_t launch(int stdIn, int stdOut, int stdErr) const {
      //signal(SIGCHLD, SIG_IGN);
      pid_t pid = fork();
      if (pid == 0) {
        // PAM_MODUTIL_DEF_PRIVS(privs);
        // int ret = pam_modutil_drop_priv(pamh, &privs, pwd);
        close(0); dup2(stdIn, 0);
        close(1); dup2(stdOut, 1);
        close(2); dup2(stdErr, 2);
        for (int i = 3; i < 1000; ++i) {
          close(i);
        }
        //close(stdIn);
        //close(stdOut);
        //close(stdErr);
        if (setuid(pwd->pw_uid) < 0) {
          std::cout << "[exec setuid failed]" << std::flush;
          std::cerr << "[exec setuid failed]" << std::flush;
          close(0);
          close(1);
          close(2);
          exit(42);
        }
        if (seteuid(pwd->pw_uid) < 0) {
          std::cout << "[exec seteuid failed]" << std::flush;
          std::cerr << "[exec seteuid failed]" << std::flush;
          close(0);
          close(1);
          close(2);
          exit(42);
        }
        char *argv[args.size()+1];
        argv[args.size()] = 0;
        for (size_t i = 0; i < args.size(); ++i) {
            argv[i] = (char *)args[i].c_str();
        }
        char *envp[envs.size()+1];
        envp[envs.size()] = 0;
        for (size_t i = 0; i < envs.size(); ++i) {
            envp[i] = (char *)envs[i].c_str();
        }
        if (execve(exec.c_str(), argv, envp) == -1) {
          // ACHTUNG HACK
          std::cout << "[exec failed]" << std::flush;
          std::cerr << "[exec failed]" << std::flush;
          close(0);
          close(1);
          close(2);
          //sleep(333);
          exit(42);
        }
      } else {
        LOG(INFO) << "master closing:"<<stdIn<<":"<<stdOut<<":"<<stdErr;
        close(stdIn);
        close(stdOut);
        close(stdErr);
      }
      return pid;
  }

  static void handleSigChild(boost::asio::signal_set &sigchld, SystemResult &sr, DuringExec &de) {
    sigchld.async_wait([&sigchld, &sr, &de](const boost::system::error_code&, int) -> void {
      if (sr.waitPid > 0) {
        while (waitpid(sr.waitPid, &sr.statusCode, WNOHANG) > 0) {}
        if (WIFEXITED(sr.statusCode)) {
          LOG(INFO) << "EXIT sigchld:" << sr.waitPid << ":" << sr.statusCode
             << ":" << WEXITSTATUS(sr.statusCode);
          sr.exitCode = WEXITSTATUS(sr.statusCode);
          de.handle_completed("signal");
        } else {
          LOG(INFO) << "Restart sigchld:" << sr.waitPid << ":" << sr.statusCode;
          de.handle_completed("signal");
          //handleSigChild(sigchld, sr, de);
        }
      }
    });
  }

  SystemResult run(pam_handle_t *) {
    SystemResult sr;
    DuringExec de;
    auto stdinPipe = Pipe::create();
    auto stdoutPipe = Pipe::create();
    auto stderrPipe = Pipe::create();
    if (stdoutPipe == boost::none || stderrPipe == boost::none || stdinPipe == boost::none) {
          sr.ok = false;
          return sr;
    }
    boost::asio::signal_set sigchld(de.io_service, SIGCHLD);
    SystemCmd::handleSigChild(sigchld, sr, de);
    stdinPipe->nonBlocking();
    stdoutPipe->nonBlocking();
    stderrPipe->nonBlocking();
    boost::asio::posix::stream_descriptor sdIn(de.io_service, stdinPipe->getWrite());
    boost::asio::posix::stream_descriptor sdOut(de.io_service, stdoutPipe->getRead());
    boost::asio::posix::stream_descriptor sdErr(de.io_service, stderrPipe->getRead());
    std::array<char, 4096> soutArray;
    std::array<char, 4096> serrArray;
    //LOG(ERROR) << "sdOut-Enter";
    register_read<4096>(de, sdOut, soutArray, sr.getSout());
    //LOG(ERROR) << "sdOut-Leave";
    //LOG(ERROR) << "sdErr-Enter";
    register_read<4096>(de, sdErr, serrArray, sr.getSerr());
    size_t ofs = 0;
    std::array<char, 4096> sinArray;
    write_stdin<4096>(de, ofs, sdIn, sinArray, this->sin);

    sr.waitPid = launch(stdinPipe->getRead(), stdoutPipe->getWrite(), stderrPipe->getWrite());
    //LOG(ERROR) << "sdErr-Leave";
    // char buf[1000];
    // int len;
    // LOG(INFO) << "stdout:" << (len=read(stdoutPipe->getRead(), buf, sizeof(buf))) << std::endl;
    // LOG(INFO) << std::string(buf, len) << std::endl;
    // LOG(INFO) << "stdout:" << (len=read(stdoutPipe->getRead(), buf, sizeof(buf))) << std::endl;
    // LOG(INFO) << std::string(buf, len) << std::endl;
    // LOG(INFO) << "stderr:" << read(stderrPipe->getRead(), buf, sizeof(buf)) << std::endl;
    LOG(INFO) << "enter run_one";    
    de.io_service.run();
    //while (io_service.run_one()) {
    LOG(INFO) << "loop run_one";    
    //}
    //io_service.run();
    // sr.waitPid = waitpid(pid, &sr.statusCode, WEXITED);
    // sr.exitCode = WEXITSTATUS(sr.statusCode);
    //LOG(INFO) << " WIFEXITED(status):" << WIFEXITED(status) << std::endl;
    //std::cout << sr.waitPid << ":" << sr.exitCode << "--" << sr.sout.str() << "--" << sr.serr.str() << std::endl;
    sr.ok = !(sr.exitCode == 42 && sr.getSout().str() == sr.getSerr().str() && sr.getSout().str() == "[exec failed]");
    sr.cmd = this->dump();
    //LOG(INFO) << sr.ok << ":" << dump();
    return sr;
  }
};
}

#endif
