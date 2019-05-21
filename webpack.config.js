

const path = require('path');
const fs = require('fs');
const tmp = require('tmp');

const webpack = require('webpack');
const ClosurePlugin = require('closure-webpack-plugin');
const pkg = require('./package.json');

function generateConfig(filename) {
	const isMinified = filename.endsWith('.min.js');

	return {
		mode: 'production',
		entry: path.join(__dirname, 'src/main.js'),
		output: {
			filename,
			sourceMapFilename: `${filename}.map`,
			library: 'OTPAuth',
			libraryTarget: 'umd',
			globalObject: 'this',
			path: path.join(__dirname, 'dist')
		},
		optimization: {
			minimize: true,
			minimizer: [
				new ClosurePlugin({
					mode: 'STANDARD',
					platform: ['native', 'java']
				}, {
					/* eslint-disable camelcase */
					warning_level: 'QUIET',
					language_in: 'ECMASCRIPT_NEXT',
					language_out: 'ECMASCRIPT5_STRICT',
					compilation_level: 'SIMPLE',
					create_source_map: true,
					renaming: isMinified,
					...(!isMinified && { formatting: 'PRETTY_PRINT' })
					/* eslint-enable camelcase */
				})
			]
		},
		devtool: 'source-map',
		node: { Buffer: false },
		plugins: [
			new webpack.EnvironmentPlugin({
				VERSION: pkg.version
			}),
			// Custom build of the Stanford Javascript Crypto Library (SJCL)
			new webpack.NormalModuleReplacementPlugin(/^sjcl$/, ((result) => {
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

				const code = `
					${fragments.reduce((content, fragment) => content + fs.readFileSync(path.join(base, fragment)), '')}
					;export default sjcl;
				`;

				fs.writeFileSync(file.name, code);
				result.request = file.name;
			})),
			new webpack.BannerPlugin({
				banner: `${pkg.name} v${pkg.version} | (c) ${pkg.author} | ${pkg.homepage} | ${pkg.license}`
			})
		]
	};
}

module.exports = [
	'otpauth.js',
	'otpauth.min.js'
].map(generateConfig);
