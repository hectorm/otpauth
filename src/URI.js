'use strict';

import {Utils} from './Utils.js';
import {Secret} from './Secret.js';
import {HOTP, TOTP} from './OTP.js';

/*
 * Google Authenticator key URI format:
 *   https://github.com/google/google-authenticator/wiki/Key-Uri-Format
 */

// otpauth://TYPE/[ISSUER:]LABEL?PARAMETERS
const OTPURI_PARAMS = ['issuer', 'label', 'secret', 'algorithm', 'digits', 'counter', 'period'].join('|');
const OTPURI_REGEX = RegExp(`^otpauth:\\/\\/([ht]otp)\\/(.+)\\?((?:&?(?:${OTPURI_PARAMS})=[^&]+)+)$`, 'i');

// RFC 4648 base32 alphabet without pad
const SECRET_REGEX = /^[2-7A-Z]+$/i;

// Support all algorithms defined in the format spec
const ALGORITHM_REGEX = /SHA(?:1|256|512)/i;

// Integer
const INTEGER_REGEX = /^[+-]?[0-9]+$/;

// Positive integer, excluding 0
const POSITIVE_INTEGER_REGEX = /^\+?[1-9][0-9]*$/;

/**
 * @class URI
 */
export class URI {
	/**
	 * Parses a Google Authenticator key URI and returns an HOTP/TOTP object.
	 * @method parse
	 * @param {string} uri Google Authenticator Key URI.
	 * @returns {Object} HOTP/TOTP object.
	 */
	static parse(uri) {
		const uriGroups = decodeURIComponent(uri).match(OTPURI_REGEX);

		if (uriGroups === null) {
			throw Error('Invalid URI format');
		}

		// Extract URI groups
		const uriType = uriGroups[1].toLowerCase();
		const uriLabel = uriGroups[2].split(/:(.+)/, 2);
		const uriParams = uriGroups[3].split('&').reduce(function(acc, cur) {
			const pairArr = cur.split(/=(.+)/, 2);
			const pairKey = pairArr[0].toLowerCase();
			const pairVal = pairArr[1];
			const pairAcc = acc;

			pairAcc[pairKey] = pairVal;
			return pairAcc;
		}, {});

		// 'otpObj' will be instantiated with 'otpCfg' argument
		let otpObj, otpCfg = {};

		if (uriType === 'hotp') {
			otpObj = HOTP;

			// counter: required
			if (typeof uriParams.counter !== 'undefined' && INTEGER_REGEX.test(uriParams.counter)) {
				otpCfg.counter = parseInt(uriParams.counter, 10);
			} else {
				throw Error('Missing or invalid \'counter\' parameter');
			}
		} else if (uriType === 'totp') {
			otpObj = TOTP;

			// period: optional
			if (typeof uriParams.period !== 'undefined') {
				if (POSITIVE_INTEGER_REGEX.test(uriParams.period)) {
					otpCfg.period = parseInt(uriParams.period, 10);
				} else {
					throw Error('Invalid \'period\' parameter');
				}
			}
		} else {
			throw Error('Unknown OTP type');
		}

		// label: required
		// issuer: optional
		if (uriLabel.length === 2) {
			otpCfg.label = uriLabel[1];
			if (typeof uriParams.issuer === 'undefined') {
				otpCfg.issuer = uriLabel[0];
			} else if (uriParams.issuer === uriLabel[0]) {
				otpCfg.issuer = uriParams.issuer;
			} else {
				throw Error('Invalid \'issuer\' parameter');
			}
		} else {
			otpCfg.label = uriLabel[0];
			if (typeof uriParams.issuer !== 'undefined') {
				otpCfg.issuer = uriParams.issuer;
			}
		}

		// secret: required
		if (typeof uriParams.secret !== 'undefined' && SECRET_REGEX.test(uriParams.secret)) {
			otpCfg.secret = new Secret({'buffer': Utils.b32.encode(uriParams.secret)});
		} else {
			throw Error('Missing or invalid \'secret\' parameter');
		}

		// algorithm: optional
		if (typeof uriParams.algorithm !== 'undefined') {
			if (ALGORITHM_REGEX.test(uriParams.algorithm)) {
				otpCfg.algorithm = uriParams.algorithm;
			} else {
				throw Error('Invalid \'algorithm\' parameter');
			}
		}

		// digits: optional
		if (typeof uriParams.digits !== 'undefined') {
			if (POSITIVE_INTEGER_REGEX.test(uriParams.digits)) {
				otpCfg.digits = parseInt(uriParams.digits, 10);
			} else {
				throw Error('Invalid \'digits\' parameter');
			}
		}

		return new otpObj(otpCfg);
	}

	/**
	 * Converts an HOTP/TOTP object to a Google Authenticator key URI.
	 * @method stringify
	 * @param {Object} otp HOTP/TOTP object.
	 * @param {Object} [config] Configuration options.
	 * @param {boolean} [config.legacyIssuer=true] Set issuer label prefix.
	 * @returns {string} Google Authenticator Key URI.
	 */
	static stringify(otp, {legacyIssuer = true} = {}) {
		if (!(otp instanceof HOTP || otp instanceof TOTP)) {
			throw Error('Invalid \'HOTP/TOTP\' object');
		}

		// Key URI format:
		// otpauth://TYPE/[ISSUER:]LABEL?PARAMETERS
		const uri = 'otpauth://'
			// Type
			+ (otp instanceof TOTP ? 'totp' : 'hotp')
			+ '/'

			// Label and optional issuer
			+ (otp.issuer.length > 0
				// Issuer label prefix
				? (legacyIssuer ? `${otp.issuer}:` : '')
					// Label and issuer parameter
					+ `${otp.label}?issuer=${otp.issuer}&`
				// No issuer
				: `${otp.label}?`)

			// Generic parameters
			+ `secret=${otp.secret.b32}`
			+ `&algorithm=${otp.algorithm}`
			+ `&digits=${otp.digits}`

			// Extra parameters
			+ (otp instanceof TOTP
				// TOTP parameters
				? `&period=${otp.period}`
				// HOTP parameters
				: `&counter=${otp.counter}`);

		return encodeURI(uri);
	}
}

