/**
 * Pads a number with leading zeros.
 * @private
 * @param {number|string} num Number.
 * @param {number} digits Digits.
 * @returns {string} Padded number.
 */
const pad = (num, digits) => {
	let prefix = '';
	let repeat = digits - String(num).length;
	while (repeat-- > 0) prefix += '0';
	return `${prefix}${num}`;
};

export default pad;
