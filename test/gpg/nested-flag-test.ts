import { assert } from 'chai';

import NestedFlag from '../../src/model/nested-flag';

describe('NestedFlag', () => {

  it('Simple', () => {
    const nf = new NestedFlag();
    assert.equal(nf.is, false);
    nf.is = false;
    assert.equal(nf.is, false);
    nf.is = true;
    assert.equal(nf.is, true);
    nf.is = false;
    assert.equal(nf.is, false);
  });

  it('leaf 2', () => {
    const nf0 = new NestedFlag();
    const nf00 = new NestedFlag(nf0);
    const nf000 = new NestedFlag(nf00);
    const nf01 = new NestedFlag(nf0);
    const nf011 = new NestedFlag(nf01);
    const nf012 = new NestedFlag(nf01);

    nf012.is = true;
    assert.equal(nf0.is, false);
    assert.equal(nf00.is, false);
    assert.equal(nf000.is, false);
    assert.equal(nf01.is, false);
    assert.equal(nf011.is, false);
    assert.equal(nf012.is, true);
  });

  it('leaf 1', () => {
    const nf0 = new NestedFlag();
    const nf00 = new NestedFlag(nf0);
    const nf000 = new NestedFlag(nf00);
    const nf01 = new NestedFlag(nf0);
    const nf011 = new NestedFlag(nf01);
    const nf012 = new NestedFlag(nf01);

    nf01.is = true;
    assert.equal(nf0.is, false);
    assert.equal(nf00.is, false);
    assert.equal(nf000.is, false);
    assert.equal(nf01.is, true);
    assert.equal(nf011.is, true);
    assert.equal(nf012.is, true);
    nf011.is = false;
    assert.equal(nf01.is, true);
    assert.equal(nf011.is, false);
    assert.equal(nf012.is, true);
  });

  it('leaf 0', () => {
    const nf0 = new NestedFlag();
    const nf00 = new NestedFlag(nf0);
    const nf000 = new NestedFlag(nf00);
    const nf01 = new NestedFlag(nf0);
    const nf011 = new NestedFlag(nf01);
    const nf012 = new NestedFlag(nf01);

    nf0.is = true;
    assert.equal(nf0.is, true);
    assert.equal(nf00.is, true);
    assert.equal(nf000.is, true);
    assert.equal(nf01.is, true);
    assert.equal(nf011.is, true);
    assert.equal(nf012.is, true);
    nf01.is = false;
    assert.equal(nf01.is, false);
    assert.equal(nf011.is, false);
    assert.equal(nf012.is, false);
    nf011.is = true;
    assert.equal(nf01.is, false);
    assert.equal(nf011.is, true);
    assert.equal(nf012.is, false);
  });

  it('override', () => {
    const nf0 = new NestedFlag();
    const nf00 = new NestedFlag(nf0);
    const nf000 = new NestedFlag(nf00);
    const nf01 = new NestedFlag(nf0);
    const nf011 = new NestedFlag(nf01);
    const nf012 = new NestedFlag(nf01);

    nf0.is = true;
    assert.equal(nf0.is, true);
    assert.equal(nf00.is, true);
    assert.equal(nf000.is, true);
    assert.equal(nf01.is, true);
    assert.equal(nf011.is, true);
    assert.equal(nf012.is, true);
    nf0.is = false;
    assert.equal(nf0.is, false);
    assert.equal(nf00.is, false);
    assert.equal(nf000.is, false);
    assert.equal(nf01.is, false);
    assert.equal(nf011.is, false);
    assert.equal(nf012.is, false);
    nf0.is = true;
    nf01.is = false;
    nf011.is = true;
    assert.equal(nf0.is, true);
    assert.equal(nf00.is, true);
    assert.equal(nf000.is, true);
    assert.equal(nf01.is, false);
    assert.equal(nf011.is, true);
    assert.equal(nf012.is, false);
    nf01.is = true;
    assert.equal(nf01.is, true);
    assert.equal(nf011.is, true);
    assert.equal(nf012.is, true);
    nf011.is = true;
    nf012.is = true;
    nf01.is = false;
    assert.equal(nf01.is, false);
    assert.equal(nf011.is, false);
    assert.equal(nf012.is, false);
    nf011.is = true;
    nf01.is = false;
    nf012.is = true;
    assert.equal(nf01.is, false);
    assert.equal(nf011.is, false);
    assert.equal(nf012.is, true);
  });

});
