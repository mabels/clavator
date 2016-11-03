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

#include <boost/algorithm/string/predicate.hpp>


#include <security/pam_appl.h>
#include <security/pam_modules.h>

#include <pwd.h>
#include <unistd.h>
#include <fcntl.h>

#include "optional_password.hpp"

#include "file_descriptor.hpp"
#include <dirent.h>

#include "during_exec.hpp"
#include "pipe_action.hpp"
#include "system_result.hpp"

namespace PamClavator {
//#include "run_as.hpp"

// #include <ipaddress/result.hpp>
//
// using ipaddress::Result;
// using ipaddress::Err;
// using ipaddress::Ok;

class SystemCmd {
private:
  const struct passwd *pwd;
  std::vector<std::string> args;
  std::vector<std::string> envs;
  std::vector<PipeAction> inPipes;
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

  SystemCmd &inPipe(const std::shared_ptr<Pipe> &pipe, const std::shared_ptr<FileDescriptor> &myFd, PipeAction::Action action) {
    inPipes.push_back(PipeAction(pipe, myFd, action));
    return *this;
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
  static void register_read(DuringExec &de, boost::asio::posix::stream_descriptor &ds,
                            std::array<char, N> &buf,
                            std::stringstream &output) {

    //LOG(ERROR) << "register_read:" << ds.native_handle();
    boost::asio::async_read(ds, boost::asio::buffer(buf.begin(), buf.size()), [&ds, &buf, &output, &de]
                  (boost::system::error_code ec, std::size_t bytes_transferred) {
                  // LOG(INFO) << "read:" << ec << ":" << bytes_transferred << std::endl;
                  LOG(DEBUG) << "Read(" << ec << ", " << bytes_transferred << ")[" << "..." << "]";
                  if (ec == boost::asio::error::eof || !ec) {
                    // std::string s(buf.begin(), bytes_transferred);
                    //std::cout << "Hello:" << bytes_transferred << ":" << s << std::endl;
                    output.write(&buf.front(), bytes_transferred);
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

  void closeFdsMother(const DuringExec &de) const {
    for (auto pa : de.pipeActions) {
      LOG(DEBUG) << pa.myFd->getFd();
      close(pa.myFd->getFd());
    }
  }

  void closeFdsChildren(const DuringExec &de, const char *errText = 0) const {
    if (errText) {
      std::cout << errText << std::flush;
      std::cerr << errText << std::flush;
    }
    for (auto pa : de.pipeActions) {
      // LOG(DEBUG) << pa.myFd->getFd();
      close(pa.childFd());
    }
  }

  void childExec(DuringExec &de, OptionalPassword &op) {
    op.destroy(); // wipe password from memory
    closeFdsMother(de);
    int ifd = 0;
    for (auto pa : de.pipeActions) {
      if (ifd < 3) { close(ifd); dup2(pa.childFd(), ifd); }
      ++ifd;
    }
    // de.pipeWriters.erase(de.pipeWriters.begin(), de.pipeWriters.end()); // remove the possible entrie points to written data
    if (setgid(pwd->pw_gid) < 0) {
      closeFdsChildren(de, "[exec setgid failed]");
      exit(42);
    }
    if (setuid(pwd->pw_uid) < 0) {
      closeFdsChildren(de, "[exec setuid failed]");
      exit(42);
    }
    if (seteuid(pwd->pw_uid) < 0) {
      closeFdsChildren(de, "[exec seteuid failed]");
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
      closeFdsChildren(de, "[exec failed]");
      exit(42);
    }
  }

  pid_t launch(DuringExec &de, OptionalPassword &op) {
      //signal(SIGCHLD, SIG_IGN);
      pid_t pid = fork();
      if (pid == 0) {
        childExec(de, op);
      } else {
        closeFdsChildren(de);
      }
      return pid;
  }

  static void handleSigChild(boost::asio::signal_set &sigchld, SystemResult &sr, DuringExec &de) {
    sigchld.async_wait([&sigchld, &sr, &de](const boost::system::error_code&, int) -> void {
      if (sr.waitPid > 0) {
        while (waitpid(sr.waitPid, &sr.statusCode, WNOHANG) > 0) {}
        if (WIFEXITED(sr.statusCode)) {
          // LOG(DEBUG) << "EXIT sigchld:" << sr.waitPid << ":" << sr.statusCode
          //    << ":" << WEXITSTATUS(sr.statusCode);
          sr.exitCode = WEXITSTATUS(sr.statusCode);
          de.handle_completed("signal");
        } else {
          // LOG(DEBUG) << "Restart sigchld:" << sr.waitPid << ":" << sr.statusCode;
          de.handle_completed("signal");
          //handleSigChild(sigchld, sr, de);
        }
      }
    });
  }

  SystemResult run(pam_handle_t *, OptionalPassword &op) {
    SystemResult sr;
    DuringExec de;
    boost::asio::signal_set sigchld(de.io_service, SIGCHLD);
    SystemCmd::handleSigChild(sigchld, sr, de);
    auto ostdoutPipe = Pipe::create();
    auto ostderrPipe = Pipe::create();
    if (ostdoutPipe == boost::none || ostderrPipe == boost::none) {
      LOG(ERROR) << "pipe creation error";
      sr.ok = false;
      return sr;
    }
    auto &stdoutPipe = *ostdoutPipe;
    auto &stderrPipe = *ostderrPipe;
    stderrPipe->getReadFd()->nonBlocking();
    stderrPipe->getReadFd()->nonBlocking();
    boost::asio::posix::stream_descriptor sdOut(de.io_service, stdoutPipe->getRead());
    boost::asio::posix::stream_descriptor sdErr(de.io_service, stderrPipe->getRead());
    std::array<char, 4096> soutArray;
    std::array<char, 4096> serrArray;
    register_read<4096>(de, sdOut, soutArray, sr.getSout());
    register_read<4096>(de, sdErr, serrArray, sr.getSerr());


    auto ostdinPipe = Pipe::create();
    if (ostdinPipe == boost::none) {
      LOG(ERROR) << "stdin pipe creation error";
      sr.ok = false;
      return sr;
    }
    auto &stdinPipe = *ostdinPipe;
    std::array<char, 4096> sinArray;
    auto sinStr = this->sin.str();
    PipeAction stdinAction(stdinPipe, stdinPipe->getWriteFd(),
     [sinStr, &sinArray](size_t ofs, const void **buf) {
      if (ofs < sinStr.size()) {
        std::copy(sinStr.begin()+ofs, sinStr.end(), sinArray.begin());
        *buf = &sinArray.front();
        return sinStr.size() - ofs;
      }
      *buf = 0;
      return 0ul;
    });
    de.inPipe(stdinAction);
    PipeAction stdoutAction(stdoutPipe, stdoutPipe->getWriteFd(),
      [](size_t, const void **) {return 0;});
    de.inPipe(stdoutAction);
    PipeAction stderrAction(stderrPipe, stderrPipe->getWriteFd(),
      [](size_t, const void **) {return 0;});
    de.inPipe(stderrAction);
    // write<4096>(de, ofs, sdIn, sinArray, this->sin);
    for (auto &i : this->inPipes) {
      de.inPipe(i);
    }
    sr.waitPid = launch(de, op);
    // output Writing is initiated after the process is forkt
    // to prefend that i have to clear the buffer(where the password is in)
    // after fork.
    de.startPipeActions();

    //LOG(ERROR) << "sdErr-Leave";
    // char buf[1000];
    // int len;
    // LOG(INFO) << "stdout:" << (len=read(stdoutPipe->getRead(), buf, sizeof(buf))) << std::endl;
    // LOG(INFO) << std::string(buf, len) << std::endl;
    // LOG(INFO) << "stdout:" << (len=read(stdoutPipe->getRead(), buf, sizeof(buf))) << std::endl;
    // LOG(INFO) << std::string(buf, len) << std::endl;
    // LOG(INFO) << "stderr:" << read(stderrPipe->getRead(), buf, sizeof(buf)) << std::endl;
    // LOG(INFO) << "enter run_one";
    de.io_service.run();
    //while (io_service.run_one()) {
    // LOG(INFO) << "loop run_one";
    //}
    //io_service.run();
    // sr.waitPid = waitpid(pid, &sr.statusCode, WEXITED);
    // sr.exitCode = WEXITSTATUS(sr.statusCode);
    //LOG(INFO) << " WIFEXITED(status):" << WIFEXITED(status) << std::endl;
    std::cout << sr.waitPid << ":" << sr.exitCode << "--" << sr.getSout().str() << "--" << sr.getSerr().str() << std::endl;
    sr.ok = !(sr.exitCode == 42 && sr.getSout().str() == sr.getSerr().str() &&
      boost::starts_with(sr.getSout().str(), "[exec ") &&
      boost::ends_with(sr.getSout().str(), "]"));
    sr.cmd = this->dump();
    //LOG(INFO) << sr.ok << ":" << dump();
    return sr;
  }
};
}

#endif
