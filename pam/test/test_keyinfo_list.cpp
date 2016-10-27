
#include <cascara/cascara.hpp>
using namespace cascara;

#include "../src/gpg_keyinfo_list.hpp"

#include <easylogging++.h>
INITIALIZE_EASYLOGGINGPP



int main() {
  describe("GpgKeyInfoList", []() {

    it("read", []() {
      std::stringstream s2;
      s2 << "S KEYINFO C083EC516CCEEFE80403CCA7CC3782A017C99142 T D2760001240102010006046450860000 OPENPGP.3 - - - - -\n";
      s2 << "S KEYINFO 2DC62D282D308E58A8C7C4F7652955AC146860D2 T D2760001240102010006046450860000 OPENPGP.2 - - - - -\n";
      s2 << "S KEYINFO EC5F333359383F725488E7DEC8B289EC521E5F39 T D2760001240102010006046450860000 OPENPGP.1 - - - - -\n";
      s2 << "OK\n";
      auto kil = GpgKeyInfo::read(s2);
      assert.equal(kil.size(), 3u);
      assert.equal(kil[0].group, "C083EC516CCEEFE80403CCA7CC3782A017C99142");
      assert.equal(kil[0].trust, "T");
      assert.equal(kil[0].cardid, "D2760001240102010006046450860000");
      assert.equal(kil[0].keyId, "OPENPGP.3");

      assert.equal(kil[1].group, "2DC62D282D308E58A8C7C4F7652955AC146860D2");
      assert.equal(kil[1].trust, "T");
      assert.equal(kil[1].cardid, "D2760001240102010006046450860000");
      assert.equal(kil[1].keyId, "OPENPGP.2");

      assert.equal(kil[2].group, "EC5F333359383F725488E7DEC8B289EC521E5F39");
      assert.equal(kil[2].trust, "T");
      assert.equal(kil[2].cardid, "D2760001240102010006046450860000");
      assert.equal(kil[2].keyId, "OPENPGP.1");
    });
  });
  exit();
}
