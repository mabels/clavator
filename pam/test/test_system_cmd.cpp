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
#else
#define EXEC_TRUE "/bin/true"
#define EXEC_FALSE "/bin/false"
#define EXEC_ECHO "/bin/echo"
#define EXEC_SLEEP "/bin/sleep"
#define EXEC_GREP "/bin/grep"
#define EXEC_CAT "/bin/cat"
#endif

INITIALIZE_EASYLOGGINGPP
int main() {
  describe("SystemCmd", []() {
    auto pwd = getpwnam(std::getenv("USER"));
    // it("simple echo", []() {
    //     assert.equal(0, SystemCmd("/bin/sleep").arg("60").run().exitCode);
    // });
    it("not launched", [&pwd]() {
        assert.isFalse(SystemCmd(pwd, "WTF").run(0).ok);
    });
    it("syncron sleep", [&pwd]() {
      auto start = std::chrono::high_resolution_clock::now(); //measure time starting here
      assert.isTrue(SystemCmd(pwd, EXEC_SLEEP).arg("1").run(0).ok, "sleep should be ok");
      auto end = std::chrono::high_resolution_clock::now(); //end measurement here
      auto elapsed = end - start;

      assert.isTrue(std::chrono::microseconds{1000000} <= elapsed, "time is not ok");
    });
    it("launched", [&pwd]() {
        assert.isTrue(SystemCmd(pwd, EXEC_TRUE).run(0).ok);
    });
    it("return ok", [&pwd]() {
        assert.equal(0, SystemCmd(pwd, EXEC_TRUE).run(0).exitCode);
    });
    it("return false", [&pwd]() {
        assert.equal(1, SystemCmd(pwd, EXEC_FALSE).run(0).exitCode);
    });
    it("stdout empty", [&pwd]() {
        assert.isTrue(SystemCmd(pwd, EXEC_TRUE).run(0).getSout().str().empty());
    });
    it("stderr empty", [&pwd]() {
        assert.isTrue(SystemCmd(pwd, EXEC_TRUE).run(0).getSerr().str().empty());
    });

    it("stdout hello world", [&pwd]() {
        assert.equal(SystemCmd(pwd, EXEC_ECHO).arg("hello world").run(0).getSout().str(), "hello world\n");
        assert.equal(SystemCmd(pwd, EXEC_ECHO).arg("hello world").run(0).getSerr().str(), "");
    });
    it("stderr output", [&pwd]() {
        assert.isTrue(SystemCmd(pwd, EXEC_GREP).arg("---Fehler").run(0).getSout().str().empty());
        assert.isFalse(SystemCmd(pwd, EXEC_GREP).arg("---Fehler").run(0).getSerr().str().empty());
    });
    it("stdin to stdout", [&pwd]() {
        assert.equal(SystemCmd(pwd, EXEC_CAT).pushSin("hello world").run(0).getSout().str(), "hello world");
        assert.equal(SystemCmd(pwd, EXEC_CAT).pushSin("hello world").run(0).getSerr().str(), "");
    });
  });
  exit();
}
