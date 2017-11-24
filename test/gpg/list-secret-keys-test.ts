import { assert } from 'chai';

import * as gpg from '../../src/gpg/gpg';
import * as lsk from '../../src/gpg/list-secret-keys';

describe('ListSecretKeys', () => {

  function createKeyFromString(): lsk.SecretKey[] {
    return lsk.run(`
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
          `.replace(/\t/g, ''));
  }

  function testListSecretKeys(s: lsk.SecretKey[]): void {
    assert.equal(s.length, 3);
    assert.equal(s[0].keyId, '1A5D93796CF70ADF');
    assert.equal(s[1].keyId, '23C4790FEF6E173F');
    assert.equal(s[2].keyId, '19B013CF06A4BEEF');
    assert.equal(s[2].funky, '#');
    assert.equal(s[2].fingerPrint.fpr, 'F36846C4A7DEFD55F492069C19B013CF06A4BEEF');
    assert.equal(s[2].group.grp, '75E60BCBF5E25BBBF0E701CD55BC79F4C03BC320');
    assert.equal(s[2].subKeys.length, 3);
    // console.log(s[2].subKeys)
    assert.equal(s[2].subKeys[0].type, 'ssb');
    assert.equal(s[2].subKeys[0].cipher, 'rsa');
    assert.equal(s[2].subKeys[0].bits, 4096);
    assert.equal(s[2].subKeys[0].keyId, '28E66F405F1BE34D');
    assert.equal(s[2].subKeys[0].created, 1464700773, 'Created');
    assert.equal(s[2].subKeys[0].expires, 1622380773, 'Expires');
    assert.equal(s[2].subKeys[0].fingerPrint.fpr, '2D32339F24A537406437181A28E66F405F1BE34D', 'ssbfpr');
    assert.equal(s[2].subKeys[0].group.grp, 'C083EC516CCEEFE80403CCA7CC3782A017C99142', 'ssbGroup');
    assert.deepEqual(s[2].subKeys[0].uses, ['a', 'e', 's']);
    assert.equal(s[2].uids.length, 1);
    assert.equal(s[2].uids[0].trust, 'u');
    assert.equal(s[2].uids[0].name, 'Meno Abels');
    assert.equal(s[2].uids[0].email, 'meno.abels@adviser.com');
    assert.equal(s[2].uids[0].comment, null);

  }

  it('externListSecretKeys', async () => {
    return new Promise<void>(async (res, rej) => {
      try {
        const mock = await gpg.createMock();
        mock.list_secret_keys((err: string, keys: lsk.SecretKey[]) => {
          assert.equal(err, null);
          testListSecretKeys(keys);
          res();
        });
      } catch (e) {
        rej(e);
      }
    });
  });

  it('listSecretKeys', () => {
    testListSecretKeys(createKeyFromString());
  });

  it('keyGen.eq', () => {
    let keys1 = createKeyFromString();
    let keys2 = createKeyFromString();
    keys1.forEach((key, idx) => {
      assert.ok(key.eq(keys2[idx]), `key:${idx}`);
    });
  });

  it('keyGen.not eq', () => {
    let keys1 = createKeyFromString();
    let keys2 = createKeyFromString();
    keys1.forEach((key, idx) => {
      key.keyId = 'Wurst';
      assert.isFalse(key.eq(keys2[idx]), 'keyid');
      key.keyId = keys2[idx].keyId;
      assert.ok(key.eq(keys2[idx]), 'key.keyId');

      key.funky = 'Wurst';
      assert.isFalse(key.eq(keys2[idx]), 'funky');
      key.funky = keys2[idx].funky;
      assert.ok(key.eq(keys2[idx]), 'key.funky');

      key.fingerPrint.fpr = 'Wurst';
      assert.isFalse(key.eq(keys2[idx]), 'fingerPrint.fpr');
      key.fingerPrint.fpr = keys2[idx].fingerPrint.fpr;
      assert.ok(key.eq(keys2[idx]), 'key.fingerPrint.fpr');

      key.group.grp = 'Wurst';
      assert.isFalse(key.eq(keys2[idx]), 'group.grp');
      key.group.grp = keys2[idx].group.grp;
      assert.ok(key.eq(keys2[idx]), 'key.group.grp');

      key.subKeys[0].type = 'xxx';
      assert.isFalse(key.eq(keys2[idx]), 'subkeys.type');
      key.subKeys[0].type = keys2[idx].subKeys[0].type;
      assert.ok(key.eq(keys2[idx]), 'key.subkeys.type');

      key.subKeys[0].cipher = 'xxx';
      assert.isFalse(key.eq(keys2[idx]), 'subkeys.cipher');
      key.subKeys[0].cipher = keys2[idx].subKeys[0].cipher;
      assert.ok(key.eq(keys2[idx]), 'key.subkeys.cipher');

      key.subKeys[0].bits = 4912;
      assert.isFalse(key.eq(keys2[idx]), 'subkeys.bits');
      key.subKeys[0].bits = keys2[idx].subKeys[0].bits;
      assert.ok(key.eq(keys2[idx]), 'key.subkeys.bits');

      key.subKeys[0].keyId = 'keyid';
      assert.isFalse(key.eq(keys2[idx]), 'subkeys.keyId');
      key.subKeys[0].keyId = keys2[idx].subKeys[0].keyId;
      assert.ok(key.eq(keys2[idx]), 'key.subkeys.keyId');

      key.subKeys[0].created = 4711;
      assert.isFalse(key.eq(keys2[idx]), 'subkeys.created');
      key.subKeys[0].created = keys2[idx].subKeys[0].created;
      assert.ok(key.eq(keys2[idx]), 'key.subkeys.created');

      key.subKeys[0].expires = 4711;
      assert.isFalse(key.eq(keys2[idx]), 'subkeys.expires');
      key.subKeys[0].expires = keys2[idx].subKeys[0].expires;
      assert.ok(key.eq(keys2[idx]), 'key.subkeys.expires');

      key.subKeys[0].fingerPrint.fpr = 'fing';
      assert.isFalse(key.eq(keys2[idx]), 'subkeys.fingerPrint.fpr');
      key.subKeys[0].fingerPrint.fpr = keys2[idx].subKeys[0].fingerPrint.fpr;
      assert.ok(key.eq(keys2[idx]), 'key.subkeys.fingerPrint.fpr');

      key.subKeys[0].group.grp = 'fing';
      assert.isFalse(key.eq(keys2[idx]), 'subkeys.group.grp');
      key.subKeys[0].group.grp = keys2[idx].subKeys[0].group.grp;
      assert.ok(key.eq(keys2[idx]), 'key.subkeys.group.grp');

      key.subKeys[0].uses = ['1', '1', '1'];
      assert.isFalse(key.eq(keys2[idx]), 'subkeys.uses');
      key.subKeys[0].uses = keys2[idx].subKeys[0].uses;
      assert.ok(key.eq(keys2[idx]), 'key.subkeys.uses');

      key.uids[0].trust = 't';
      assert.isFalse(key.eq(keys2[idx]), 'subkeys.trust');
      key.uids[0].trust = keys2[idx].uids[0].trust;
      assert.ok(key.eq(keys2[idx]), 'key.uid.trust');

      key.uids[0].name = 'Nomen Ist';
      assert.isFalse(key.eq(keys2[idx]), 'uid.name');
      key.uids[0].name = keys2[idx].uids[0].name;
      assert.ok(key.eq(keys2[idx]), 'key.uid.name');

      key.uids[0].email = 'Nomen@Ist';
      assert.isFalse(key.eq(keys2[idx]), 'uid.email');
      key.uids[0].email = keys2[idx].uids[0].email;
      assert.ok(key.eq(keys2[idx]), 'key.uid.email');

      key.uids[0].comment = 'ipsu lorem';
      assert.isFalse(key.eq(keys2[idx]), 'uid.comment');
      key.uids[0].comment = keys2[idx].uids[0].comment;
      assert.ok(key.eq(keys2[idx]), 'key.uid.comment');

      assert.ok(key.eq(keys2[idx]), 'over all check');
    });

  });

});
