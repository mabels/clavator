declare module 'express-ws' {
    import * as core from "express-serve-static-core";

    function ExpressWs(app: core.Application): void
    namespace ExpressWs {
      interface ExpressWebSocket {
        on(event: 'message', handler: (message: any) => void): void;
        on(event: string, handler: Function): void;
        send(data: any, handler: Function): void;
        send(data: any): void;
      }
    }

    export = ExpressWs;
}
declare module 'express-serve-static-core' {
  import { ExpressWebSocket } from 'express-ws';
  import { Express, Request } from "express-serve-static-core";

  interface Express {
    ws(url: string, handler: (websocket: ExpressWebSocket, request: Request) => void): void;
  }
}
