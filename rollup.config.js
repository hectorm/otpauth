import replace from "@rollup/plugin-replace";
import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import dts from "rollup-plugin-dts";
import { terser } from "rollup-plugin-terser";

import packageJson from "./package.json";

export default async () => {
  const mainEsOpts = {
    plugins: [
      replace({
        preventAssignment: true,
        require: "await import",
        __OTPAUTH_VERSION__: packageJson.version,
      }),
      resolve(),
      babel({ babelHelpers: "bundled" }),
    ],
    onwarn: (warning) => {
      throw new Error(warning.message);
    },
  };

  const mainCjsOpts = {
    ...mainEsOpts,
    plugins: [
      replace({
        preventAssignment: true,
        __OTPAUTH_VERSION__: packageJson.version,
      }),
      resolve(),
      babel({ babelHelpers: "bundled" }),
    ],
  };

  const outOpts = {
    name: "OTPAuth",
    exports: "named",
    banner: async () => {
      const getLicenseComment = (pkg) =>
        `/*! ${[
          `${pkg.name} v${pkg.version}`,
          `(c) ${pkg.author.name ? pkg.author.name : pkg.author}`,
          `${pkg.license}`,
          `${pkg.homepage}`,
        ].join(" | ")} */\n`;

      let comment = getLicenseComment(packageJson);
      for (const dependency of Object.keys(packageJson.dependencies)) {
        const dependencyPackageJson = await import(
          `${dependency}/package.json`
        );
        comment += getLicenseComment(dependencyPackageJson);
      }

      return comment;
    },
  };

  const outMinOpts = {
    ...outOpts,
    sourcemap: true,
    plugins: [terser({ output: { max_line_len: 1024 } })],
  };

  return [
    {
      ...mainEsOpts,
      input: "./src/index.js",
      output: [
        { ...outOpts, file: "./dist/otpauth.esm.js", format: "es" },
        { ...outMinOpts, file: "./dist/otpauth.esm.min.js", format: "es" },
      ],
    },
    {
      ...mainCjsOpts,
      input: "./src/index.js",
      output: [
        { ...outOpts, file: "./dist/otpauth.cjs.js", format: "cjs" },
        { ...outMinOpts, file: "./dist/otpauth.cjs.min.js", format: "cjs" },
      ],
    },
    {
      ...mainCjsOpts,
      input: "./src/index.js",
      output: [
        { ...outOpts, file: "./dist/otpauth.umd.js", format: "umd" },
        { ...outMinOpts, file: "./dist/otpauth.umd.min.js", format: "umd" },
      ],
    },
    {
      input: "./types/index.d.ts",
      output: [{ file: "./dist/otpauth.d.ts", format: "es" }],
      plugins: [dts()],
    },
  ];
};
