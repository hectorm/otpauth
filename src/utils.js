import { InternalUtils } from './internal-utils';

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
		fromBuf: buf => {
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
		toBuf: num => {
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
		}

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
		fromBuf: buf => {
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
		toBuf: str => {
			const buf = new ArrayBuffer(str.length);
			const arr = new Uint8Array(buf);

			for (let i = 0; i < str.length; i++) {
				arr[i] = str.charCodeAt(i) & 0xFF;
			}

			return buf;
		}

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
		fromBuf: buf => {
			return InternalUtils.utf8TextDecode(buf);
		},

		/**
		 * Converts an UTF-8 string to an ArrayBuffer.
		 * @param {string} str String.
		 * @returns {ArrayBuffer} ArrayBuffer.
		 */
		toBuf: str => {
			return InternalUtils.utf8TextEncode(str).buffer;
		}

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
		fromBuf: buf => {
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
		toBuf: str => {
			// Canonicalize to all upper case and remove padding if it exists.
			str = str.toUpperCase().replace(/=+$/, '');

			const buf = new ArrayBuffer((str.length * 5) / 8 | 0);
			const arr = new Uint8Array(buf);
			let bits = 0;
			let value = 0;
			let index = 0;

			for (let i = 0; i < str.length; i++) {
				const idx = Utils.base32.alphabet.indexOf(str[i]);
				if (idx === -1) throw new TypeError(`Invalid character found: ${str[i]}`);

				value = (value << 5) | idx;
				bits += 5;

				if (bits >= 8) {
					arr[index++] = (value >>> bits - 8) & 255;
					bits -= 8;
				}
			}

			return buf;
		}

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
		fromBuf: buf => {
			const arr = new Uint8Array(buf);
			let str = '';

			for (let i = 0; i < arr.length; i++) {
				const hex = arr[i].toString(16);
				str += hex.length === 2 ? hex : `0${hex}`;
			}

			return str.toUpperCase();
		},

		/**
		 * Converts a hexadecimal string to an ArrayBuffer.
		 * @param {string} str Hexadecimal string.
		 * @returns {ArrayBuffer} ArrayBuffer.
		 */
		toBuf: str => {
			const buf = new ArrayBuffer(str.length / 2);
			const arr = new Uint8Array(buf);

			for (let i = 0, j = 0; i < arr.length; i += 1, j += 2) {
				arr[i] = parseInt(str.substr(j, 2), 16);
			}

			return buf;
		}

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
	}

};
