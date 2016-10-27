
#ifndef __GPG_KEYINFO_LIST__
#define __GPG_KEYINFO_LIST__

#include <map>
#include <vector>
#include <string>

#include <cstdlib>

#include <boost/algorithm/string.hpp>
#include <boost/regex.hpp>
#include <boost/optional.hpp>

#include <easylogging++.h>

class GpgKeyInfo {
public:
  std::string group;
  std::string trust;
  std::string cardid;
  std::string keyId;
  bool operator==(const GpgKeyInfo& obj) const {
	return this->group == obj.group &&
	 this->trust == obj.trust &&
	 this->cardid == obj.cardid &&
	 this->keyId == obj.keyId;
  } 

  static boost::optional<GpgKeyInfo> fill(std::vector<std::string> match) {
    if (!(match.size() >= 6 && match[0] == "S" && match[1] == "KEYINFO")) {
      LOG(ERROR) << "no keyinfo line";
      return boost::none;
    }
    GpgKeyInfo ret;
    ret.group = match[2];
    ret.trust = match[3];
    ret.cardid = match[4];
    ret.keyId = match[5];
    return ret;
  }

  static std::vector<GpgKeyInfo> read(std::istream &istream) {
    std::vector<GpgKeyInfo> ret;
    std::string line;
    while (std::getline(istream, line)) {
      std::vector<std::string> strs;
      boost::split(strs, line, boost::is_any_of(" "));
      if (strs[0] == "OK") {
        break;
      }
      auto ki = GpgKeyInfo::fill(strs);
      if (ki == boost::none) {
          continue;
      }
      ret.push_back(*ki);
    }
    return ret;
  }
};

#endif
