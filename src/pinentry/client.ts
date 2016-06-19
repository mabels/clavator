
//const readline = require('readline');
//import * as WebSocketClient from "websocket";

export function client(socket: any) {
    let readline = require("readline");
    let WebSocketClient = require('websocket').client;
    let winston = require('winston');
    let log = new (winston.Logger)({
        transports: [
            new (winston.transports.File)({ filename: '/Users/menabe/Software/kawin/meno/pinentry-client.log' })
        ]
    });
    let session = (process.argv[3] || "not-connected") + "-" + process.pid;

    log.info('pinentry-client started:' + session);

    let client = new WebSocketClient();
    client.on('connectFailed', (error) => {
        log.error('Connect Error: ' + error.toString());
    });

    client.on('connect', (connection: any) => {
        connection.on('error', (error) => {
            log.error("Connection Error: " + error.toString());
        });
        connection.on('close', function() {
            log.info('pinentry-protocol Connection Closed');
            process.exit(0);
        });
        let rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        function action(out: string, cb: (answer: string) => void) {
            log.info("Send:" + out);
            if (out[out.length - 1] != "\n") {
                out = out + "\n";
            }
            rl.question(out, cb);
        }
        function callBack(answer: string) {
            let recv = JSON.stringify({
                type: "recv-in",
                session: session,
                pid: process.pid,
                answer: answer
            });
            log.info("Received:" + recv);
            connection.send(recv);
        }
        connection.on('message', function(message) {
            if (message.type === 'utf8') {
                let msg = JSON.parse(message.utf8Data);
                if (msg.session == session) {
                    action(msg.msg, callBack);
                } else {
                    log.error("unknown session:" + message.utf8Data);
                }
            }
        });
        connection.send(JSON.stringify({ type: "start-pinentry", session: session, pid: process.pid }));
    })
    // 'ws://localhost:8080/'
    client.connect('wsf://' + socket + '/', 'pinentry-protocol');
}

//pinentry_client();
