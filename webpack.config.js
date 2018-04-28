'use strict';

const pkg = require('./package.json');

const path = require('path');
const fs = require('fs');
const tmp = require('tmp');

const webpack = require('webpack');
const ClosureCompilerPlugin = require('google-closure-compiler-js').webpack;
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

function generateConfig(filename) {
	const isMinified = filename.endsWith('.min.js');

	return {
		mode: 'production',
		entry: path.join(__dirname, 'src/main.js'),
		output: {
			filename: filename,
			sourceMapFilename: `${filename}.map`,
			library: 'OTPAuth',
			libraryTarget: 'umd',
			globalObject: 'this',
			path: path.join(__dirname, 'dist')
		},
		optimization: {
			minimize: true,
			minimizer: [
				new UglifyJsPlugin({
					sourceMap: true,
					uglifyOptions: {
						/* eslint-disable camelcase */
						compress: false,
						mangle: false,
						output: {
							beautify: !isMinified,
							max_line_len: 512,
							indent_level: 1
						}
						/* eslint-enable camelcase */
					}
				})
			]
		},
		devtool: 'source-map',
		node: {Buffer: false},
		plugins: [
			new webpack.EnvironmentPlugin({
				VERSION: pkg.version
			}),
			// Custom build of the Stanford Javascript Crypto Library (SJCL)
			new webpack.NormalModuleReplacementPlugin(/^sjcl$/, function (result) {
				const file = tmp.fileSync();

				const base = path.join(__dirname, 'node_modules/sjcl');
				const fragments = [
					'core/sjcl.js',
					'core/bitArray.js',
					'core/codecArrayBuffer.js',
					'core/sha1.js',
					'core/sha256.js',
					'core/sha512.js',
					'core/hmac.js'
				];

				let code = fragments.reduce(function (content, fragment) {
					return content + fs.readFileSync(path.join(base, fragment));
				}, '') + '; export default sjcl;';

				fs.writeFileSync(file.name, code);
				result.request = file.name;
			}),
			new ClosureCompilerPlugin({
				options: {
					warningLevel: 'QUIET',
					languageIn: 'ES6_STRICT',
					languageOut: 'ES5_STRICT',
					compilationLevel: 'SIMPLE',
					rewritePolyfills: true,
					createSourceMap: true,
					assumeFunctionWrapper: true,
					outputWrapper: '(function(){%output%}).call(this);',
					renaming: isMinified,
					externs: [
						{src: 'let Buffer'},
						{src: 'let define'},
						{src: 'let exports'},
						{src: 'let module'}
					]
				}
			}),
			new webpack.BannerPlugin(`${pkg.libraryName} v${pkg.version} | (c) ${pkg.author} | ${pkg.homepage} | ${pkg.license}`)
		]
	};
}

module.exports = [
	'otpauth.js',
	'otpauth.min.js'
].map(generateConfig);
