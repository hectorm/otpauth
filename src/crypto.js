// eslint-disable-next-line import/no-extraneous-dependencies
import sjcl from 'sjcl'; // SJCL is included during compilation.

import { InternalUtils } from './utils';

let randomBytes;
let hmacDigest;

if (InternalUtils.isNode) {
	const NodeBuffer = InternalUtils.globalThis.Buffer;
	const NodeCrypto = InternalUtils.nodeRequire('crypto');

	randomBytes = size => {
		const bytes = NodeCrypto.randomBytes(size);
		return bytes.buffer;
	};

	hmacDigest = (algorithm, key, message) => {
		const hmac = NodeCrypto.createHmac(algorithm, NodeBuffer.from(key));
		hmac.update(NodeBuffer.from(message));
		return hmac.digest().buffer;
	};
} else {
	const BrowserCrypto = InternalUtils.globalThis.crypto || InternalUtils.globalThis.msCrypto;

	let getRandomValues;
	if (typeof BrowserCrypto !== 'undefined' && typeof BrowserCrypto.getRandomValues === 'function') {
		getRandomValues = array => {
			BrowserCrypto.getRandomValues(array);
		};
	} else {
		InternalUtils.console.warn('Cryptography API not available, falling back to \'Math.random\'...');
		getRandomValues = array => {
			for (let i = 0; i < array.length; i++) {
				array[i] = Math.floor(Math.random() * 256);
			}
		};
	}

	randomBytes = size => {
		const bytes = new Uint8Array(size);
		getRandomValues(bytes);
		return bytes.buffer;
	};

	hmacDigest = (algorithm, key, message) => {
		const hash = sjcl.hash[algorithm.toLowerCase()];
		if (typeof hash === 'undefined') {
			throw new TypeError('Unknown hash function');
		}
		// eslint-disable-next-line new-cap
		const hmac = new sjcl.misc.hmac(sjcl.codec.arrayBuffer.toBits(key), hash);
		hmac.update(sjcl.codec.arrayBuffer.toBits(message));
		return sjcl.codec.arrayBuffer.fromBits(hmac.digest(), false);
	};
}

/**
 * An object containing some cryptography functions with dirty workarounds for Node.js and browsers.
 * @private
 * @type {Object}
 */
export const Crypto = {

	/**
	 * Returns random bytes.
	 * @param {number} size Size.
	 * @returns {ArrayBuffer} Random bytes.
	 */
	randomBytes,

	/**
	 * Calculates an HMAC digest.
	 * In Node.js, the command `openssl list -digest-algorithms` displays the available digest algorithms.
	 * @param {string} algorithm Algorithm.
	 * @param {ArrayBuffer} key Key.
	 * @param {ArrayBuffer} message Message.
	 * @returns {ArrayBuffer} Digest.
	 */
	hmacDigest

};
