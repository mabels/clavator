#ifndef __GPG_CARD_STATUS__
#define __GPG_CARD_STATUS__

#include <string>
#include <map>

#include <boost/algorithm/string.hpp>
#include <boost/optional.hpp>

class KeyState {
public:
  size_t id;
  size_t mode;
  size_t bits;
  size_t maxpinlen;
  size_t pinretry;
  size_t sigcount;
  size_t cafpr;
  std::string fpr;
  size_t fprtime;
};

class Reader {
public:
  std::string model;
  std::string aid;
  std::string cardid;
  std::string type;
  static boost::optional<Reader> fill(const std::vector<std::string> &match) {
    if (!(match.size() >= 5 && match[0] == "Reader")) {
      LOG(ERROR) << "no Reader Line:" << boost::algorithm::join(match, ":");
      return boost::none;
    }
    Reader ret;
    ret.model = match[1];
    ret.aid = match[2];
    ret.cardid = match[3];
    ret.type = match[4];
    return ret;
  }
};

class Gpg2CardStatus {
  /*
  Reader:Yubico Yubikey 4 OTP U2F CCID:AID:D2760001240102010006041775630000:openpgp-card:
  version:0201:
  vendor:0006:Yubico:
  serial:04177563:
  name:Meno:Abels:
  lang:en:
  sex:m:
  url::
  login:abels:
  forcepin:0:::
  keyattr:1:1:4096:
  keyattr:2:1:4096:
  keyattr:3:1:4096:
  maxpinlen:127:127:127:
  pinretry:3:0:3:
  sigcount:16:::
  cafpr::::
  fpr:F78D5B547A9BB0E8A174C0F5060FF53CB3A32992:B3B94966DF73077EFA734EC83D851A5DF09DEB9C:2D32339F24A537406437181A28E66F405F1BE34D:
  fprtime:1465218501:1465218921:1464700773:
  */
public:
  Reader reader;
  std::string version;
  std::string vendor;
  std::string serial;
  std::string name;
  std::string lang;
  std::string sex;
  std::string url;
  std::string login;
  std::string forcepin;
  std::vector<KeyState> keyStates;
  size_t sigcount;
  size_t cafpr;

  std::vector<KeyState>::iterator allocKeyState(size_t slot) {
    for(size_t i = keyStates.size(); i <= slot; ++i) {
        keyStates.push_back(KeyState());
    }
    return keyStates.begin() + slot;
  }


  typedef std::function<bool(Gpg2CardStatus &gcs, const std::vector<std::string> &strs)> GcsAction;
  static std::map<std::string, GcsAction> actors() {
    static std::map<std::string, GcsAction> ret = {
      { "Reader", [](Gpg2CardStatus &gcs, const std::vector<std::string> &strs) {
        auto reader = Reader::fill(strs);
        if (reader == boost::none) {
          return false;
        }
        gcs.reader = *reader;
        return true;
      } },
      { "version", [](Gpg2CardStatus &gcs, const std::vector<std::string> &strs) {
        gcs.version = strs[1];
        return true;
      } },
      { "vendor", [](Gpg2CardStatus &gcs, const std::vector<std::string> &strs) {
        std::vector<std::string> rest(strs.begin()+1, strs.end());
        gcs.vendor = boost::algorithm::join(rest, ":");
        return true;
      } },
      { "serial", [](Gpg2CardStatus &gcs, const std::vector<std::string> &strs) {
        std::vector<std::string> rest(strs.begin()+1, strs.end());
        gcs.serial = boost::algorithm::join(rest, ":");
        return true;
      } },
      { "name", [](Gpg2CardStatus &gcs, const std::vector<std::string> &strs) {
        std::vector<std::string> rest(strs.begin()+1, strs.end());
        gcs.name = boost::algorithm::join(rest, " ");
        return true;
      } },
      { "lang", [](Gpg2CardStatus &gcs, const std::vector<std::string> &strs) {
        gcs.lang = strs[1];
        return true;
      } },
      { "sex", [](Gpg2CardStatus &gcs, const std::vector<std::string> &strs) {
        gcs.sex = strs[1];
        return true;
      } },
      { "url", [](Gpg2CardStatus &gcs, const std::vector<std::string> &strs) {
        gcs.url = strs[1];
        return true;
      } },
      { "login", [](Gpg2CardStatus &gcs, const std::vector<std::string> &strs) {
        gcs.login = strs[1];
        return true;
      } },
      { "forcepin", [](Gpg2CardStatus &gcs, const std::vector<std::string> &strs) {
        std::vector<std::string> rest(strs.begin()+1, strs.end());
        gcs.forcepin = boost::algorithm::join(rest, ":");
        return true;
      } },
      { "keyattr", [](Gpg2CardStatus &gcs, const std::vector<std::string> &strs) {
        char *end;
        size_t id = std::strtoul(strs[1].c_str(), &end, 10);
        auto ki = gcs.allocKeyState(id-1);
        ki->id = id;
        ki->mode = std::strtoul(strs[2].c_str(), &end, 10);
        ki->bits = std::strtoul(strs[3].c_str(), &end, 10);
        return true;
      } },
      { "maxpinlen", [](Gpg2CardStatus &gcs, const std::vector<std::string> &strs) {
        size_t i = 0;
        for (auto si = strs.begin()+1; si != strs.end(); ++si, ++i) {
          auto ki = gcs.allocKeyState(i);
          char *end;
          ki->maxpinlen = std::strtoul(si->c_str(), &end, 10);
        }
        return true;
      } },
      { "pinretry", [](Gpg2CardStatus &gcs, const std::vector<std::string> &strs) {
        size_t i = 0;
        for (auto si = strs.begin()+1; si != strs.end(); ++si, ++i) {
          auto ki = gcs.allocKeyState(i);
          char *end;
          ki->pinretry = std::strtoul(si->c_str(), &end, 10);
        }
        return true;
      } },
      { "sigcount", [](Gpg2CardStatus &gcs, const std::vector<std::string> &strs) {
        char *end;
        gcs.sigcount = std::strtoul(strs[1].c_str(), &end, 10);
        size_t i = 0;
        for (auto si = strs.begin()+2; si != strs.end(); ++si, ++i) {
          auto ki = gcs.allocKeyState(i);
          ki->sigcount = std::strtoul(si->c_str(), &end, 10);
        }
        return true;
      } },
      { "cafpr", [](Gpg2CardStatus &gcs, const std::vector<std::string> &strs) {
        char *end;
        gcs.cafpr = std::strtoul(strs[1].c_str(), &end, 10);
        size_t i = 0;
        for (auto si = strs.begin()+2; si != strs.end(); ++si, ++i) {
          auto ki = gcs.allocKeyState(i);
          ki->cafpr = std::strtoul(si->c_str(), &end, 10);
        }
        return true;
      } },
      { "fpr", [](Gpg2CardStatus &gcs, const std::vector<std::string> &strs) {
        size_t i = 0;
        for (auto si = strs.begin()+1; si != strs.end(); ++si, ++i) {
          auto ki = gcs.allocKeyState(i);
          ki->fpr = *si;
        }
        return true;
      } },
      { "fprtime", [](Gpg2CardStatus &gcs, const std::vector<std::string> &strs) {
        size_t i = 0;
        for (auto si = strs.begin()+1; si != strs.end(); ++si, ++i) {
          auto ki = gcs.allocKeyState(i);
          char *end;
          ki->fprtime = std::strtoul(si->c_str(), &end, 10);
        }
        return true;
      } },
    };
    return ret;
  }

  static std::vector<Gpg2CardStatus> read(std::istream &istream) {
    std::vector<Gpg2CardStatus> gcs;
    std::vector<Gpg2CardStatus>::iterator gcsi = gcs.end();
    std::map<std::string, GcsAction> actors = Gpg2CardStatus::actors();
    std::string line;
    while (std::getline(istream, line)) {
      boost::trim(line);
      if (line.back() == ':') {
        line.erase(line.end()-1);
      }
      std::vector<std::string> strs;
      boost::split(strs, line, boost::is_any_of(":"));
      if (strs[0] == "Reader") {
        gcsi = gcs.insert(gcs.end(), Gpg2CardStatus());
      }
      if (gcsi == gcs.end()) {
        continue;
      }
      // std::cerr << "ReqAction:" << strs[0] << std::endl;
      auto action = actors.find(strs[0]);
      if (action == actors.end()) {
        LOG(ERROR) << "RejAction:" << strs[0];
        continue;
      }
      // std::cerr << "Action:" << action->first << std::endl;
      if (!(action->second)(*gcsi, strs)) {
          gcs.erase(gcsi);
          gcsi = gcs.end();
      }
    }
    return gcs;
  }
};

#endif
