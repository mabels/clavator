
#include <string>
#include <vector>

#include <boost/algorithm/string.hpp>

#include "../src/base64.hpp"


class Pem {
public:
  std::string type;
  std::vector<std::string> base64;
  std::string binary;
  static std::vector<Pem> read(std::istream &istream) {
    bool inBlock = false;
    std::string endPattern;
    std::string type;
    std::vector<Pem> ret;
    std::vector<std::string> vecBase64;
    std::string line;
    while (std::getline(istream, line)) {
      boost::trim(line);
      // std::cerr << boost::starts_with(line, "-----BEGIN ") << ":"
        // << boost::ends_with(line, "-----")
        // << "[" << line << "]" << std::endl;
      if (boost::starts_with(line, "-----BEGIN ") &&
          boost::ends_with(line, "-----")) {
          type = std::string(line.begin() + (sizeof("-----BEGIN ")-1),
                              line.end()-(sizeof("-----")-1));
          endPattern = "-----END " + type + "-----";
          // std::cerr << "[" << endPattern << "]" << std::endl;
          vecBase64.clear();
          inBlock = true;
          continue;
      } else if (line == endPattern) {
        inBlock = false;
        Pem pem;
        pem.type = type;
        pem.base64 = vecBase64;
        std::string str = boost::algorithm::join(vecBase64, "");
        // std::cerr << "[" << str << "]" << std::endl;
        pem.binary = Base64::decode(str);
        ret.push_back(pem);
        continue;
      }
      if (!inBlock) {
        continue;
      }
      vecBase64.push_back(line);
    }
    return ret;
  }
};
