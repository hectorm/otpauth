'use strict';

import {Utils} from './Utils.js';
import {Crypto} from './Crypto.js';
import {Secret} from './Secret.js';
import {URI} from './URI.js';

/**
 * Default Configuration.
 * @private
 */
const DC = {
	'issuer': '',        // HOTP/TOTP
	'label': 'OTPAuth',  // HOTP/TOTP
	'algorithm': 'SHA1', // HOTP/TOTP
	'digits': 6,         // HOTP/TOTP
	'counter': 0,        // HOTP
	'period': 30,        // TOTP
	'window': 50,        // HOTP/TOTP
	'pad': true          // HOTP/TOTP
};

/**
 * @class HOTP
 */
export class HOTP {
	/**
	 * HOTP: An HMAC-based One-time Password Algorithm (RFC 4226)
	 * @see https://tools.ietf.org/html/rfc4226
	 * @param {Object} [config] Configuration options.
	 * @param {string} [config.issuer] Account provider.
	 * @param {string} [config.label=OTPAuth] Account label.
	 * @param {Secret} [config.secret=Secret] Secret key.
	 * @param {string} [config.algorithm=SHA1] HMAC hashing algorithm.
	 * @param {number} [config.digits=6] Token length.
	 * @param {number} [config.counter=0] Initial counter value.
	 */
	constructor ({issuer = DC.issuer, label = DC.label, secret = new Secret(), algorithm = DC.algorithm, digits = DC.digits, counter = DC.counter} = {}) {
		/** @type {string} */
		this.issuer = issuer;
		/** @type {string} */
		this.label = label;
		/** @type {string} */
		this.algorithm = algorithm;
		/** @type {Secret} */
		this.secret = secret;
		/** @type {number} */
		this.digits = digits;
		/** @type {number} */
		this.counter = counter;
	}

	/**
	 * Generates an HOTP token.
	 * @method generate
	 * @param {Object} config Configuration options.
	 * @param {Secret} config.secret Secret key.
	 * @param {string} [config.algorithm=SHA1] HMAC hashing algorithm.
	 * @param {number} [config.digits=6] Token length.
	 * @param {number} [config.counter=0] Counter value.
	 * @param {boolean} [config.pad=true] Add leading zeros to result.
	 * @returns {string|number} Token.
	 */
	static generate ({secret, algorithm = DC.algorithm, digits = DC.digits, counter = DC.counter, pad = DC.pad}) {
		const digest = new Uint8Array(Crypto.hmacDigest(algorithm, secret.buffer, Utils.uint.encode(counter)));

		const offset = digest[digest.byteLength - 1] & 15;
		const binary = (
			(digest[offset] & 127) << 24 |
			(digest[offset + 1] & 255) << 16 |
			(digest[offset + 2] & 255) << 8 |
			(digest[offset + 3] & 255)
		) % Math.pow(10, digits);

		return pad
			// ? '0'.repeat(digits - String(binary).length) + binary
			? Array(1 + digits - String(binary).length).join('0') + binary
			: binary;
	}

	/**
	 * Generates an HOTP token.
	 * @method generate
	 * @param {Object} [config] Configuration options.
	 * @param {number} [config.counter=this.counter++] Counter value.
	 * @param {boolean} [config.pad=true] Add leading zeros to result.
	 * @returns {string|number} Token.
	 */
	generate ({counter = this.counter++, pad} = {}) {
		return HOTP.generate({
			'secret': this.secret,
			'algorithm': this.algorithm,
			'digits': this.digits,
			'counter': counter,
			'pad': pad
		});
	}

	/**
	 * Validates an HOTP token.
	 * @method validate
	 * @param {Object} config Configuration options.
	 * @param {string} config.token Token value.
	 * @param {Secret} config.secret Secret key.
	 * @param {string} [config.algorithm=SHA1] HMAC hashing algorithm.
	 * @param {number} [config.counter=0] Counter value.
	 * @param {number} [config.window=50] Window of counter values to test.
	 * @returns {number|null} Token delta, or null if the token is not found.
	 */
	static validate ({token, secret, algorithm, counter = DC.counter, window = DC.window}) {
		const searchToken = parseInt(token, 10);

		for (let i = counter - window; i <= counter + window; ++i) {
			const generatedToken = HOTP.generate({
				'secret': secret,
				'algorithm': algorithm,
				'counter': i,
				'digits': token.length,
				'pad': false
			});

			if (searchToken === generatedToken) {
				return i - counter;
			}
		}

		return null;
	}

	/**
	 * Validates an HOTP token.
	 * @method validate
	 * @param {Object} config Configuration options.
	 * @param {string} config.token Token value.
	 * @param {number} [config.counter=this.counter] Counter value.
	 * @param {number} [config.window=50] Window of counter values to test.
	 * @returns {number|null} Token delta, or null if the token is not found.
	 */
	validate ({token, counter = this.counter, window}) {
		return HOTP.validate({
			'token': token,
			'secret': this.secret,
			'algorithm': this.algorithm,
			'counter': counter,
			'window': window
		});
	}

	/**
	 * Returns a Google Authenticator key URI.
	 * @method toString
	 * @returns {string} URI.
	 */
	toString () {
		return URI.stringify(this);
	}
}

/**
 * @class TOTP
 */
export class TOTP {
	/**
	 * TOTP: Time-Based One-Time Password Algorithm (RFC 6238).
	 * @see https://tools.ietf.org/html/rfc6238
	 * @param {Object} [config] Configuration options.
	 * @param {string} [config.issuer] Account provider.
	 * @param {string} [config.label=OTPAuth] Account label.
	 * @param {Secret} [config.secret=Secret] Secret key.
	 * @param {string} [config.algorithm=SHA1] HMAC hashing algorithm.
	 * @param {number} [config.digits=6] Token length.
	 * @param {number} [config.period=30] Token time-step duration.
	 */
	constructor ({issuer = DC.issuer, label = DC.label, secret = new Secret(), algorithm = DC.algorithm, digits = DC.digits, period = DC.period} = {}) {
		/** @type {string} */
		this.issuer = issuer;
		/** @type {string} */
		this.label = label;
		/** @type {string} */
		this.secret = secret;
		/** @type {Secret} */
		this.algorithm = algorithm;
		/** @type {number} */
		this.digits = digits;
		/** @type {number} */
		this.period = period;
	}

	/**
	 * Generates a TOTP token.
	 * @method generate
	 * @param {Object} config Configuration options.
	 * @param {Secret} config.secret Secret key.
	 * @param {string} [config.algorithm=SHA1] HMAC hashing algorithm.
	 * @param {number} [config.digits=6] Token length.
	 * @param {number} [config.period=30] Token time-step duration.
	 * @param {number} [config.timestamp=Date.now] Timestamp value in milliseconds.
	 * @param {boolean} [config.pad=true] Add leading zeros to result.
	 * @returns {string|number} Token.
	 */
	static generate ({secret, algorithm, digits, period = DC.period, timestamp = Date.now(), pad}) {
		return HOTP.generate({
			'secret': secret,
			'algorithm': algorithm,
			'digits': digits,
			'counter': Math.floor(timestamp / 1000 / period),
			'pad': pad
		});
	}

	/**
	 * Generates a TOTP token.
	 * @method generate
	 * @param {Object} [config] Configuration options.
	 * @param {number} [config.timestamp=Date.now] Timestamp value in milliseconds.
	 * @param {boolean} [config.pad=true] Add leading zeros to result.
	 * @returns {string|number} Token.
	 */
	generate ({timestamp = Date.now(), pad} = {}) {
		return TOTP.generate({
			'secret': this.secret,
			'algorithm': this.algorithm,
			'digits': this.digits,
			'period': this.period,
			'timestamp': timestamp,
			'pad': pad
		});
	}

	/**
	 * Validates a TOTP token.
	 * @method validate
	 * @param {Object} config Configuration options.
	 * @param {string} config.token Token value.
	 * @param {Secret} config.secret Secret key.
	 * @param {string} [config.algorithm=SHA1] HMAC hashing algorithm.
	 * @param {number} [config.period=30] Token time-step duration.
	 * @param {number} [config.timestamp=Date.now] Timestamp value in milliseconds.
	 * @param {number} [config.window=50] Window of counter values to test.
	 * @returns {number|null} Token delta, or null if the token is not found.
	 */
	static validate ({token, secret, algorithm, period = DC.period, timestamp = Date.now(), window}) {
		return HOTP.validate({
			'token': token,
			'secret': secret,
			'algorithm': algorithm,
			'counter': Math.floor(timestamp / 1000 / period),
			'window': window
		});
	}

	/**
	 * Validates a TOTP token.
	 * @method validate
	 * @param {Object} config Configuration options.
	 * @param {string} config.token Token value.
	 * @param {number} [config.timestamp=Date.now] Timestamp value in milliseconds.
	 * @param {number} [config.window=50] Window of counter values to test.
	 * @returns {number|null} Token delta, or null if the token is not found.
	 */
	validate ({token, timestamp, window}) {
		return TOTP.validate({
			'token': token,
			'secret': this.secret,
			'algorithm': this.algorithm,
			'period': this.period,
			'timestamp': timestamp,
			'window': window
		});
	}

	/**
	 * Returns a Google Authenticator key URI.
	 * @method toString
	 * @returns {string} URI.
	 */
	toString () {
		return URI.stringify(this);
	}
}
