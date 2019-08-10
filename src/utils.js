/**
 * An object containing some utilities.
 * @namespace Utils
 * @type {Object}
 */
export const Utils = {};

/**
 * UInt conversion.
 * @memberof Utils
 * @namespace Utils.uint
 * @type {Object}
 */
Utils.uint = {};

/**
 * Converts an ArrayBuffer to an integer.
 * @memberof Utils.uint
 * @method decode
 * @param {ArrayBuffer} buf ArrayBuffer.
 * @returns {number} Integer.
 */
Utils.uint.decode = buf => {
	const arr = new Uint8Array(buf);
	let num = 0;

	for (let i = 0; i < arr.length; i++) {
		if (arr[i] !== 0) {
			num *= 256;
			num += arr[i];
		}
	}

	return num;
};

/**
 * Converts an integer to an ArrayBuffer.
 * @memberof Utils.uint
 * @method encode
 * @param {number} num Integer.
 * @returns {ArrayBuffer} ArrayBuffer.
 */
Utils.uint.encode = num => {
	const buf = new ArrayBuffer(8);
	const arr = new Uint8Array(buf);
	let acc = num;

	for (let i = 7; i >= 0; i--) {
		if (acc === 0) {
			break;
		}

		arr[i] = acc & 255;
		acc -= arr[i];
		acc /= 256;
	}

	return buf;
};

/**
 * Raw string conversion.
 * @memberof Utils
 * @namespace Utils.raw
 * @type {Object}
 */
Utils.raw = {};

/**
 * Converts an ArrayBuffer to a string.
 * @memberof Utils.raw
 * @method decode
 * @param {ArrayBuffer} buf ArrayBuffer.
 * @returns {string} String.
 */
Utils.raw.decode = buf => {
	const arr = new Uint8Array(buf);
	let str = '';

	for (let i = 0; i < arr.length; i++) {
		str += String.fromCharCode(arr[i]);
	}

	return str;
};

/**
 * Converts a string to an ArrayBuffer.
 * @memberof Utils.raw
 * @method encode
 * @param {string} str String.
 * @returns {ArrayBuffer} ArrayBuffer.
 */
Utils.raw.encode = str => {
	const buf = new ArrayBuffer(str.length);
	const arr = new Uint8Array(buf);

	for (let i = 0; i < str.length; i++) {
		arr[i] = str.charCodeAt(i);
	}

	return buf;
};

/**
 * Base32 string conversion.
 * @memberof Utils
 * @namespace Utils.b32
 * @type {Object}
 */
Utils.b32 = {};

/**
 * RFC 4648 base32 alphabet without pad.
 * @memberof Utils.b32
 * @type {string}
 */
Utils.b32.alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Converts an ArrayBuffer to a base32 string (RFC 4648).
 * @see https://github.com/LinusU/base32-decode
 * @memberof Utils.b32
 * @method decode
 * @param {ArrayBuffer} buf ArrayBuffer.
 * @returns {string} Base32 string.
 */
Utils.b32.decode = buf => {
	const arr = new Uint8Array(buf);

	let bits = 0;
	let value = 0;
	let str = '';

	for (let i = 0; i < arr.length; i++) {
		value = (value << 8) | arr[i];
		bits += 8;

		while (bits >= 5) {
			str += Utils.b32.alphabet[(value >>> bits - 5) & 31];
			bits -= 5;
		}
	}

	if (bits > 0) {
		str += Utils.b32.alphabet[(value << 5 - bits) & 31];
	}

	return str;
};

/**
 * Converts a base32 string to an ArrayBuffer (RFC 4648).
 * @see https://github.com/LinusU/base32-encode
 * @memberof Utils.b32
 * @method encode
 * @param {string} str Base32 string.
 * @returns {ArrayBuffer} ArrayBuffer.
 */
Utils.b32.encode = str => {
	const strUpp = str.toUpperCase();
	const buf = new ArrayBuffer((str.length * 5) / 8 | 0);
	const arr = new Uint8Array(buf);

	let bits = 0;
	let value = 0;
	let index = 0;

	for (let i = 0; i < strUpp.length; i++) {
		const idx = Utils.b32.alphabet.indexOf(strUpp[i]);

		if (idx === -1) {
			throw new TypeError(`Invalid character found: ${strUpp[i]}`);
		}

		value = (value << 5) | idx;
		bits += 5;

		if (bits >= 8) {
			arr[index++] = (value >>> bits - 8) & 255;
			bits -= 8;
		}
	}

	return buf;
};

/**
 * Hexadecimal string conversion.
 * @memberof Utils
 * @namespace Utils.hex
 * @type {Object}
 */
Utils.hex = {};

/**
 * Converts an ArrayBuffer to a hexadecimal string.
 * @memberof Utils.hex
 * @method decode
 * @param {ArrayBuffer} buf ArrayBuffer.
 * @returns {string} Hexadecimal string.
 */
Utils.hex.decode = buf => {
	const arr = new Uint8Array(buf);
	let str = '';

	for (let i = 0; i < arr.length; i++) {
		const hexByte = arr[i].toString(16);

		str += hexByte.length === 1
			? `0${hexByte}`
			: hexByte;
	}

	return str.toUpperCase();
};

/**
 * Converts a hexadecimal string to an ArrayBuffer.
 * @memberof Utils.hex
 * @method encode
 * @param {string} str Hexadecimal string.
 * @returns {ArrayBuffer} ArrayBuffer.
 */
Utils.hex.encode = str => {
	const buf = new ArrayBuffer(str.length / 2);
	const arr = new Uint8Array(buf);

	for (let i = 0; i < arr.length; i++) {
		arr[i] = parseInt(str.substr(i * 2, 2), 16);
	}

	return buf;
};

/**
 * Pads a number with leading zeros.
 * @memberof Utils
 * @method pad
 * @param {number|string} num Number.
 * @param {number} digits Digits.
 * @returns {string} Padded number.
 */
Utils.pad = (num, digits) => {
	let prefix = '';
	let repeat = digits - String(num).length;
	while (repeat-- > 0) prefix += '0';
	return `${prefix}${num}`;
};

/**
 * An object containing some utilities (for internal use only).
 * @private
 * @namespace InternalUtils
 * @type {Object}
 */
export const InternalUtils = {};

/**
 * "globalThis" ponyfill.
 * @see https://mathiasbynens.be/notes/globalthis
 * @memberof InternalUtils
 * @type {Object}
 */
InternalUtils.globalThis = (function getGlobalThis() {
	/* eslint-disable no-extend-native, no-undef */
	if (typeof globalThis === 'object') return globalThis;
	Object.defineProperty(Object.prototype, '__gt__', { get() { return this; }, configurable: true });
	try { return __gt__; } finally { delete Object.prototype.__gt__; }
	/* eslint-enable */
})();

/**
 * "console" ponyfill.
 * (NOTICE: only some methods are implemented).
 * @memberof InternalUtils
 * @type {Object}
 */
InternalUtils.console = typeof InternalUtils.globalThis.console !== 'object'
	? ['log', 'info', 'error', 'warn'].reduce((c, n) => { c[n] = () => {}; return c; }, {})
	: InternalUtils.globalThis.console;

/**
 * Detect if running in "Node.js".
 * @memberof InternalUtils
 * @type {boolean}
 */
InternalUtils.isNode = Object.prototype.toString.call(InternalUtils.globalThis.process) === '[object process]';

/**
 * Dynamically import "Node.js" modules.
 * @memberof InternalUtils
 * @method require
 * @param {string} name Name.
 * @returns {Object} Module.
 */
// eslint-disable-next-line no-eval
InternalUtils.require = name => eval('require')(name);
