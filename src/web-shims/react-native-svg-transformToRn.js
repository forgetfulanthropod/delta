/**
 * Interop shim for react-native-svg's internal PEG.js transformToRn parser.
 *
 * Same issue as the main transform parser: CJS module.exports = { parse: ... }
 * imported via `import { parse as ... } from './transformToRn'`
 */
const parser = require('react-native-svg/lib/module/lib/extract/transformToRn');

// The original exports { SyntaxError, parse }
const parse = parser.parse || (parser.default && parser.default.parse) || parser;
const SyntaxError = parser.SyntaxError || (parser.default && parser.default.SyntaxError);

export { parse, SyntaxError };
export default parser;
