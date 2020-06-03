[![Last version](https://img.shields.io/github/tag/hectorm/otpauth.svg)][tags]
[![Dependencies status](https://img.shields.io/david/hectorm/otpauth.svg)][dependencies]
[![Dev dependencies status](https://img.shields.io/david/dev/hectorm/otpauth.svg)][devDependencies]
[![NPM status](https://img.shields.io/npm/dm/otpauth.svg)][npm]

***

# OTPAuth
One Time Password (HOTP/TOTP) library for Node.js and browsers.

## Installation
Install the module via `npm`.

```sh
npm install otpauth
```

## Usage

### Node.js
```javascript
import * as OTPAuth from 'otpauth';

let totp = new OTPAuth.TOTP({
	issuer: 'ACME',
	label: 'AzureDiamond',
	algorithm: 'SHA1',
	digits: 6,
	period: 30,
	secret: 'NB2W45DFOIZA' // or "OTPAuth.Secret.fromB32('NB2W45DFOIZA')"
});

// Generate TOTP token.
let token = totp.generate();

// Validate TOTP token.
let delta = totp.validate({
	token: token,
	window: 1
});

// Convert to Google Authenticator key URI.
//   otpauth://totp/ACME:AzureDiamond?issuer=ACME&secret=NB2W45DFOIZA&algorithm=SHA1&digits=6&period=30
let uri = totp.toString(); // or "OTPAuth.URI.stringify(totp)"

// Convert from Google Authenticator key URI.
let parsedTotp = OTPAuth.URI.parse(uri);
```

### Browser
```html
<script src="otpauth.umd.js"></script>
<script>
	// Same as above...
</script>
```

## Documentation
See the [documentation][docs] page.

## Supported hashing algorithms
In Node.js, the same algorithms as [`Crypto.createHmac`][createHmac] function are supported, since it is used internally.
In browsers, the `SHA1`, `SHA256` and `SHA512` algorithms are supported by using the [Stanford Javascript Crypto Library][sjcl].

## License
[MIT License][license] © [Héctor Molinero Fernández](https://hector.molinero.dev/).

[docs]: https://hectorm.github.io/otpauth/index.html
[license]: https://github.com/hectorm/otpauth/blob/master/LICENSE.md
[tags]: https://github.com/hectorm/otpauth/tags
[npm]: https://www.npmjs.com/package/otpauth
[dependencies]: https://david-dm.org/hectorm/otpauth
[devDependencies]: https://david-dm.org/hectorm/otpauth?type=dev
[createHmac]: https://nodejs.org/api/crypto.html#crypto_crypto_createhmac_algorithm_key_options
[sjcl]: https://github.com/bitwiseshiftleft/sjcl
