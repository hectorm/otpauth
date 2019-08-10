import { Utils } from './utils';
import { Crypto } from './crypto';

/**
 * Secret key object.
 */
export class Secret {
	/**
	 * @param {Object} [config] Configuration options.
	 * @param {ArrayBuffer} [config.buffer=Crypto.randomBytes] Secret key.
	 * @param {number} [config.size=20] Number of random bytes to generate, ignored if 'buffer' is provided.
	 */
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
	 * Converts a raw string to a Secret object.
	 * @param {string} str Raw string.
	 * @returns {Secret} Secret object.
	 */
	static fromRaw(str) {
		return new Secret({ buffer: Utils.raw.encode(str) });
	}

	/**
	 * Converts a base32 string to a Secret object.
	 * @param {string} str Base32 string.
	 * @returns {Secret} Secret object.
	 */
	static fromB32(str) {
		return new Secret({ buffer: Utils.b32.encode(str) });
	}

	/**
	 * Converts a hexadecimal string to a Secret object.
	 * @param {string} str Hexadecimal string.
	 * @returns {Secret} Secret object.
	 */
	static fromHex(str) {
		return new Secret({ buffer: Utils.hex.encode(str) });
	}

	/**
	 * String representation of secret key.
	 * @type {string}
	 */
	get raw() {
		Object.defineProperty(this, 'raw', {
			enumerable: true,
			configurable: true,
			writable: true,
			value: Utils.raw.decode(this.buffer)
		});

		return this.raw;
	}

	/**
	 * Base32 representation of secret key.
	 * @type {string}
	 */
	get b32() {
		Object.defineProperty(this, 'b32', {
			enumerable: true,
			configurable: true,
			writable: true,
			value: Utils.b32.decode(this.buffer)
		});

		return this.b32;
	}

	/**
	 * Hexadecimal representation of secret key.
	 * @type {string}
	 */
	get hex() {
		Object.defineProperty(this, 'hex', {
			enumerable: true,
			configurable: true,
			writable: true,
			value: Utils.hex.decode(this.buffer)
		});

		return this.hex;
	}
}
