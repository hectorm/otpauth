'use strict';

module.exports = {
	'extends': ['eslint:recommended', 'standard'],
	'parserOptions': {
		'ecmaVersion': 6,
		'sourceType': 'module'
	},
	'env': {
		'browser': true,
		'node': true,
		'es6': true
	},
	'rules': {
		'indent': ['error', 'tab'],
		'no-extra-semi': ['error'],
		'no-tabs': ['off'],
		'quote-props': ['error', 'always'],
		'semi': ['error', 'always'],
		'semi-spacing': ['error', {'before': false, 'after': true}]
	}
};

