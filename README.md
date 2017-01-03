[![Documentation](https://doc.esdoc.org/github.com/zant95/otpauth/badge.svg)](https://doc.esdoc.org/github.com/zant95/otpauth/)
[![License](https://img.shields.io/github/license/zant95/otpauth.svg)](LICENSE.md)

[![NPM](https://nodei.co/npm/otpauth.png)](https://www.npmjs.com/package/otpauth)

***

# OTPAuth
One Time Password (HOTP/TOTP) library for Node.js and browser.

## Installation
Install the module via `npm`.

```
$ npm install otpauth
```

## Usage

### Node.js
```javascript
const OTPAuth = require('otpauth');

let totp = new OTPAuth.TOTP({
	'issuer': 'ACME',
	'label': 'mail@example.org',
	'algorithm': 'SHA512',
	'digits': 8,
	'period': 20
});

let token = totp.generate();
let uri = totp.toString();

```

### Browser
```html
<script src="otpauth.js"></script>
<script>
	var totp = new OTPAuth.TOTP({
		'issuer': 'ACME',
		'label': 'mail@example.org',
		'algorithm': 'SHA512',
		'digits': 8,
		'period': 20
	});

	var token = totp.generate();
	var uri = totp.toString();
</script>
```

For more information, see the [documentation](https://doc.esdoc.org/github.com/zant95/otpauth/) page.

