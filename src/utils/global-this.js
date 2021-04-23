/**
 * "globalThis" ponyfill.
 * {@link https://mathiasbynens.be/notes/globalthis|A horrifying globalThis polyfill in universal JavaScript}
 * @type {Object.<string, *>}
*/
export const globalThis = (() => {
	// @ts-ignore
	if (typeof globalThis === 'object') return globalThis;
	else {
		// eslint-disable-next-line no-extend-native
		Object.defineProperty(Object.prototype, '__GLOBALTHIS__', {
			get() { return this; },
			configurable: true,
		});
		try {
			// @ts-ignore
			// eslint-disable-next-line no-undef
			if (typeof __GLOBALTHIS__ !== 'undefined') return __GLOBALTHIS__;
		} finally {
			// @ts-ignore
			delete Object.prototype.__GLOBALTHIS__;
		}
	}

	// Still unable to determine "globalThis", fall back to a naive method.
	/* eslint-disable no-undef, no-restricted-globals */
	if (typeof self !== 'undefined') return self;
	else if (typeof window !== 'undefined') return window;
	else if (typeof global !== 'undefined') return global;
	/* eslint-enable */

	return undefined;
})();
