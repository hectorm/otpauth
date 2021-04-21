/**
 * "globalThis" ponyfill.
 * {@link https://mathiasbynens.be/notes/globalthis|A horrifying globalThis polyfill in universal JavaScript}
 * @type {Object.<string, *>}
*/
const magicalGlobalThis = (() => {
	/* eslint-disable no-extend-native, no-undef, no-restricted-globals */
	let magic;

	if (typeof globalThis === 'object') {
		magic = globalThis;
	} else {
		Object.defineProperty(Object.prototype, '__OTPAUTH_GLOBALTHIS__', {
			get() { return this; },
			configurable: true,
		});
		try {
			// @ts-ignore
			magic = __OTPAUTH_GLOBALTHIS__;
		} finally {
			// @ts-ignore
			delete Object.prototype.__OTPAUTH_GLOBALTHIS__;
		}
	}

	if (typeof magic === 'undefined') {
		// Still unable to determine "globalThis", fall back to a naive method.
		if (typeof self !== 'undefined') {
			magic = self;
		} else if (typeof window !== 'undefined') {
			magic = window;
		} else if (typeof global !== 'undefined') {
			magic = global;
		}
	}

	return magic;
	/* eslint-enable */
})();

export default magicalGlobalThis;
