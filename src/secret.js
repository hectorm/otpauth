import { base32ToBuf, base32FromBuf } from './utils/encoding/base32';
import { hexToBuf, hexFromBuf } from './utils/encoding/hex';
import { latin1ToBuf, latin1FromBuf } from './utils/encoding/latin1';
import { utf8ToBuf, utf8FromBuf } from './utils/encoding/utf8';
import { randomBytes } from './utils/crypto/random-bytes';

class Secret {
	/**
	 * Secret key object.
	 * @constructor
	 * @param {Object} [config] Configuration options.
	 * @param {ArrayBuffer} [config.buffer=randomBytes] Secret key.
	 * @param {number} [config.size=20] Number of random bytes to generate, ignored if 'buffer' is provided.
	 */
	constructor({ buffer, size = 20 } = {}) {
		/**
		 * Secret key.
		 * @type {ArrayBuffer}
		 */
		this.buffer = typeof buffer === 'undefined'
			? randomBytes(size)
			: buffer;
	}

	/**
	 * Converts a Latin-1 string to a Secret object.
	 * @param {string} str Latin-1 string.
	 * @returns {Secret} Secret object.
	 */
	static fromLatin1(str) {
		return new Secret({ buffer: latin1ToBuf(str) });
	}

	/**
	 * Converts an UTF-8 string to a Secret object.
	 * @param {string} str UTF-8 string.
	 * @returns {Secret} Secret object.
	 */
	static fromUTF8(str) {
		return new Secret({ buffer: utf8ToBuf(str) });
	}

	/**
	 * Converts a base32 string to a Secret object.
	 * @param {string} str Base32 string.
	 * @returns {Secret} Secret object.
	 */
	static fromBase32(str) {
		return new Secret({ buffer: base32ToBuf(str) });
	}

	/**
	 * Converts a hexadecimal string to a Secret object.
	 * @param {string} str Hexadecimal string.
	 * @returns {Secret} Secret object.
	 */
	static fromHex(str) {
		return new Secret({ buffer: hexToBuf(str) });
	}

	/**
	 * Latin-1 string representation of secret key.
	 * @type {string}
	 */
	get latin1() {
		Object.defineProperty(this, 'latin1', {
			enumerable: true,
			value: latin1FromBuf(this.buffer),
		});

		return this.latin1;
	}

	/**
	 * UTF-8 string representation of secret key.
	 * @type {string}
	 */
	get utf8() {
		Object.defineProperty(this, 'utf8', {
			enumerable: true,
			value: utf8FromBuf(this.buffer),
		});

		return this.utf8;
	}

	/**
	 * Base32 string representation of secret key.
	 * @type {string}
	 */
	get base32() {
		Object.defineProperty(this, 'base32', {
			enumerable: true,
			value: base32FromBuf(this.buffer),
		});

		return this.base32;
	}

	/**
	 * Hexadecimal string representation of secret key.
	 * @type {string}
	 */
	get hex() {
		Object.defineProperty(this, 'hex', {
			enumerable: true,
			value: hexFromBuf(this.buffer),
		});

		return this.hex;
	}
}

export { Secret };
