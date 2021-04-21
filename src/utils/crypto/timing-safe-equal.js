import globalThis from '../global-this';
import isNode from '../is-node';
import nodeRequire from '../node-require';

const NodeBuffer = isNode ? globalThis.Buffer : undefined;
const NodeCrypto = isNode ? nodeRequire('crypto') : undefined;

/**
 * Returns true if a is equal to b, without leaking timing information that would allow an attacker to guess one of the values.
 * @param {string} a String a.
 * @param {string} b String b.
 * @returns {boolean} Equality result.
 */
const timingSafeEqual = (a, b) => {
	if (isNode) {
		return NodeCrypto.timingSafeEqual(NodeBuffer.from(a), NodeBuffer.from(b));
	} else {
		if (a.length !== b.length) {
			throw new TypeError('Input strings must have the same length');
		}
		let i = -1;
		let out = 0;
		while (++i < a.length) {
			out |= a.charCodeAt(i) ^ b.charCodeAt(i);
		}
		return out === 0;
	}
};

export default timingSafeEqual;
