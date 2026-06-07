/**
 * Web shim for 'warn-once'.
 * react-native-screens (ESM build) does: import warnOnce from 'warn-once'
 * The real package only does module.exports = fn (no export default).
 * This shim guarantees a default export so the import in ScreenStackItem etc. succeeds on Vite/RNW.
 */
function warnOnce(condition, ...rest) {
  if (process.env.NODE_ENV !== 'production' && condition) {
    const key = rest.join(' ');
    if (warnOnce._warnings.has(key)) return;
    warnOnce._warnings.add(key);
    console.warn(...rest);
  }
}
warnOnce._warnings = new Set();

export default warnOnce;
