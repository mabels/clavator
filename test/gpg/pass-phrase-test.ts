import { assert } from 'chai';

import PassPhrase from '../../src/ui/model/pass-phrase';
import Warrents from '../../src/gpg/warrents';
import Warrent from '../../src/gpg/warrent';
import DiceWare from '../../src/dice-ware/dice-ware';
import CharFormat from '../../src/ui/model/char-format';
import DiceWareDispatcher from '../../src/server/dispatcher/dice-ware-dispatcher';
import { ResultQueue } from '../../src/gpg/result';

describe('PassPhrase', () => {

  let diceWares: DiceWare[];
  let rq: ResultQueue = null;

  before((done: any): void => {
    rq = ResultQueue.create();
    DiceWareDispatcher.get(rq).subscribe(rcdws => {
      diceWares = rcdws.data;
      console.log('diceWares loaded');
      done();
    });
  });

  after((done) => {
    rq.stop().subscribe(done);
  });

  function warrents(i: number): Warrents {
    const wts = new Warrents();
    Array(i).fill(0).map((_, x) => `I${x}`).forEach((ini) => {
      const w = new Warrent();
      w.warrent.value = ini;
      wts.add(w);
    });
    return wts;
  }

  describe('createDoublePassports', () => {
    it('warrents-0', () => {
      const pp = PassPhrase.createDoublePasswords(0, warrents(0), diceWares, CharFormat.lowerAlphas(), 'error', '', 4);
      assert.equal(pp.doublePasswords.length, 0);
    });

    it('warrents-1 min', () => {
      const pp = PassPhrase.createDoublePasswords(0, warrents(1), diceWares, CharFormat.lowerAlphas(), 'error', '', 4);
      assert.equal(pp.doublePasswords.length, 0);
    });

    it('warrents-1 min max', () => {
      const pp = PassPhrase.createDoublePasswords(6, warrents(1), diceWares,
        CharFormat.lowerAlphas(), 'error', '', 4, 8);
      assert.equal(pp.doublePasswords.length, 6);
      assert.isFalse(!!pp.doublePasswords.find(i => i.warrents.length() != 1));
      assert.deepEqual((new Array(pp.doublePasswords.length)).fill('^[a-z]{4,8}$'),
         pp.doublePasswords.map(i => i.first.match().source));
    });

    it('warrents-1 min==max', () => {
      const pp = PassPhrase.createDoublePasswords(6, warrents(1), diceWares,
        CharFormat.lowerAlphas(), 'error', '', 4, 4);
      assert.equal(pp.doublePasswords.length, 6);
      assert.isFalse(!!pp.doublePasswords.find(i => i.warrents.length() != 1));
      assert.isFalse(!!pp.doublePasswords.find((i, idx) => {
        // console.log(i.warrents.first().warrent.objectId(),
        //            pp.warrents.get(idx % pp.warrents.length()).objectId());
        return i.warrents.first().warrent !== pp.warrents.get(idx % pp.warrents.length());
      }));
      assert.deepEqual((new Array(pp.doublePasswords.length)).fill('^[a-z]{4,4}$'),
         pp.doublePasswords.map(i => i.first.match().source));
    });

    it('warrents-2 min', () => {
      const pp = PassPhrase.createDoublePasswords(6, warrents(2), diceWares, CharFormat.lowerAlphas(), 'error', '', 4);
      assert.equal(pp.doublePasswords.length, 6);
      assert.isFalse(!!pp.doublePasswords.find(i => i.warrents.length() != 1));
      assert.deepEqual((new Array(pp.doublePasswords.length)).fill('^[a-z]{4,}$'),
         pp.doublePasswords.map(i => i.first.match().source));

    });

    it('warrents-2 min==max', () => {
      const pp = PassPhrase.createDoublePasswords(6, warrents(2), diceWares,
        CharFormat.lowerAlphas(), 'error', '', 8, 8);
      assert.equal(pp.doublePasswords.length, 6);
      assert.isFalse(!!pp.doublePasswords.find(i => i.warrents.length() != 1));
      assert.deepEqual((new Array(pp.doublePasswords.length)).fill('^[a-z]{8,8}$'),
         pp.doublePasswords.map(i => i.first.match().source));
    });

  });

  describe('createPerWarrent', () => {

    it('warrents-0', () => {
      const pp = PassPhrase.createPerWarrent(warrents(0), diceWares, CharFormat.lowerAlphas(), 'error', '', 4);
      assert.equal(pp.doublePasswords.length, 0);
      assert.isFalse(!!pp.doublePasswords.find(i => i.warrents.length() != 0));
    });

    it('warrents-1 min', () => {
      const pp = PassPhrase.createPerWarrent(warrents(1), diceWares, CharFormat.lowerAlphas(), 'error', '', 4);
      assert.equal(pp.doublePasswords.length, 1);
      assert.isFalse(!!pp.doublePasswords.find(i => i.warrents.length() != 1));
      assert.deepEqual([
        '^[a-z]{4,}$'
      ],
      pp.doublePasswords.map(i => i.first.match().source));

    });

    it('warrents-1 min max', () => {
      const pp = PassPhrase.createPerWarrent(warrents(1), diceWares, CharFormat.lowerAlphas(), 'error', '', 4, 8);
      assert.equal(pp.doublePasswords.length, 1);
      assert.isFalse(!!pp.doublePasswords.find(i => i.warrents.length() != 1));
      assert.deepEqual([
        '^[a-z]{4,8}$'
      ],
      pp.doublePasswords.map(i => i.first.match().source));

    });

    it('warrents-1 min==max', () => {
      const pp = PassPhrase.createPerWarrent(warrents(1), diceWares, CharFormat.lowerAlphas(), 'error', '', 4, 4);
      assert.equal(pp.doublePasswords.length, 1);
      assert.isFalse(!!pp.doublePasswords.find(i => i.warrents.length() != 1));
      assert.deepEqual([
        '^[a-z]{4,4}$'
      ],
      pp.doublePasswords.map(i => i.first.match().source));
    });

    it('warrents-2 min', () => {
      const pp = PassPhrase.createPerWarrent(warrents(2), diceWares, CharFormat.lowerAlphas(), 'error', '', 4);
      assert.equal(pp.doublePasswords.length, 2);
      assert.isFalse(!!pp.doublePasswords.find(i => i.warrents.length() != 1));
      assert.deepEqual([
        '^[a-z]{2,}$',
        '^[a-z]{2,}$'
      ],
      pp.doublePasswords.map(i => i.first.match().source));

    });

    it('warrents-2 min max', () => {
      const pp = PassPhrase.createPerWarrent(warrents(2), diceWares, CharFormat.lowerAlphas(), 'error', '', 4, 8);
      assert.equal(pp.doublePasswords.length, 2);
      assert.isFalse(!!pp.doublePasswords.find(i => i.warrents.length() != 1));
      assert.deepEqual([
        '^[a-z]{2,4}$',
        '^[a-z]{2,4}$'
      ],
      pp.doublePasswords.map(i => i.first.match().source));
    });

    it('warrents-2 min==max', () => {
      const pp = PassPhrase.createPerWarrent(warrents(2), diceWares, CharFormat.lowerAlphas(), 'error', '', 8, 8);
      assert.equal(pp.doublePasswords.length, 2);
      assert.isFalse(!!pp.doublePasswords.find(i => i.warrents.length() != 1));
      assert.deepEqual([
        '^[a-z]{4,4}$',
        '^[a-z]{4,4}$'
      ],
      pp.doublePasswords.map(i => i.first.match().source));
    });

    it('warrents-3 min', () => {
      const pp = PassPhrase.createPerWarrent(warrents(3), diceWares, CharFormat.lowerAlphas(), 'error', '', 4);
      assert.equal(pp.doublePasswords.length, 3);
      assert.isFalse(!!pp.doublePasswords.find(i => i.warrents.length() != 1));
      assert.deepEqual([
        '^[a-z]{2,}$',
        '^[a-z]{1,}$',
        '^[a-z]{1,}$'
      ],
      pp.doublePasswords.map(i => i.first.match().source));
    });

    it('warrents-3 min max', () => {
      const pp = PassPhrase.createPerWarrent(warrents(3), diceWares, CharFormat.lowerAlphas(), 'error', '', 4, 8);
      assert.equal(pp.doublePasswords.length, 3);
      assert.isFalse(!!pp.doublePasswords.find(i => i.warrents.length() != 1));
      assert.deepEqual([
        '^[a-z]{2,3}$',
        '^[a-z]{1,3}$',
        '^[a-z]{1,2}$'
      ],
      pp.doublePasswords.map(i => i.first.match().source));
    });

    it('warrents-3 min==max', () => {
      const pp = PassPhrase.createPerWarrent(warrents(3), diceWares, CharFormat.lowerAlphas(), 'error', '', 8, 8);
      assert.equal(pp.doublePasswords.length, 3);
      assert.isFalse(!!pp.doublePasswords.find(i => i.warrents.length() != 1));
      assert.deepEqual([
        '^[a-z]{3,3}$',
        '^[a-z]{3,3}$',
        '^[a-z]{2,2}$'
      ],
      pp.doublePasswords.map(i => i.first.match().source));
    });

    it('warrents-4 min', () => {
      const pp = PassPhrase.createPerWarrent(warrents(4), diceWares, CharFormat.lowerAlphas(), 'error', '', 4);
      assert.equal(pp.doublePasswords.length, 4);
      assert.isFalse(!!pp.doublePasswords.find(i => i.warrents.length() != 1));
      assert.deepEqual([
        '^[a-z]{1,}$',
        '^[a-z]{1,}$',
        '^[a-z]{1,}$',
        '^[a-z]{1,}$'
      ],
      pp.doublePasswords.map(i => i.first.match().source));
    });

    it('warrents-4 min max', () => {
      const pp = PassPhrase.createPerWarrent(warrents(4), diceWares, CharFormat.lowerAlphas(), 'error', '', 4, 8);
      assert.equal(pp.doublePasswords.length, 4);
      assert.isFalse(!!pp.doublePasswords.find(i => i.warrents.length() != 1));
      assert.deepEqual([
        '^[a-z]{1,2}$',
        '^[a-z]{1,2}$',
        '^[a-z]{1,2}$',
        '^[a-z]{1,2}$'
      ],
      pp.doublePasswords.map(i => i.first.match().source));
    });

    it('warrents-4 min==max', () => {
      const pp = PassPhrase.createPerWarrent(warrents(4), diceWares, CharFormat.lowerAlphas(), 'error', '', 8, 8);
      assert.equal(pp.doublePasswords.length, 4);
      assert.isFalse(!!pp.doublePasswords.find(i => i.warrents.length() != 1));
      assert.deepEqual([
        '^[a-z]{2,2}$',
        '^[a-z]{2,2}$',
        '^[a-z]{2,2}$',
        '^[a-z]{2,2}$'
      ],
      pp.doublePasswords.map(i => i.first.match().source));
    });

    it('warrents-5 length 4 min', () => {
      const pp = PassPhrase.createPerWarrent(warrents(5), diceWares, CharFormat.lowerAlphas(), 'error', '', 4);
      assert.equal(pp.doublePasswords.length, 5);
      assert.isFalse(!!pp.doublePasswords.find(i => i.warrents.length() != 1));
      assert.deepEqual([
        '^[a-z]{1,}$',
        '^[a-z]{1,}$',
        '^[a-z]{1,}$',
        '^[a-z]{1,}$',
        '^[a-z]{0,}$'
      ],
      pp.doublePasswords.map(i => i.first.match().source));
    });

    it('warrents-5 length 4 min max', () => {
      const pp = PassPhrase.createPerWarrent(warrents(5), diceWares, CharFormat.lowerAlphas(), 'error', '', 4, 8);
      assert.equal(pp.doublePasswords.length, 5);
      assert.isFalse(!!pp.doublePasswords.find(i => i.warrents.length() != 1));
      assert.deepEqual([
        '^[a-z]{1,2}$',
        '^[a-z]{1,2}$',
        '^[a-z]{1,2}$',
        '^[a-z]{1,1}$',
        '^[a-z]{0,1}$'
      ],
      pp.doublePasswords.map(i => i.first.match().source));
    });

    it('warrents-5 length 4 min==max', () => {
      const pp = PassPhrase.createPerWarrent(warrents(5), diceWares, CharFormat.lowerAlphas(), 'error', '', 8, 8);
      assert.equal(pp.doublePasswords.length, 5);
      assert.isFalse(!!pp.doublePasswords.find(i => i.warrents.length() != 1));
      assert.deepEqual([
        '^[a-z]{2,2}$',
        '^[a-z]{2,2}$',
        '^[a-z]{2,2}$',
        '^[a-z]{1,1}$',
        '^[a-z]{1,1}$',
      ],
      pp.doublePasswords.map(i => i.first.match().source));
    });

    it('warrents-6 length 4 min', () => {
      const pp = PassPhrase.createPerWarrent(warrents(6), diceWares, CharFormat.lowerAlphas(), 'error', '', 4);
      assert.equal(pp.doublePasswords.length, 6);
      assert.isFalse(!!pp.doublePasswords.find(i => i.warrents.length() != 1));
      assert.deepEqual([
        '^[a-z]{1,}$',
        '^[a-z]{1,}$',
        '^[a-z]{1,}$',
        '^[a-z]{1,}$',
        '^[a-z]{0,}$',
        '^[a-z]{0,}$'
      ],
      pp.doublePasswords.map(i => i.first.match().source));
    });

    it('warrents-6 length 4 min max', () => {
      const pp = PassPhrase.createPerWarrent(warrents(6), diceWares, CharFormat.lowerAlphas(), 'error', '', 4, 8);
      assert.equal(pp.doublePasswords.length, 6);
      assert.isFalse(!!pp.doublePasswords.find(i => i.warrents.length() != 1));
      assert.deepEqual([
        '^[a-z]{1,2}$',
        '^[a-z]{1,2}$',
        '^[a-z]{1,1}$',
        '^[a-z]{1,1}$',
        '^[a-z]{0,1}$',
        '^[a-z]{0,1}$'
      ],
      pp.doublePasswords.map(i => i.first.match().source));
    });

    it('warrents-6 length 4 min==max', () => {
      const pp = PassPhrase.createPerWarrent(warrents(6), diceWares, CharFormat.lowerAlphas(), 'error', '', 8, 8);
      assert.equal(pp.doublePasswords.length, 6);
      assert.isFalse(!!pp.doublePasswords.find(i => i.warrents.length() != 1));
      assert.deepEqual([
            '^[a-z]{2,2}$',
            '^[a-z]{2,2}$',
            '^[a-z]{1,1}$',
            '^[a-z]{1,1}$',
            '^[a-z]{1,1}$',
            '^[a-z]{1,1}$'
        ],
        pp.doublePasswords.map(i => i.first.match().source));
      // assert.equal(pp.doublePasswords[0].first.match().source, '^[a-z]{3,3}$');
      // assert.equal(pp.doublePasswords[1].first.match().source, '^[a-z]{3,3}$');
      // assert.equal(pp.doublePasswords[2].first.match().source, '^[a-z]{2,2}$');
    });
  });

});
