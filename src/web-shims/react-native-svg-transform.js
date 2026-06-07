/**
 * Interop shim for react-native-svg's internal PEG.js transform parser.
 *
 * The original file (lib/module/lib/extract/transform.js) is a CJS file:
 *   module.exports = { SyntaxError: ..., parse: peg$parse };
 *
 * extractTransform.js does:
 *   import { parse } from './transform';
 *
 * Vite serving the lib/module files as ESM doesn't auto-create a named 'parse'
 * export from the CJS module.exports, causing:
 *   "does not provide an export named 'parse'"
 *
 * This shim forces a proper named export.
 */
const parser = require('react-native-svg/lib/module/lib/extract/transform');

// The original exports { SyntaxError, parse }
const parse = parser.parse || (parser.default && parser.default.parse) || parser;
const SyntaxError = parser.SyntaxError || (parser.default && parser.default.SyntaxError);

export { parse, SyntaxError };
export default parser;
