#ifndef __SYSTEM_RESULT__
#define __SYSTEM_RESULT__

#include <string>
#include <sstream>
#include <memory>

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

#endif
