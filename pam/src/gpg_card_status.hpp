#include <string>
#include <map>

#include <boost/algorithm/string.hpp>

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
  std::string reader;
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


  typedef std::function<void(Gpg2CardStatus &gcs, const std::vector<std::string> &strs)> GcsAction;
  static std::map<std::string, GcsAction> actors() {
    static std::map<std::string, GcsAction> ret = {
      { "Reader", [](Gpg2CardStatus &gcs, const std::vector<std::string> &strs) {
        std::vector<std::string> rest(strs.begin()+1, strs.end());
        gcs.reader = boost::algorithm::join(rest, ":");
      } },
      { "version", [](Gpg2CardStatus &gcs, const std::vector<std::string> &strs) {
        gcs.version = strs[1];
      } },
      { "vendor", [](Gpg2CardStatus &gcs, const std::vector<std::string> &strs) {
        std::vector<std::string> rest(strs.begin()+1, strs.end());
        gcs.vendor = boost::algorithm::join(rest, ":");
      } },
      { "serial", [](Gpg2CardStatus &gcs, const std::vector<std::string> &strs) {
        std::vector<std::string> rest(strs.begin()+1, strs.end());
        gcs.serial = boost::algorithm::join(rest, ":");
      } },
      { "name", [](Gpg2CardStatus &gcs, const std::vector<std::string> &strs) {
        std::vector<std::string> rest(strs.begin()+1, strs.end());
        gcs.name = boost::algorithm::join(rest, " ");
      } },
      { "lang", [](Gpg2CardStatus &gcs, const std::vector<std::string> &strs) {
        gcs.lang = strs[1];
      } },
      { "sex", [](Gpg2CardStatus &gcs, const std::vector<std::string> &strs) {
        gcs.sex = strs[1];
      } },
      { "url", [](Gpg2CardStatus &gcs, const std::vector<std::string> &strs) {
        gcs.url = strs[1];
      } },
      { "login", [](Gpg2CardStatus &gcs, const std::vector<std::string> &strs) {
        gcs.login = strs[1];
      } },
      { "forcepin", [](Gpg2CardStatus &gcs, const std::vector<std::string> &strs) {
        std::vector<std::string> rest(strs.begin()+1, strs.end());
        gcs.forcepin = boost::algorithm::join(rest, ":");
      } },
      { "keyattr", [](Gpg2CardStatus &gcs, const std::vector<std::string> &strs) {
        char *end;
        size_t id = std::strtoul(strs[1].c_str(), &end, 10);
        auto ki = gcs.allocKeyState(id-1);
        ki->id = id;
        ki->mode = std::strtoul(strs[2].c_str(), &end, 10);
        ki->bits = std::strtoul(strs[3].c_str(), &end, 10);
      } },
      { "maxpinlen", [](Gpg2CardStatus &gcs, const std::vector<std::string> &strs) {
        size_t i = 0;
        for (auto si = strs.begin()+1; si != strs.end(); ++si, ++i) {
          auto ki = gcs.allocKeyState(i);
          char *end;
          ki->maxpinlen = std::strtoul(si->c_str(), &end, 10);
        }
      } },
      { "pinretry", [](Gpg2CardStatus &gcs, const std::vector<std::string> &strs) {
        size_t i = 0;
        for (auto si = strs.begin()+1; si != strs.end(); ++si, ++i) {
          auto ki = gcs.allocKeyState(i);
          char *end;
          ki->pinretry = std::strtoul(si->c_str(), &end, 10);
        }
      } },
      { "sigcount", [](Gpg2CardStatus &gcs, const std::vector<std::string> &strs) {
        char *end;
        gcs.sigcount = std::strtoul(strs[1].c_str(), &end, 10);
        size_t i = 0;
        for (auto si = strs.begin()+2; si != strs.end(); ++si, ++i) {
          auto ki = gcs.allocKeyState(i);
          ki->sigcount = std::strtoul(si->c_str(), &end, 10);
        }
      } },
      { "cafpr", [](Gpg2CardStatus &gcs, const std::vector<std::string> &strs) {
        char *end;
        gcs.cafpr = std::strtoul(strs[1].c_str(), &end, 10);
        size_t i = 0;
        for (auto si = strs.begin()+2; si != strs.end(); ++si, ++i) {
          auto ki = gcs.allocKeyState(i);
          ki->cafpr = std::strtoul(si->c_str(), &end, 10);
        }
      } },
      { "fpr", [](Gpg2CardStatus &gcs, const std::vector<std::string> &strs) {
        size_t i = 0;
        for (auto si = strs.begin()+1; si != strs.end(); ++si, ++i) {
          auto ki = gcs.allocKeyState(i);
          ki->fpr = *si;
        }
      } },
      { "fprtime", [](Gpg2CardStatus &gcs, const std::vector<std::string> &strs) {
        size_t i = 0;
        for (auto si = strs.begin()+1; si != strs.end(); ++si, ++i) {
          auto ki = gcs.allocKeyState(i);
          char *end;
          ki->fprtime = std::strtoul(si->c_str(), &end, 10);
        }
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
        std::cerr << "RejAction:" << strs[0] << std::endl;
        continue;
      }
      // std::cerr << "Action:" << action->first << std::endl;
      (action->second)(*gcsi, strs);
    }
    return gcs;
  }
};
