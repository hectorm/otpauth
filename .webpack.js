'use strict';

const pkg = require('./package.json');
const path = require('path');
const webpack = require('webpack');
const ClosureCompilerPlugin = require('google-closure-compiler-js').webpack;

module.exports = {
	'entry': path.join(__dirname, 'src/index.js'),
	'output': {
		'library': `${pkg.libraryName}`,
		'libraryTarget': 'umd',
		'filename': `${pkg.name}.js`,
		'path': path.join(__dirname, 'lib')
	},
	'externals': {
		'crypto': 'crypto'
	},
	'node': {
		'Buffer': false
	},
	'devtool': 'source-map',
	'plugins': [
		new ClosureCompilerPlugin({
			'options': {
				'warningLevel': 'QUIET',
				'languageIn': 'ES6_STRICT',
				'languageOut': 'ES5_STRICT',
				'compilationLevel': 'SIMPLE',
				'createSourceMap': true,
				'rewritePolyfills': true,
				'assumeFunctionWrapper': true,
				'outputWrapper': '(function(){%output%}).call(this);',
				'externs': [
					{'src': 'var define'},
					{'src': 'var exports'},
					{'src': 'var module'}
				]
			}
		}),
		new webpack.BannerPlugin(
			`${pkg.libraryName} v${pkg.version} | (c) ${pkg.author} | ${pkg.homepage} | ${pkg.license}`
		)
	]
};

