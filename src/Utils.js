'use strict';

/**
 * An object containing some utilities.
 * @type {Object}
 *
 * @property {function(buf: ArrayBuffer): number} uint.decode
 *   Converts an ArrayBuffer to an integer.
 * @property {function(num: number): ArrayBuffer} uint.encode
 *   Converts an integer to an ArrayBuffer.
 *
 * @property {function(buf: ArrayBuffer): string} raw.decode
 *   Converts an ArrayBuffer to a string.
 * @property {function(str: string): ArrayBuffer} raw.encode
 *   Converts a string to an ArrayBuffer.
 *
 * @property {function(buf: ArrayBuffer): string} b32.decode
 *   Converts an ArrayBuffer to a base32 string (RFC 4648).
 * @property {function(str: string): ArrayBuffer} b32.encode
 *   Converts a base32 string to an ArrayBuffer (RFC 4648).
 *
 * @property {function(buf: ArrayBuffer): string} hex.decode
 *   Converts an ArrayBuffer to a hexadecimal string.
 * @property {function(str: string): ArrayBuffer} hex.encode
 *   Converts a hexadecimal string to an ArrayBuffer.
 */
export const Utils = {
	'uint': {}, 'raw': {}, 'b32': {}, 'hex': {}
};

Utils.uint.decode = function (buf) {
	const arr = new Uint8Array(buf);
	let num = 0;

	for (let i = 0; i < arr.length; i++) {
		if (arr[i] === 0) continue;
		num *= 256;
		num += arr[i];
	}

	return num;
};

Utils.uint.encode = function (num) {
	const buf = new ArrayBuffer(8);
	const arr = new Uint8Array(buf);
	let acc = num;

	for (let i = 7; i >= 0; i--) {
		if (acc === 0) break;
		arr[i] = acc & 255;
		acc -= arr[i];
		acc /= 256;
	}

	return buf;
};

Utils.raw.decode = function (buf) {
	const arr = new Uint8Array(buf);
	let str = '';

	for (let i = 0; i < arr.length; i++) {
		str += String.fromCharCode(arr[i]);
	}

	return str;
};

Utils.raw.encode = function (str) {
	const buf = new ArrayBuffer(str.length);
	const arr = new Uint8Array(buf);

	for (let i = 0; i < str.length; i++) {
		arr[i] = str.charCodeAt(i);
	}

	return buf;
};

// RFC 4648 base32 alphabet without pad
Utils.b32.alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

// Based on github.com/LinusU/base32-decode
Utils.b32.decode = function (buf) {
	const arr = new Uint8Array(buf);

	let bits = 0;
	let value = 0;
	let str = '';

	for (let i = 0; i < arr.length; i++) {
		value = value << 8 | arr[i];
		bits += 8;

		while (bits >= 5) {
			str += Utils.b32.alphabet[value >>> bits - 5 & 31];
			bits -= 5;
		}
	}

	if (bits > 0) {
		str += Utils.b32.alphabet[value << 5 - bits & 31];
	}

	return str;
};

// Based on github.com/LinusU/base32-encode
Utils.b32.encode = function (str) {
	const strUpp = str.toUpperCase();
	const buf = new ArrayBuffer(str.length * 5 / 8 | 0);
	const arr = new Uint8Array(buf);

	let bits = 0;
	let value = 0;
	let index = 0;

	for (let i = 0; i < strUpp.length; i++) {
		let idx = Utils.b32.alphabet.indexOf(strUpp[i]);

		if (idx === -1) {
			throw new Error('Invalid character found: ' + strUpp[i]);
		}

		value = value << 5 | idx;
		bits += 5;

		if (bits >= 8) {
			arr[index++] = value >>> bits - 8 & 255;
			bits -= 8;
		}
	}

	return buf;
};

Utils.hex.decode = function (buf) {
	const arr = new Uint8Array(buf);
	let str = '';

	for (let i = 0; i < arr.length; i++) {
		const hexByte = arr[i].toString(16);

		str += hexByte.length === 1
			? '0' + hexByte
			: hexByte;
	}

	return str.toUpperCase();
};

Utils.hex.encode = function (str) {
	const buf = new ArrayBuffer(str.length / 2);
	const arr = new Uint8Array(buf);

	for (let i = 0; i < arr.length; i++) {
		arr[i] = parseInt(str.substr(i * 2, 2), 16);
	}

	return buf;
};

