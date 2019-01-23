import { assert } from 'chai';

import { CharFormat } from '../../src/ui/model';

describe('CardFormat', async () => {

  it('simple wild', () => {
    const cf = (new CharFormat()).range('1', '9').any();
    assert.isTrue(cf.isWildCard());
  });

  it('illegal range', () => {
    assert.throws(() => (new CharFormat()).range('9', '1'));
  });

  it('simple 0-9', () => {
    const cf = (new CharFormat()).range('0', '9');
    assert.isFalse(cf.isWildCard());
    assert.equal('0123456789', cf.vector().join(''));
  });

  it('simple a-z overlapps a-z', () => {
    const cf = (new CharFormat()).range('0', '9').range('0', '9');
    assert.isFalse(cf.isWildCard());
    assert.equal('0123456789', cf.vector().join(''));
  });

  it('simple a-z overlapps b-y', () => {
    const cf = (new CharFormat()).range('1', '8').range('0', '9');
    assert.isFalse(cf.isWildCard());
    assert.equal('0123456789', cf.vector().join(''));
  });

  it('simple a-m overlapps a-z', () => {
    const cf = (new CharFormat()).range('0', '5').range('0', '9');
    assert.isFalse(cf.isWildCard());
    assert.equal('0123456789', cf.vector().join(''));
  });

  it('simple a-m concat c-z', () => {
    const cf = (new CharFormat()).range('0', '5').range('3', '9');
    assert.isFalse(cf.isWildCard());
    assert.equal('0123456789', cf.vector().join(''));
  });

  it('simple a-m concat n-z', () => {
    const cf = (new CharFormat()).range('0', '5').range('6', '9');
    assert.isFalse(cf.isWildCard());
    assert.equal('0123456789', cf.vector().join(''));
  });

  it('simple a-m concat o-z', () => {
    const cf = (new CharFormat()).range('0', '5').range('7', '9');
    assert.isFalse(cf.isWildCard());
    assert.equal('012345789', cf.vector().join(''));
  });

});
