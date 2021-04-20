import jsSHA from 'jssha';

import globalThis from '../global-this';
import isNode from '../is-node';
import nodeRequire from '../node-require';

const NodeBuffer = isNode ? globalThis.Buffer : undefined;
const NodeCrypto = isNode ? nodeRequire('crypto') : undefined;

/**
 * Calculates an HMAC digest.
 * In Node.js, the command "openssl list -digest-algorithms" displays the available digest algorithms.
 * @private
 * @param {string} algorithm Algorithm.
 * @param {ArrayBuffer} key Key.
 * @param {ArrayBuffer} message Message.
 * @returns {ArrayBuffer} Digest.
 */
const hmacDigest = isNode
	? (algorithm, key, message) => {
		const hmac = NodeCrypto.createHmac(algorithm, NodeBuffer.from(key));
		hmac.update(NodeBuffer.from(message));
		return hmac.digest().buffer;
	}
	: (algorithm, key, message) => {
		const variant = ({
			'SHA1': 'SHA-1',
			'SHA224': 'SHA-224',
			'SHA256': 'SHA-256',
			'SHA384': 'SHA-384',
			'SHA512': 'SHA-512',
			'SHA3-224': 'SHA3-224',
			'SHA3-256': 'SHA3-256',
			'SHA3-384': 'SHA3-384',
			'SHA3-512': 'SHA3-512',
		})[algorithm.toUpperCase()];
		if (typeof variant === 'undefined') {
			throw new TypeError('Unknown hash function');
		}
		// eslint-disable-next-line @babel/new-cap
		const hmac = new jsSHA(variant, 'ARRAYBUFFER');
		hmac.setHMACKey(key, 'ARRAYBUFFER');
		hmac.update(message);
		return hmac.getHMAC('ARRAYBUFFER');
	};

export default hmacDigest;
