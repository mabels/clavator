
#include <boost/algorithm/string.hpp>

class KeyState {
public:
  size_t id;
  size_t mode;
  size_t bits;
  size_t maxpinlens;
  size_t pinretries;
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
    for(size_t i = keyStates.length; i <= slot; ++i) {
        keyStates.push_back(KeyState());
    }
    return keyStates.begin() + slot;
  }


  typedef std::function<void(Gpg2CardStatus &gcs, const std::vector<std::string> &strs)> GcsAction;
  static std::map<std::string, GcsAction> actor() {
    static std::map<std::string, GcsAction> ret = {
      { "Reader", [](Gpg2CardStatus &gcs, const std::vector<std::string> &strs) {
        gcs.reader = strs[1];
      } },
      { "version", [](Gpg2CardStatus &gcs, const std::vector<std::string> &strs) {
        gcs.version = strs[1];
      } },
      { "vendor", [](Gpg2CardStatus &gcs, const std::vector<std::string> &strs) {
        std::vector<std::string> rest(strs.begin()+1, strs.end());
        gcs.vendor = boost::algorithm::join(rest, ":");
      } },
      { "serial", [](Gpg2CardStatus &gcs, const std::vector<std::string> &strs) {
        gcs.serial = strs[1];
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
        size_t id = std::stoi(strs[1]);
        auto ki = gcs.allocKeyState(id-1);
        ki->id = id;
        ki->mode = std::stoi(strs[2]);
        ki->bits = std::stoi(strs[3]);
      } },
      { "maxpinlen", [](Gpg2CardStatus &gcs, const std::vector<std::string> &strs) {
        for (auto si = strs.begin()+1, i = 0; si != strs.end(); ++si, ++i) {
          auto ki = gcs.allocKeyState(i);
          ki->maxpinlen = std::stoi(*si);
        }
      } },
      { "pinretry", [](Gpg2CardStatus &gcs, const std::vector<std::string> &strs) {
        for (auto si = strs.begin()+1, i = 0; si != strs.end(); ++si, ++i) {
          auto ki = gcs.allocKeyState(i);
          ki->pinretry = std::stoi(*si);
        }
      } },
      { "sigcount", [](Gpg2CardStatus &gcs, const std::vector<std::string> &strs) {
        gcs.sigcount = std::stoi(strs[1]);
        for (auto si = strs.begin()+2, i = 0; si != strs.end(); ++si, ++i) {
          auto ki = gcs.allocKeyState(i);
          ki->sigcount = std::stoi(*si);
        }
      } },
      { "cafpr", [](Gpg2CardStatus &gcs, const std::vector<std::string> &strs) {
        gcs.cafpr = std::stoi(strs[1]);
        for (auto si = strs.begin()+2, i = 0; si != strs.end(); ++si, ++i) {
          auto ki = gcs.allocKeyState(i);
          ki->cafpr = std::stoi(*si);
        }
      } },
      { "fpr", [](Gpg2CardStatus &gcs, const std::vector<std::string> &strs) {
        for (auto si = strs.begin()+1, i = 0; si != strs.end(); ++si, ++i) {
          auto ki = gcs.allocKeyState(i);
          ki->fpr = *si;
        }
      } },
      { "fprtime", [](Gpg2CardStatus &gcs, const std::vector<std::string> &strs) {
        for (auto si = strs.begin()+1, i = 0; si != strs.end(); ++si, ++i) {
          auto ki = gcs.allocKeyState(i);
          ki->fprtime = std::stoi(*si);
        }
      } },
    };
    return ret;
  }

  static std::vector<Gpg2CardStatus> read(std::istream &istream) {
    std::vector<Gpg2CardStatus> gcs;
    std::vector<Gpg2CardStatus>::iterator gcsi = gcs.end();
    std::map<std::string, GcsAction> actors;
    std::string line;
    while (std::getline(istream, line)) {
      std::vector<std::string> strs;
      boost::split(strs, line, boost::is_any_of(":"));
      if (strs[0] == "Reader") {
        gcsi = gcs.insert(gcs.last(), Gpg2CardStatus());
      }
      if (gcsi == gcs.end()) {
        continue;
      }
      auto action = actor.find(strs[0]);
      if (action == actor.end()) {
        continue;
      }
      (action.second)(*gcsi, strs);
    }
    return gcs;
  }
};
