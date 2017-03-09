import { assert } from 'chai';


import * as gpg from "../../src/gpg/gpg";
import * as cs from "../../src/gpg/card_status";

function gpg_card_funny(): string {
  return [
    "Reader:1050:0407:X:0:AID:D2760001240102010006041775630000:openpgp-card:\n",
    "version:0201:\n",
    "vendor:0006:Yubico:\n",
    "serial:04177563:\n",
    "name:Meno:Abels:\n",
    "lang:en:\n",
    "sex:m:\n",
    "url:http\\x3a//www.geo.de:\n",
    "login:abels:\n",
    "forcepin:0:::\n",
    "keyattr:1:1:4096:\n",
    "keyattr:2:1:4096:\n",
    "keyattr:3:1:4096:\n",
    "maxpinlen:127:127:127:\n",
    "pinretry:3:0:3:\n",
    "sigcount:16:::\n",
    "cafpr:1:2:3:\n",
    "fpr:F78D5B547A9BB0E8A174C0F5060FF53CB3A32992:B3B94966DF73077EFA734EC83D851A5DF09DEB9C:2D32339F24A537406437181A28E66F405F1BE34D:\n",
    "fprtime:1465218501:1465218921:1464700773:\n"].join("")
}

function gpg_card_status(): string {
  let ret: string[] = [];
  for (let i = 0; i < 3; ++i) {
    ret.push([
      "Reader:Yubico Yubikey 4 OTP U2F CCID:AID:D2760001240102010006041775630000:openpgp-card:\n",
      "version:0201:\n",
      "vendor:0006:Yubico:\n",
      "serial:04177563:\n",
      "name:Meno:Abels:\n",
      "lang:en:\n",
      "sex:m:\n",
      "url:http\\x3a//www.geo.de:\n",
      "login:abels:\n",
      "forcepin:0:::\n",
      "keyattr:1:1:4096:\n",
      "keyattr:2:1:4096:\n",
      "keyattr:3:1:4096:\n",
      "maxpinlen:127:127:127:\n",
      "pinretry:3:0:3:\n",
      "sigcount:16:::\n",
      "cafpr::::\n",
      "fpr:F78D5B547A9BB0E8A174C0F5060FF53CB3A32992:B3B94966DF73077EFA734EC83D851A5DF09DEB9C:2D32339F24A537406437181A28E66F405F1BE34D:\n",
      "fprtime:1465218501:1465218921:1464700773:\n",
    ].join(""));
  }
  return ret.join("");
}

describe("gpg_card_status", () => {
  it("read gpg_card_status", () => {
    let gcss = gpg_card_status();
    let css = cs.Gpg2CardStatus.read(gcss);
    assert.equal(css.length, 3, "size");
    for (let cs of css) {
      assert.equal(cs.reader.model, "Yubico Yubikey 4 OTP U2F CCID");
      assert.equal(cs.reader.aid, "AID");
      assert.equal(cs.reader.cardid, "D2760001240102010006041775630000");
      assert.equal(cs.reader.type, "openpgp-card");
      assert.equal(cs.version, "0201");
      assert.equal(cs.vendor, "0006:Yubico");
      assert.equal(cs.serial, "04177563");
      assert.equal(cs.name, "Meno Abels");
      assert.equal(cs.lang, "en");
      assert.equal(cs.sex, "m");
      assert.equal(cs.url, "http://www.geo.de");
      assert.equal(cs.login, "abels");
      assert.equal(cs.forcepin, "0::");
      assert.equal(cs.keyStates.length, 3);
      const fprs: string[] = [
        "F78D5B547A9BB0E8A174C0F5060FF53CB3A32992",
        "B3B94966DF73077EFA734EC83D851A5DF09DEB9C",
        "2D32339F24A537406437181A28E66F405F1BE34D"
      ];
      const fprtimes: number[] = [
        1465218501,
        1465218921,
        1464700773
      ];
      const cafprs = [0, 0, 0];
      let id = 1;
      for (let ks of cs.keyStates) {
        assert.equal(ks.id, id);
        assert.equal(ks.mode, 1);
        assert.equal(ks.bits, 4096);
        assert.equal(ks.maxpinlen, 127);
        assert.equal(ks.pinretry, id == 2 ? 0 : 3);
        assert.equal(ks.fpr, fprs[id - 1]);
        assert.equal(ks.fprtime, fprtimes[id - 1]);
        assert.equal(ks.cafpr, cafprs[id - 1]);
        ++id;
      }
      assert.equal(cs.sigcount, 16);
      // assert.equal(cs.cafpr, 0);
    }
  });

  it("read gpg_funny_card", () => {
    let gcss = gpg_card_funny();
    let css = cs.Gpg2CardStatus.read(gcss);
    assert.equal(css.length, 1, "size");
    for (let cs of css) {
      assert.equal(cs.reader.model, "1050:0407:X:0");
      assert.equal(cs.reader.aid, "AID");
      assert.equal(cs.reader.cardid, "D2760001240102010006041775630000");
      assert.equal(cs.reader.type, "openpgp-card");
      assert.equal(cs.version, "0201");
      assert.equal(cs.vendor, "0006:Yubico");
      assert.equal(cs.serial, "04177563");
      assert.equal(cs.name, "Meno Abels");
      assert.equal(cs.lang, "en");
      assert.equal(cs.sex, "m");
      assert.equal(cs.url, "http://www.geo.de");
      assert.equal(cs.login, "abels");
      assert.equal(cs.forcepin, "0::");
      assert.equal(cs.keyStates.length, 3);
      const fprs = [
        "F78D5B547A9BB0E8A174C0F5060FF53CB3A32992",
        "B3B94966DF73077EFA734EC83D851A5DF09DEB9C",
        "2D32339F24A537406437181A28E66F405F1BE34D"
      ];
      const fprtimes = [
        1465218501,
        1465218921,
        1464700773
      ];
      const cafprs = [1, 2, 3];
      let id = 1;
      for (let ks of cs.keyStates) {
        assert.equal(ks.id, id);
        assert.equal(ks.mode, 1);
        assert.equal(ks.bits, 4096);
        assert.equal(ks.maxpinlen, 127);
        assert.equal(ks.pinretry, id == 2 ? 0 : 3);
        assert.equal(ks.fpr, fprs[id - 1]);
        assert.equal(ks.fprtime, fprtimes[id - 1]);
        assert.equal(ks.cafpr, cafprs[id - 1]);
        ++id;
      }
      assert.equal(cs.sigcount, 16);
      // assert.equal(cs.cafpr, 0);
    }
  });

  it("eq", () => {
    let gcss = gpg_card_status();
    let css1 = cs.Gpg2CardStatus.read(gcss);
    let css2 = cs.Gpg2CardStatus.read(gcss);
    assert.ok(css1[0].eq(css2[0]))
  })

   it("not eq", () => {
    let gcss = gpg_card_status();
    let cs1 = cs.Gpg2CardStatus.read(gcss)[0];
    let cs2 = cs.Gpg2CardStatus.read(gcss)[0];

    cs1.reader.model = "Wurst"; 
    assert.isFalse(cs1.eq(cs2));
    cs1.reader.model = cs2.reader.model;
    assert.ok(cs1.eq(cs2), "global reset test:model")

    cs1.reader.aid = "XXX"; 
    assert.isFalse(cs1.eq(cs2));
    cs1.reader.aid = cs2.reader.aid;
    assert.ok(cs1.eq(cs2), "global reset test:aid")

    cs1.reader.cardid = "XXX"; 
    assert.isFalse(cs1.eq(cs2));
    cs1.reader.cardid = cs2.reader.cardid;
    assert.ok(cs1.eq(cs2), "global reset test:cardid")

    cs1.reader.type = "openpgp-fart"; 
    assert.isFalse(cs1.eq(cs2));
    cs1.reader.type = cs2.reader.type;
    assert.ok(cs1.eq(cs2), "global reset test:type")

    cs1.version = "4711"; 
    assert.isFalse(cs1.eq(cs2));
    cs1.version = cs2.version;
    assert.ok(cs1.eq(cs2), "global reset test:version")

    cs1.vendor = "VenderBlender"; 
    assert.isFalse(cs1.eq(cs2));
    cs1.vendor = cs2.vendor;
    assert.ok(cs1.eq(cs2), "global reset test:vendor")

    cs1.serial = "471101111"; 
    assert.isFalse(cs1.eq(cs2));
    cs1.serial = cs2.serial;
    assert.ok(cs1.eq(cs2), "global reset test:serial")

    cs1.name = "Xeno Xbels"; 
    assert.isFalse(cs1.eq(cs2));
    cs1.name = cs2.name;
    assert.ok(cs1.eq(cs2), "global reset test:name")

    cs1.lang = "xx"; 
    assert.isFalse(cs1.eq(cs2));
    cs1.lang = cs2.lang;
    assert.ok(cs1.eq(cs2), "global reset test:lang")

    cs1.sex = "x"; 
    assert.isFalse(cs1.eq(cs2));
    cs1.sex = cs2.sex;
    assert.ok(cs1.eq(cs2), "global reset test:sex")

    cs1.url = "url"; 
    assert.isFalse(cs1.eq(cs2));
    cs1.url = cs2.url;
    assert.ok(cs1.eq(cs2), "global reset test:url")

    cs1.login = "xabels"; 
    assert.isFalse(cs1.eq(cs2));
    cs1.login = cs2.login;
    assert.ok(cs1.eq(cs2), "global reset test:login")

    cs1.forcepin = "1::"; 
    assert.isFalse(cs1.eq(cs2));
    cs1.forcepin = cs2.forcepin;
    assert.ok(cs1.eq(cs2), "global reset test:forcepin")

    cs1.sigcount = 4;
    assert.isFalse(cs1.eq(cs2));
    cs1.sigcount = cs2.sigcount;
    assert.ok(cs1.eq(cs2), "global reset test:sigcount")
      const fprs = [
        "F78D5B547A9BB0E8A174C0F5060FF53CB3A32992",
        "B3B94966DF73077EFA734EC83D851A5DF09DEB9C",
        "2D32339F24A537406437181A28E66F405F1BE34D"
      ];
      const fprtimes = [
        1465218501,
        1465218921,
        1464700773
      ];
      const cafprs = [1, 2, 3];
      let id = 1;
      for (let ks of cs1.keyStates) {
        ks.id = 9+id; 
        assert.isFalse(cs1.eq(cs2));
        ks.id = id;
        assert.ok(cs1.eq(cs2), `ks.id ${id}`)

        ks.mode = 9; 
        assert.isFalse(cs1.eq(cs2));
        ks.mode = 1;
        assert.ok(cs1.eq(cs2), `ks.mode ${id}`)

        ks.bits = 9193; 
        assert.isFalse(cs1.eq(cs2));
        ks.bits = 4096;
        assert.ok(cs1.eq(cs2), `ks.bits ${id}`)

        ks.maxpinlen = 9193; 
        assert.isFalse(cs1.eq(cs2));
        ks.maxpinlen = 127;
        assert.ok(cs1.eq(cs2), `ks.maxpinlen ${id}`)

        ks.pinretry = 9193; 
        assert.isFalse(cs1.eq(cs2));
        ks.pinretry = id == 2 ? 0 : 3;
        assert.ok(cs1.eq(cs2), `ks.pinretry ${id}`)

        ks.fpr = "fingerprint"; 
        assert.isFalse(cs1.eq(cs2));
        ks.fpr = fprs[id - 1];
        assert.ok(cs1.eq(cs2), `ks.fpr ${id}`)

        ks.fprtime = 5493934;
        assert.isFalse(cs1.eq(cs2));
        ks.fprtime = fprtimes[id - 1];
        assert.ok(cs1.eq(cs2), `ks.fprtime ${id}`)

        ks.cafpr = 5493934;
        assert.isFalse(cs1.eq(cs2));
        ks.cafpr = cs2.keyStates[id-1].cafpr;
        assert.ok(cs1.eq(cs2), `ks.cafpr ${id}`)

        ++id;
      }
      assert.ok(cs1.eq(cs2), "global reset test")

  })


});
