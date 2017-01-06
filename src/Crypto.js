import sjcl from './.sjcl.custom.js';

/**
 * An object containing some cryptography functions
 * with dirty workarounds for Node.js and browsers.
 * @private
 */
export const Crypto = {};

let nodeCrypto;

if (typeof window === 'undefined' &&
	typeof module !== 'undefined' &&
	typeof module.exports !== 'undefined'
) {
	// Dynamically require 'crypto' module to prevent issues with Webpack
	// eslint-disable-next-line no-eval
	nodeCrypto = eval('require')('crypto');
}

if (typeof nodeCrypto !== 'undefined') {
	let bufferFrom;

	if (typeof Buffer.from === 'function') {
		bufferFrom = Buffer.from;
	} else {
		// Node.js < 5.10.0
		bufferFrom = function (arrbuf) {
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
		bufferTo = function (nodeBuf) {
			return nodeBuf;
		};
	} else {
		// Node.js < 4.0.0
		bufferTo = function (nodeBuf) {
			const arr = new Uint8Array(nodeBuf.length);

			for (let i = 0; i < arr.length; i++) {
				arr[i] = nodeBuf[i];
			}

			return arr;
		};
	}

	Crypto.randomBytes = function (size) {
		return bufferTo(nodeCrypto.randomBytes(size));
	};

	// In Node.js, the command:
	//   $ openssl list-message-digest-algorithms
	// displays the available digest algorithms.
	Crypto.hmacDigest = function(algorithm, key, message) {
		return bufferTo(
			nodeCrypto.createHmac(algorithm, bufferFrom(key))
				.update(bufferFrom(message))
				.digest()
		);
	};
} else {
	let getRandomValues;

	if (typeof global.crypto !== 'undefined' && typeof global.crypto.getRandomValues === 'function') {
		getRandomValues = function (arr) {
			global.crypto.getRandomValues(arr);
		};
	} else if (typeof global.msCrypto !== 'undefined' && typeof global.msCrypto.getRandomValues === 'function') {
		getRandomValues = function (arr) {
			global.msCrypto.getRandomValues(arr);
		};
	} else {
		// eslint-disable-next-line no-console
		console.warn('Cryptography API not available, falling back to \'Math.random\'...');

		getRandomValues = function (arr) {
			for (let i = 0; i < arr.length; i++) {
				// eslint-disable-next-line no-param-reassign
				arr[i] = Math.floor(Math.random() * 256);
			}
		};
	}

	Crypto.randomBytes = function (size) {
		const arr = new Uint8Array(size);
		getRandomValues(arr);

		return arr;
	};

	Crypto.hmacDigest = function(algorithm, key, message) {
		const hash = sjcl.hash[algorithm.toLowerCase()];

		if (typeof hash === 'undefined') {
			throw Error('Unknown hash function');
		}

		const hmac = new sjcl.misc.hmac(sjcl.codec.arrayBuffer.toBits(key), hash);
		hmac.update(sjcl.codec.arrayBuffer.toBits(message));

		return sjcl.codec.arrayBuffer.fromBits(hmac.digest(), false);
	};
}

