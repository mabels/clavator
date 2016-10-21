

#include <arpa/inet.h>

#include <fstream>

#include <boost/algorithm/string.hpp>
#include <boost/algorithm/string/classification.hpp>
#include <boost/algorithm/string/split.hpp>

#include "base64.hpp"

namespace PamClavator {

class Key {
public:
  const bool ok;
  const std::string style;
  const std::string data;
  const std::string name;
  const std::string from_data_style;
  const std::string from_data_modulo;
  const std::string from_data_pubkey;

public:
  Key(bool ok, const std::string &style, const std::string &data,
      const std::string &name, const std::string &from_data_style,
      const std::string &from_data_modulo, const std::string &from_data_pubkey)
      : ok(ok), style(style), data(data), name(name),
        from_data_style(from_data_style), from_data_modulo(from_data_modulo),
        from_data_pubkey(from_data_pubkey) {}

  bool isOk() const { return ok; }
  std::string dump() const {
    std::stringstream d;
    d << "[" << style << "][" << data << "][" << name << "]";
    return d.str();
  }

  static bool getPart(size_t len, std::istringstream &str, std::string &dest) {
    uint32_t plen = 0;
    str.read(((char *)(&plen)), sizeof(plen));
    plen = ntohl(plen);
    if (str.eof() || plen >= len) {
      // std::cerr << "1-part:" << plen << std::endl;
      return false;
    }
    char buf[plen];
    str.read(buf, sizeof(buf));
    if (str.eof()) {
      // std::cerr << "2-part:" << plen << std::endl;
      return false;
    }
    dest.assign(buf, sizeof(buf));
    return true;
  }

  static bool fill(const std::string &data, std::string &from_data_style,
                   std::string &from_data_modulo,
                   std::string &from_data_pubkey) {
    auto str = Base64::decode(data);
    auto strData = std::istringstream(str);
    if (!getPart(str.size(), strData, from_data_style)) {
      return false;
    }
    if (!getPart(str.size(), strData, from_data_modulo)) {
      return false;
    }
    if (!getPart(str.size(), strData, from_data_pubkey)) {
      return false;
    }
    return true;
  }
  //
  // parts = []
  // while keydata:
  //        # read the length of the data
  //    dlen = struct.unpack('>I', keydata[:4])[0]
  //
  //    # read in <length> bytes
  //    data, keydata = keydata[4:dlen+4], keydata[4+dlen:]
  //
  //    parts.append(data)
  //
  //
  // print parts
  // print "".join("{:02x}".format(ord(c)) for c in parts[2]).upper()
};

class SshAuthorizedKeys {
public:
private:
  //const std::string fname;
  std::vector<Key> keys;

  //SshAuthorizedKeys(const char *fname) : fname(fname) {}

public:
  const std::vector<Key> &get() const { return keys; }

  //  std::ifstream fstream(fname, std::ios_base::in | std::ios_base::binary);
  static SshAuthorizedKeys read(std::istream &fstream) {
    SshAuthorizedKeys ret;
    for (std::string str; std::getline(fstream, str);) {
      str = boost::trim_copy(str);
      std::vector<std::string> strVec;
      boost::algorithm::split(strVec, str, boost::algorithm::is_any_of("\t "),
                              boost::token_compress_on);
      std::string name;
      if (strVec.size() > 2) {
        std::vector<std::string> tail(strVec.begin() + 2, strVec.end());
        name = boost::algorithm::join(tail, " ");
      }
      std::string style;
      if (strVec.size() > 0) {
        style = strVec[0];
      }
      std::string data;
      if (strVec.size() > 1) {
        data = strVec[1];
      }
      std::string from_data_style;
      std::string from_data_modulo;
      std::string from_data_pubkey;
      bool ok =
          Key::fill(data, from_data_style, from_data_modulo, from_data_pubkey);
      ret.keys.push_back(Key(ok, style, data, name, from_data_style,
                             from_data_modulo, from_data_pubkey));
      // }
    }
    // fstream.close();
    return ret;
  }
};
}
