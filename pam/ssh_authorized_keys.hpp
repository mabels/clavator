
#include <fstream>

#include <boost/algorithm/string.hpp>
#include <boost/algorithm/string/split.hpp>
#include <boost/algorithm/string/classification.hpp>

class SshAuthorizedKeys {
public:
  class Key {
  private:
    const std::string style;
    const std::string data;
    const std::string name;

  public:
    Key(const std::string &style, const std::string &data,
        const std::string &name)
        : style(style), data(data), name(name) {
// std::cout << style << std::endl;
// std::cout << data << std::endl;
// std::cout << name << std::endl;
        }
    std::string dump() const {
      std::stringstream d;
      d << "[" << style << "][" << data << "][" << name << "]";
      return d.str();
    }
  };

private:
  const std::string fname;
  std::vector<Key> keys;

  static std::string trim(const std::string &str,
                   const std::string &whitespace = " \t") {
    const auto strBegin = str.find_first_not_of(whitespace);
    if (strBegin == std::string::npos)
      return ""; // no content

    const auto strEnd = str.find_last_not_of(whitespace);
    const auto strRange = strEnd - strBegin + 1;

    return str.substr(strBegin, strRange);
  }
  SshAuthorizedKeys(const char *fname) : fname(fname) {}

public:
  const std::vector<Key>& get() const {
    return keys;
  }

  static SshAuthorizedKeys read(const char *fname) {
    SshAuthorizedKeys ret(fname);
    std::ifstream fstream(fname, std::ios_base::in | std::ios_base::binary);
    for (std::string str; std::getline(fstream, str);) {
      str = trim(str);
      if (str.empty() || boost::starts_with(str, "#")) {
        continue;
      }
      std::vector<std::string> strVec;
      boost::algorithm::split(strVec, str, boost::algorithm::is_any_of("\t "),
                              boost::token_compress_on);
      if (strVec.size() >= 2) {
        std::vector<std::string> tail(strVec.begin() + 2, strVec.end());
        ret.keys.push_back(
            Key(strVec[0], strVec[1], boost::algorithm::join(tail, " ")));
      }
    }
    fstream.close();
    return ret;
  }
};
