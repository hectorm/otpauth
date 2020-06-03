import fs from 'fs';
import path from 'path';

import tmp from 'tmp';

import alias from '@rollup/plugin-alias';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';

import sjclPkg from 'sjcl/package.json';
import otpauthPkg from './package.json';

const sjclReplacement = () => {
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

	return file.name;
};

const pkgBanner = pkg => (`/*! ${[
	`${pkg.name} v${pkg.version}`,
	`(c) ${pkg.author.name ? pkg.author.name : pkg.author}`,
	`${pkg.license}`,
	`${pkg.homepage}`
].join(' | ')} */`);

const commonPlugins = [
	alias({ entries: [{ find: 'sjcl', replacement: sjclReplacement() }] }),
	replace({ __OTPAUTH_VERSION__: otpauthPkg.version }),
	resolve(),
	babel({ babelHelpers: 'bundled' }),
	{ banner: [pkgBanner(otpauthPkg), pkgBanner(sjclPkg)].join('\n') }
];

const minPlugins = [
	terser({
		output: {
			/* eslint-disable camelcase */
			max_line_len: 1024
			/* eslint-enable */
		}
	})
];

const onwarn = warning => {
	// Ignore "eval" in "utils.js".
	if (warning.code === 'EVAL'
		&& /\/utils\.js$/.test(warning.loc.file)
	) return;

	// Ignore "this is undefined" in "sjcl".
	if (warning.code === 'THIS_IS_UNDEFINED'
		&& /\/sjcl-[^/]+\.js$/.test(warning.loc.file)
	) return;

	throw new Error(warning.message);
};

export default {
	input: 'src/main.js',
	output: [
		{ name: 'OTPAuth', file: './dist/otpauth.cjs.js', format: 'cjs' },
		{ name: 'OTPAuth', file: './dist/otpauth.umd.js', format: 'umd' },
		{ name: 'OTPAuth', file: './dist/otpauth.esm.js', format: 'es' },
		{ name: 'OTPAuth', file: './dist/otpauth.cjs.min.js', format: 'cjs', sourcemap: true, plugins: minPlugins },
		{ name: 'OTPAuth', file: './dist/otpauth.umd.min.js', format: 'umd', sourcemap: true, plugins: minPlugins },
		{ name: 'OTPAuth', file: './dist/otpauth.esm.min.js', format: 'es', sourcemap: true, plugins: minPlugins }
	],
	plugins: commonPlugins,
	onwarn
};
