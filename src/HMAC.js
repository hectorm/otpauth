'use strict';

import {default as crypto} from 'crypto';
import {default as sjcl} from './.sjcl.custom.js';

/**
 * Supported HMAC algorithms.
 * The value of each key is used by the Stanford Javascript Crypto Library (SJCL).
 * @private
 */
const HMAC_ALGORITHMS = {
	'SHA1': 'sha1',
	'SHA256': 'sha256',
	'SHA512': 'sha512'
};

/**
 * @class HMAC
 */
export class HMAC {
	/**
	 * Calculates the HMAC digest of the given key and message.
	 * @method digest
	 * @param {Object} config Configuration options.
	 * @param {string} config.algorithm Hashing algorithm (SHA1, SHA256 or SHA512).
	 * @param {ArrayBuffer} config.key Key.
	 * @param {ArrayBuffer} config.message Message.
	 * @returns {ArrayBuffer} Digest.
	 */
	static digest({algorithm, key, message}) {
		if (!(algorithm in HMAC_ALGORITHMS)) {
			throw Error('Unknown hash function');
		}

		let digest;

		if (typeof crypto !== 'undefined' && typeof crypto.createHmac !== 'undefined') {
			const hmac = crypto.createHmac(algorithm, new Uint8Array(key));
			hmac.update(new Uint8Array(message));

			digest = hmac.digest();
		} else if (typeof sjcl !== 'undefined') {
			const hash = sjcl.hash[HMAC_ALGORITHMS[algorithm]];
			const fromBits = sjcl.codec.arrayBuffer.fromBits;
			const toBits = sjcl.codec.arrayBuffer.toBits;

			const hmac = new sjcl.misc.hmac(toBits(key), hash);
			hmac.update(toBits(message));

			digest = fromBits(hmac.digest(), false);
		} else {
			throw Error('Unable to create HMAC digest');
		}

		return digest;
	}
}

