
import { assert } from 'chai';

import DiceWareDispatcher from '../../src/server/dispatcher/dice-ware-dispatcher';
import DiceWare from '../../src/dice-ware/dice-ware';
import { ResultQueue } from '../../src/gpg/result';
import * as rxme from 'rxme';

describe('DiceWare', () => {
  let rq: ResultQueue = null;

  before((done) => {
    ResultQueue.create().match(ResultQueue.match(myrq => {
      rq = myrq;
      done();
    })).passTo();
  });

  after((done) => {
    rq.stop().match(done).passTo();
  });

  it('serialize', async () => {
    const dws: DiceWare[] = [];
    DiceWareDispatcher.get(rq).match(DiceWare.match(rcdw => {
      dws.push(rcdw);
    })).match(rxme.Matcher.Complete(() => {
      const diceWares = dws;
      const clones = diceWares.map(dw => DiceWare.fill(dw.toObj()));
      assert.isTrue(diceWares.length >= 1);
      assert.equal(diceWares.length, clones.length);
      assert.equal(diceWares[0].diceCount, clones[0].diceCount);
      assert.equal(diceWares[0].fname, clones[0].fname);
      assert.equal(diceWares[0].diceWare.size, clones[0].diceWare.size);
      const vdiceWare = Array.from(diceWares[0].diceWare.values()).sort((a, b) => a.cmp(b));
      const vclones = Array.from(clones[0].diceWare.values()).sort((a, b) => a.cmp(b));
      for (let i = 0; i < vclones.length; ++i) {
        assert.isTrue(vdiceWare[i].equals(vclones[i]));
      }
    }));
  });

  it('read', async () => {
    const dws: DiceWare[] = [];
    DiceWareDispatcher.get(rq).match(DiceWare.match(rcdw => {
      dws.push(rcdw);
    })).match(rxme.Matcher.Complete(() => {
      const diceWare = dws[0];
      assert.isNotEmpty(diceWare.fname);
      assert.isTrue(diceWare.diceCount == 5);
      assert.isTrue(diceWare.diceWare.size > 100);
      assert.isTrue(!!Array.from(diceWare.diceWare.values()).find(d => d.password == 'voice'));
    }));
  });

});
