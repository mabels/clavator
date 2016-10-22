#include <string>
#include <sstream>
#include <vector>


#include "../src/option.hpp"

class Oid {
public:
  std::vector<uint32_t> oid;

  std::string toString() {
    const char *dot = "";
    std::stringstream out;
    for (auto i : oid) {
        out << dot << i;
        dot = ".";
    }
    return out.str();
  }

  static void parseSimple(std::vector<uint32_t> &oid, uint8_t val) {
    auto first = val<80?val<40?0:1:2;
    oid.push_back(first);
    oid.push_back(val-(first*40));
  }

  static Option<Oid> read(std::string::const_iterator begin, std::string::const_iterator end) {
    Oid ret;
    bool first = true;
    size_t bits = 0;
    size_t n = 0;
    for (auto i = begin; i != end; ++i) {
      uint8_t v = *i;
      n = (n<<bits) + (v & 0x7f);
      if (v & 0x80) {
        bits = 7;
      } else {
        if (first) {
          parseSimple(ret.oid, v);
          first = false;
        } else {
          ret.oid.push_back(n);
        }
        bits = 0;
        n = 0;
      }
    }
    if (bits) {
      return None<Oid>();
    }
    return Some(ret);
  }
};