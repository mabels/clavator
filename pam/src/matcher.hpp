#ifndef __BASE_MATCHER__
#define __BASE_MATCHER__

class BaseMatcher {
public:
  virtual ~BaseMatcher() {}
  virtual bool match(const char *argv) = 0;
  virtual void dump() const = 0;
};

template<class T>
class Matcher  : public BaseMatcher {
private:
  const char *matchString;
  T preset;
public:
  T value;
  Matcher(const char *match, const T &value, std::vector<BaseMatcher *> &matcher)
    : matchString(match), preset(value), value(value) {
    matcher.push_back(this);
  }
  virtual ~Matcher() {}
  virtual bool match(const char *argv);
  virtual void dump() const {
      std::stringstream s2;
      if (matchString[strlen(matchString)-1] == '=') {
        s2 << matchString << value << " preset=" << preset;
      } else {
        s2 << matchString << "=" << value << " preset=" << preset;
      }
      //D((s2.str().c_str()));
  }

};

template<> bool Matcher<std::string>::match(const char *argv) {
  if (!strncmp(argv, matchString, strlen(matchString)-1)) {
      value = argv + strlen(matchString);
      return true;
  }
  return false;
}

template<> bool Matcher<bool>::match(const char *argv) {
  if (!strncmp(argv, matchString, strlen(matchString)-1)) {
      value = true;
      return true;
  }
  return false;
}

template<> bool Matcher<size_t>::match(const char *argv) {
  if (!strncmp(argv, matchString, strlen(matchString)-1)) {
    std::stringstream convertor;
    std::string numberString = matchString;
    size_t number;
    convertor << numberString;
    convertor >> number;
    if (convertor.fail()) {
      LOG(ERROR) << "Not a Number!" << matchString;
      return false;
    }
    value = number;
    return true;
  }
  return false;
}


#endif
