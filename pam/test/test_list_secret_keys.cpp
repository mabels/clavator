

#include <cascara/cascara.hpp>
using namespace cascara;

#include "../src/gpg_list_secret_keys.hpp"


void testListSecretKeys(std::vector<SecretKey> &s) {
    assert.equal(s.length, 3);
    assert.equal(s[0].keyId, "1A5D93796CF70ADF");
    assert.equal(s[1].keyId, "23C4790FEF6E173F");
    assert.equal(s[2].keyId, "19B013CF06A4BEEF");
    assert.equal(s[2].funky, '#');
    assert.equal(s[2].fingerPrint.fpr, "F36846C4A7DEFD55F492069C19B013CF06A4BEEF");
    assert.equal(s[2].group.grp, "75E60BCBF5E25BBBF0E701CD55BC79F4C03BC320");
    assert.equal(s[2].subKeys.length, 3);
    assert.equal(s[2].subKeys[0].type, 'ssb');
    assert.equal(s[2].subKeys[0].cipher, 'rsa');
    assert.equal(s[2].subKeys[0].bits, 4096);
    assert.equal(s[2].subKeys[0].keyId, '28E66F405F1BE34D');
    assert.equal(s[2].subKeys[0].created, 1464700773, "Created");
    assert.equal(s[2].subKeys[0].expires, 1622380773, "Expires");
    assert.equal(s[2].subKeys[0].fingerPrint.fpr, "2D32339F24A537406437181A28E66F405F1BE34D", "ssbfpr");
    assert.equal(s[2].subKeys[0].group.grp, "C083EC516CCEEFE80403CCA7CC3782A017C99142", "ssbGroup");
    assert.deepEqual(s[2].subKeys[1].uses, ['a', 'e', 's']);
    assert.equal(s[2].uids.length, 1);
    assert.equal(s[2].uids[0].trust, "u");
    assert.equal(s[2].uids[0].name, "Meno Abels");
    assert.equal(s[2].uids[0].email, "meno.abels@adviser.com");
    assert.equal(s[2].uids[0].comment, null);
}

int main() {
  describe('ListSecretKeys', []() -> {

    it("listSecretKeys", []() -> {
      std::stringstream s2;
      s2 << "sec:-:2048:1:1A5D93796CF70ADF:1333149072:1493647783::-:::escaESCA:::+::::\n";
      s2 << "fpr:::::::::547484819BCCDBDA0E73858F1A5D93796CF70ADF:\n";
      s2 << "grp:::::::::71AA10F2E9194FF66E3FD4AE883B4CB9180CF977:\n";
      s2 << "uid:-::::1462111783::A319A573075CF1606705BDA9FD5F07E5AD24F257::Meno Abels <meno.abels@adviser.com>:::::::::\n";
      s2 << "ssb:-:2048:1:0212004AF9FC8C5A:1333149072:1493647841:::::esa:::+:::\n";
      s2 << "fpr:::::::::6E7D140786ED43EC1976080E0212004AF9FC8C5A:\n";
      s2 << "grp:::::::::CF22205D70DB384DE25ACC1AAE7E918C15C1533E:\n";
      s2 << "sec:u:2048:1:23C4790FEF6E173F:1373320318:1499550718::u:::escaESCA:::+::::\n";
      s2 << "fpr:::::::::F999B66D68B825CEBEEB891123C4790FEF6E173F:\n";
      s2 << "grp:::::::::32DA7F8296F405671974350221776EA82B9388B0:\n";
      s2 << "uid:u::::1373320318::30F624F6E100EA83E90DDF2056DDABF6C25775AC::Meno Abels <meno.abels@sinnerschrader.com>:::::::::\n";
      s2 << "ssb:u:2048:1:2E64ABA4FFB43774:1373320318:1499550718:::::esa:::+:::\n";
      s2 << "fpr:::::::::CC8A8119FE0AEEB69FF8B9682E64ABA4FFB43774:\n";
      s2 << "grp:::::::::2A1585647A39DC23748C16CE2692896C139768C1:\n";
      s2 << "sec:u:256:22:19B013CF06A4BEEF:1464699940:1622379940::u:::cESCA:::#::ed25519::\n";
      s2 << "fpr:::::::::F36846C4A7DEFD55F492069C19B013CF06A4BEEF:\n";
      s2 << "grp:::::::::75E60BCBF5E25BBBF0E701CD55BC79F4C03BC320:\n";
      s2 << "uid:u::::1464699940::A319A573075CF1606705BDA9FD5F07E5AD24F257::Meno Abels <meno.abels@adviser.com>:::::::::\n";
      s2 << "ssb:u:4096:1:28E66F405F1BE34D:1464700773:1622380773:::::esa:::D2760001240102010006041775630000:::\n";
      s2 << "fpr:::::::::2D32339F24A537406437181A28E66F405F1BE34D:\n";
      s2 << "grp:::::::::C083EC516CCEEFE80403CCA7CC3782A017C99142:\n";
      s2 << "ssb:u:4096:1:060FF53CB3A32992:1465218501:1622898501:::::es:::D2760001240102010006041775630000:::\n";
      s2 << "fpr:::::::::F78D5B547A9BB0E8A174C0F5060FF53CB3A32992:\n";
      s2 << "grp:::::::::EC5F333359383F725488E7DEC8B289EC521E5F39:\n";
      s2 << "ssb:u:4096:1:3D851A5DF09DEB9C:1465218921:1622898921:::::es:::D2760001240102010006041775630000:::\n";
      s2 << "fpr:::::::::B3B94966DF73077EFA734EC83D851A5DF09DEB9C:\n";
      s2 << "grp:::::::::2DC62D282D308E58A8C7C4F7652955AC146860D2:\n";
      testListSecretKeys(lsk.run(s2));
    });
  });

}
