const path = require('path');
const fs = require('fs');

const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

const tmp = require('tmp');
// Enable graceful cleanup.
tmp.setGracefulCleanup();

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
		devtool: 'source-map',
		node: false,
		optimization: {
			minimize: isMinified,
			minimizer: [
				new TerserPlugin({
					parallel: true,
					sourceMap: true,
					extractComments: false,
					terserOptions: {
						output: {
							/* eslint-disable camelcase */
							comments: /^!/,
							max_line_len: 1024
							/* eslint-enable */
						}
					}
				})
			]
		},
		plugins: [
			new webpack.EnvironmentPlugin({
				VERSION: pkg.version
			}),
			new webpack.BannerPlugin({
				banner: `${pkg.name} v${pkg.version} | (c) ${pkg.author} | ${pkg.homepage} | ${pkg.license}`
			}),
			// Custom build of the Stanford Javascript Crypto Library (SJCL).
			new webpack.NormalModuleReplacementPlugin(/^sjcl$/, (result => {
				const file = tmp.fileSync({ prefix: 'sjcl-', postfix: '.js' });

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

				const code = `${fragments.reduce((content, fragment) => {
					return content + fs.readFileSync(path.join(base, fragment));
				}, '')}; export default sjcl;`;

				fs.writeFileSync(file.name, code);
				result.request = file.name;
			}))
		],
		module: {
			rules: [
				{ test: /\.js$/i, use: { loader: 'babel-loader' } }
			]
		}
	};
}

module.exports = [
	'otpauth.js',
	'otpauth.min.js'
].map(generateConfig);
