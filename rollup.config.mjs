import replace from "@rollup/plugin-replace";
import virtual from "@rollup/plugin-virtual";
import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import esbuild from "rollup-plugin-esbuild";
import dts from "rollup-plugin-dts";

import packageJson from "./package.json" assert { type: "json" };

export default async () => {
  const mainOpts = {
    plugins: [
      replace({
        preventAssignment: true,
        __OTPAUTH_VERSION__: packageJson.version,
      }),
      virtual({
        "node:crypto": `
          export const createHmac = undefined;
          export const randomBytes = undefined;
          export const timingSafeEqual = undefined;
        `,
      }),
      resolve(),
      babel({ babelHelpers: "bundled" }),
    ],
    onwarn: (warning) => {
      throw new Error(warning.message);
    },
  };

  const mainMinOpts = {
    ...mainOpts,
    plugins: [
      ...mainOpts.plugins,
      esbuild({
        target: "es2015",
        minify: true,
      }),
    ],
  };

  const mainNodeOpts = {
    plugins: [
      replace({
        preventAssignment: true,
        __OTPAUTH_VERSION__: packageJson.version,
      }),
      virtual({
        jssha: `
          export default undefined;
        `,
      }),
      resolve(),
      babel({ babelHelpers: "bundled" }),
    ],
    onwarn: (warning) => {
      throw new Error(warning.message);
    },
  };

  const mainNodeMinOpts = {
    ...mainNodeOpts,
    plugins: [
      ...mainNodeOpts.plugins,
      esbuild({
        target: "es2015",
        minify: true,
      }),
    ],
  };

  const outOpts = {
    name: "OTPAuth",
    exports: "named",
  };

  const outMinOpts = {
    ...outOpts,
    sourcemap: true,
  };

  return [
    {
      ...mainOpts,
      input: "./src/index.js",
      output: [
        { ...outOpts, file: "./dist/otpauth.esm.js", format: "es" },
        { ...outOpts, file: "./dist/otpauth.umd.js", format: "umd" },
      ],
    },
    {
      ...mainMinOpts,
      input: "./src/index.js",
      output: [
        { ...outMinOpts, file: "./dist/otpauth.esm.min.js", format: "es" },
        { ...outMinOpts, file: "./dist/otpauth.umd.min.js", format: "umd" },
      ],
    },
    {
      ...mainNodeOpts,
      input: "./src/index.js",
      output: [
        { ...outOpts, file: "./dist/otpauth.node.mjs", format: "es" },
        { ...outOpts, file: "./dist/otpauth.node.cjs", format: "cjs" },
      ],
    },
    {
      ...mainNodeMinOpts,
      input: "./src/index.js",
      output: [
        { ...outMinOpts, file: "./dist/otpauth.node.min.mjs", format: "es" },
        { ...outMinOpts, file: "./dist/otpauth.node.min.cjs", format: "cjs" },
      ],
    },
    {
      input: "./types/index.d.ts",
      output: [{ file: "./dist/otpauth.d.ts", format: "es" }],
      plugins: [dts()],
    },
  ];
};
