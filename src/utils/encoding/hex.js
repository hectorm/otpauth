/**
 * Converts a hexadecimal string to an ArrayBuffer.
 * @param {string} str Hexadecimal string.
 * @returns {ArrayBuffer} ArrayBuffer.
 */
const hexToBuf = (str) => {
	const buf = new ArrayBuffer(str.length / 2);
	const arr = new Uint8Array(buf);

	for (let i = 0; i < str.length; i += 2) {
		arr[i / 2] = parseInt(str.substr(i, 2), 16);
	}

	return buf;
};

/**
 * Converts an ArrayBuffer to a hexadecimal string.
 * @param {ArrayBuffer} buf ArrayBuffer.
 * @returns {string} Hexadecimal string.
 */
const hexFromBuf = (buf) => {
	const arr = new Uint8Array(buf);
	let str = '';

	for (let i = 0; i < arr.length; i++) {
		const hex = arr[i].toString(16);
		if (hex.length === 1) str += '0';
		str += hex;
	}

	return str.toUpperCase();
};

export { hexToBuf, hexFromBuf };
