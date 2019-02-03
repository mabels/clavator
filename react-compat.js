const ReactCompat = require('preact-compat');
const createContext = require('preact-context');
ReactCompat.createContext = createContext.createContext;
ReactCompat.default.createContext = createContext.createContext;

module.exports = ReactCompat;