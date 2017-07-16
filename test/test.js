'use strict';

/* eslint-disable no-use-before-define */
var OTPAuth = OTPAuth || require('../dist/otpauth.min.js');
var chai = chai || require('chai');
var expect = expect || chai.expect;
/* eslint-enable */

chai.Assertion.addMethod('bufferEql', function (x) {
	var expected = new Uint8Array(x);
	var actual = new Uint8Array(this._obj);

	this.assert(
		chai.util.eql(actual, expected),
		'expected #{act} to be equal to #{exp}',
		'expected #{act} not to be equal to #{exp}',
		expected, actual
	);
});

var inputs = [{
	// 00
	buffer: new Uint16Array([43166, 43963, 43559, 29521, 19166, 19613, 5178, 6152, 37930, 252, 24507, 64210, 28982, 57540, 65533, 54088, 54415, 2014, 50282, 22992]).buffer,
	raw: '\x9E\xA8\xBB\xAB\x27\xAA\x51\x73\xDE\x4A\x9D\x4C\x3A\x14\x08\x18\x2A\x94\xFC\x00\xBB\x5F\xD2\xFA\x36\x71\xC4\xE0\xFD\xFF\x48\xD3\x8F\xD4\xDE\x07\x6A\xC4\xD0\x59',
	b32: 'T2ULXKZHVJIXHXSKTVGDUFAIDAVJJ7AAXNP5F6RWOHCOB7P7JDJY7VG6A5VMJUCZ',
	hex: '9EA8BBAB27AA5173DE4A9D4C3A1408182A94FC00BB5FD2FA3671C4E0FDFF48D38FD4DE076AC4D059',
	hotp: {
		constructor: {
			input: {algorithm: 'SHA1'}
		},
		generate: {
			input: {counter: 1e10},
			output: '136591'
		},
		validate: {
			input: {token: '136591', counter: 1e10 - 90, window: 100},
			output: 90
		},
		toString: {
			output: 'otpauth://hotp/OTPAuth?secret=T2ULXKZHVJIXHXSKTVGDUFAIDAVJJ7AAXNP5F6RWOHCOB7P7JDJY7VG6A5VMJUCZ&algorithm=SHA1&digits=6&counter=0'
		}
	},
	totp: {
		constructor: {
			input: {algorithm: 'SHA1', period: 5}
		},
		generate: {
			input: {timestamp: 1451606400000},
			output: '823248'
		},
		validate: {
			input: {token: '823248', timestamp: 1451606450000},
			output: -10
		},
		toString: {
			output: 'otpauth://totp/OTPAuth?secret=T2ULXKZHVJIXHXSKTVGDUFAIDAVJJ7AAXNP5F6RWOHCOB7P7JDJY7VG6A5VMJUCZ&algorithm=SHA1&digits=6&period=5'
		}
	}
}, {
	// 01
	buffer: new Uint16Array([18090, 48480, 27991, 30797, 47976, 51345, 8708, 48040, 20922, 20926, 9312, 49305, 30776, 7291, 42211, 63590, 1158, 12256, 50671, 40876]).buffer,
	raw: '\xAA\x46\x60\xBD\x57\x6D\x4D\x78\x68\xBB\x91\xC8\x04\x22\xA8\xBB\xBA\x51\xBE\x51\x60\x24\x99\xC0\x38\x78\x7B\x1C\xE3\xA4\x66\xF8\x86\x04\xE0\x2F\xEF\xC5\xAC\x9F',
	b32: 'VJDGBPKXNVGXQ2F3SHEAIIVIXO5FDPSRMASJTQBYPB5RZY5EM34IMBHAF7X4LLE7',
	hex: 'AA4660BD576D4D7868BB91C80422A8BBBA51BE51602499C038787B1CE3A466F88604E02FEFC5AC9F',
	hotp: {
		constructor: {
			input: {algorithm: 'SHA256'}
		},
		generate: {
			input: {counter: 1e10},
			output: '728219'
		},
		validate: {
			input: {token: '728219', counter: 1e10 - 90, window: 100},
			output: 90
		},
		toString: {
			output: 'otpauth://hotp/OTPAuth?secret=VJDGBPKXNVGXQ2F3SHEAIIVIXO5FDPSRMASJTQBYPB5RZY5EM34IMBHAF7X4LLE7&algorithm=SHA256&digits=6&counter=0'
		}
	},
	totp: {
		constructor: {
			input: {algorithm: 'SHA256', period: 10}
		},
		generate: {
			input: {timestamp: 1451606400000},
			output: '530988'
		},
		validate: {
			input: {token: '530988', timestamp: 1451606500000},
			output: -10
		},
		toString: {
			output: 'otpauth://totp/OTPAuth?secret=VJDGBPKXNVGXQ2F3SHEAIIVIXO5FDPSRMASJTQBYPB5RZY5EM34IMBHAF7X4LLE7&algorithm=SHA256&digits=6&period=10'
		}
	}
}, {
	// 02
	buffer: new Uint16Array([32525, 58802, 54704, 50846, 842, 31285, 32289, 64282, 36479, 51558, 50702, 18096, 65533, 12308, 65533, 39346, 5951, 54232, 34271, 18845]).buffer,
	raw: '\x0D\x7F\xB2\xE5\xB0\xD5\x9E\xC6\x4A\x03\x35\x7A\x21\x7E\x1A\xFB\x7F\x8E\x66\xC9\x0E\xC6\xB0\x46\xFD\xFF\x14\x30\xFD\xFF\xB2\x99\x3F\x17\xD8\xD3\xDF\x85\x9D\x49',
	b32: 'BV73FZNQ2WPMMSQDGV5CC7Q27N7Y4ZWJB3DLARX574KDB7P7WKMT6F6Y2PPYLHKJ',
	hex: '0D7FB2E5B0D59EC64A03357A217E1AFB7F8E66C90EC6B046FDFF1430FDFFB2993F17D8D3DF859D49',
	hotp: {
		constructor: {
			input: {algorithm: 'SHA512'}
		},
		generate: {
			input: {counter: 1e10},
			output: '812759'
		},
		validate: {
			input: {token: '812759', counter: 1e10 - 90, window: 100},
			output: 90
		},
		toString: {
			output: 'otpauth://hotp/OTPAuth?secret=BV73FZNQ2WPMMSQDGV5CC7Q27N7Y4ZWJB3DLARX574KDB7P7WKMT6F6Y2PPYLHKJ&algorithm=SHA512&digits=6&counter=0'
		}
	},
	totp: {
		constructor: {
			input: {algorithm: 'SHA512', period: 15}
		},
		generate: {
			input: {timestamp: 1451606400000},
			output: '069364'
		},
		validate: {
			input: {token: '069364', timestamp: 1451606550000},
			output: -10
		},
		toString: {
			output: 'otpauth://totp/OTPAuth?secret=BV73FZNQ2WPMMSQDGV5CC7Q27N7Y4ZWJB3DLARX574KDB7P7WKMT6F6Y2PPYLHKJ&algorithm=SHA512&digits=6&period=15'
		}
	}
}, {
	// 03
	buffer: new Uint16Array([51037, 23628, 33758, 7831, 60635, 33945, 53212, 34347, 30503, 20017, 25741, 52882, 1730, 34105, 43705, 34358, 11389, 21091, 43338, 32591]).buffer,
	raw: '\x5D\xC7\x4C\x5C\xDE\x83\x97\x1E\xDB\xEC\x99\x84\xDC\xCF\x2B\x86\x27\x77\x31\x4E\x8D\x64\x92\xCE\xC2\x06\x39\x85\xB9\xAA\x36\x86\x7D\x2C\x63\x52\x4A\xA9\x4F\x7F',
	b32: 'LXDUYXG6QOLR5W7MTGCNZTZLQYTXOMKORVSJFTWCAY4YLONKG2DH2LDDKJFKST37',
	hex: '5DC74C5CDE83971EDBEC9984DCCF2B862777314E8D6492CEC2063985B9AA36867D2C63524AA94F7F',
	hotp: {
		constructor: {
			input: {digits: 6, issuer: 'ACME'}
		},
		generate: {
			input: {counter: 1e10},
			output: '692310'
		},
		validate: {
			input: {token: '692310', counter: 0},
			output: null
		},
		toString: {
			output: 'otpauth://hotp/ACME:OTPAuth?issuer=ACME&secret=LXDUYXG6QOLR5W7MTGCNZTZLQYTXOMKORVSJFTWCAY4YLONKG2DH2LDDKJFKST37&algorithm=SHA1&digits=6&counter=0'
		}
	},
	totp: {
		constructor: {
			input: {digits: 6, issuer: 'ACME'}
		},
		generate: {
			input: {timestamp: 1451606400000},
			output: '096972'
		},
		validate: {
			input: {token: '096972', timestamp: 0},
			output: null
		},
		toString: {
			output: 'otpauth://totp/ACME:OTPAuth?issuer=ACME&secret=LXDUYXG6QOLR5W7MTGCNZTZLQYTXOMKORVSJFTWCAY4YLONKG2DH2LDDKJFKST37&algorithm=SHA1&digits=6&period=30'
		}
	}
}, {
	// 04
	buffer: new Uint16Array([21530, 65533, 31457, 21867, 48007, 30404, 49757, 60647, 22494, 54350, 45498, 45781, 50410, 3426, 24674, 4442, 45282, 62405, 29459, 49678]).buffer,
	raw: '\x1A\x54\xFD\xFF\xE1\x7A\x6B\x55\x87\xBB\xC4\x76\x5D\xC2\xE7\xEC\xDE\x57\x4E\xD4\xBA\xB1\xD5\xB2\xEA\xC4\x62\x0D\x62\x60\x5A\x11\xE2\xB0\xC5\xF3\x13\x73\x0E\xC2',
	b32: 'DJKP377BPJVVLB53YR3F3QXH5TPFOTWUXKY5LMXKYRRA2YTALII6FMGF6MJXGDWC',
	hex: '1A54FDFFE17A6B5587BBC4765DC2E7ECDE574ED4BAB1D5B2EAC4620D62605A11E2B0C5F313730EC2',
	hotp: {
		constructor: {
			input: {digits: 7, label: 'Username'}
		},
		generate: {
			input: {counter: 1e10},
			output: '9926814'
		},
		validate: {
			input: {token: '9926814', counter: 0},
			output: null
		},
		toString: {
			output: 'otpauth://hotp/Username?secret=DJKP377BPJVVLB53YR3F3QXH5TPFOTWUXKY5LMXKYRRA2YTALII6FMGF6MJXGDWC&algorithm=SHA1&digits=7&counter=0'
		}
	},
	totp: {
		constructor: {
			input: {digits: 7, label: 'Username'}
		},
		generate: {
			input: {timestamp: 1451606400000},
			output: '6614389'
		},
		validate: {
			input: {token: '6614389', timestamp: 0},
			output: null
		},
		toString: {
			output: 'otpauth://totp/Username?secret=DJKP377BPJVVLB53YR3F3QXH5TPFOTWUXKY5LMXKYRRA2YTALII6FMGF6MJXGDWC&algorithm=SHA1&digits=7&period=30'
		}
	}
}, {
	// 05
	buffer: new Uint16Array([14646, 41460, 53078, 31118, 12968, 28155, 26734, 2876, 14486, 2483, 60944, 3819, 43040, 51157, 61274, 57439, 47819, 46060, 31835, 64784]).buffer,
	raw: '\x36\x39\xF4\xA1\x56\xCF\x8E\x79\xA8\x32\xFB\x6D\x6E\x68\x3C\x0B\x96\x38\xB3\x09\x10\xEE\xEB\x0E\x20\xA8\xD5\xC7\x5A\xEF\x5F\xE0\xCB\xBA\xEC\xB3\x5B\x7C\x10\xFD',
	b32: 'GY47JIKWZ6HHTKBS7NWW42B4BOLDRMYJCDXOWDRAVDK4OWXPL7QMXOXMWNNXYEH5',
	hex: '3639F4A156CF8E79A832FB6D6E683C0B9638B30910EEEB0E20A8D5C75AEF5FE0CBBAECB35B7C10FD',
	hotp: {
		constructor: {
			input: {digits: 8, issuer: 'ACME Co', label: 'Firstname Lastname'}
		},
		generate: {
			input: {counter: 1e10},
			output: '76351593'
		},
		validate: {
			input: {token: '76351593', counter: 0},
			output: null
		},
		toString: {
			output: 'otpauth://hotp/ACME%20Co:Firstname%20Lastname?issuer=ACME%20Co&secret=GY47JIKWZ6HHTKBS7NWW42B4BOLDRMYJCDXOWDRAVDK4OWXPL7QMXOXMWNNXYEH5&algorithm=SHA1&digits=8&counter=0'
		}
	},
	totp: {
		constructor: {
			input: {digits: 8, issuer: 'ACME Co', label: 'Firstname Lastname'}
		},
		generate: {
			input: {timestamp: 1451606400000},
			output: '57578252'
		},
		validate: {
			input: {token: '57578252', timestamp: 0},
			output: null
		},
		toString: {
			output: 'otpauth://totp/ACME%20Co:Firstname%20Lastname?issuer=ACME%20Co&secret=GY47JIKWZ6HHTKBS7NWW42B4BOLDRMYJCDXOWDRAVDK4OWXPL7QMXOXMWNNXYEH5&algorithm=SHA1&digits=8&period=30'
		}
	}
}, {
	// 06
	buffer: new Uint16Array([6952, 59382, 49227, 46820, 62400, 43213, 1294, 31142, 1178, 21964, 36167, 26389, 58911, 9677, 51244, 15092, 19914, 38706, 3646, 58573]).buffer,
	raw: '\x28\x1B\xF6\xE7\x4B\xC0\xE4\xB6\xC0\xF3\xCD\xA8\x0E\x05\xA6\x79\x9A\x04\xCC\x55\x47\x8D\x15\x67\x1F\xE6\xCD\x25\x2C\xC8\xF4\x3A\xCA\x4D\x32\x97\x3E\x0E\xCD\xE4',
	b32: 'FAN7NZ2LYDSLNQHTZWUA4BNGPGNAJTCVI6GRKZY743GSKLGI6Q5MUTJSS47A5TPE',
	hex: '281BF6E74BC0E4B6C0F3CDA80E05A6799A04CC55478D15671FE6CD252CC8F43ACA4D32973E0ECDE4',
	hotp: {
		constructor: {
			input: {}
		},
		generate: {
			input: {counter: 1e10},
			output: '462236'
		},
		validate: {
			input: {token: '462236', counter: 1e10 + 10},
			output: -10
		},
		toString: {
			output: 'otpauth://hotp/OTPAuth?secret=FAN7NZ2LYDSLNQHTZWUA4BNGPGNAJTCVI6GRKZY743GSKLGI6Q5MUTJSS47A5TPE&algorithm=SHA1&digits=6&counter=0'
		}
	},
	totp: {
		constructor: {
			input: {}
		},
		generate: {
			input: {timestamp: 1451606400000},
			output: '211496'
		},
		validate: {
			input: {token: '211496', timestamp: 1451603700000, window: 100},
			output: 90
		},
		toString: {
			output: 'otpauth://totp/OTPAuth?secret=FAN7NZ2LYDSLNQHTZWUA4BNGPGNAJTCVI6GRKZY743GSKLGI6Q5MUTJSS47A5TPE&algorithm=SHA1&digits=6&period=30'
		}
	}
}, {
	// 07
	buffer: new Uint16Array([36033, 1942, 57802, 13299, 6193, 59972, 65533, 63130, 15420, 38697, 61727, 17566, 24165, 31833, 44414, 46673, 22869, 25260, 59361, 37446]).buffer,
	raw: '\xC1\x8C\x96\x07\xCA\xE1\xF3\x33\x31\x18\x44\xEA\xFD\xFF\x9A\xF6\x3C\x3C\x29\x97\x1F\xF1\x9E\x44\x65\x5E\x59\x7C\x7E\xAD\x51\xB6\x55\x59\xAC\x62\xE1\xE7\x46\x92',
	b32: 'YGGJMB6K4HZTGMIYITVP37426Y6DYKMXD7YZ4RDFLZMXY7VNKG3FKWNMMLQ6ORUS',
	hex: 'C18C9607CAE1F333311844EAFDFF9AF63C3C29971FF19E44655E597C7EAD51B65559AC62E1E74692',
	hotp: {
		constructor: {
			input: {}
		},
		generate: {
			input: {counter: 1e10},
			output: '203969'
		},
		validate: {
			input: {token: '203969', counter: 1e10 + 10},
			output: -10
		},
		toString: {
			output: 'otpauth://hotp/OTPAuth?secret=YGGJMB6K4HZTGMIYITVP37426Y6DYKMXD7YZ4RDFLZMXY7VNKG3FKWNMMLQ6ORUS&algorithm=SHA1&digits=6&counter=0'
		}
	},
	totp: {
		constructor: {
			input: {}
		},
		generate: {
			input: {timestamp: 1451606400000},
			output: '946384'
		},
		validate: {
			input: {token: '946384', timestamp: 1451603700000, window: 100},
			output: 90
		},
		toString: {
			output: 'otpauth://totp/OTPAuth?secret=YGGJMB6K4HZTGMIYITVP37426Y6DYKMXD7YZ4RDFLZMXY7VNKG3FKWNMMLQ6ORUS&algorithm=SHA1&digits=6&period=30'
		}
	}
}, {
	// 08
	buffer: new Uint16Array([20412, 49784, 65451, 25185, 19043, 3957, 48751, 34068, 8924, 27365, 1945, 44024, 14202, 54242, 54475, 37844, 27053, 57858, 9905, 37141]).buffer,
	raw: '\xBC\x4F\x78\xC2\xAB\xFF\x61\x62\x63\x4A\x75\x0F\x6F\xBE\x14\x85\xDC\x22\xE5\x6A\x99\x07\xF8\xAB\x7A\x37\xE2\xD3\xCB\xD4\xD4\x93\xAD\x69\x02\xE2\xB1\x26\x15\x91',
	b32: 'XRHXRQVL75QWEY2KOUHW7PQUQXOCFZLKTED7RK32G7RNHS6U2SJ222IC4KYSMFMR',
	hex: 'BC4F78C2ABFF6162634A750F6FBE1485DC22E56A9907F8AB7A37E2D3CBD4D493AD6902E2B1261591',
	hotp: {
		constructor: {
			input: {}
		},
		generate: {
			input: {counter: 1e10},
			output: '833717'
		},
		validate: {
			input: {token: '833717', counter: 1e10 + 10},
			output: -10
		},
		toString: {
			output: 'otpauth://hotp/OTPAuth?secret=XRHXRQVL75QWEY2KOUHW7PQUQXOCFZLKTED7RK32G7RNHS6U2SJ222IC4KYSMFMR&algorithm=SHA1&digits=6&counter=0'
		}
	},
	totp: {
		constructor: {
			input: {}
		},
		generate: {
			input: {timestamp: 1451606400000},
			output: '875381'
		},
		validate: {
			input: {token: '875381', timestamp: 1451603700000, window: 100},
			output: 90
		},
		toString: {
			output: 'otpauth://totp/OTPAuth?secret=XRHXRQVL75QWEY2KOUHW7PQUQXOCFZLKTED7RK32G7RNHS6U2SJ222IC4KYSMFMR&algorithm=SHA1&digits=6&period=30'
		}
	}
}, {
	// 09
	buffer: new Uint16Array([1319, 4080, 36928, 43915, 63050, 33017, 65533, 33717, 27409, 32302, 47857, 291, 44387, 44158, 32840, 33103, 33267, 14581, 37425, 15343]).buffer,
	raw: '\x27\x05\xF0\x0F\x40\x90\x8B\xAB\x4A\xF6\xF9\x80\xFD\xFF\xB5\x83\x11\x6B\x2E\x7E\xF1\xBA\x23\x01\x63\xAD\x7E\xAC\x48\x80\x4F\x81\xF3\x81\xF5\x38\x31\x92\xEF\x3B',
	b32: 'E4C7AD2ASCF2WSXW7GAP375VQMIWWLT66G5CGALDVV7KYSEAJ6A7HAPVHAYZF3Z3',
	hex: '2705F00F40908BAB4AF6F980FDFFB583116B2E7EF1BA230163AD7EAC48804F81F381F5383192EF3B',
	hotp: {
		constructor: {
			input: {}
		},
		generate: {
			input: {counter: 1e10},
			output: '865988'
		},
		validate: {
			input: {token: '865988', counter: 1e10 + 10},
			output: -10
		},
		toString: {
			output: 'otpauth://hotp/OTPAuth?secret=E4C7AD2ASCF2WSXW7GAP375VQMIWWLT66G5CGALDVV7KYSEAJ6A7HAPVHAYZF3Z3&algorithm=SHA1&digits=6&counter=0'
		}
	},
	totp: {
		constructor: {
			input: {}
		},
		generate: {
			input: {timestamp: 1451606400000},
			output: '893785'
		},
		validate: {
			input: {token: '893785', timestamp: 1451603700000, window: 100},
			output: 90
		},
		toString: {
			output: 'otpauth://totp/OTPAuth?secret=E4C7AD2ASCF2WSXW7GAP375VQMIWWLT66G5CGALDVV7KYSEAJ6A7HAPVHAYZF3Z3&algorithm=SHA1&digits=6&period=30'
		}
	}
}];

/* ================================================
 * Utils
 * ================================================
 */

describe('OTPAuth.Utils', function () {
	it('uint.decode[0]', function () {
		var output = OTPAuth.Utils.uint.decode(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]).buffer);
		expect(output).to.equal(0);
	});

	it('uint.decode[1]', function () {
		var output = OTPAuth.Utils.uint.decode(new Uint8Array([0, 0, 0, 0, 255, 255, 255, 255]).buffer);
		expect(output).to.equal(4294967295);
	});

	it('uint.decode[2]', function () { // MAX_SAFE_INTEGER
		var output = OTPAuth.Utils.uint.decode(new Uint8Array([0, 31, 255, 255, 255, 255, 255, 255]).buffer);
		expect(output).to.equal(9007199254740991);
	});

	it('uint.encode[0]', function () {
		var output = OTPAuth.Utils.uint.encode(0);
		expect(output).to.bufferEql(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]).buffer);
	});

	it('uint.encode[1]', function () {
		var output = OTPAuth.Utils.uint.encode(4294967295);
		expect(output).to.bufferEql(new Uint8Array([0, 0, 0, 0, 255, 255, 255, 255]).buffer);
	});

	it('uint.encode[2]', function () { // MAX_SAFE_INTEGER
		var output = OTPAuth.Utils.uint.encode(9007199254740991);
		expect(output).to.bufferEql(new Uint8Array([0, 31, 255, 255, 255, 255, 255, 255]).buffer);
	});

	inputs.forEach(function (input, index) {
		it('raw.decode[' + index + ']', function () {
			var output = OTPAuth.Utils.raw.decode(input.buffer);
			expect(output).to.equal(input.raw);
		});
	});

	inputs.forEach(function (input, index) {
		it('raw.encode[' + index + ']', function () {
			var output = OTPAuth.Utils.raw.encode(input.raw);
			expect(output).to.bufferEql(input.buffer);
		});
	});

	inputs.forEach(function (input, index) {
		it('b32.decode[' + index + ']', function () {
			var output = OTPAuth.Utils.b32.decode(input.buffer);
			expect(output).to.equal(input.b32);
		});
	});

	inputs.forEach(function (input, index) {
		it('b32.encode[' + index + ']', function () {
			var output = OTPAuth.Utils.b32.encode(input.b32);
			expect(output).to.bufferEql(input.buffer);
		});
	});

	inputs.forEach(function (input, index) {
		it('hex.decode[' + index + ']', function () {
			var output = OTPAuth.Utils.hex.decode(input.buffer);
			expect(output).to.equal(input.hex);
		});
	});

	inputs.forEach(function (input, index) {
		it('hex.encode[' + index + ']', function () {
			var output = OTPAuth.Utils.hex.encode(input.hex);
			expect(output).to.bufferEql(input.buffer);
		});
	});
});

/* ================================================
 * Secret
 * ================================================
 */

describe('Test - OTPAuth.Secret', function () {
	inputs.forEach(function (input, index) {
		it('constructor[' + index + ']', function () {
			var output = new OTPAuth.Secret({buffer: input.buffer});

			expect(output).to.eql({
				raw: input.raw,
				b32: input.b32,
				hex: input.hex,
				buffer: input.buffer
			});

			expect(output.buffer).to.bufferEql(input.buffer);
		});
	});

	it('constructor[' + inputs.length + ']', function () {
		var output = new OTPAuth.Secret({size: 256});

		expect(output).to.be.an('object');
		expect(output.buffer).to.be.an('arrayBuffer');
		expect(output.buffer.byteLength).to.equal(256);
		expect(output.raw).to.be.a('string');
		expect(output.b32).to.be.a('string');
		expect(output.b32).to.match(/^[2-7A-Z]{410}$/);
		expect(output.hex).to.be.a('string');
		expect(output.hex).to.match(/^[0-9A-F]{512}$/);
	});

	it('constructor[' + (inputs.length + 1) + ']', function () {
		var output = new OTPAuth.Secret();

		expect(output).to.be.an('object');
		expect(output.buffer).to.be.an('arrayBuffer');
		expect(output.buffer.byteLength).to.equal(20);
		expect(output.b32).to.be.a('string');
		expect(output.b32).to.match(/^[2-7A-Z]{32}$/);
		expect(output.hex).to.be.a('string');
		expect(output.hex).to.match(/^[0-9A-F]{40}$/);
	});

	inputs.forEach(function (input, index) {
		it('fromRaw[' + index + ']', function () {
			var output = OTPAuth.Secret.fromRaw(input.raw);

			expect(output).to.eql({
				raw: input.raw,
				b32: input.b32,
				hex: input.hex,
				buffer: input.buffer
			});

			expect(output.buffer).to.bufferEql(input.buffer);
		});
	});

	inputs.forEach(function (input, index) {
		it('fromB32[' + index + ']', function () {
			var output = OTPAuth.Secret.fromB32(input.b32);

			expect(output).to.eql({
				raw: input.raw,
				b32: input.b32,
				hex: input.hex,
				buffer: input.buffer
			});

			expect(output.buffer).to.bufferEql(input.buffer);
		});
	});

	inputs.forEach(function (input, index) {
		it('fromHex[' + index + ']', function () {
			var output = OTPAuth.Secret.fromHex(input.hex);

			expect(output).to.eql({
				raw: input.raw,
				b32: input.b32,
				hex: input.hex,
				buffer: input.buffer
			});

			expect(output.buffer).to.bufferEql(input.buffer);
		});
	});
});

/* ================================================
 * HOTP
 * ================================================
 */

describe('Test - OTPAuth.HOTP', function () {
	it('defaults', function () {
		var hotp = new OTPAuth.HOTP();

		expect(hotp).to.be.an('object');
		expect(hotp.issuer).to.equal('');
		expect(hotp.label).to.equal('OTPAuth');
		expect(hotp.secret).to.be.instanceof(OTPAuth.Secret);
		expect(hotp.algorithm).to.equal('SHA1');
		expect(hotp.digits).to.equal(6);
		expect(hotp.counter).to.equal(0);

		expect(hotp.generate()).to.be.a('string');
		expect(hotp.generate()).to.have.lengthOf(6);
		expect(hotp.generate({pad: false})).to.a('number');

		expect(hotp.validate({token: hotp.generate()})).to.equal(-1);

		// Counter is incremented on each 'generate' call
		expect(hotp.counter).to.equal(4);
	});

	inputs.forEach(function (input, index) {
		it('generate[' + index + ']', function () {
			var constructorInput = input.hotp.constructor.input;
			constructorInput.secret = new OTPAuth.Secret({buffer: input.buffer});
			var hotp = new OTPAuth.HOTP(constructorInput);

			var generateInput = input.hotp.generate.input;
			var output = hotp.generate(generateInput);

			expect(output).to.equal(input.hotp.generate.output);
		});
	});

	inputs.forEach(function (input, index) {
		it('validate[' + index + ']', function () {
			var constructorInput = input.hotp.constructor.input;
			constructorInput.secret = new OTPAuth.Secret({buffer: input.buffer});
			var hotp = new OTPAuth.HOTP(constructorInput);

			var validateInput = input.hotp.validate.input;
			var output = hotp.validate(validateInput);

			expect(output).to.equal(input.hotp.validate.output);
		});
	});

	inputs.forEach(function (input, index) {
		it('toString[' + index + ']', function () {
			var constructorInput = input.hotp.constructor.input;
			constructorInput.secret = new OTPAuth.Secret({buffer: input.buffer});
			var hotp = new OTPAuth.HOTP(constructorInput);

			var output = hotp.toString();

			expect(output).to.equal(input.hotp.toString.output);
		});
	});
});

/* ================================================
 * TOTP
 * ================================================
 */

describe('Test - OTPAuth.TOTP', function () {
	it('defaults', function () {
		var totp = new OTPAuth.TOTP();

		expect(totp).to.be.an('object');
		expect(totp.issuer).to.equal('');
		expect(totp.label).to.equal('OTPAuth');
		expect(totp.secret).to.be.instanceof(OTPAuth.Secret);
		expect(totp.algorithm).to.equal('SHA1');
		expect(totp.digits).to.equal(6);
		expect(totp.period).to.equal(30);

		expect(totp.generate()).to.be.a('string');
		expect(totp.generate()).to.have.lengthOf(6);
		expect(totp.generate({pad: false})).to.a('number');

		expect(totp.validate({token: totp.generate()})).to.equal(0);
	});

	inputs.forEach(function (input, index) {
		it('generate[' + index + ']', function () {
			var constructorInput = input.totp.constructor.input;
			constructorInput.secret = new OTPAuth.Secret({buffer: input.buffer});
			var totp = new OTPAuth.TOTP(constructorInput);

			var generateInput = input.totp.generate.input;
			var output = totp.generate(generateInput);

			expect(output).to.equal(input.totp.generate.output);
		});
	});

	inputs.forEach(function (input, index) {
		it('validate[' + index + ']', function () {
			var constructorInput = input.totp.constructor.input;
			constructorInput.secret = new OTPAuth.Secret({buffer: input.buffer});
			var totp = new OTPAuth.TOTP(constructorInput);

			var validateInput = input.totp.validate.input;
			var output = totp.validate(validateInput);

			expect(output).to.equal(input.totp.validate.output);
		});
	});

	inputs.forEach(function (input, index) {
		it('toString[' + index + ']', function () {
			var constructorInput = input.totp.constructor.input;
			constructorInput.secret = new OTPAuth.Secret({buffer: input.buffer});
			var totp = new OTPAuth.TOTP(constructorInput);

			var output = totp.toString();

			expect(output).to.equal(input.totp.toString.output);
		});
	});
});

/* ================================================
 * URI
 * ================================================
 */

describe('Test - OTPAuth.URI', function () {
	inputs.forEach(function (input, index) {
		it('parse[' + index + '] - HOTP', function () {
			var constructorInput = input.hotp.constructor.input;
			constructorInput.secret = new OTPAuth.Secret({buffer: input.buffer});
			var hotp = new OTPAuth.HOTP(constructorInput);

			var output = OTPAuth.URI.parse(input.hotp.toString.output);

			expect(output).to.eql(hotp);
		});
	});

	inputs.forEach(function (input, index) {
		it('parse[' + index + '] - TOTP', function () {
			var constructorInput = input.totp.constructor.input;
			constructorInput.secret = new OTPAuth.Secret({buffer: input.buffer});
			var totp = new OTPAuth.TOTP(constructorInput);

			var output = OTPAuth.URI.parse(input.totp.toString.output);

			expect(output).to.eql(totp);
		});
	});

	inputs.forEach(function (input, index) {
		it('stringify[' + index + '] - HOTP', function () {
			var constructorInput = input.hotp.constructor.input;
			constructorInput.secret = new OTPAuth.Secret({buffer: input.buffer});
			var hotp = new OTPAuth.HOTP(constructorInput);

			var output = OTPAuth.URI.stringify(hotp);

			expect(output).to.equal(input.hotp.toString.output);
		});
	});

	inputs.forEach(function (input, index) {
		it('stringify[' + index + '] - TOTP', function () {
			var constructorInput = input.totp.constructor.input;
			constructorInput.secret = new OTPAuth.Secret({buffer: input.buffer});
			var totp = new OTPAuth.TOTP(constructorInput);

			var output = OTPAuth.URI.stringify(totp);

			expect(output).to.equal(input.totp.toString.output);
		});
	});

	it('stringify[' + inputs.length + '] - TOTP', function () {
		var totp = new OTPAuth.TOTP({
			issuer: 'ACME',
			label: 'AzureDiamond',
			secret: new OTPAuth.Secret({
				buffer: OTPAuth.Utils.b32.encode('NB2W45DFOIZA')
			})
		});

		var output = OTPAuth.URI.stringify(totp, {legacyIssuer: true});
		var expected = 'otpauth://totp/ACME:AzureDiamond?issuer=ACME&secret=NB2W45DFOIZA&algorithm=SHA1&digits=6&period=30';

		expect(output).to.equal(expected);
	});

	it('stringify[' + (inputs.length + 1) + '] - TOTP', function () {
		var totp = new OTPAuth.TOTP({
			issuer: 'ACME',
			label: 'AzureDiamond',
			secret: new OTPAuth.Secret({
				buffer: OTPAuth.Utils.b32.encode('NB2W45DFOIZA')
			})
		});

		var output = OTPAuth.URI.stringify(totp, {legacyIssuer: false});
		var expected = 'otpauth://totp/AzureDiamond?issuer=ACME&secret=NB2W45DFOIZA&algorithm=SHA1&digits=6&period=30';

		expect(output).to.equal(expected);
	});
});
