
import * as http from 'http';

export class PinEntryServer {
  socketFile: string;
}

export function start(socket: any, options: { [id: string]: any; } = {}) {

    let WebSocketServer = require('websocket').server;
    let readline = require("readline");
    let winston = require('winston');

    let log = new (winston.Logger)({
        transports: [
            new (winston.transports.File)({ filename: '/Users/menabe/Software/kawin/meno/pinentry-server.log' })
        ]
    });

    let server = http.createServer((request, response) => {
        log.debug('Received request for ' + request.url);
        response.writeHead(404);
        response.end();
    });
    server.listen(socket, () => {
        log.info('Server is listening on port ' + socket);
    });

    let wsServer = new WebSocketServer({
        httpServer: server,
        // You should not use autoAcceptConnections for production
        // applications, as it defeats all standard cross-origin protection
        // facilities built into the protocol and the browser.  You should
        // *always* verify the connection's origin and decide whether or not
        // to accept it.
        autoAcceptConnections: false
    });

    function originIsAllowed(origin) {
        // put logic here to detect whether the specified origin is allowed.
        return true;
    }



    wsServer.on('request', (request) => {
        if (!originIsAllowed(request.origin)) {
            // Make sure we only accept requests from an allowed origin
            request.reject();
            log.error('Connection from origin ' + request.origin + ' rejected.');
            return;
        }

        let connection = request.accept('pinentry-protocol', request.origin);
        log.info('Connection accepted:' + request);
        function send(obj: any) {
            let json = JSON.stringify(obj);
            log.info("Send:" + json);
            connection.send(json);
        }
        connection.on('message', function(message) {
            if (message.type === 'utf8') {
                let msg = JSON.parse(message.utf8Data);
                log.info('Received Message: ' + msg.type + ":" + msg.session);
                switch (msg.type) {
                    case 'start-pinentry':
                        send({
                            type: "send-out",
                            session: msg.session,
                            msg: "OK I am read for " + msg.session
                        });
                        break;
                    case 'recv-in':
                        let res: string = "";
                        switch (msg.answer) {
                            case 'BYE':
                                connection.close();
                                return;
                            case 'GETPIN':
                                if (options['test_getpin']) {
                                    res = "D " + options['test_getpin'] + "\n";
                                } else {
                                    throw Error("missing impl");
                                }
                                break;
                            case 'GETINFO pid':
                                res = "D " + msg.pid + "\n";
                                break;
                        }
                        send({
                            type: "send-out",
                            session: msg.session,
                            msg: res + "OK understood " + msg.session
                        });
                        break;
                    default:
                        log.error("unknown message:" + msg);
                }
            }
        });
        connection.on('close', function(reasonCode, description) {
            log.info(' Peer ' + connection.remoteAddress + ' disconnected.');
        });
    });
}

//pinentry_server();
