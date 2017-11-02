
import { assert } from 'chai';

import DiceWareDispatcher from '../../src/server/dispatcher/dice-ware-dispatcher';

describe('DiceWare', () => {
  it('read', async () => {
    const diceWare = await DiceWareDispatcher.read();
    assert.isNotEmpty(diceWare.fname);
    assert.isTrue(diceWare.diceCount == 5);
    assert.isTrue(diceWare.diceWare.size > 100);
    assert.isTrue(!!Array.from(diceWare.diceWare.values()).find(d => d.password == 'voice'));
  });

});
