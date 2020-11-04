import { Utils } from './utils';
import { Crypto } from './crypto';
import { Secret } from './secret';

/**
 * Default configuration.
 * @private
 * @type {Object}
 */
const defaults = {
	issuer: '',
	label: 'OTPAuth',
	algorithm: 'SHA1',
	digits: 6,
	counter: 0,
	period: 30,
	window: 1
};

/**
 * HOTP: An HMAC-based One-time Password Algorithm (RFC 4226)
 * (https://tools.ietf.org/html/rfc4226).
 * @param {Object} [config] Configuration options.
 * @param {string} [config.issuer=''] Account provider.
 * @param {string} [config.label='OTPAuth'] Account label.
 * @param {Secret|string} [config.secret=Secret] Secret key.
 * @param {string} [config.algorithm='SHA1'] HMAC hashing algorithm.
 * @param {number} [config.digits=6] Token length.
 * @param {number} [config.counter=0] Initial counter value.
 */
export class HOTP {
	constructor({
		issuer = defaults.issuer,
		label = defaults.label,
		secret = new Secret(),
		algorithm = defaults.algorithm,
		digits = defaults.digits,
		counter = defaults.counter
	} = {}) {
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
		this.secret = typeof secret === 'string'
			? Secret.fromB32(secret)
			: secret;
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
	 * @returns {string} Token.
	 */
	static generate({
		secret,
		algorithm = defaults.algorithm,
		digits = defaults.digits,
		counter = defaults.counter
	}) {
		const digest = new Uint8Array(Crypto.hmacDigest(algorithm, secret.buffer, Utils.uint.toBuf(counter)));
		const offset = digest[digest.byteLength - 1] & 15;
		const otp = (
			((digest[offset] & 127) << 24)
			| ((digest[offset + 1] & 255) << 16)
			| ((digest[offset + 2] & 255) << 8)
			| (digest[offset + 3] & 255)
		) % (10 ** digits);

		return Utils.pad(otp, digits);
	}

	/**
	 * Generates an HOTP token.
	 * @param {Object} [config] Configuration options.
	 * @param {number} [config.counter=this.counter++] Counter value.
	 * @returns {string} Token.
	 */
	generate({
		counter = this.counter++
	} = {}) {
		return HOTP.generate({
			secret: this.secret,
			algorithm: this.algorithm,
			digits: this.digits,
			counter
		});
	}

	/**
	 * Validates an HOTP token.
	 * @param {Object} config Configuration options.
	 * @param {string} config.token Token value.
	 * @param {Secret} config.secret Secret key.
	 * @param {string} [config.algorithm='SHA1'] HMAC hashing algorithm.
	 * @param {number} [config.counter=0] Counter value.
	 * @param {number} [config.window=1] Window of counter values to test.
	 * @returns {number|null} Token delta, or null if the token is not found.
	 */
	static validate({
		token,
		secret,
		algorithm,
		counter = defaults.counter,
		window = defaults.window
	}) {
		for (let i = counter - window; i <= counter + window; ++i) {
			const generatedToken = HOTP.generate({
				secret,
				algorithm,
				digits: token.length,
				counter: i
			});

			if (Crypto.timingSafeEqual(token, generatedToken)) {
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
	 * @param {number} [config.window=1] Window of counter values to test.
	 * @returns {number|null} Token delta, or null if the token is not found.
	 */
	validate({
		token,
		counter = this.counter,
		window
	}) {
		return HOTP.validate({
			token: Utils.pad(token, this.digits),
			secret: this.secret,
			algorithm: this.algorithm,
			counter,
			window
		});
	}

	/**
	 * Returns a Google Authenticator key URI.
	 * @returns {string} URI.
	 */
	toString() {
		const e = encodeURIComponent;
		return 'otpauth://hotp/'
			+ `${this.issuer.length > 0
				? `${e(this.issuer)}:${e(this.label)}?issuer=${e(this.issuer)}&`
				: `${e(this.label)}?`}`
			+ `secret=${e(this.secret.b32)}&`
			+ `algorithm=${e(this.algorithm)}&`
			+ `digits=${e(this.digits)}&`
			+ `counter=${e(this.counter)}`;
	}
}

/**
 * TOTP: Time-Based One-Time Password Algorithm (RFC 6238)
 * (https://tools.ietf.org/html/rfc6238).
 * @param {Object} [config] Configuration options.
 * @param {string} [config.issuer=''] Account provider.
 * @param {string} [config.label='OTPAuth'] Account label.
 * @param {Secret|string} [config.secret=Secret] Secret key.
 * @param {string} [config.algorithm='SHA1'] HMAC hashing algorithm.
 * @param {number} [config.digits=6] Token length.
 * @param {number} [config.period=30] Token time-step duration.
 */
export class TOTP {
	constructor({
		issuer = defaults.issuer,
		label = defaults.label,
		secret = new Secret(),
		algorithm = defaults.algorithm,
		digits = defaults.digits,
		period = defaults.period
	} = {}) {
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
		this.secret = typeof secret === 'string'
			? Secret.fromB32(secret)
			: secret;
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
	 * @returns {string} Token.
	 */
	static generate({
		secret,
		algorithm,
		digits,
		period = defaults.period,
		timestamp = Date.now()
	}) {
		return HOTP.generate({
			secret,
			algorithm,
			digits,
			counter: Math.floor(timestamp / 1000 / period)
		});
	}

	/**
	 * Generates a TOTP token.
	 * @param {Object} [config] Configuration options.
	 * @param {number} [config.timestamp=Date.now] Timestamp value in milliseconds.
	 * @returns {string} Token.
	 */
	generate({
		timestamp = Date.now()
	} = {}) {
		return TOTP.generate({
			secret: this.secret,
			algorithm: this.algorithm,
			digits: this.digits,
			period: this.period,
			timestamp
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
	 * @param {number} [config.window=1] Window of counter values to test.
	 * @returns {number|null} Token delta, or null if the token is not found.
	 */
	static validate({
		token,
		secret,
		algorithm,
		period = defaults.period,
		timestamp = Date.now(),
		window
	}) {
		return HOTP.validate({
			token,
			secret,
			algorithm,
			counter: Math.floor(timestamp / 1000 / period),
			window
		});
	}

	/**
	 * Validates a TOTP token.
	 * @param {Object} config Configuration options.
	 * @param {string} config.token Token value.
	 * @param {number} [config.timestamp=Date.now] Timestamp value in milliseconds.
	 * @param {number} [config.window=1] Window of counter values to test.
	 * @returns {number|null} Token delta, or null if the token is not found.
	 */
	validate({
		token,
		timestamp,
		window
	}) {
		return TOTP.validate({
			token: Utils.pad(token, this.digits),
			secret: this.secret,
			algorithm: this.algorithm,
			period: this.period,
			timestamp,
			window
		});
	}

	/**
	 * Returns a Google Authenticator key URI.
	 * @returns {string} URI.
	 */
	toString() {
		const e = encodeURIComponent;
		return 'otpauth://totp/'
			+ `${this.issuer.length > 0
				? `${e(this.issuer)}:${e(this.label)}?issuer=${e(this.issuer)}&`
				: `${e(this.label)}?`}`
			+ `secret=${e(this.secret.b32)}&`
			+ `algorithm=${e(this.algorithm)}&`
			+ `digits=${e(this.digits)}&`
			+ `period=${e(this.period)}`;
	}
}
