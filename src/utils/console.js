import { globalScope } from "./global-scope.js";

/**
 * "console" ponyfill.
 * @type {Object.<string, *>}
 */
const console = (() => {
  /** @type {Object.<string, *>} */
  const container = {};

  const methods = [
    "assert",
    "clear",
    "context",
    "count",
    "countReset",
    "debug",
    "dir",
    "dirxml",
    "error",
    "exception",
    "group",
    "groupCollapsed",
    "groupEnd",
    "info",
    "log",
    "profile",
    "profileEnd",
    "table",
    "time",
    "timeEnd",
    "timeLog",
    "timeStamp",
    "trace",
    "warn",
  ];

  if (typeof globalScope.console === "object") {
    for (const method of methods) {
      container[method] =
        typeof globalScope.console[method] === "function"
          ? globalScope.console[method]
          : () => {};
    }
  } else {
    for (const method of methods) {
      container[method] = () => {};
    }
  }

  return container;
})();

export { console };
