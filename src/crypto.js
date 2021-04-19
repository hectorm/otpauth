import jsSHA from 'jssha';

import { InternalUtils } from './internal-utils';

const NodeBuffer = InternalUtils.isNode ? InternalUtils.globalThis.Buffer : undefined;
const NodeCrypto = InternalUtils.isNode ? InternalUtils.nodeRequire('crypto') : undefined;
const BrowserCrypto = !InternalUtils.isNode ? InternalUtils.globalThis.crypto || InternalUtils.globalThis.msCrypto : undefined;

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
	get randomBytes() {
		let _randomBytes;

		if (InternalUtils.isNode) {
			_randomBytes = size => NodeCrypto.randomBytes(size).buffer;
		} else if (BrowserCrypto && BrowserCrypto.getRandomValues) {
			_randomBytes = size => BrowserCrypto.getRandomValues(new Uint8Array(size)).buffer;
		} else {
			throw new Error('Cryptography API not available');
		}

		Object.defineProperty(this, 'randomBytes', {
			enumerable: true,
			configurable: true,
			writable: true,
			value: _randomBytes
		});

		return this.randomBytes;
	},

	/**
	 * Calculates an HMAC digest.
	 * In Node.js, the command `openssl list -digest-algorithms` displays the available digest algorithms.
	 * @param {string} algorithm Algorithm.
	 * @param {ArrayBuffer} key Key.
	 * @param {ArrayBuffer} message Message.
	 * @returns {ArrayBuffer} Digest.
	 */
	get hmacDigest() {
		let _hmacDigest;

		if (InternalUtils.isNode) {
			_hmacDigest = (algorithm, key, message) => {
				const hmac = NodeCrypto.createHmac(algorithm, NodeBuffer.from(key));
				hmac.update(NodeBuffer.from(message));
				return hmac.digest().buffer;
			};
		} else {
			_hmacDigest = (algorithm, key, message) => {
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
		}

		Object.defineProperty(this, 'hmacDigest', {
			enumerable: true,
			configurable: true,
			writable: true,
			value: _hmacDigest
		});

		return this.hmacDigest;
	},

	/**
	 * Returns true if a is equal to b, without leaking timing information that would allow an attacker to guess one of the values.
	 * @param {string} a String a.
	 * @param {string} b String b.
	 * @returns {boolean} Equality result.
	 */
	get timingSafeEqual() {
		let _timingSafeEqual;

		if (InternalUtils.isNode) {
			_timingSafeEqual = (a, b) => NodeCrypto.timingSafeEqual(NodeBuffer.from(a), NodeBuffer.from(b));
		} else {
			_timingSafeEqual = (a, b) => {
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

		Object.defineProperty(this, 'timingSafeEqual', {
			enumerable: true,
			configurable: true,
			writable: true,
			value: _timingSafeEqual
		});

		return this.timingSafeEqual;
	}

};
