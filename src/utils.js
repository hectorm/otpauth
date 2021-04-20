/**
 * An object containing some utilities.
 * @type {Object}
 */
export const Utils = {
	/**
	 * UInt conversion.
	 * @type {Object}
	 */
	uint: {
		/**
		 * Converts an ArrayBuffer to an integer.
		 * @param {ArrayBuffer} buf ArrayBuffer.
		 * @returns {number} Integer.
		 */
		fromBuf: (buf) => {
			const arr = new Uint8Array(buf);
			let num = 0;

			for (let i = 0; i < arr.length; i++) {
				if (arr[i] !== 0) {
					num *= 256;
					num += arr[i];
				}
			}

			return num;
		},

		/**
		 * Converts an integer to an ArrayBuffer.
		 * @param {number} num Integer.
		 * @returns {ArrayBuffer} ArrayBuffer.
		 */
		toBuf: (num) => {
			const buf = new ArrayBuffer(8);
			const arr = new Uint8Array(buf);
			let acc = num;

			for (let i = 7; i >= 0; i--) {
				if (acc === 0) break;
				arr[i] = acc & 255;
				acc -= arr[i];
				acc /= 256;
			}

			return buf;
		},
	},

	/**
	 * Latin-1 string conversion.
	 * @type {Object}
	 */
	latin1: {
		/**
		 * Converts an ArrayBuffer to a Latin-1 string.
		 * @param {ArrayBuffer} buf ArrayBuffer.
		 * @returns {string} Latin-1 string.
		 */
		fromBuf: (buf) => {
			const arr = new Uint8Array(buf);
			let str = '';

			for (let i = 0; i < arr.length; i++) {
				str += String.fromCharCode(arr[i]);
			}

			return str;
		},

		/**
		 * Converts a Latin-1 string to an ArrayBuffer.
		 * @param {string} str Latin-1 string.
		 * @returns {ArrayBuffer} ArrayBuffer.
		 */
		toBuf: (str) => {
			const buf = new ArrayBuffer(str.length);
			const arr = new Uint8Array(buf);

			for (let i = 0; i < str.length; i++) {
				arr[i] = str.charCodeAt(i) & 0xFF;
			}

			return buf;
		},
	},

	/**
	 * UTF-8 string conversion.
	 * @type {Object}
	 */
	utf8: {
		/**
		 * Converts an ArrayBuffer to an UTF-8 string.
		 * @param {ArrayBuffer} buf ArrayBuffer.
		 * @returns {string} String.
		 */
		get fromBuf() {
			let _fromBuf;

			if (Utils.private.globalThis.TextDecoder) {
				const decoder = new Utils.private.globalThis.TextDecoder('utf-8');
				_fromBuf = (buf) => decoder.decode(buf);
			} else {
				throw new Error('Encoding API not available');
			}

			Object.defineProperty(this, 'fromBuf', {
				enumerable: true,
				value: _fromBuf,
			});

			return this.fromBuf;
		},

		/**
		 * Converts an UTF-8 string to an ArrayBuffer.
		 * @param {string} str String.
		 * @returns {ArrayBuffer} ArrayBuffer.
		 */
		get toBuf() {
			let _toBuf;

			if (Utils.private.globalThis.TextEncoder) {
				const encoder = new Utils.private.globalThis.TextEncoder('utf-8');
				_toBuf = (str) => encoder.encode(str).buffer;
			} else {
				throw new Error('Encoding API not available');
			}

			Object.defineProperty(this, 'toBuf', {
				enumerable: true,
				value: _toBuf,
			});

			return this.toBuf;
		},
	},

	/**
	 * Base32 string conversion.
	 * @type {Object}
	 */
	base32: {
		/**
		 * RFC 4648 base32 alphabet without pad.
		 * @type {string}
		 */
		alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567',

		/**
		 * Converts an ArrayBuffer to a base32 string (RFC 4648)
		 * (https://github.com/LinusU/base32-encode).
		 * @param {ArrayBuffer} buf ArrayBuffer.
		 * @returns {string} Base32 string.
		 */
		fromBuf: (buf) => {
			const arr = new Uint8Array(buf);
			let bits = 0;
			let value = 0;
			let str = '';

			for (let i = 0; i < arr.length; i++) {
				value = (value << 8) | arr[i];
				bits += 8;

				while (bits >= 5) {
					str += Utils.base32.alphabet[(value >>> bits - 5) & 31];
					bits -= 5;
				}
			}

			if (bits > 0) {
				str += Utils.base32.alphabet[(value << 5 - bits) & 31];
			}

			return str;
		},

		/**
		 * Converts a base32 string to an ArrayBuffer (RFC 4648)
		 * (https://github.com/LinusU/base32-decode).
		 * @param {string} str Base32 string.
		 * @returns {ArrayBuffer} ArrayBuffer.
		 */
		toBuf: (str) => {
			// Canonicalize to all upper case and remove padding if it exists.
			const cstr = str.toUpperCase().replace(/=+$/, '');

			const buf = new ArrayBuffer((cstr.length * 5) / 8 | 0);
			const arr = new Uint8Array(buf);
			let bits = 0;
			let value = 0;
			let index = 0;

			for (let i = 0; i < cstr.length; i++) {
				const idx = Utils.base32.alphabet.indexOf(cstr[i]);
				if (idx === -1) throw new TypeError(`Invalid character found: ${cstr[i]}`);

				value = (value << 5) | idx;
				bits += 5;

				if (bits >= 8) {
					arr[index++] = (value >>> bits - 8) & 255;
					bits -= 8;
				}
			}

			return buf;
		},
	},

	/**
	 * Hexadecimal string conversion.
	 * @type {Object}
	 */
	hex: {
		/**
		 * Converts an ArrayBuffer to a hexadecimal string.
		 * @param {ArrayBuffer} buf ArrayBuffer.
		 * @returns {string} Hexadecimal string.
		 */
		fromBuf: (buf) => {
			const arr = new Uint8Array(buf);
			let str = '';

			for (let i = 0; i < arr.length; i++) {
				const hex = arr[i].toString(16);
				if (hex.length === 1) str += '0';
				str += hex;
			}

			return str.toUpperCase();
		},

		/**
		 * Converts a hexadecimal string to an ArrayBuffer.
		 * @param {string} str Hexadecimal string.
		 * @returns {ArrayBuffer} ArrayBuffer.
		 */
		toBuf: (str) => {
			const buf = new ArrayBuffer(str.length / 2);
			const arr = new Uint8Array(buf);

			for (let i = 0; i < str.length; i += 2) {
				arr[i / 2] = parseInt(str.substr(i, 2), 16);
			}

			return buf;
		},
	},

	/**
	 * Pads a number with leading zeros.
	 * @param {number|string} num Number.
	 * @param {number} digits Digits.
	 * @returns {string} Padded number.
	 */
	pad: (num, digits) => {
		let prefix = '';
		let repeat = digits - String(num).length;
		while (repeat-- > 0) prefix += '0';
		return `${prefix}${num}`;
	},

	/**
	 * An object containing some utilities not exposed in the public API.
	 * @private
	 * @type {Object}
	 */
	private: {
		/**
		 * "globalThis" ponyfill
		 * (https://mathiasbynens.be/notes/globalthis).
		 * @type {Object}
		 */
		get globalThis() {
			let _globalThis;

			/* eslint-disable no-extend-native, no-restricted-globals, no-undef */
			if (typeof globalThis === 'object') {
				_globalThis = globalThis;
			} else {
				Object.defineProperty(Object.prototype, '__magicalGlobalThis__', {
					get() { return this; },
					configurable: true,
				});
				try {
					_globalThis = __magicalGlobalThis__;
				} finally {
					delete Object.prototype.__magicalGlobalThis__;
				}
			}

			if (typeof _globalThis === 'undefined') {
				// Still unable to determine "globalThis", fall back to a naive method.
				if (typeof self !== 'undefined') {
					_globalThis = self;
				} else if (typeof window !== 'undefined') {
					_globalThis = window;
				} else if (typeof global !== 'undefined') {
					_globalThis = global;
				}
			}
			/* eslint-enable */

			Object.defineProperty(this, 'globalThis', {
				enumerable: true,
				value: _globalThis,
			});

			return this.globalThis;
		},

		/**
		 * "console" ponyfill.
		 * @type {Object}
		 */
		get console() {
			const _console = {};

			const methods = [
				'assert', 'clear', 'context', 'count', 'countReset', 'debug', 'dir', 'dirxml',
				'error', 'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log', 'profile',
				'profileEnd', 'table', 'time', 'timeEnd', 'timeLog', 'timeStamp', 'trace', 'warn',
			];

			if (typeof Utils.private.globalThis.console === 'object') {
				for (const method of methods) {
					_console[method] = typeof Utils.private.globalThis.console[method] === 'function'
						? Utils.private.globalThis.console[method]
						: () => {};
				}
			} else {
				for (const method of methods) {
					_console[method] = () => {};
				}
			}

			Object.defineProperty(this, 'console', {
				enumerable: true,
				value: _console,
			});

			return this.console;
		},

		/**
		 * Detect if running in "Node.js".
		 * @type {boolean}
		 */
		get isNode() {
			const _isNode = Object.prototype.toString.call(Utils.private.globalThis.process) === '[object process]';

			Object.defineProperty(this, 'isNode', {
				enumerable: true,
				value: _isNode,
			});

			return this.isNode;
		},

		/**
		 * Dynamically import "Node.js" modules.
		 * (`eval` is used to prevent bundlers from including the module,
		 * e.g., [webpack/webpack#8826](https://github.com/webpack/webpack/issues/8826))
		 * @type {Function}
		 */
		get nodeRequire() {
			const _nodeRequire = Utils.private.isNode
				// eslint-disable-next-line no-eval
				? eval('require')
				: () => {};

			Object.defineProperty(this, 'nodeRequire', {
				enumerable: true,
				value: _nodeRequire,
			});

			return this.nodeRequire;
		},
	},
};
