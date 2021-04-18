import jsSHA from 'jssha';

import { InternalUtils } from './internal-utils';

let randomBytes;
let hmacDigest;
let timingSafeEqual;

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

	timingSafeEqual = (a, b) => {
		return NodeCrypto.timingSafeEqual(NodeBuffer.from(a), NodeBuffer.from(b));
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
		const variant = ({
			SHA1: 'SHA-1',
			SHA224: 'SHA-224',
			SHA256: 'SHA-256',
			SHA384: 'SHA-384',
			SHA512: 'SHA-512',
			'SHA3-224': 'SHA3-224',
			'SHA3-256': 'SHA3-256',
			'SHA3-384': 'SHA3-384',
			'SHA3-512': 'SHA3-512'
		})[algorithm.toUpperCase()];
		if (typeof variant === 'undefined') {
			throw new TypeError('Unknown hash function');
		}
		// eslint-disable-next-line new-cap
		const hmac = new jsSHA(variant, 'ARRAYBUFFER');
		hmac.setHMACKey(key, 'ARRAYBUFFER');
		hmac.update(message);
		return hmac.getHMAC('ARRAYBUFFER');
	};

	timingSafeEqual = (a, b) => {
		if (a.length !== b.length) {
			throw new TypeError('Input strings must have the same length');
		}
		let i = -1;
		let out = 0;
		while (++i < a.length) {
			out |= a.charCodeAt(i) ^ b.charCodeAt(i);
		}
		return out === 0;
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
	hmacDigest,

	/**
	 * Returns true if a is equal to b, without leaking timing information that would allow an attacker to guess one of the values.
	 * @param {string} a String a.
	 * @param {string} b String b.
	 * @returns {boolean} Equality result.
	 */
	timingSafeEqual

};
