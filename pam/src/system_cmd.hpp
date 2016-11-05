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
public:
  typedef const std::function<bool(const SystemResult &sr, const SystemCmd &sc)> RetryAction;
private:
  const struct passwd *pwd;
  std::vector<std::string> args;
  std::vector<std::string> envs;
  std::vector<PipeAction> toChildPipes;
  std::vector<PipeAction> fromMotherPipes;
  std::stringstream sin;
  const std::string exec;
  // boost::optional<int> status;
  std::vector<RetryAction> retryActions;
public:
  SystemCmd(const struct passwd *pwd, const std::string &cmd) : pwd(pwd), exec(cmd) {
    arg(exec);
  }
  SystemCmd(const struct passwd *pwd, const char *cmd) : pwd(pwd), exec(cmd) {
    arg(exec);
  }

  SystemCmd &checkRetry(RetryAction retry) {
    retryActions.push_back(retry);
    return *this;
  }

  SystemCmd &toChildPipe(const std::shared_ptr<Pipe> &pipe, const std::shared_ptr<FileDescriptor> &myFd,
    PipeAction::Action action) {
    toChildPipes.push_back(PipeAction(pipe, myFd, action));
    return *this;
  }
  SystemCmd &fromChildPipe(const std::shared_ptr<Pipe> &pipe, const std::shared_ptr<FileDescriptor> &myFd,
    PipeAction::Action action) {
    fromMotherPipes.push_back(PipeAction(pipe, myFd, action));
    return *this;
  }

  // boost::optional<int> getStatus() const {
  //   return status;
  // }

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

  std::string asString() const {
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
    // if (status) {
    //   ret << "=>" << *status;
    // }
    return ret.str();
  }

  void closeFdsMother(const DuringExec &de) const {
    for (auto pa : de.clientActions) {
      // LOG(DEBUG) << pa.myFd->getFd();
      close(pa.myFd->getFd());
    }
    for (auto pa : de.motherActions) {
      // LOG(DEBUG) << pa.myFd->getFd();
      close(pa.myFd->getFd());
    }
  }

  void closeTranslatedFdsChildren(const DuringExec &de, const char *errText = 0) const {
    if (errText) {
      std::cout << errText << std::flush;
      std::cerr << errText << std::flush;
    }
    for (auto pa : de.clientActions) {
      if (pa.translateFd >= 0) { close(pa.translateFd); }
      else { close(pa.childFd()); }
    }
    for (auto pa : de.motherActions) {
      if (pa.translateFd >= 0) { close(pa.translateFd); }
      else { close(pa.childFd()); }
    }
  }

  void childExec(DuringExec &de, OptionalPassword &op) {
    op.destroy(); // wipe password from memory
    for (auto pa : de.clientActions) {
      if (pa.translateFd >= 0) { close(pa.translateFd); dup2(pa.childFd(), pa.translateFd); }
    }
    for (auto pa : de.motherActions) {
      if (pa.translateFd >= 0) { close(pa.translateFd); dup2(pa.childFd(), pa.translateFd); }
    }
    closeFdsMother(de);
    // de.pipeWriters.erase(de.pipeWriters.begin(), de.pipeWriters.end()); // remove the possible entrie points to written data
    if (setgid(pwd->pw_gid) < 0) {
      closeTranslatedFdsChildren(de, "[exec setgid failed]");
      exit(42);
    }
    if (setuid(pwd->pw_uid) < 0) {
      closeTranslatedFdsChildren(de, "[exec setuid failed]");
      exit(42);
    }
    if (seteuid(pwd->pw_uid) < 0) {
      closeTranslatedFdsChildren(de, "[exec seteuid failed]");
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
      closeTranslatedFdsChildren(de, "[exec failed]");
      exit(42);
    }
  }

  pid_t launch(DuringExec &de, OptionalPassword &op) {
      //signal(SIGCHLD, SIG_IGN);
      pid_t pid = fork();
      if (pid == 0) {
        childExec(de, op);
      } else {
        for (auto pa : de.clientActions) {
          close(pa.childFd());
        }
        for (auto pa : de.motherActions) {
          close(pa.childFd());
        }
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

  SystemResult run(pam_handle_t *pamh, OptionalPassword &op, int retry = 0) {
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
    PipeAction stdoutAction(stdoutPipe, stdoutPipe->getReadFd(),
     [this, &sr](size_t len, const void **buf) -> size_t {
       sr.getSout().write(static_cast<const char *>(*buf), len);
       return len;
     }, 1);
    de.fromMotherPipe(stdoutAction);
    PipeAction stderrAction(stderrPipe, stderrPipe->getReadFd(),
     [this, &sr](size_t len, const void **buf) -> size_t {
       sr.getSerr().write(static_cast<const char *>(*buf), len);
       return len;
     }, 2);
    de.fromMotherPipe(stderrAction);
    // boost::asio::posix::stream_descriptor sdOut(de.io_service, stdoutPipe->getRead());
    // boost::asio::posix::stream_descriptor sdErr(de.io_service, stderrPipe->getRead());
    // std::array<char, 4096> soutArray;
    // std::array<char, 4096> serrArray;
    // register_read<4096>(de, sdOut, soutArray, sr.getSout());
    // register_read<4096>(de, sdErr, serrArray, sr.getSerr());
    auto ostdinPipe = Pipe::create();
    if (ostdinPipe == boost::none) {
      LOG(ERROR) << "stdin pipe creation error";
      sr.ok = false;
      return sr;
    }
    auto &stdinPipe = *ostdinPipe;
    std::array<char, 4096> sinArray;
    // auto sinStr = this->sin.str();
    PipeAction stdinAction(stdinPipe, stdinPipe->getWriteFd(),
     [this, &sinArray](size_t ofs, const void **buf) -> size_t {
      if (this->sin.eof()) {
        *buf = 0;
        return 0ul;
      }
      if (!this->sin.good()) {
        LOG(ERROR) << "stdin stream read error: ofs=" << ofs;
        *buf = 0;
        return 0ul;
      }
      this->sin.seekg(ofs, this->sin.beg);
      //char bufX[4096];
      this->sin.read(&(sinArray.front()), sinArray.size());
      //this->sin.read(*buf, sinArray.size());
      auto buflen = this->sin.gcount();
      // LOG(DEBUG) << "stdinAction:" << sinArray.size() << ":"
      //   << buflen << ":" << this->sin.str().size();
      *buf = &(sinArray.front());
      return buflen;
    }, 0);
    de.toChildPipe(stdinAction);
    // Close the writepipe for the read pipe in the Motherprocess
    // PipeAction stdoutAction(stdoutPipe, stdoutPipe->getWriteFd(),
    //   [](size_t, const void **) {return 0;});
    // de.inPipe(stdoutAction);
    // PipeAction stderrAction(stderrPipe, stderrPipe->getWriteFd(),
    //   [](size_t, const void **) {return 0;});
    // de.inPipe(stderrAction);
    // write<4096>(de, ofs, sdIn, sinArray, this->sin);
    for (auto &i : this->toChildPipes) {
      de.toChildPipe(i);
    }
    for (auto &i : this->fromMotherPipes) {
      de.fromMotherPipe(i);
    }
    de.startFromMotherPipeActions();
    sr.waitPid = launch(de, op);
    de.startToChildPipeActions();

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
    //std::cout << sr.waitPid << ":" << sr.exitCode << "--" << sr.getSout().str() << "--" << sr.getSerr().str() << std::endl;
    sr.ok = !(sr.exitCode == 42 && sr.getSout().str() == sr.getSerr().str() &&
      boost::starts_with(sr.getSout().str(), "[exec ") &&
      boost::ends_with(sr.getSout().str(), "]"));
    sr.cmdAsString = this->asString();
    if (retry == 0) {
      bool doRetry = false;
      for (auto rt : this->retryActions) {
        doRetry |= (rt)(sr, *this);
      }
      if (doRetry) {
        LOG(INFO) << "retrying command:" << sr.asString();
        return run(pamh, op, retry + 1);
      }
    }
    //LOG(INFO) << sr.ok << ":" << dump();
    return sr;
  }
};

}

#endif
