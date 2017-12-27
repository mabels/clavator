
import * as WebSocket from 'ws';
import * as Message from '../../model/message';
import Dispatcher from '../dispatcher';
// import * as fsExtra from 'fs-extra';

import { DiceWare, Diced } from '../../dice-ware/dice-ware';
// import * as CardStatus from './gpg/card_status';

import * as Progress from '../../model/progress';
// import { Observer } from '../observer';
import * as rxme from 'rxme';
import { ResultQueue } from '../../gpg/result';
// import * as path from 'path';

function listToDiceWare(fname: string, body: string): DiceWare {
    const list = body.split(/\r?\n/).map(line => Diced.parse(line)).filter(d => d);
    // console.log('listToDiceWare:', list);
    return new DiceWare(fname, list);
}

let diceWares: DiceWare[];
function moduleToDiceWare(): DiceWare[] {
    if (diceWares) {
        return diceWares;
    }
    const wordLists = [
        require('./dice-ware-loader!./en-large-word-list.url'),
        require('./dice-ware-loader!./de-large-word-list.url')
    ];
    diceWares = wordLists.map(wl => listToDiceWare(wl.url, wl.body));
    return diceWares;
}

// export function match(cb: rxme.MatcherCallback<Resul)
export function get(rq: ResultQueue): rxme.Observable {
 return rxme.Observable.create(obs => {
    moduleToDiceWare().forEach(dw => obs.next(rxme.Msg.Type(dw)));
    obs.complete();
 });
}

export function create(rq: ResultQueue): Dispatcher {
    const ret = new Dispatcher();
    ret.recv.match(req => {
        // console.log('DiceWareDispatcher.run', req.header);
        if (req.header.action != 'DiceWares.Request') {
            // ws.send(Message.prepare('Progressor.Clavator', Progress.fail('Ohh')))
            return false;
        }
        const reply = req.reply('Progressor.Clavator');
        get(this.resultQueue).subscribe(rcdw => {
            if (rcdw.isError()) {
                return;
            }
            diceWares = rcdw.data;
            console.log(JSON.stringify(diceWares[0]));
            reply.progressInfo(`DiceWareRequest Action`).send(ret.send);
            // console.log('DiceWares.Response:', JSON.stringify(diceWares[0]));
            req.reply('DiceWares.Response').dataToJson(diceWares.map(dw => dw.toObj())).send(ret.send);
        }, _ => {
            console.log('error:', _);
            reply.progressError('can not read diceware file').send(ret.send);
        });
    });
    return ret;
}

export default { create: create, get: get };
