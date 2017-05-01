'use strict';

module.exports = {
	'title': 'OTPAuth',
	'index': './README.md',
	'package': './package.json',
	'source': './src',
	'destination': './doc',
	'includes': ['\\.js$'],
	'excludes': ['^\\.'],
	'access': ['public', 'protected'],
	'autoPrivate': true,
	'unexportIdentifier': false,
	'undocumentIdentifier': true,
	'builtinExternal': true,
	'coverage': true,
	'includeSource': true,
	'lint': true
}
