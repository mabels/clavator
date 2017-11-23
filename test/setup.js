
process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});

const JSDOM = require("node-jsdom");
//const { JSDOM } = jsdom;

const exposedProperties = ['window', 'navigator', 'document'];

global.document = new JSDOM.jsdom('');
global.window = document.defaultView;
global.WebSocket = function() { console.error('WebSocket fake')};
/*
console.log(document.defaultView);
console.log(global.document.defaultView);
Object.keys(document.defaultView).forEach((property) => {
  if (typeof global[property] === 'undefined') {
    exposedProperties.push(property);
    global[property] = document.defaultView[property];
  }
});
*/

global.navigator = {
  userAgent: 'node.js'
};
