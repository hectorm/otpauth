/**
 * One Time Password (HOTP/TOTP) library for Node.js and browser.
 * @module OTPAuth
 * @author Héctor Molinero Fernández <hector@molinero.dev>
 */
export {HOTP, TOTP} from './otp.js';
export {URI} from './uri.js';
export {Secret} from './secret.js';
export {Utils} from './utils.js';

/**
 * Library version.
 * @type {string}
 */
export const version = process.env.VERSION;
