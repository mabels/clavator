#include <chrono>

#include <cascara/cascara.hpp>
using namespace cascara;

#include "../src/system_cmd.hpp"


#ifdef __APPLE_CC__
#define EXEC_TRUE "/usr/bin/true"
#define EXEC_FALSE "/usr/bin/false"
#define EXEC_ECHO "/bin/echo"
#define EXEC_SLEEP "/bin/sleep"
#define EXEC_GREP "/usr/bin/grep"
#define EXEC_CAT "/bin/cat"
#define EXEC_BASH "/bin/bash"
#else
#define EXEC_TRUE "/bin/true"
#define EXEC_FALSE "/bin/false"
#define EXEC_ECHO "/bin/echo"
#define EXEC_SLEEP "/bin/sleep"
#define EXEC_GREP "/bin/grep"
#define EXEC_CAT "/bin/cat"
#define EXEC_BASH "/bin/bash"
#endif

#include <easylogging++.h>
INITIALIZE_EASYLOGGINGPP


void dump(sigset_t signal_set) {
  for (int i = 0; i < 32; ++i) {
    if (sigismember(&signal_set, i)) {
      std::cout << "1";
    } else {
      std::cout << "0";
    }
  }
  std::cout << "|" << sizeof(sigset_t) << std::endl;
}

int main() {
  sigset_t signal_set;
  sigemptyset(&signal_set);
  sigaddset(&signal_set, SIGCHLD);
  sigprocmask(SIG_BLOCK, &signal_set, NULL);

  describe("SystemCmd", [signal_set]() {
    auto pwd = getpwnam(std::getenv("USER"));
    // it("simple echo", []() {
    //     assert.equal(0, SystemCmd("/bin/sleep").arg("60").run().exitCode);
    // });
    it("not launched", [&pwd]() {
      OptionalPassword op;
        assert.isFalse(PamClavator::SystemCmd(pwd, "WTF", "/bin/launchctl").run(0, op).ok);
    });
    it("syncron sleep", [&pwd]() {
      OptionalPassword op;
      auto start = std::chrono::high_resolution_clock::now(); //measure time starting here
      assert.isTrue(PamClavator::SystemCmd(pwd, EXEC_SLEEP, "/bin/launchctl").arg("1").run(0, op).ok, "sleep should be ok");
      auto end = std::chrono::high_resolution_clock::now(); //end measurement here
      auto elapsed = end - start;

      assert.isTrue(std::chrono::microseconds{1000000} <= elapsed, "time is not ok");
    });
    it("launched", [&pwd]() {
      OptionalPassword op;
        assert.isTrue(PamClavator::SystemCmd(pwd, EXEC_TRUE, "/bin/launchctl").run(0, op).ok);
    });
    it("return ok", [&pwd]() {
      OptionalPassword op;
        assert.equal(0, PamClavator::SystemCmd(pwd, EXEC_TRUE, "/bin/launchctl").run(0, op).exitCode);
    });
    it("return false", [&pwd]() {
      OptionalPassword op;
        assert.equal(1, PamClavator::SystemCmd(pwd, EXEC_FALSE, "/bin/launchctl").run(0, op).exitCode);
    });
    it("stdout empty", [&pwd]() {
      OptionalPassword op;
        assert.isTrue(PamClavator::SystemCmd(pwd, EXEC_TRUE, "/bin/launchctl").run(0, op).getSout().str().empty());
    });
    it("stderr empty", [&pwd]() {
      OptionalPassword op;
        assert.isTrue(PamClavator::SystemCmd(pwd, EXEC_TRUE, "/bin/launchctl").run(0, op).getSerr().str().empty());
    });

    it("stdout hello world", [&pwd]() {
      OptionalPassword op;
        assert.equal(PamClavator::SystemCmd(pwd, EXEC_ECHO, "/bin/launchctl").arg("hello world").run(0, op).getSout().str(), "hello world\n");
        assert.equal(PamClavator::SystemCmd(pwd, EXEC_ECHO, "/bin/launchctl").arg("hello world").run(0, op).getSerr().str(), "");
    });
    it("stderr output", [&pwd]() {
      OptionalPassword op;
        assert.isTrue(PamClavator::SystemCmd(pwd, EXEC_GREP, "/bin/launchctl").arg("---Fehler").run(0, op).getSout().str().empty());
        assert.isFalse(PamClavator::SystemCmd(pwd, EXEC_GREP, "/bin/launchctl").arg("---Fehler").run(0, op).getSerr().str().empty());
    });


    it("fd to stdout", [&pwd]() {
      OptionalPassword op;
      for (auto sendSize = 0; sendSize < 1000000; sendSize += 1024) {
        std::stringstream sout;
        std::stringstream spattern;
        spattern << sendSize << ":";
        auto pattern = spattern.str();
        for (auto fill = 0; fill < sendSize; fill += pattern.size()) {
          sout << pattern;
        }
        std::string out = sout.str();
        const char *cout = out.c_str();
        auto oPipe = Pipe::create();
        auto &pipe = *oPipe;
        PamClavator::SystemCmd bash(pwd, EXEC_BASH, "/bin/launchctl");
        bash.toChildPipe(pipe, pipe->getWriteFd(), [cout, &out](size_t ofs, const void **buf) -> size_t {
          if (ofs >= out.size()) {
            *buf = 0;
            return 0ul;
          }
          *buf = cout + ofs;
          // std::cout << ofs << ":" << out.size() << ":" << buf;
          return out.size() - ofs;
        });
        std::stringstream fdRedirect;
        fdRedirect << EXEC_CAT << " <&" << pipe->getReadFd()->asString();
        assert.equal(bash.arg("-c").arg(fdRedirect.str()).run(0, op).getSout().str(), out);
      }
    });

    it("stdin to stdout", [&pwd]() {
      OptionalPassword op;
      // std::cout << "-1-" << std::endl;
      for (size_t sendSize = 0; sendSize < 1000000; sendSize += 1024) {
        std::stringstream sout;
        std::stringstream spattern;
        spattern << sendSize << ":";
        // std::cout << "-2-" << sendSize << std::endl;
        auto pattern = spattern.str();
        for (auto fill = pattern.size(); fill < sendSize; fill += pattern.size()) {
          sout << pattern;
        }
        std::string out = sout.str();
        // std::cout << "-2.1-" << sendSize << ":" << out.size()+pattern.size() << std::endl;
        assert.equal(sendSize <= out.size()+pattern.size(), true, "Size Missmatch");
        assert.equal(PamClavator::SystemCmd(pwd, EXEC_CAT, "/bin/launchctl").pushSin(out).run(0, op).getSout().str(), out);
      }
    });
    //
    it("stdin to stdout", [signal_set]() {
      sigset_t signal_current;
      sigemptyset(&signal_current);
      sigprocmask(SIG_BLOCK, &signal_current, &signal_current);
      dump(signal_set);
      dump(signal_current);
      assert.equal(memcmp(
	static_cast<const void*>(&signal_current),
	static_cast<const void*>(&signal_set),
	sizeof(signal_current)), 0, "signal still block");
    });

  });
  exit();
}
