'use strict';

/**
 * @class Utils
 */
export class Utils {
	/**
	 * @type {Object}
	 */
	static get uint() {
		/**
		 * Converts an ArrayBuffer to an integer.
		 * @memberof Utils.uint
		 * @method decode
		 * @param {ArrayBuffer} buff ArrayBuffer.
		 * @returns {number} Integer.
		 */
		const decode = function (buff) {
			const tArr = new Uint8Array(buff);
			let num = 0;

			for (let i = 0; i < tArr.length; i++) {
				if (tArr[i] === 0) continue;
				num *= 256;
				num += tArr[i];
			}

			return num;
		};

		/**
		 * Converts an integer to an ArrayBuffer.
		 * @memberof Utils.uint
		 * @method encode
		 * @param {string} num Integer.
		 * @returns {ArrayBuffer} ArrayBuffer.
		 */
		const encode = function (num) {
			const buff = new ArrayBuffer(8);
			const tArr = new Uint8Array(buff);
			let acc = num;

			for (let i = 7; i >= 0; i--) {
				if (acc === 0) break;
				tArr[i] = acc & 255;
				acc -= tArr[i];
				acc /= 256;
			}

			return buff;
		};

		return {decode, encode};
	}

	/**
	 * @type {Object}
	 */
	static get raw() {
		/**
		 * Converts an ArrayBuffer to a string.
		 * @memberof Utils.raw
		 * @method decode
		 * @param {ArrayBuffer} buff ArrayBuffer.
		 * @returns {string} String.
		 */
		const decode = function (buff) {
			const arr = new Uint8Array(buff);
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
		const encode = function (str) {
			const buff = new ArrayBuffer(str.length);
			const tArr = new Uint8Array(buff);

			for (let i = 0; i < str.length; i++) {
				tArr[i] = str.charCodeAt(i);
			}

			return buff;
		};

		return {decode, encode};
	}

	/**
	 * @type {Object}
	 */
	static get b32() {
		// RFC 4648 base32 alphabet without pad
		const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

		/**
		 * Converts an ArrayBuffer to a base32 string (RFC 4648).
		 * @see https://tools.ietf.org/html/rfc4648
		 * @see https://github.com/LinusU/base32-decode
		 * @memberof Utils.b32
		 * @method decode
		 * @param {ArrayBuffer} buff ArrayBuffer.
		 * @returns {string} Base32 string.
		 */
		const decode = function (buff) {
			// Based on LinusU/base32-decode
			const tArr = new Uint8Array(buff);
			let bits = 0, value = 0, str = '';

			for (let i = 0; i < tArr.length; i++) {
				value = value << 8 | tArr[i];
				bits += 8;

				while (bits >= 5) {
					str += alphabet[value >>> bits - 5 & 31];
					bits -= 5;
				}
			}

			if (bits > 0) {
				str += alphabet[value << 5 - bits & 31];
			}

			return str;
		};

		/**
		 * Converts a base32 string to an ArrayBuffer (RFC 4648).
		 * @see https://tools.ietf.org/html/rfc4648
		 * @see https://github.com/LinusU/base32-encode
		 * @memberof Utils.b32
		 * @method encode
		 * @param {string} str Base32 String.
		 * @returns {ArrayBuffer} ArrayBuffer.
		 */
		const encode = function (str) {
			// Based on LinusU/base32-encode
			const strU = str.toUpperCase();
			const buff = new ArrayBuffer(str.length * 5 / 8 | 0);
			const tArr = new Uint8Array(buff);
			let bits = 0, value = 0, index = 0;

			for (let i = 0; i < strU.length; i++) {
				let idx = alphabet.indexOf(strU[i]);

				if (idx === -1) {
					throw new Error('Invalid character found: ' + strU[i]);
				}

				value = value << 5 | idx;
				bits += 5;

				if (bits >= 8) {
					tArr[index++] = value >>> bits - 8 & 255;
					bits -= 8;
				}
			}

			return buff;
		};

		return {decode, encode};
	}

	/**
	 * @type {Object}
	 */
	static get hex() {
		/**
		 * Converts an ArrayBuffer to a hexadecimal string.
		 * @memberof Utils.hex
		 * @method decode
		 * @param {ArrayBuffer} buff ArrayBuffer.
		 * @returns {string} Hexadecimal string.
		 */
		const decode = function (buff) {
			const tArr = new Uint8Array(buff);
			let str = '';

			for (let i = 0; i < tArr.length; i++) {
				const hexByte = tArr[i].toString(16);

				str += hexByte.length === 1
					? '0' + hexByte
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
		const encode = function (str) {
			const buff = new ArrayBuffer(str.length / 2);
			const tArr = new Uint8Array(buff);

			for (let i = 0; i < tArr.length; i++) {
				tArr[i] = parseInt(str.substr(i * 2, 2), 16);
			}

			return buff;
		};

		return {decode, encode};
	}
}

/**
 * @class _Utils
 * @private
 */
export class _Utils {
	static buf2arrbuf(buf) {
		if (buf.buffer instanceof ArrayBuffer) {
			return buf.buffer;
		}

		// Node.js < 4.0.0
		const arrbuf = new ArrayBuffer(buf.length);
		const arr = new Uint8Array(arrbuf);

		for (let i = 0; i < arr.length; i++) {
			arr[i] = buf[i];
		}

		return arrbuf;
	}

	static arrbuf2buf(arrbuf) {
		if (typeof Buffer.from === 'function') {
			return Buffer.from(arrbuf);
		}

		// Node.js < 5.10.0
		const buf = new Buffer(arrbuf.byteLength);
		const arr = new Uint8Array(arrbuf);

		for (let i = 0; i < arr.length; i++) {
			buf[i] = arr[i];
		}

		return buf;
	}
}

