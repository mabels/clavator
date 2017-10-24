import { assert } from 'chai';

import PassPhrase from '../../src/gpg/pass-phrase';
import Warrents from '../../src/gpg/warrents';
import Warrent from '../../src/gpg/warrent';

describe('PassPhrase', () => {

  function warrents(i: number): Warrents {
    const wts = new Warrents();
    Array(i).fill(0).map((_, x) => `I${x}`).forEach((ini) => {
      const w = new Warrent();
      w.warrent.value = ini;
      wts.add(w);
    });
    return wts;
  }

  it('warrents-0', () => {
    const pp = PassPhrase.createPassPhrase(warrents(0), '[a-z]', 'error', 4);
    assert.equal(pp.parts.length, 0);
  });

  it('warrents-1 min', () => {
    const pp = PassPhrase.createPassPhrase(warrents(1), '[a-z]', 'error', 4);
    assert.equal(pp.parts.length, 1);
    assert.equal(pp.parts[0].part.match.source, '^[a-z]{4,}$');

  });

  it('warrents-1 min max', () => {
    const pp = PassPhrase.createPassPhrase(warrents(1), '[a-z]', 'error', 4, 8);
    assert.equal(pp.parts.length, 1);
    assert.equal(pp.parts[0].part.match.source, '^[a-z]{4,8}$');

  });

  it('warrents-1 min==max', () => {
    const pp = PassPhrase.createPassPhrase(warrents(1), '[a-z]', 'error', 4, 4);
    assert.equal(pp.parts.length, 1);
    assert.equal(pp.parts[0].part.match.source, '^[a-z]{4,4}$');
  });

  it('warrents-2 min', () => {
    const pp = PassPhrase.createPassPhrase(warrents(2), '[a-z]', 'error', 4);
    assert.equal(pp.parts.length, 2);
    assert.equal(pp.parts[0].part.match.source, '^[a-z]{2,}$');
    assert.equal(pp.parts[1].part.match.source, '^[a-z]{2,}$');

  });

  it('warrents-2 min max', () => {
    const pp = PassPhrase.createPassPhrase(warrents(2), '[a-z]', 'error', 4, 8);
    assert.equal(pp.parts.length, 2);
    assert.equal(pp.parts[0].part.match.source, '^[a-z]{2,4}$');
    assert.equal(pp.parts[1].part.match.source, '^[a-z]{2,4}$');
  });

  it('warrents-2 min==max', () => {
    const pp = PassPhrase.createPassPhrase(warrents(2), '[a-z]', 'error', 8, 8);
    assert.equal(pp.parts.length, 2);
    assert.equal(pp.parts[0].part.match.source, '^[a-z]{4,4}$');
    assert.equal(pp.parts[1].part.match.source, '^[a-z]{4,4}$');
  });

  it('warrents-3 min', () => {
    const pp = PassPhrase.createPassPhrase(warrents(3), '[a-z]', 'error', 4);
    assert.equal(pp.parts.length, 3);
    assert.equal(pp.parts[0].part.match.source, '^[a-z]{2,}$');
    assert.equal(pp.parts[1].part.match.source, '^[a-z]{1,}$');
    assert.equal(pp.parts[2].part.match.source, '^[a-z]{1,}$');
  });

  it('warrents-3 min max', () => {
    const pp = PassPhrase.createPassPhrase(warrents(3), '[a-z]', 'error', 4, 8);
    assert.equal(pp.parts.length, 3);
    assert.equal(pp.parts[0].part.match.source, '^[a-z]{2,3}$');
    assert.equal(pp.parts[1].part.match.source, '^[a-z]{1,3}$');
    assert.equal(pp.parts[2].part.match.source, '^[a-z]{1,2}$');
  });

  it('warrents-3 min==max', () => {
    const pp = PassPhrase.createPassPhrase(warrents(3), '[a-z]', 'error', 8, 8);
    assert.equal(pp.parts.length, 3);
    assert.equal(pp.parts[0].part.match.source, '^[a-z]{3,3}$');
    assert.equal(pp.parts[1].part.match.source, '^[a-z]{3,3}$');
    assert.equal(pp.parts[2].part.match.source, '^[a-z]{2,2}$');
  });

  it('warrents-4 min', () => {
    const pp = PassPhrase.createPassPhrase(warrents(4), '[a-z]', 'error', 4);
    assert.equal(pp.parts.length, 4);
    assert.equal(pp.parts[0].part.match.source, '^[a-z]{2,}$');
    assert.equal(pp.parts[1].part.match.source, '^[a-z]{2,}$');
    assert.equal(pp.parts[2].part.match.source, '^[a-z]{2,}$');
  });

  it('warrents-4 min max', () => {
    const pp = PassPhrase.createPassPhrase(warrents(4), '[a-z]', 'error', 4, 8);
    assert.equal(pp.parts.length, 4);
    assert.equal(pp.parts[0].part.match.source, '^[a-z]{2,4}$');
    assert.equal(pp.parts[1].part.match.source, '^[a-z]{2,4}$');
    assert.equal(pp.parts[2].part.match.source, '^[a-z]{2,4}$');
  });

  it('warrents-4 min==max', () => {
    const pp = PassPhrase.createPassPhrase(warrents(4), '[a-z]', 'error', 8, 8);
    assert.equal(pp.parts.length, 4);
    assert.equal(pp.parts[0].part.match.source, '^[a-z]{3,3}$');
    assert.equal(pp.parts[1].part.match.source, '^[a-z]{3,3}$');
    assert.equal(pp.parts[2].part.match.source, '^[a-z]{2,2}$');
  });

  it('warrents-5 length 4 min', () => {
    const pp = PassPhrase.createPassPhrase(warrents(5), '[a-z]', 'error', 4);
    assert.equal(pp.parts.length, 5);
    assert.equal(pp.parts[0].part.match.source, '^[a-z]{2,}$');
    assert.equal(pp.parts[1].part.match.source, '^[a-z]{2,}$');
    assert.equal(pp.parts[2].part.match.source, '^[a-z]{2,}$');
  });

  it('warrents-5 length 4 min max', () => {
    const pp = PassPhrase.createPassPhrase(warrents(5), '[a-z]', 'error', 4, 8);
    assert.equal(pp.parts.length, 5);
    assert.equal(pp.parts[0].part.match.source, '^[a-z]{2,4}$');
    assert.equal(pp.parts[1].part.match.source, '^[a-z]{2,4}$');
    assert.equal(pp.parts[2].part.match.source, '^[a-z]{2,4}$');
  });

  it('warrents-5 length 4 min==max', () => {
    const pp = PassPhrase.createPassPhrase(warrents(5), '[a-z]', 'error', 8, 8);
    assert.equal(pp.parts.length, 5);
    assert.equal(pp.parts[0].part.match.source, '^[a-z]{3,3}$');
    assert.equal(pp.parts[1].part.match.source, '^[a-z]{3,3}$');
    assert.equal(pp.parts[2].part.match.source, '^[a-z]{2,2}$');
  });

  it('warrents-6 length 4 min', () => {
    const pp = PassPhrase.createPassPhrase(warrents(6), '[a-z]', 'error', 4);
    assert.equal(pp.parts.length, 6);
    assert.equal(pp.parts[0].part.match.source, '^[a-z]{2,}$');
    assert.equal(pp.parts[1].part.match.source, '^[a-z]{2,}$');
    assert.equal(pp.parts[2].part.match.source, '^[a-z]{2,}$');
  });

  it('warrents-6 length 4 min max', () => {
    const pp = PassPhrase.createPassPhrase(warrents(6), '[a-z]', 'error', 4, 8);
    assert.equal(pp.parts.length, 6);
    assert.equal(pp.parts[0].part.match.source, '^[a-z]{2,4}$');
    assert.equal(pp.parts[1].part.match.source, '^[a-z]{2,4}$');
    assert.equal(pp.parts[2].part.match.source, '^[a-z]{2,4}$');
  });

  it('warrents-6 length 4 min==max', () => {
    const pp = PassPhrase.createPassPhrase(warrents(6), '[a-z]', 'error', 8, 8);
    assert.equal(pp.parts.length, 6);
    assert.equal(pp.parts[0].part.match.source, '^[a-z]{3,3}$');
    assert.equal(pp.parts[1].part.match.source, '^[a-z]{3,3}$');
    assert.equal(pp.parts[2].part.match.source, '^[a-z]{2,2}$');
  });

});
