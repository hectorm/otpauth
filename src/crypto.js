// eslint-disable-next-line import/no-extraneous-dependencies
import sjcl from 'sjcl'; // SJCL is included during compilation.

import { InternalUtils } from './utils';

/**
 * Node.js Crypto module.
 * @private
 * @type {Object}
 */
const NodeCrypto = InternalUtils.require('crypto');

/**
 * An object containing some cryptography functions
 * with dirty workarounds for Node.js and browsers.
 * @private
 * @type {Object}
 */
export const Crypto = {};

if (NodeCrypto) {
	let bufferFrom;

	if (typeof Buffer.from === 'function') {
		bufferFrom = Buffer.from;
	} else {
		// Node.js < 5.10.0
		bufferFrom = arrbuf => {
			// eslint-disable-next-line no-buffer-constructor
			const nodeBuf = new Buffer(arrbuf.byteLength);
			const arr = new Uint8Array(arrbuf);

			for (let i = 0; i < arr.length; i++) {
				nodeBuf[i] = arr[i];
			}

			return nodeBuf;
		};
	}

	let bufferTo;

	if (Buffer.prototype instanceof Uint8Array) {
		bufferTo = nodeBuf => nodeBuf;
	} else {
		// Node.js < 4.0.0
		bufferTo = nodeBuf => {
			const arr = new Uint8Array(nodeBuf.length);

			for (let i = 0; i < arr.length; i++) {
				arr[i] = nodeBuf[i];
			}

			return arr;
		};
	}

	Crypto.randomBytes = size => {
		const buff = NodeCrypto.randomBytes(size);
		return bufferTo(buff);
	};

	// In Node.js, the command:
	// $ openssl list -digest-algorithms
	// displays the available digest algorithms.
	Crypto.hmacDigest = (algorithm, key, message) => {
		const buff = NodeCrypto.createHmac(algorithm, bufferFrom(key));
		return bufferTo(buff).update(bufferFrom(message)).digest();
	};
} else {
	let getRandomValues;

	if (typeof global.crypto !== 'undefined' && typeof global.crypto.getRandomValues === 'function') {
		getRandomValues = arr => {
			global.crypto.getRandomValues(arr);
		};
	} else if (typeof global.msCrypto !== 'undefined' && typeof global.msCrypto.getRandomValues === 'function') {
		getRandomValues = arr => {
			global.msCrypto.getRandomValues(arr);
		};
	} else {
		console.warn('Cryptography API not available, falling back to \'Math.random\'...');
		getRandomValues = arr => {
			for (let i = 0; i < arr.length; i++) {
				arr[i] = Math.floor(Math.random() * 256);
			}
		};
	}

	Crypto.randomBytes = size => {
		const arr = new Uint8Array(size);
		getRandomValues(arr);
		return arr;
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
