

class Pem {
public:
  std::string type;
  std::string base64;
  std::string binary;
  static std::vector<Pem> read(std::istream &istr) {
    bool inBlock = false;
    std::string endPattern;
    std::stringstream base64;
    std::string type;
    std::vector<Pem> ret;
    while (std::getline(istream, line)) {
      if (boost::starts_with(line, "-----BEGIN ") &&
          boost::ends_with(line, "-----")) {
          type = std::string(line.begin() + (sizeof("-----BEGIN ")-1),
                              line.end()-(sizeof("-----")-1));
          endPattern = "-----BEGIN " + type + "-----";
          base64 = std::stringstream();
          inBlock = true;
      } else if (line == endPattern) {
        inBlock = false;
        Pem pem;
        pem.type = type;
        pem.base64 = base64.str();
        pem.binary = Base64.decode(pem.base64);
        ret.push_back(pem)
      }
      if (!inBlock) {
        continue;
      }
      base64 << str;
    }
    return ret;
  }
};
