import { Utils } from './utils';
import { Secret } from './secret';
/* eslint-disable-next-line import/no-cycle */
import { HOTP, TOTP } from './otp';

/**
 * Valid key URI parameters.
 * @private
 * @type {Array}
 */
const OTPURI_PARAMS = ['issuer', 'label', 'secret', 'algorithm', 'digits', 'counter', 'period'];

/**
 * Key URI regex.
 *   otpauth://TYPE/[ISSUER:]LABEL?PARAMETERS
 * @private
 * @type {RegExp}
 */
const OTPURI_REGEX = new RegExp(`^otpauth:\\/\\/([ht]otp)\\/(.+)\\?((?:&?(?:${OTPURI_PARAMS.join('|')})=[^&]+)+)$`, 'i');

/**
 * RFC 4648 base32 alphabet without pad.
 * @private
 * @type {string}
 */
const SECRET_REGEX = /^[2-7A-Z]+$/i;

/**
 * Regex for supported algorithms.
 * @private
 * @type {RegExp}
 */
const ALGORITHM_REGEX = /^SHA(?:1|256|512)$/i;

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
 * HOTP/TOTP object/string conversion.
 * @see https://github.com/google/google-authenticator/wiki/Key-Uri-Format
 */
export class URI {
	/**
	 * Parses a Google Authenticator key URI and returns an HOTP/TOTP object.
	 * @method parse
	 * @param {string} uri Google Authenticator Key URI.
	 * @returns {Object} HOTP/TOTP object.
	 */
	static parse(uri) {
		let uriGroups;

		try {
			uriGroups = decodeURIComponent(uri).match(OTPURI_REGEX);
		} catch (error) { /* Handled below */ }

		if (!Array.isArray(uriGroups)) {
			throw new URIError('Invalid URI format');
		}

		// Extract URI groups
		const uriType = uriGroups[1].toLowerCase();
		const uriLabel = uriGroups[2].split(/:(.+)/, 2);
		const uriParams = uriGroups[3].split('&').reduce((acc, cur) => {
			const pairArr = cur.split(/=(.+)/, 2);
			const pairKey = pairArr[0].toLowerCase();
			const pairVal = pairArr[1];
			const pairAcc = acc;

			pairAcc[pairKey] = pairVal;
			return pairAcc;
		}, {});

		// 'OTP' will be instantiated with 'config' argument
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
			config.secret = new Secret({ buffer: Utils.b32.encode(uriParams.secret) });
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
	 * @method stringify
	 * @param {Object} otp HOTP/TOTP object.
	 * @param {Object} [config] Configuration options.
	 * @param {boolean} [config.legacyIssuer=true] Set issuer label prefix.
	 * @returns {string} Google Authenticator Key URI.
	 */
	static stringify(otp, { legacyIssuer = true } = {}) {
		const isHOTP = otp instanceof HOTP;
		const isTOTP = otp instanceof TOTP;

		if (!isHOTP && !isTOTP) {
			throw new TypeError('Invalid \'HOTP/TOTP\' object');
		}

		// Key URI format:
		// otpauth://TYPE/[ISSUER:]LABEL?PARAMETERS
		let uri = 'otpauth://';

		// Type
		uri += `${isTOTP ? 'totp' : 'hotp'}/`;

		// Label and optional issuer
		if (otp.issuer.length > 0) {
			// Legacy label prefix
			if (legacyIssuer) uri += `${encodeURIComponent(otp.issuer)}:`;
			// Label
			uri += `${encodeURIComponent(otp.label)}?`;
			// Issuer
			uri += `issuer=${encodeURIComponent(otp.issuer)}&`;
		} else {
			// Label
			uri += `${encodeURIComponent(otp.label)}?`;
		}

		// Generic parameters
		uri += `secret=${encodeURIComponent(otp.secret.b32)}`
			+ `&algorithm=${encodeURIComponent(otp.algorithm)}`
			+ `&digits=${encodeURIComponent(otp.digits)}`;

		// Extra parameters
		if (isTOTP) {
			// TOTP parameters
			uri += `&period=${encodeURIComponent(otp.period)}`;
		} else {
			// HOTP parameters
			uri += `&counter=${encodeURIComponent(otp.counter)}`;
		}

		return uri;
	}
}
