
import { assert } from 'chai';

import * as Kg from '../../src/gpg/key-gen';

function makeKeyGen(): Kg.KeyGen {
  let kg = new Kg.KeyGen();
  kg.password.password = 'password';
  kg.password.verify = 'v-password';
  // kg.adminPin.password = 'adminPin'
  // kg.adminPin.verify = 'v-adminPin'
  // kg.userPin.verify = 'v-userPin'
  // kg.userPin.verify = 'v-userPin'
  kg.keyInfo.type.value = 'RS';
  kg.keyInfo.length.value = 4777;
  kg.keyInfo.usage.values = ['murks', 'lurks'];
  let uid = new Kg.Uid();
  uid.name.value = 'nameReal';
  uid.email.value = 'name@Real';
  uid.comment.value = 'name@Real';
  kg.uids.add(uid);
  let ki1 = new Kg.KeyInfo();
  ki1.type.value = 'ki1';
  ki1.length.value = 4531;
  ki1.usage.values = ['ki1.1', 'ki1.2'];
  kg.subKeys.add(ki1);
  let ki2 = new Kg.KeyInfo();
  ki2.type.value = 'ki2';
  ki2.length.value = 5413;
  ki2.usage.values = ['ki2.1', 'ki2.2'];
  kg.subKeys.add(ki2);
  return kg;
}

function makeValidKeyGen(): Kg.KeyGen {
  let kg = new Kg.KeyGen();
  kg.password.password = 'password';
  kg.password.verify = 'password';
  // kg.adminPin.password = 'adminPin'
  // kg.adminPin.verify = 'adminPin'
  // kg.userPin.verify = 'userPin'
  // kg.userPin.verify = 'userPin'
  kg.keyInfo.type.value = 'RSA';
  kg.keyInfo.length.value = 4096;
  kg.keyInfo.usage.values = ['sign', 'cert'];
  let uid = new Kg.Uid();
  uid.name.value = 'Name Real';
  uid.email.value = 'name@real.name';
  uid.comment.value = 'jo man';
  kg.uids.add(uid);
  let ki1 = new Kg.KeyInfo();
  ki1.type.value = 'RSA';
  ki1.length.value = 2048;
  ki1.usage.values = ['auth', 'encr'];
  kg.subKeys.add(ki1);
  let ki2 = new Kg.KeyInfo();
  ki2.type.value = 'RSA';
  ki2.length.value = 1024;
  ki2.usage.values = ['sign', 'auth'];
  kg.subKeys.add(ki2);
  return kg;
}

describe('keygen', () => {
  it('serialization', () => {
    let sjs = JSON.stringify(makeKeyGen());
    let js = JSON.parse(sjs);
    let rkg = new Kg.KeyGen();
    Kg.KeyGen.fill(js, rkg);

    assert.equal(rkg.password.password, 'password');
    assert.equal(rkg.password.verify, 'v-password');
    // assert.equal(rkg.adminPin.password, 'adminPin');
    // assert.equal(rkg.adminPin.verify, 'v-adminPin');
    // assert.equal(rkg.userPin.verify, 'v-userPin');
    // assert.equal(rkg.userPin.verify, 'v-userPin');
    assert.equal(rkg.keyInfo.type.value, 'RS');
    assert.equal(rkg.keyInfo.length.value, 4777);
    assert.deepEqual(rkg.keyInfo.usage.values, ['murks', 'lurks']);
    assert.equal(rkg.uids.pallets[0].name.value, 'nameReal');
    assert.equal(rkg.uids.pallets[0].email.value, 'name@Real');
    assert.equal(rkg.uids.pallets[0].comment.value, 'name@Real');
    assert.equal(rkg.subKeys.pallets[0].type.value, 'ki1');
    assert.equal(rkg.subKeys.pallets[0].length.value, 4531);
    assert.deepEqual(rkg.subKeys.pallets[0].usage.values, ['ki1.1', 'ki1.2']);
    assert.equal(rkg.subKeys.pallets[1].type.value, 'ki2');
    assert.equal(rkg.subKeys.pallets[1].length.value, 5413);
    assert.deepEqual(rkg.subKeys.pallets[1].usage.values, ['ki2.1', 'ki2.2']);
  });

  it('is invalid', () => {
    let invalid = makeKeyGen();
    assert.equal(invalid.valid(), false);
  });
  it('is valid', () => {
    let valid = makeValidKeyGen();
    assert.equal(valid.valid(), false);
  });

});
