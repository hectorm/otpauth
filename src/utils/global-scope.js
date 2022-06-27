/**
 * "globalThis" ponyfill.
 * @see [A horrifying globalThis polyfill in universal JavaScript](https://mathiasbynens.be/notes/globalthis)
 * @type {Object.<string, *>}
 */
const globalScope = (() => {
  // @ts-ignore
  if (typeof globalThis === "object") return globalThis;
  else {
    Object.defineProperty(Object.prototype, "__GLOBALTHIS__", {
      get() {
        return this;
      },
      configurable: true,
    });
    try {
      // @ts-ignore
      // eslint-disable-next-line no-undef
      if (typeof __GLOBALTHIS__ !== "undefined") return __GLOBALTHIS__;
    } finally {
      // @ts-ignore
      delete Object.prototype.__GLOBALTHIS__;
    }
  }

  // Still unable to determine "globalThis", fall back to a naive method.
  if (typeof self !== "undefined") return self;
  else if (typeof window !== "undefined") return window;
  else if (typeof global !== "undefined") return global;

  return undefined;
})();

export { globalScope };
