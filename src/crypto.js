// eslint-disable-next-line import/no-extraneous-dependencies
import sjcl from 'sjcl'; // SJCL is included during compilation.

import { InternalUtils } from './utils';

/**
 * An object containing some cryptography functions
 * with dirty workarounds for Node.js and browsers.
 * @private
 * @namespace Crypto
 * @type {Object}
 */
export const Crypto = {};

/**
 * Returns random bytes.
 * @memberof Crypto
 * @method randomBytes
 * @param {number} size Size.
 * @returns {ArrayBuffer} Random bytes.
 */
Crypto.randomBytes = undefined;

/**
 * Calculates an HMAC digest.
 * In Node.js, the command `openssl list -digest-algorithms` displays the available digest algorithms.
 * @memberof Crypto
 * @method hmacDigest
 * @param {string} algorithm Algorithm.
 * @param {ArrayBuffer} key Key.
 * @param {ArrayBuffer} message Message.
 * @returns {ArrayBuffer} Digest.
 */
Crypto.hmacDigest = undefined;

if (InternalUtils.isNode) {
	const NodeBuffer = InternalUtils.globalThis.Buffer;
	const NodeCrypto = InternalUtils.require('crypto');

	let nodeBufferFromArrayBuffer;
	if (typeof NodeBuffer.from === 'function') {
		nodeBufferFromArrayBuffer = NodeBuffer.from;
	} else {
		// Node.js < 5.10.0
		nodeBufferFromArrayBuffer = arrayBuffer => {
			const nodeBuffer = new NodeBuffer(arrayBuffer.byteLength);
			const uint8Array = new Uint8Array(arrayBuffer);
			for (let i = 0; i < uint8Array.length; i++) {
				nodeBuffer[i] = uint8Array[i];
			}
			return nodeBuffer;
		};
	}

	let nodeBufferToArrayBuffer;
	if (NodeBuffer.prototype instanceof Uint8Array) {
		nodeBufferToArrayBuffer = nodeBuffer => nodeBuffer.buffer;
	} else {
		// Node.js < 4.0.0
		nodeBufferToArrayBuffer = nodeBuffer => {
			const uint8Array = new Uint8Array(nodeBuffer.length);
			for (let i = 0; i < uint8Array.length; i++) {
				uint8Array[i] = nodeBuffer[i];
			}
			return uint8Array.buffer;
		};
	}

	Crypto.randomBytes = size => {
		const randomBytes = NodeCrypto.randomBytes(size);
		return nodeBufferToArrayBuffer(randomBytes);
	};

	Crypto.hmacDigest = (algorithm, key, message) => {
		const hmac = NodeCrypto.createHmac(algorithm, nodeBufferFromArrayBuffer(key));
		hmac.update(nodeBufferFromArrayBuffer(message));
		return nodeBufferToArrayBuffer(hmac.digest());
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

	Crypto.randomBytes = size => {
		const randomBytes = new Uint8Array(size);
		getRandomValues(randomBytes);
		return randomBytes.buffer;
	};

	Crypto.hmacDigest = (algorithm, key, message) => {
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
