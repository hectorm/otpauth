import { globalThis } from '../global-this';
import { isNode } from '../is-node';
import { nodeRequire } from '../node-require';

const NodeCrypto = isNode ? nodeRequire('crypto') : undefined;
const BrowserCrypto = !isNode ? globalThis.crypto || globalThis.msCrypto : undefined;

/**
 * Returns random bytes.
 * @param {number} size Size.
 * @returns {ArrayBuffer} Random bytes.
 */
const randomBytes = (size) => {
	if (isNode) {
		return NodeCrypto.randomBytes(size).buffer;
	} else {
		if (!BrowserCrypto || !BrowserCrypto.getRandomValues) {
			throw new Error('Cryptography API not available');
		}
		return BrowserCrypto.getRandomValues(new Uint8Array(size)).buffer;
	}
};

export { randomBytes };
