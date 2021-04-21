[![Last version](https://img.shields.io/github/v/tag/hectorm/otpauth?label=version)](https://github.com/hectorm/otpauth/tags)
[![Build Status](https://img.shields.io/github/workflow/status/hectorm/otpauth/Build?label=build)](https://github.com/hectorm/otpauth/actions)
[![Dependencies status](https://img.shields.io/david/hectorm/otpauth?label=dependencies)](https://david-dm.org/hectorm/otpauth)
[![Dev dependencies status](https://img.shields.io/david/dev/hectorm/otpauth?label=dev%20dependencies)](https://david-dm.org/hectorm/otpauth?type=dev)
[![NPM downloads](https://img.shields.io/npm/dm/otpauth?label=npm%20downloads)](https://www.npmjs.com/package/otpauth)

***

# OTPAuth

One Time Password (HOTP/TOTP) library for Node.js, Deno and browsers.

## Usage

### Node.js

```javascript
import * as OTPAuth from 'otpauth';

// Create a new TOTP object.
let totp = new OTPAuth.TOTP({
	issuer: 'ACME',
	label: 'AzureDiamond',
	algorithm: 'SHA1',
	digits: 6,
	period: 30,
	secret: 'NB2W45DFOIZA' // or "OTPAuth.Secret.fromBase32('NB2W45DFOIZA')"
});

// Generate a token.
let token = totp.generate();

// Validate a token.
let delta = totp.validate({
	token: token,
	window: 1
});

// Convert to Google Authenticator key URI.
// otpauth://totp/ACME:AzureDiamond?issuer=ACME&secret=NB2W45DFOIZA&algorithm=SHA1&digits=6&period=30
let uri = totp.toString(); // or "OTPAuth.URI.stringify(totp)"

// Convert from Google Authenticator key URI.
let parsedTotp = OTPAuth.URI.parse(uri);
```

### Deno

```javascript
// @deno-types="https://deno.land/x/otpauth/dist/otpauth.d.ts"
import * as OTPAuth from 'https://deno.land/x/otpauth/dist/otpauth.esm.js'

// Same as above...
```

### Browsers

```html
<script src="https://cdn.jsdelivr.net/npm/otpauth/dist/otpauth.umd.min.js"></script>
<script>
	// Same as above...
</script>
```

## Documentation

See the documentation page.

> [https://hectorm.github.io/otpauth/](https://hectorm.github.io/otpauth/)

## Supported hashing algorithms

In Node.js, the same algorithms as
[`Crypto.createHmac`](https://nodejs.org/api/crypto.html#crypto_crypto_createhmac_algorithm_key_options)
function are supported, since it is used internally. In Deno and browsers, the `SHA1`, `SHA224`, `SHA256`, `SHA384`,
`SHA512`, `SHA3-224`, `SHA3-256`, `SHA3-384` and `SHA3-512` algorithms are supported by using the
[jsSHA](https://github.com/Caligatio/jsSHA) library.

## License

[MIT License](https://github.com/hectorm/otpauth/blob/master/LICENSE.md)
© [Héctor Molinero Fernández](https://hector.molinero.dev/).
