'use strict';

import {default as crypto} from 'crypto';
import {Utils, _Utils} from './Utils.js';

/**
 * @class Secret
 */
export class Secret {
	/**
	 * Secret key object.
	 * @param {Object} [config] Configuration options.
	 * @param {ArrayBuffer} [config.buffer=Secret.getRandomBytes] Secret key.
	 */
	constructor({buffer} = {}) {
		/** @type {ArrayBuffer} */
		this.buffer = typeof buffer === 'undefined'
			? this.buffer = Secret.getRandomBytes()
			: buffer;
	}

	/** @type {string} */
	get raw() {
		Object.defineProperty(this, 'raw', {
			'enumerable': true,
			'configurable': true,
			'writable': true,
			'value': Utils.raw.decode(this.buffer)
		});

		return this.raw;
	}

	/** @type {string} */
	get b32() {
		Object.defineProperty(this, 'b32', {
			'enumerable': true,
			'configurable': true,
			'writable': true,
			'value': Utils.b32.decode(this.buffer)
		});

		return this.b32;
	}

	/** @type {string} */
	get hex() {
		Object.defineProperty(this, 'hex', {
			'enumerable': true,
			'configurable': true,
			'writable': true,
			'value': Utils.hex.decode(this.buffer)
		});

		return this.hex;
	}

	/**
	 * Generates random bytes.
	 * @method getRandomBytes
	 * @param {Object} [config] Configuration options.
	 * @param {number} [config.size=20] Number of bytes to generate.
	 * @returns {ArrayBuffer} Random bytes.
	 */
	static getRandomBytes({size = 20} = {}) {
		let bytes;

		if (typeof crypto !== 'undefined' && typeof crypto.randomBytes === 'function') {
			bytes = _Utils.buf2arrbuf(crypto.randomBytes(size));
		} else {
			const arr = new Uint8Array(size);

			if (typeof global.crypto !== 'undefined' && typeof global.crypto.getRandomValues === 'function') {
				global.crypto.getRandomValues(arr);
			} else if (typeof global.msCrypto !== 'undefined' && typeof global.msCrypto.getRandomValues === 'function') {
				global.msCrypto.getRandomValues(arr);
			} else { // WARNING: 'Math.random' is not cryptographically-secure
				for (let i = 0; i < arr.length; i++) {
					arr[i] = Math.floor(Math.random() * 256);
				}
			}

			bytes = arr.buffer;
		}

		return bytes;
	}
}

