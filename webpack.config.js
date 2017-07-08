'use strict';

const pkg = require('./package.json');

const path = require('path');
const fs = require('fs');
const tmp = require('tmp');

const webpack = require('webpack');
const ClosureCompilerPlugin = require('google-closure-compiler-js').webpack;

module.exports = {
	'entry': path.join(__dirname, 'src/index.js'),
	'output': {
		'library': `${pkg.libraryName}`,
		'libraryTarget': 'umd',
		'filename': `${pkg.name}.min.js`,
		'path': path.join(__dirname, 'dist')
	},
	'devtool': 'source-map',
	'node': {
		'Buffer': false
	},
	'plugins': [
		// Custom build of the Stanford Javascript Crypto Library (SJCL)
		new webpack.NormalModuleReplacementPlugin(/^sjcl$/, function (result) {
			const request = tmp.fileSync().name;

			const root = path.join(__dirname, 'node_modules/sjcl');
			const sources = [
				'core/sjcl.js',
				'core/bitArray.js',
				'core/codecArrayBuffer.js',
				'core/sha1.js',
				'core/sha256.js',
				'core/sha512.js',
				'core/hmac.js',
				'core/exports.js'
			];

			fs.writeFileSync(request, sources.reduce(function (code, file) {
				return code + fs.readFileSync(path.join(root, file));
			}, ''));

			result.request = request;
		}),
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
