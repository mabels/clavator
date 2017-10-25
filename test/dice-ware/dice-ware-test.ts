
import { assert } from 'chai';

import DiceWare from '../../src/dice-ware/dice-ware';
import DiceWareDispatcher from '../../src/server/dispatcher/dice-ware-dispatcher';

describe('DiceWare', () => {
  it('read', async () => {
    const diceWare = await DiceWareDispatcher.read();
    assert.isNotEmpty(diceWare.fname);
    assert.isTrue(diceWare.diceCount == 5);
    assert.isTrue(diceWare.list.size > 100);
    assert.isTrue(!!Array.from(diceWare.list.values()).find(d => d.part == 'voice'));
  });

});
