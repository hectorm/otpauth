import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';

import packageJson from './package.json';

export default async () => {
	const commonBuildOptions = {
		name: 'OTPAuth',
		banner: async () => {
			const getLicenseComment = (pkg) => (`/*! ${[
				`${pkg.name} v${pkg.version}`,
				`(c) ${pkg.author.name ? pkg.author.name : pkg.author}`,
				`${pkg.license}`,
				`${pkg.homepage}`,
			].join(' | ')} */\n`);

			let comment = getLicenseComment(packageJson);
			for (const dependency of Object.keys(packageJson.dependencies)) {
				// eslint-disable-next-line no-await-in-loop
				const dependencyPackageJson = await import(`${dependency}/package.json`);
				comment += getLicenseComment(dependencyPackageJson);
			}

			return comment;
		},
	};

	const minifiedBuildOptions = {
		plugins: [
			/* eslint-disable-next-line camelcase */
			terser({ output: { max_line_len: 1024 } }),
		],
		sourcemap: true,
	};

	return {
		input: './src/index.js',
		output: [
			{ file: './dist/otpauth.cjs.js', format: 'cjs', ...commonBuildOptions },
			{ file: './dist/otpauth.umd.js', format: 'umd', ...commonBuildOptions },
			{ file: './dist/otpauth.esm.js', format: 'es', ...commonBuildOptions },
			{ file: './dist/otpauth.cjs.min.js', format: 'cjs', ...commonBuildOptions, ...minifiedBuildOptions },
			{ file: './dist/otpauth.umd.min.js', format: 'umd', ...commonBuildOptions, ...minifiedBuildOptions },
			{ file: './dist/otpauth.esm.min.js', format: 'es', ...commonBuildOptions, ...minifiedBuildOptions },
		],
		plugins: [
			replace({ preventAssignment: true, __OTPAUTH_VERSION__: packageJson.version }),
			resolve(),
			babel({ babelHelpers: 'bundled' }),
		],
		onwarn: (warning) => {
			// Ignore "eval" in "node-require.js".
			if (warning.code === 'EVAL' && /\/node-require\.js$/.test(warning.loc.file)) {
				return;
			}

			throw new Error(warning.message);
		},
	};
};
