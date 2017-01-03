'use strict';

import {default as crypto} from 'crypto';
import {Utils} from './Utils.js';

/**
 * @class Secret
 */
export class Secret {
	/**
	 * Secret key object.
	 * @param {Object} [config] Configuration options.
	 * @param {ArrayBuffer} [config.buffer=Secret.getRandomBytes] ArrayBuffer of the secret key.
	 */
	constructor({buffer} = {}) {
		/** @type {ArrayBuffer} */
		this.buffer = typeof buffer === 'undefined'
			? this.buffer = Secret.getRandomBytes()
			: buffer;
		/** @type {string} */
		this.raw = Utils.raw.decode(this.buffer);
		/** @type {string} */
		this.b32 = Utils.b32.decode(this.buffer);
		/** @type {string} */
		this.hex = Utils.hex.decode(this.buffer);
	}

	/**
	 * Returns an ArrayBuffer of random bytes using Node or Web Cryptography API.
	 * @method getRandomBytes
	 * @param {Object} [config] Configuration options.
	 * @param {number} [config.size=20] Number of bytes to generate.
	 * @returns {ArrayBuffer} Random bytes.
	 */
	static getRandomBytes({size = 20} = {}) {
		let bytes;

		if (typeof crypto !== 'undefined' && typeof crypto.randomBytes !== 'undefined') {
			bytes = new Uint8Array(crypto.randomBytes(size).buffer, 0, size);
		} else {
			bytes = new Uint8Array(size);

			if (typeof global.crypto !== 'undefined' && typeof global.crypto.getRandomValues !== 'undefined') {
				global.crypto.getRandomValues(bytes);
			} else if (typeof global.msCrypto !== 'undefined' && typeof global.msCrypto.getRandomValues !== 'undefined') {
				global.msCrypto.getRandomValues(bytes);
			} else { // WARNING: 'Math.random' is not cryptographically-secure
				for (let i = 0; i < bytes.length; i++) {
					bytes[i] = Math.floor(Math.random() * 256);
				}
			}
		}

		return bytes.buffer;
	}
}

