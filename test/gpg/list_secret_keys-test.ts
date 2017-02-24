import { assert } from 'chai';


import * as gpg from "../../src/gpg/gpg";
import * as lsk from "../../src/gpg/list_secret_keys";

//import * as pins from "../../src/pinentry/server";
//import * as pinc from "../../src/pinentry/client";


describe('ListSecretKeys', () => {

  function testListSecretKeys(s: lsk.SecretKey[]) : void {
      assert.equal(s.length, 3);
      assert.equal(s[0].keyId, "1A5D93796CF70ADF");
      assert.equal(s[1].keyId, "23C4790FEF6E173F");
      assert.equal(s[2].keyId, "19B013CF06A4BEEF");
      assert.equal(s[2].funky, '#');
      assert.equal(s[2].fingerPrint.fpr, "F36846C4A7DEFD55F492069C19B013CF06A4BEEF");
      assert.equal(s[2].group.grp, "75E60BCBF5E25BBBF0E701CD55BC79F4C03BC320");
      assert.equal(s[2].subKeys.length, 3);
// console.log(s[2].subKeys)
      assert.equal(s[2].subKeys[0].type, 'ssb');
      assert.equal(s[2].subKeys[0].cipher, 'rsa');
      assert.equal(s[2].subKeys[0].bits, 4096);
      assert.equal(s[2].subKeys[0].keyId, '28E66F405F1BE34D');
      assert.equal(s[2].subKeys[0].created, 1464700773, "Created");
      assert.equal(s[2].subKeys[0].expires, 1622380773, "Expires");
      assert.equal(s[2].subKeys[0].fingerPrint.fpr, "2D32339F24A537406437181A28E66F405F1BE34D", "ssbfpr");
      assert.equal(s[2].subKeys[0].group.grp, "C083EC516CCEEFE80403CCA7CC3782A017C99142", "ssbGroup");
      assert.deepEqual(s[2].subKeys[0].uses, ['a', 'e', 's']);
      assert.equal(s[2].uids.length, 1);
      assert.equal(s[2].uids[0].trust, "u");
      assert.equal(s[2].uids[0].name, "Meno Abels");
      assert.equal(s[2].uids[0].email, "meno.abels@adviser.com");
      assert.equal(s[2].uids[0].comment, null);

  }

  it("externListSecretKeys", () => {
        (new gpg.Gpg()).list_secret_keys((err: string, keys: lsk.SecretKey[]) => {
            assert.equal(err, null);
            testListSecretKeys(keys);
        });
   });

   it("listSecretKeys", () => {
        testListSecretKeys(lsk.run(`
sec:-:2048:1:1A5D93796CF70ADF:1333149072:1493647783::-:::escaESCA:::+::::
fpr:::::::::547484819BCCDBDA0E73858F1A5D93796CF70ADF:
grp:::::::::71AA10F2E9194FF66E3FD4AE883B4CB9180CF977:
uid:-::::1462111783::A319A573075CF1606705BDA9FD5F07E5AD24F257::Meno Abels <meno.abels@adviser.com>:::::::::
ssb:-:2048:1:0212004AF9FC8C5A:1333149072:1493647841:::::esa:::+:::
fpr:::::::::6E7D140786ED43EC1976080E0212004AF9FC8C5A:
grp:::::::::CF22205D70DB384DE25ACC1AAE7E918C15C1533E:
sec:u:2048:1:23C4790FEF6E173F:1373320318:1499550718::u:::escaESCA:::+::::
fpr:::::::::F999B66D68B825CEBEEB891123C4790FEF6E173F:
grp:::::::::32DA7F8296F405671974350221776EA82B9388B0:
uid:u::::1373320318::30F624F6E100EA83E90DDF2056DDABF6C25775AC::Meno Abels <meno.abels@sinnerschrader.com>:::::::::
ssb:u:2048:1:2E64ABA4FFB43774:1373320318:1499550718:::::esa:::+:::
fpr:::::::::CC8A8119FE0AEEB69FF8B9682E64ABA4FFB43774:
grp:::::::::2A1585647A39DC23748C16CE2692896C139768C1:
sec:u:256:22:19B013CF06A4BEEF:1464699940:1622379940::u:::cESCA:::#::ed25519::
fpr:::::::::F36846C4A7DEFD55F492069C19B013CF06A4BEEF:
grp:::::::::75E60BCBF5E25BBBF0E701CD55BC79F4C03BC320:
uid:u::::1464699940::A319A573075CF1606705BDA9FD5F07E5AD24F257::Meno Abels <meno.abels@adviser.com>:::::::::
ssb:u:4096:1:28E66F405F1BE34D:1464700773:1622380773:::::esa:::D2760001240102010006041775630000:::
fpr:::::::::2D32339F24A537406437181A28E66F405F1BE34D:
grp:::::::::C083EC516CCEEFE80403CCA7CC3782A017C99142:
ssb:u:4096:1:060FF53CB3A32992:1465218501:1622898501:::::es:::D2760001240102010006041775630000:::
fpr:::::::::F78D5B547A9BB0E8A174C0F5060FF53CB3A32992:
grp:::::::::EC5F333359383F725488E7DEC8B289EC521E5F39:
ssb:u:4096:1:3D851A5DF09DEB9C:1465218921:1622898921:::::es:::D2760001240102010006041775630000:::
fpr:::::::::B3B94966DF73077EFA734EC83D851A5DF09DEB9C:
grp:::::::::2DC62D282D308E58A8C7C4F7652955AC146860D2:
          `.replace(/\t/g, '')));
    })

    it("keyGen", () => {
        return;
        // let socket = "./S." + require('node-uuid').v4();
        // pins.server(socket, { test_getpin: 47114711 });
        //
        // let kg = new gpg.KeyGen();
        // kg.keyType = "RSA";
        // kg.keyLength = 1024;
        // kg.keyUsage = ['cert'];
        // kg.nameReal = "Test " + process.pid;
        // kg.nameEmail = "test." + process.pid + "@test.org";
        // kg.nameComment = "comment-" + process.pid;
        // kg.expireDate = "2029-01-01";
        //
        // let gPg = new gpg.Gpg()
        //     .setPinentryUrl("wsf://" + socket)
        //     .setHomeDir('./meno')
        //     .setGpgCmd('/Users/menabe/Software/gpg/gnupg/g10/gpg');
        //
        // gPg.started(() => {
        //     gPg.gen_key(kg, (code) => {
        //         assert.equal(code, null, "retcode:" + code);
        //         gPg.list_secret_keys((err: string, keys: lsk.SecretKey[]) => {
        //             assert.equal(err, null);
        //             console.log(err);
        //             console.log(keys);
        //             keys.forEach((key: lsk.SecretKey) => {
        //                 if (key.uids && key.uids[0] && key.uids[0].name == kg.nameReal) {
        //                     assert.equal(key.uids[0].email, kg.nameEmail);
        //                     assert.equal(key.subKeys.length, 0);
        //                     assert.equal(key.type, 'sec');
        //                     assert.equal(key.funky, '');
        //                     assert.equal(key.cipher, 'rsa');
        //                     assert.equal(key.bits, 1024);
        //                     assert.equal(key.expires, '2029-01-01', "Expires");
        //                 }
        //             })
        //             assert.done();
        //         });
        //     });
        // });
    });

});
