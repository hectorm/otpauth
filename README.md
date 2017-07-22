[![Last version](https://img.shields.io/github/tag/zant95/otpauth.svg)][tags]
[![Dependencies status](https://img.shields.io/david/zant95/otpauth.svg)][dependencies]
[![Dev dependencies status](https://img.shields.io/david/dev/zant95/otpauth.svg)][devDependencies]
[![NPM status](https://img.shields.io/npm/dm/otpauth.svg)][npm]
[![Documentation](https://zant95.github.io/otpauth/badge.svg)][docs]

***

# OTPAuth
One Time Password (HOTP/TOTP) library for Node.js and browser.

## Installation
Install the module via `npm`.

```sh
npm install otpauth
```

## Usage

### Node.js
```javascript
const OTPAuth = require('otpauth');

let totp = new OTPAuth.TOTP({
	issuer: 'ACME',
	label: 'AzureDiamond',
	algorithm: 'SHA1',
	digits: 6,
	period: 30,
	secret: OTPAuth.Secret.fromB32('NB2W45DFOIZA')
});

// Generate TOTP token.
let token = totp.generate();

// Validate TOTP token.
let delta = totp.validate({
	token: token,
	window: 10
});

// Convert to Google Authenticator key URI:
//   otpauth://totp/ACME:AzureDiamond?issuer=ACME&secret=NB2W45DFOIZA&algorithm=SHA1&digits=6&period=30
let uri = totp.toString();
```

### Browser
```html
<script src="otpauth.min.js"></script>
<script>
	// Same as above...
</script>
```

## Supported hashing algorithms
In Node.js, the same algorithms as [`Crypto.createHmac`][createHmac] function are supported, since it is used internally.
In browsers, the `SHA1`, `SHA256` and `SHA512` algorithms are supported by using the [Stanford Javascript Crypto Library][sjcl].

## Documentation
See the [documentation][docs] page.

## License
[MIT License][license] © [Héctor Molinero Fernández](https://molinero.xyz/).

[license]: LICENSE.md
[docs]: https://zant95.github.io/otpauth/index.html
[createHmac]: https://nodejs.org/api/crypto.html#crypto_crypto_createhmac_algorithm_key
[tags]: https://github.com/zant95/otpauth/tags
[npm]: https://www.npmjs.com/package/otpauth
[dependencies]: https://david-dm.org/zant95/otpauth
[devDependencies]: https://david-dm.org/zant95/otpauth?type=dev
[createHmac]: https://nodejs.org/api/crypto.html#crypto_crypto_createhmac_algorithm_key
[sjcl]: https://github.com/bitwiseshiftleft/sjcl
