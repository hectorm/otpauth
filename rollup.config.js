import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';

import otpauthPkg from './package.json';

const minBuildOptions = {
	plugins: [
		/* eslint-disable-next-line camelcase */
		terser({ output: { max_line_len: 1024 } })
	],
	sourcemap: true
};

const getBanner = pkg => (`/*! ${[
	`${pkg.name} v${pkg.version}`,
	`(c) ${pkg.author.name ? pkg.author.name : pkg.author}`,
	`${pkg.license}`,
	`${pkg.homepage}`
].join(' | ')} */`);

export default {
	input: 'src/main.js',
	output: [
		{ name: 'OTPAuth', file: './dist/otpauth.cjs.js', format: 'cjs' },
		{ name: 'OTPAuth', file: './dist/otpauth.umd.js', format: 'umd' },
		{ name: 'OTPAuth', file: './dist/otpauth.esm.js', format: 'es' },
		{ name: 'OTPAuth', file: './dist/otpauth.cjs.min.js', format: 'cjs', ...minBuildOptions },
		{ name: 'OTPAuth', file: './dist/otpauth.umd.min.js', format: 'umd', ...minBuildOptions },
		{ name: 'OTPAuth', file: './dist/otpauth.esm.min.js', format: 'es', ...minBuildOptions }
	],
	plugins: [
		replace({ preventAssignment: true, __OTPAUTH_VERSION__: otpauthPkg.version }),
		resolve(),
		babel({ babelHelpers: 'bundled' }),
		{ banner: [getBanner(otpauthPkg)].join('\n') }
	],
	onwarn: warning => {
		// Ignore "eval" in "utils.js".
		if (warning.code === 'EVAL'
			&& /\/utils\.js$/.test(warning.loc.file)
		) return;

		throw new Error(warning.message);
	}
};
