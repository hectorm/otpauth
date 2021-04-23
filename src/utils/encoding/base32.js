/**
 * RFC 4648 base32 alphabet without pad.
 * @type {string}
 */
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Converts a base32 string to an ArrayBuffer (RFC 4648).
 * {@link https://github.com/LinusU/base32-decode|LinusU/base32-decode}
 * @param {string} str Base32 string.
 * @returns {ArrayBuffer} ArrayBuffer.
 */
const base32ToBuf = (str) => {
	// Canonicalize to all upper case and remove padding if it exists.
	const cstr = str.toUpperCase().replace(/=+$/, '');

	const buf = new ArrayBuffer((cstr.length * 5) / 8 | 0);
	const arr = new Uint8Array(buf);
	let bits = 0;
	let value = 0;
	let index = 0;

	for (let i = 0; i < cstr.length; i++) {
		const idx = ALPHABET.indexOf(cstr[i]);
		if (idx === -1) throw new TypeError(`Invalid character found: ${cstr[i]}`);

		value = (value << 5) | idx;
		bits += 5;

		if (bits >= 8) {
			arr[index++] = (value >>> bits - 8) & 255;
			bits -= 8;
		}
	}

	return buf;
};

/**
 * Converts an ArrayBuffer to a base32 string (RFC 4648).
 * {@link https://github.com/LinusU/base32-encode|LinusU/base32-encode}
 * @param {ArrayBuffer} buf ArrayBuffer.
 * @returns {string} Base32 string.
 */
const base32FromBuf = (buf) => {
	const arr = new Uint8Array(buf);
	let bits = 0;
	let value = 0;
	let str = '';

	for (let i = 0; i < arr.length; i++) {
		value = (value << 8) | arr[i];
		bits += 8;

		while (bits >= 5) {
			str += ALPHABET[(value >>> bits - 5) & 31];
			bits -= 5;
		}
	}

	if (bits > 0) {
		str += ALPHABET[(value << 5 - bits) & 31];
	}

	return str;
};

export { base32ToBuf, base32FromBuf };
