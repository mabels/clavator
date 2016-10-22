#include <string>
#include <fstream>
#include <sstream>

#include <cascara/cascara.hpp>
using namespace cascara;

#include "../src/gpg_card_status.hpp"

void gpg_card_status(std::stringstream &s2) {
  for (int i = 0; i < 3; ++i) {
    s2 << "Reader:Yubico Yubikey 4 OTP U2F CCID:AID:D2760001240102010006041775630000:openpgp-card:\n";
    s2 << "version:0201:\n";
    s2 << "vendor:0006:Yubico:\n";
    s2 << "serial:04177563:\n";
    s2 << "name:Meno:Abels:\n";
    s2 << "lang:en:\n";
    s2 << "sex:m:\n";
    s2 << "url::\n";
    s2 << "login:abels:\n";
    s2 << "forcepin:0:::\n";
    s2 << "keyattr:1:1:4096:\n";
    s2 << "keyattr:2:1:4096:\n";
    s2 << "keyattr:3:1:4096:\n";
    s2 << "maxpinlen:127:127:127:\n";
    s2 << "pinretry:3:0:3:\n";
    s2 << "sigcount:16:::\n";
    s2 << "cafpr::::\n";
    s2 << "fpr:F78D5B547A9BB0E8A174C0F5060FF53CB3A32992:B3B94966DF73077EFA734EC83D851A5DF09DEB9C:2D32339F24A537406437181A28E66F405F1BE34D:\n";
    s2 << "fprtime:1465218501:1465218921:1464700773:\n";
  }
}

int main() {
  describe("gpg_card_status", []() {
    it("read gpg_card_status", []() {
      std::stringstream gcss;
      gpg_card_status(gcss);
      auto css = Gpg2CardStatus::read(gcss);
      assert.equal(css.size(), 3, "size");
      for (auto &cs : css) {
        assert.equal(cs.reader, "Yubico Yubikey 4 OTP U2F CCID:AID:D2760001240102010006041775630000:openpgp-card");
        assert.equal(cs.version, "0201");
        assert.equal(cs.vendor, "0006:Yubico");
        assert.equal(cs.serial, "04177563");
        assert.equal(cs.name, "Meno Abels");
        assert.equal(cs.lang, "en");
        assert.equal(cs.sex, "m");
        assert.equal(cs.url, "");
        assert.equal(cs.login, "abels");
        assert.equal(cs.forcepin, "0::");
        assert.equal(cs.keyStates.size(), 3);
        const char *fprs[] = {
          "F78D5B547A9BB0E8A174C0F5060FF53CB3A32992",
          "B3B94966DF73077EFA734EC83D851A5DF09DEB9C",
          "2D32339F24A537406437181A28E66F405F1BE34D"
        };
        const size_t fprtimes[] = {
          1465218501,
          1465218921,
          1464700773
        };
        size_t id = 1;
        for (auto &ks: cs.keyStates) {
          assert.equal(ks.id, id);
          assert.equal(ks.mode, 1);
          assert.equal(ks.bits, 4096);
          assert.equal(ks.maxpinlen, 127);
          assert.equal(ks.pinretry, id==2?0:3);
          assert.equal(ks.fpr, fprs[id-1]);
          assert.equal(ks.fprtime, fprtimes[id-1]);
          ++id;
        }
        assert.equal(cs.sigcount, 16);
        assert.equal(cs.cafpr, 0);
      }
    });
  });
  return exit();
}
