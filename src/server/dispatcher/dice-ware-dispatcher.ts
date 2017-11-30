
import * as WebSocket from 'ws';
import * as Message from '../../model/message';
import Dispatcher from '../dispatcher';
// import * as fsExtra from 'fs-extra';

import { DiceWare, Diced } from '../../dice-ware/dice-ware';
// import * as CardStatus from './gpg/card_status';

import * as Progress from '../../model/progress';
// import { Observer } from '../observer';
import * as rx from 'rxjs';
import { ResultContainer, ResultObservable, ResultObserver, ResultQueue } from '../../gpg/result';
// import * as path from 'path';

export class DiceWareDispatcher implements Dispatcher {

    private static diceWares: DiceWare[];

    private readonly resultQueue: ResultQueue;

    public static create(rq: ResultQueue): DiceWareDispatcher {
        return new DiceWareDispatcher(rq);
    }

    private static listToDiceWare(fname: string, body: string): DiceWare {
        const list = body.split(/\r?\n/).map(line => Diced.parse(line)).filter(d => d);
        // console.log('listToDiceWare:', list);
        return new DiceWare(fname, list);
    }

    private static moduleToDiceWare(): DiceWare[] {
        if (DiceWareDispatcher.diceWares) {
            return DiceWareDispatcher.diceWares;
        }
        const wordLists = [
            require('./dice-ware-loader!./en-large-word-list.url'),
            require('./dice-ware-loader!./de-large-word-list.url')
        ];
        DiceWareDispatcher.diceWares = wordLists.map(wl => DiceWareDispatcher.listToDiceWare(wl.url, wl.body));
        return DiceWareDispatcher.diceWares;
    }

    public static get(rq: ResultQueue): ResultObservable<DiceWare[]> {
     return rx.Observable.create((obs: ResultObserver<DiceWare[]>) => {
        obs.next(ResultContainer.builder<DiceWare[]>(rq).setData(DiceWareDispatcher.moduleToDiceWare()));
        obs.complete();
     });
    }

    constructor(rq: ResultQueue) {
        this.resultQueue = rq;
    }

    // public static read(fname: string): Promise<DiceWare> {
    //   return new Promise((resolve, reject) => {
    //     fsExtra.readFile(fname).then(file => {
    //       const list = file.toString('utf-8').split(/\r?\n/).map(line => Diced.parse(line)).filter(d => d);
    //       // console.log('DiceWareDispatcher.read:', list);
    //       resolve(new DiceWare(fname, list));
    //     }).catch(reject);
    //   });
    // }

    public run(ws: WebSocket, m: Message.Message): boolean {
        console.log('DiceWareDispatcher.run', m.header);
        if (m.header.action != 'DiceWares.Request') {
            // ws.send(Message.prepare('Progressor.Clavator', Progress.fail('Ohh')))
            return false;
        }
        let header = Message.toHeader(m, 'Progressor.Clavator');
        DiceWareDispatcher.get(this.resultQueue).subscribe(rcdw => {
            if (rcdw.isError()) {
                return;
            }
            const diceWares = rcdw.data;
            console.log(JSON.stringify(diceWares[0]));
            ws.send(Message.prepare(header, Progress.info(`DiceWareRequest Action`)));
            // console.log('DiceWares.Response:', JSON.stringify(diceWares[0]));
            ws.send(Message.prepare(header.setAction('DiceWares.Response'),
                diceWares.map(dw => dw.toObj())));
        }, _ => {
            console.log('error:', _);
            ws.send(Message.prepare(header, Progress.fail('can not read diceware file')));
        });
        return true;
    }

}

export default DiceWareDispatcher;
