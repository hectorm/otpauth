import globalThis from './global-this';

/**
 * Detect if running in Node.js.
 * @type {boolean}
 */
const isNode = Object.prototype.toString.call(globalThis.process) === '[object process]';

export default isNode;
