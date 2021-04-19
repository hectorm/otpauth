import { Utils } from './utils';
import { Crypto } from './crypto';

/**
 * Secret key object.
 * @param {Object} [config] Configuration options.
 * @param {ArrayBuffer} [config.buffer=Crypto.randomBytes] Secret key.
 * @param {number} [config.size=20] Number of random bytes to generate, ignored if 'buffer' is provided.
 */
export class Secret {
	constructor({ buffer, size = 20 } = {}) {
		/**
		 * Secret key.
		 * @type {ArrayBuffer}
		 */
		this.buffer = typeof buffer === 'undefined'
			? Crypto.randomBytes(size)
			: buffer;
	}

	/**
	 * Converts a Latin-1 string to a Secret object.
	 * @param {string} str Latin-1 string.
	 * @returns {Secret} Secret object.
	 */
	static fromLatin1(str) {
		return new Secret({ buffer: Utils.latin1.toBuf(str) });
	}

	/**
	 * Converts an UTF-8 string to a Secret object.
	 * @param {string} str UTF-8 string.
	 * @returns {Secret} Secret object.
	 */
	static fromUTF8(str) {
		return new Secret({ buffer: Utils.utf8.toBuf(str) });
	}

	/**
	 * Converts a base32 string to a Secret object.
	 * @param {string} str Base32 string.
	 * @returns {Secret} Secret object.
	 */
	static fromBase32(str) {
		return new Secret({ buffer: Utils.base32.toBuf(str) });
	}

	/**
	 * Converts a hexadecimal string to a Secret object.
	 * @param {string} str Hexadecimal string.
	 * @returns {Secret} Secret object.
	 */
	static fromHex(str) {
		return new Secret({ buffer: Utils.hex.toBuf(str) });
	}

	/**
	 * Latin-1 string representation of secret key.
	 * @type {string}
	 */
	get latin1() {
		Object.defineProperty(this, 'latin1', {
			enumerable: true,
			value: Utils.latin1.fromBuf(this.buffer)
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
			value: Utils.utf8.fromBuf(this.buffer)
		});

		return this.utf8;
	}

	/**
	 * Base32 representation of secret key.
	 * @type {string}
	 */
	get base32() {
		Object.defineProperty(this, 'base32', {
			enumerable: true,
			value: Utils.base32.fromBuf(this.buffer)
		});

		return this.base32;
	}

	/**
	 * Hexadecimal representation of secret key.
	 * @type {string}
	 */
	get hex() {
		Object.defineProperty(this, 'hex', {
			enumerable: true,
			value: Utils.hex.fromBuf(this.buffer)
		});

		return this.hex;
	}
}
