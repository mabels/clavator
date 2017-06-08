
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const exposedProperties = ['window', 'navigator', 'document'];

global.document = new JSDOM('');
global.window = document.defaultView;
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
