import path from "node:path";
import url from "node:url";
import fs from "node:fs/promises";

import replace from "@rollup/plugin-replace";
import virtual from "@rollup/plugin-virtual";
import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import esbuild from "rollup-plugin-esbuild";
import dts from "rollup-plugin-dts";

export default async () => {
  const __dirname = url.fileURLToPath(path.dirname(import.meta.url));
  const pkg = JSON.parse(
    await fs.readFile(path.join(__dirname, "./package.json"), "utf8"),
  );

  const banner = `/// <reference types="./otpauth.d.ts" />`;

  const replaceOpts = {
    preventAssignment: true,
    __OTPAUTH_VERSION__: pkg.version,
  };

  const babelOpts = {
    babelHelpers: "bundled",
  };

  const esbuildOpts = {
    target: "es2015",
    minify: true,
    banner,
  };

  const mainOpts = {
    plugins: [
      replace(replaceOpts),
      virtual({
        "node:crypto": [
          `export const createHmac = undefined;`,
          `export const randomBytes = undefined;`,
          `export const timingSafeEqual = undefined;`,
        ].join("\n"),
      }),
      resolve(),
      babel(babelOpts),
    ],
    onwarn: (warning) => {
      throw new Error(warning.message);
    },
  };

  const mainMinOpts = {
    ...mainOpts,
    plugins: [...mainOpts.plugins, esbuild(esbuildOpts)],
  };

  const mainNodeOpts = {
    plugins: [
      replace(replaceOpts),
      virtual({
        jssha: `export default undefined;`,
      }),
      resolve(),
      babel(babelOpts),
    ],
    onwarn: (warning) => {
      throw new Error(warning.message);
    },
  };

  const mainNodeMinOpts = {
    ...mainNodeOpts,
    plugins: [...mainNodeOpts.plugins, esbuild(esbuildOpts)],
  };

  const outOpts = {
    name: "OTPAuth",
    exports: "named",
    banner,
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
