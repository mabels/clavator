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

int main() {
  describe("SystemCmd", []() {
    auto pwd = getpwnam(std::getenv("USER"));
    // it("simple echo", []() {
    //     assert.equal(0, SystemCmd("/bin/sleep").arg("60").run().exitCode);
    // });
    it("not launched", [&pwd]() {
      OptionalPassword op;
        assert.isFalse(PamClavator::SystemCmd(pwd, "WTF").run(0, op).ok);
    });
    it("syncron sleep", [&pwd]() {
      OptionalPassword op;
      auto start = std::chrono::high_resolution_clock::now(); //measure time starting here
      assert.isTrue(PamClavator::SystemCmd(pwd, EXEC_SLEEP).arg("1").run(0, op).ok, "sleep should be ok");
      auto end = std::chrono::high_resolution_clock::now(); //end measurement here
      auto elapsed = end - start;

      assert.isTrue(std::chrono::microseconds{1000000} <= elapsed, "time is not ok");
    });
    it("launched", [&pwd]() {
      OptionalPassword op;
        assert.isTrue(PamClavator::SystemCmd(pwd, EXEC_TRUE).run(0, op).ok);
    });
    it("return ok", [&pwd]() {
      OptionalPassword op;
        assert.equal(0, PamClavator::SystemCmd(pwd, EXEC_TRUE).run(0, op).exitCode);
    });
    it("return false", [&pwd]() {
      OptionalPassword op;
        assert.equal(1, PamClavator::SystemCmd(pwd, EXEC_FALSE).run(0, op).exitCode);
    });
    it("stdout empty", [&pwd]() {
      OptionalPassword op;
        assert.isTrue(PamClavator::SystemCmd(pwd, EXEC_TRUE).run(0, op).getSout().str().empty());
    });
    it("stderr empty", [&pwd]() {
      OptionalPassword op;
        assert.isTrue(PamClavator::SystemCmd(pwd, EXEC_TRUE).run(0, op).getSerr().str().empty());
    });

    it("stdout hello world", [&pwd]() {
      OptionalPassword op;
        assert.equal(PamClavator::SystemCmd(pwd, EXEC_ECHO).arg("hello world").run(0, op).getSout().str(), "hello world\n");
        assert.equal(PamClavator::SystemCmd(pwd, EXEC_ECHO).arg("hello world").run(0, op).getSerr().str(), "");
    });
    it("stderr output", [&pwd]() {
      OptionalPassword op;
        assert.isTrue(PamClavator::SystemCmd(pwd, EXEC_GREP).arg("---Fehler").run(0, op).getSout().str().empty());
        assert.isFalse(PamClavator::SystemCmd(pwd, EXEC_GREP).arg("---Fehler").run(0, op).getSerr().str().empty());
    });

    // it("stdin to stdout", [&pwd]() {
    //   OptionalPassword op;
    //   for (auto sendSize = 0; sendSize < 1000000; sendSize += 1024) {
    //     std::stringstream sout;
    //     std::stringstream spattern;
    //     spattern << sendSize << ":";
    //     auto pattern = spattern.str();
    //     for (auto fill = 0; fill < sendSize; fill += pattern.size()) {
    //       sout << pattern;
    //     }
    //     std::string out = sout.str();
    //     assert.equal(PamClavator::SystemCmd(pwd, EXEC_CAT).pushSin(out).run(0, op).getSout().str(), out);
    //   }
    // });
    //
    // it("fd to stdout", [&pwd]() {
    //   OptionalPassword op;
    //   for (auto sendSize = 0; sendSize < 1000000; sendSize += 1024) {
    //     std::stringstream sout;
    //     std::stringstream spattern;
    //     spattern << sendSize << ":";
    //     auto pattern = spattern.str();
    //     for (auto fill = 0; fill < sendSize; fill += pattern.size()) {
    //       sout << pattern;
    //     }
    //     std::string out = sout.str();
    //     const char *cout = out.c_str();
    //     auto oPipe = Pipe::create();
    //     auto &pipe = *oPipe;
    //     PamClavator::SystemCmd bash(pwd, EXEC_BASH);
    //     bash.inPipe(pipe, pipe->getWriteFd(), [cout, &out](size_t ofs, const void **buf) {
    //       if (ofs >= out.size()) {
    //         return 0ul;
    //       }
    //       *buf = cout + ofs;
    //       return out.size() - ofs;
    //     });
    //     std::stringstream fdRedirect;
    //     fdRedirect << EXEC_CAT << "<&" << pipe->getWriteFd()->asString();
    //     assert.equal(bash.arg("-c").arg(fdRedirect.str()).run(0, op).getSout().str(), out);
    //   }
    // });

  });
  exit();
}
