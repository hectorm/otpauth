import { globalScope } from "./global-scope.js";

/**
 * Detect if running in Node.js.
 * @type {boolean}
 */
const isNode =
  Object.prototype.toString.call(globalScope.process) === "[object process]";

export { isNode };
