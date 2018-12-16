import {Utils} from './utils.js';
import {Crypto} from './crypto.js';
import {Secret} from './secret.js';
import {URI} from './uri.js';

/**
 * Default configuration.
 * @private
 * @type {Object}
 */
const DC = {
	issuer: '',
	label: 'OTPAuth',
	algorithm: 'SHA1',
	digits: 6,
	counter: 0,
	period: 30,
	window: 50,
	pad: true
};

/**
 * HOTP: An HMAC-based One-time Password Algorithm (RFC 4226).
 * @see https://tools.ietf.org/html/rfc4226
 */
export class HOTP {
	/**
	 * @param {Object} [config] Configuration options.
	 * @param {string} [config.issuer=''] Account provider.
	 * @param {string} [config.label='OTPAuth'] Account label.
	 * @param {Secret} [config.secret=Secret] Secret key.
	 * @param {string} [config.algorithm='SHA1'] HMAC hashing algorithm.
	 * @param {number} [config.digits=6] Token length.
	 * @param {number} [config.counter=0] Initial counter value.
	 */
	constructor({issuer = DC.issuer, label = DC.label, secret = new Secret(), algorithm = DC.algorithm, digits = DC.digits, counter = DC.counter} = {}) {
		/**
		 * Account provider.
		 * @type {string}
		 */
		this.issuer = issuer;
		/**
		 * Account label.
		 * @type {string}
		 */
		this.label = label;
		/**
		 * Secret key.
		 * @type {Secret}
		 */
		this.secret = secret;
		/**
		 * HMAC hashing algorithm.
		 * @type {string}
		 */
		this.algorithm = algorithm;
		/**
		 * Token length.
		 * @type {number}
		 */
		this.digits = digits;
		/**
		 * Initial counter value.
		 * @type {number}
		 */
		this.counter = counter;
	}

	/**
	 * Generates an HOTP token.
	 * @param {Object} config Configuration options.
	 * @param {Secret} config.secret Secret key.
	 * @param {string} [config.algorithm='SHA1'] HMAC hashing algorithm.
	 * @param {number} [config.digits=6] Token length.
	 * @param {number} [config.counter=0] Counter value.
	 * @param {boolean} [config.pad=true] Add leading zeros to result.
	 * @returns {string|number} Token.
	 */
	static generate({secret, algorithm = DC.algorithm, digits = DC.digits, counter = DC.counter, pad = DC.pad}) {
		const digest = new Uint8Array(Crypto.hmacDigest(algorithm, secret.buffer, Utils.uint.encode(counter)));
		const offset = digest[digest.byteLength - 1] & 15;
		const otp = (
			((digest[offset] & 127) << 24) |
			((digest[offset + 1] & 255) << 16) |
			((digest[offset + 2] & 255) << 8) |
			(digest[offset + 3] & 255)
		) % (10 ** digits);

		return pad
			? new Array(1 + digits - String(otp).length).join('0') + otp
			: otp;
	}

	/**
	 * Generates an HOTP token.
	 * @param {Object} [config] Configuration options.
	 * @param {number} [config.counter=this.counter++] Counter value.
	 * @param {boolean} [config.pad=true] Add leading zeros to result.
	 * @returns {string|number} Token.
	 */
	generate({counter = this.counter++, pad} = {}) {
		return HOTP.generate({
			secret: this.secret,
			algorithm: this.algorithm,
			digits: this.digits,
			counter: counter,
			pad: pad
		});
	}

	/**
	 * Validates an HOTP token.
	 * @param {Object} config Configuration options.
	 * @param {string} config.token Token value.
	 * @param {Secret} config.secret Secret key.
	 * @param {string} [config.algorithm='SHA1'] HMAC hashing algorithm.
	 * @param {number} [config.counter=0] Counter value.
	 * @param {number} [config.window=50] Window of counter values to test.
	 * @returns {number|null} Token delta, or null if the token is not found.
	 */
	static validate({token, secret, algorithm, counter = DC.counter, window = DC.window}) {
		const searchToken = parseInt(token, 10);

		for (let i = counter - window; i <= counter + window; ++i) {
			const generatedToken = HOTP.generate({
				secret: secret,
				algorithm: algorithm,
				counter: i,
				digits: token.length,
				pad: false
			});

			if (searchToken === generatedToken) {
				return i - counter;
			}
		}

		return null;
	}

	/**
	 * Validates an HOTP token.
	 * @param {Object} config Configuration options.
	 * @param {string} config.token Token value.
	 * @param {number} [config.counter=this.counter] Counter value.
	 * @param {number} [config.window=50] Window of counter values to test.
	 * @returns {number|null} Token delta, or null if the token is not found.
	 */
	validate({token, counter = this.counter, window}) {
		return HOTP.validate({
			token: token,
			secret: this.secret,
			algorithm: this.algorithm,
			counter: counter,
			window: window
		});
	}

	/**
	 * Returns a Google Authenticator key URI.
	 * @returns {string} URI.
	 */
	toString() {
		return URI.stringify(this);
	}
}

/**
 * TOTP: Time-Based One-Time Password Algorithm (RFC 6238).
 * @see https://tools.ietf.org/html/rfc6238
 */
export class TOTP {
	/**
	 * @param {Object} [config] Configuration options.
	 * @param {string} [config.issuer=''] Account provider.
	 * @param {string} [config.label='OTPAuth'] Account label.
	 * @param {Secret} [config.secret=Secret] Secret key.
	 * @param {string} [config.algorithm='SHA1'] HMAC hashing algorithm.
	 * @param {number} [config.digits=6] Token length.
	 * @param {number} [config.period=30] Token time-step duration.
	 */
	constructor({issuer = DC.issuer, label = DC.label, secret = new Secret(), algorithm = DC.algorithm, digits = DC.digits, period = DC.period} = {}) {
		/**
		 * Account provider.
		 * @type {string}
		 */
		this.issuer = issuer;
		/**
		 * Account label.
		 * @type {string}
		 */
		this.label = label;
		/**
		 * Secret key.
		 * @type {string}
		 */
		this.secret = secret;
		/**
		 * HMAC hashing algorithm.
		 * @type {Secret}
		 */
		this.algorithm = algorithm;
		/**
		 * Token length.
		 * @type {number}
		 */
		this.digits = digits;
		/**
		 * Token time-step duration.
		 * @type {number}
		 */
		this.period = period;
	}

	/**
	 * Generates a TOTP token.
	 * @param {Object} config Configuration options.
	 * @param {Secret} config.secret Secret key.
	 * @param {string} [config.algorithm='SHA1'] HMAC hashing algorithm.
	 * @param {number} [config.digits=6] Token length.
	 * @param {number} [config.period=30] Token time-step duration.
	 * @param {number} [config.timestamp=Date.now] Timestamp value in milliseconds.
	 * @param {boolean} [config.pad=true] Add leading zeros to result.
	 * @returns {string|number} Token.
	 */
	static generate({secret, algorithm, digits, period = DC.period, timestamp = Date.now(), pad}) {
		return HOTP.generate({
			secret: secret,
			algorithm: algorithm,
			digits: digits,
			counter: Math.floor(timestamp / 1000 / period),
			pad: pad
		});
	}

	/**
	 * Generates a TOTP token.
	 * @param {Object} [config] Configuration options.
	 * @param {number} [config.timestamp=Date.now] Timestamp value in milliseconds.
	 * @param {boolean} [config.pad=true] Add leading zeros to result.
	 * @returns {string|number} Token.
	 */
	generate({timestamp = Date.now(), pad} = {}) {
		return TOTP.generate({
			secret: this.secret,
			algorithm: this.algorithm,
			digits: this.digits,
			period: this.period,
			timestamp: timestamp,
			pad: pad
		});
	}

	/**
	 * Validates a TOTP token.
	 * @param {Object} config Configuration options.
	 * @param {string} config.token Token value.
	 * @param {Secret} config.secret Secret key.
	 * @param {string} [config.algorithm='SHA1'] HMAC hashing algorithm.
	 * @param {number} [config.period=30] Token time-step duration.
	 * @param {number} [config.timestamp=Date.now] Timestamp value in milliseconds.
	 * @param {number} [config.window=50] Window of counter values to test.
	 * @returns {number|null} Token delta, or null if the token is not found.
	 */
	static validate({token, secret, algorithm, period = DC.period, timestamp = Date.now(), window}) {
		return HOTP.validate({
			token: token,
			secret: secret,
			algorithm: algorithm,
			counter: Math.floor(timestamp / 1000 / period),
			window: window
		});
	}

	/**
	 * Validates a TOTP token.
	 * @param {Object} config Configuration options.
	 * @param {string} config.token Token value.
	 * @param {number} [config.timestamp=Date.now] Timestamp value in milliseconds.
	 * @param {number} [config.window=50] Window of counter values to test.
	 * @returns {number|null} Token delta, or null if the token is not found.
	 */
	validate({token, timestamp, window}) {
		return TOTP.validate({
			token: token,
			secret: this.secret,
			algorithm: this.algorithm,
			period: this.period,
			timestamp: timestamp,
			window: window
		});
	}

	/**
	 * Returns a Google Authenticator key URI.
	 * @returns {string} URI.
	 */
	toString() {
		return URI.stringify(this);
	}
}
