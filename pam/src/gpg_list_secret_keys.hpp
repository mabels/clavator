#ifndef __GPG_LIST_SECRET_KEYS__
#define __GPG_LIST_SECRET_KEYS__

#include <map>
#include <vector>
#include <string>

#include <cstdlib>

#include <boost/algorithm/string.hpp>
#include <boost/regex.hpp>

class FingerPrint {
public:
  std::string fpr;
  void fill(const std::vector<std::string> &match) {
    this->fpr = match[9];
  }
};

class Group {
public:
  std::string grp;
  void fill(const std::vector<std::string> &match) {
    // debugArray(match);
    this->grp = match[9];
  }
};

static std::map<size_t, const char *> Ciphers = {
    { 22, "ed25519" },
    { 1, "rsa" }
};

class Key {
public:
  std::string type;
  std::string trust;
  std::string cipher;
  std::string modulo;
  size_t bits;
  std::string keyId;
  std::string key;
  size_t created;
  size_t expires;
  std::vector<char> uses;
  Group group;
  FingerPrint fingerPrint;

// sec:u:256:22:19B013CF06A4BEEF:1464699940:1622379940::u:::cESCA:::#::ed25519::
// ssb:u:256:22:258DE0ECF59BF6FC:1464700731:1622380731:::::a:::+::ed25519:
// ssb:u:4096:1:28E66F405F1BE34D:1464700773:1622380773:::::esa:::D2760001240102010006041775630000::ed25519:
// ssb:u:4096:1:060FF53CB3A32992:1465218501:1622898501:::::es:::D2760001240102010006041775630000::ed25519:
// ssb:u:4096:1:3D851A5DF09DEB9C:1465218921:1622898921:::::es:::D2760001240102010006041775630000::ed25519:

  Key& fill(std::vector<std::string> match) {
    // debugArray(match);
    this->type = match[0];
    this->trust = match[1];
    char *end;
    this->bits = std::strtoul(match[2].c_str(), &end, 10);
    size_t cipher = std::strtoul(match[3].c_str(), &end, 10);
    auto found = Ciphers.find(cipher);
    if (found != Ciphers.end()) {
      this->cipher = found->second;
    } else {
      std::stringstream s2;
      s2 << "UNK[" << match[3] << "]";
      this->cipher = s2.str();
    }
    this->key = this->keyId = match[4];
    this->created = std::strtoul(match[5].c_str(), &end, 10);
    this->expires = std::strtoul(match[6].c_str(), &end, 10);
    this->modulo = match[14];
    // std::cerr << "TYPE:" << match[11] << std::endl;
    for (auto i = match[11].begin(); i != match[11].end(); ++i) {
        this->uses.push_back(*i);
    }
    std::sort(this->uses.begin(), this->uses.end());
    return *this;
  }
};


static boost::regex reNameAndEmail("^\\s*(.*)\\s+<(\\S+)>\\s*$");

class Uid {
  public:
  std::string trust;
  std::string name;
  std::string email;
  std::string comment;
  size_t created;
  std::string id;
  std::string key;

  //uid:u::::1464699940::A319A573075CF1606705BDA9FD5F07E5AD24F257::Meno Abels <meno.abels@adviser.com>:::::::::
  static Uid fill(std::vector<std::string> &match) {
    // debugArray(match);
    Uid uid;
    uid.trust = match[1];
    char *end;
    uid.created = std::strtoul(match[5].c_str(), &end, 10);
    uid.key = uid.id = match[7];
    boost::cmatch what;
    // std::cerr << "Uid:" << match[9] << std::endl;
    if (boost::regex_match(match[9].c_str(), what, reNameAndEmail)) {
      // std::cerr << "Uid:match" << what[1] << ":" << what[2] << std::endl;
      uid.name = what[1];
      uid.email = what[2];
    }
    //this.comment = match[5];
    return uid;
  }
};


class SecretKey {
public:
  Key key;
  std::vector<Uid> uids;
  std::vector<Key> subKeys;

  static std::vector<SecretKey> read(std::istream &istream) {
    std::vector<SecretKey> ret;
    std::vector<SecretKey>::iterator currentSec;
    Key *currentKey = 0;
    std::string line;
    while (std::getline(istream, line)) {
      std::vector<std::string> strs;
      boost::split(strs, line, boost::is_any_of(":"));
      if (strs[0] == "sec") {
        currentSec = ret.insert(ret.end(), SecretKey());
        currentSec->key.fill(strs);
        currentKey = &(currentSec->key);
      } else if (strs[0] == "uid") {
        currentSec->uids.push_back(Uid::fill(strs));
      } else if (strs[0] == "ssb") {
        currentKey = &(*currentSec->subKeys.insert(currentSec->subKeys.end(), Key().fill(strs)));
      } else if (currentKey && strs[0] == "fpr") {
        currentKey->fingerPrint.fill(strs);
      } else if (currentKey && strs[0] == "grp") {
        currentKey->group.fill(strs);
      } else {
        std::cerr << "SecretKey: unkown-type=" << strs[0] << std::endl;
      }
    }
    return ret;
  }
};

#endif
