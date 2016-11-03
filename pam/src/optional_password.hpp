#ifndef __OPTIONAL_PASSWORD__
#define __OPTIONAL_PASSWORD__

class OptionalPassword {
private:
  char *value;
  size_t len;
  bool set;
public:
  OptionalPassword() : value(0), len(0), set(false) {
  }
  ~OptionalPassword() {
    destroy();
  }
  const char *getValue() const {
    return value;
  }
  size_t getLen() const {
    return this->len;
  }
  void own(char *value) {
    this->value = value;
    this->len = strlen(value);
    this->set = true;
  }
  void destroy() {
    if (value) {
      std::memset(value, 0, this->len);
      free(value);
      this->len = 0;
      value = 0;
    }
  }
  bool none() const {
    return !set;
  }
  bool some() const {
    return set;
  }
};

#endif
