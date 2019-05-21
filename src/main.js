/**
 * One Time Password (HOTP/TOTP) library for Node.js and browser.
 * @module OTPAuth
 * @author Héctor Molinero Fernández <hector@molinero.dev>
 */
export { HOTP, TOTP } from './otp';
export { URI } from './uri';
export { Secret } from './secret';
export { Utils } from './utils';

/**
 * Library version.
 * @type {string}
 */
export const version = process.env.VERSION;
