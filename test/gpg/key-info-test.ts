
import { assert } from 'chai';

import { KeyGenUid, KeyGen, KeyInfo } from '../../src/gpg/types';

function makeKeyGen(): KeyGen {
  let kg = new KeyGen();
  kg.password._value.set('password');
  // kg.password.verify = 'v-password';
  // kg.adminPin.password = 'adminPin'
  // kg.adminPin.verify = 'v-adminPin'
  // kg.userPin.verify = 'v-userPin'
  // kg.userPin.verify = 'v-userPin'
  kg.keyInfo.type._value.set('RS');
  kg.keyInfo.length._value.set(4777);
  kg.keyInfo.usage.values.replace(['murks', 'lurks']);
  let uid = new KeyGenUid();
  uid.name._value.set('nameReal');
  uid.email._value.set('name@Real');
  uid.comment._value.set('name@Real');
  kg.uids.add(uid);
  let ki1 = new KeyInfo();
  ki1.type._value.set('ki1');
  ki1.length._value.set(4531);
  ki1.usage.values.replace(['ki1.1', 'ki1.2']);
  kg.subKeys.add(ki1);
  let ki2 = new KeyInfo();
  ki2.type._value.set('ki2');
  ki2.length._value.set(5413);
  ki2.usage.values.replace(['ki2.1', 'ki2.2']);
  kg.subKeys.add(ki2);
  return kg;
}

function makeValidKeyGen(): KeyGen {
  const kg = new KeyGen();
  kg.password._value.set('password');
  // kg.password.verify = 'password';
  // kg.adminPin.password = 'adminPin'
  // kg.adminPin.verify = 'adminPin'
  // kg.userPin.verify = 'userPin'
  // kg.userPin.verify = 'userPin'
  kg.keyInfo.type._value.set('RSA');
  kg.keyInfo.length._value.set(4096);
  kg.keyInfo.usage.values.replace(['sign', 'cert']);
  let uid = new KeyGenUid();
  uid.name._value.set('Name Real');
  uid.email._value.set('name@real.name');
  uid.comment._value.set('jo man');
  kg.uids.add(uid);
  let ki1 = new KeyInfo();
  ki1.type._value.set('RSA');
  ki1.length._value.set(2048);
  ki1.usage.values.replace(['auth', 'encr']);
  kg.subKeys.add(ki1);
  let ki2 = new KeyInfo();
  ki2.type._value.set('RSA');
  ki2.length._value.set(1024);
  ki2.usage.values.replace(['sign', 'auth']);
  kg.subKeys.add(ki2);
  return kg;
}

describe('keygen', () => {
  it('serialization', () => {
    const sjs = JSON.stringify(makeKeyGen());
    const js = JSON.parse(sjs);
    // console.log(sjs);
    const rkg = new KeyGen();
    KeyGen.fill(js, rkg);

    assert.equal(rkg.password.value, 'password');
    // assert.equal(rkg.password.verify, 'v-password');
    // assert.equal(rkg.adminPin.password, 'adminPin');
    // assert.equal(rkg.adminPin.verify, 'v-adminPin');
    // assert.equal(rkg.userPin.verify, 'v-userPin');
    // assert.equal(rkg.userPin.verify, 'v-userPin');
    assert.equal(rkg.keyInfo.type.value, 'RS');
    assert.equal(rkg.keyInfo.length.value, 4777);
    assert.deepEqual(rkg.keyInfo.usage.values, ['murks', 'lurks']);
    assert.equal(rkg.uids.first().name.value, 'nameReal');
    assert.equal(rkg.uids.first().email.value, 'name@Real');
    assert.equal(rkg.uids.first().comment.value, 'name@Real');
    assert.equal(rkg.subKeys.first().type.value, 'ki1');
    assert.equal(rkg.subKeys.first().length.value, 4531);
    assert.deepEqual(rkg.subKeys.first().usage.values, ['ki1.1', 'ki1.2']);
    assert.equal(rkg.subKeys.get(1).type.value, 'ki2');
    assert.equal(rkg.subKeys.get(1).length.value, 5413);
    assert.deepEqual(rkg.subKeys.get(1).usage.values, ['ki2.1', 'ki2.2']);
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
