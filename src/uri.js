import { Utils } from './utils';
import { Secret } from './secret';
import { HOTP, TOTP } from './otp';

/**
 * Key URI regex.
 *   otpauth://TYPE/[ISSUER:]LABEL?PARAMETERS
 * @private
 * @type {RegExp}
 */
const OTPURI_REGEX = /^otpauth:\/\/([ht]otp)\/(.+)\?((?:&?[A-Z0-9.~_-]+=[^&]*)+)$/i;

/**
 * RFC 4648 base32 alphabet with pad.
 * @private
 * @type {string}
 */
const SECRET_REGEX = /^[2-7A-Z]+=*$/i;

/**
 * Regex for supported algorithms.
 * @private
 * @type {RegExp}
 */
const ALGORITHM_REGEX = /^SHA(?:1|224|256|384|512|3-224|3-256|3-384|3-512)$/i;

/**
 * Integer regex.
 * @private
 * @type {RegExp}
 */
const INTEGER_REGEX = /^[+-]?\d+$/;

/**
 * Positive integer regex.
 * @private
 * @type {RegExp}
 */
const POSITIVE_INTEGER_REGEX = /^\+?[1-9]\d*$/;

/**
 * HOTP/TOTP object/string conversion
 * (https://github.com/google/google-authenticator/wiki/Key-Uri-Format).
 */
export class URI {
	/**
	 * Parses a Google Authenticator key URI and returns an HOTP/TOTP object.
	 * @param {string} uri Google Authenticator Key URI.
	 * @returns {HOTP|TOTP} HOTP/TOTP object.
	 */
	static parse(uri) {
		let uriGroups;

		try {
			uriGroups = uri.match(OTPURI_REGEX);
		} catch (error) { /* Handled below */ }

		if (!Array.isArray(uriGroups)) {
			throw new URIError('Invalid URI format');
		}

		// Extract URI groups.
		const uriType = uriGroups[1].toLowerCase();
		const uriLabel = uriGroups[2].split(/:(.+)/, 2).map(decodeURIComponent);
		const uriParams = uriGroups[3].split('&').reduce((acc, cur) => {
			const pairArr = cur.split(/=(.*)/, 2).map(decodeURIComponent);
			const pairKey = pairArr[0].toLowerCase();
			const pairVal = pairArr[1];
			const pairAcc = acc;

			pairAcc[pairKey] = pairVal;
			return pairAcc;
		}, {});

		// 'OTP' will be instantiated with 'config' argument.
		let OTP;
		const config = {};

		if (uriType === 'hotp') {
			OTP = HOTP;

			// Counter: required
			if (typeof uriParams.counter !== 'undefined' && INTEGER_REGEX.test(uriParams.counter)) {
				config.counter = parseInt(uriParams.counter, 10);
			} else {
				throw new TypeError('Missing or invalid \'counter\' parameter');
			}
		} else if (uriType === 'totp') {
			OTP = TOTP;

			// Period: optional
			if (typeof uriParams.period !== 'undefined') {
				if (POSITIVE_INTEGER_REGEX.test(uriParams.period)) {
					config.period = parseInt(uriParams.period, 10);
				} else {
					throw new TypeError('Invalid \'period\' parameter');
				}
			}
		} else {
			throw new TypeError('Unknown OTP type');
		}

		// Label: required
		// Issuer: optional
		if (uriLabel.length === 2) {
			config.label = uriLabel[1];
			if (typeof uriParams.issuer === 'undefined') {
				config.issuer = uriLabel[0];
			} else if (uriParams.issuer === uriLabel[0]) {
				config.issuer = uriParams.issuer;
			} else {
				throw new TypeError('Invalid \'issuer\' parameter');
			}
		} else {
			config.label = uriLabel[0];
			if (typeof uriParams.issuer !== 'undefined') {
				config.issuer = uriParams.issuer;
			}
		}

		// Secret: required
		if (typeof uriParams.secret !== 'undefined' && SECRET_REGEX.test(uriParams.secret)) {
			config.secret = new Secret({ buffer: Utils.base32.toBuf(uriParams.secret) });
		} else {
			throw new TypeError('Missing or invalid \'secret\' parameter');
		}

		// Algorithm: optional
		if (typeof uriParams.algorithm !== 'undefined') {
			if (ALGORITHM_REGEX.test(uriParams.algorithm)) {
				config.algorithm = uriParams.algorithm;
			} else {
				throw new TypeError('Invalid \'algorithm\' parameter');
			}
		}

		// Digits: optional
		if (typeof uriParams.digits !== 'undefined') {
			if (POSITIVE_INTEGER_REGEX.test(uriParams.digits)) {
				config.digits = parseInt(uriParams.digits, 10);
			} else {
				throw new TypeError('Invalid \'digits\' parameter');
			}
		}

		return new OTP(config);
	}

	/**
	 * Converts an HOTP/TOTP object to a Google Authenticator key URI.
	 * @param {HOTP|TOTP} otp HOTP/TOTP object.
	 * @param {Object} [config] Configuration options.
	 * @returns {string} Google Authenticator Key URI.
	 */
	static stringify(otp) {
		if (otp instanceof HOTP || otp instanceof TOTP) {
			return otp.toString();
		}

		throw new TypeError('Invalid \'HOTP/TOTP\' object');
	}
}
