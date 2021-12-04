import { globalThis } from "./global-this.js";

/**
 * Detect if running in Node.js.
 * @type {boolean}
 */
const isNode =
  Object.prototype.toString.call(globalThis.process) === "[object process]";

export { isNode };
