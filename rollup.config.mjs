import fs from "node:fs";
import module from "node:module";

import replace from "@rollup/plugin-replace";
import virtual from "@rollup/plugin-virtual";
import resolve from "@rollup/plugin-node-resolve";
import swc from "@rollup/plugin-swc";
import terser from "@rollup/plugin-terser";
import dts from "rollup-plugin-dts";

const require = module.createRequire(import.meta.url);

const pkgSpec = (pkg) => {
  return JSON.parse(fs.readFileSync(require.resolve(`${pkg}/package.json`), "utf8"));
};

const mock = (...exports) => {
  return exports.map((f) => `export const ${f} = undefined`).join(";\n");
};

export default () => {
  const spec = pkgSpec(".");

  const replaceOpts = {
    preventAssignment: true,
    __OTPAUTH_VERSION__: spec.version,
  };

  const swcOpts = {
    swc: {
      jsc: {
        target: "es2020",
      },
    },
  };

  const terserOpts = {
    compress: {
      passes: 2,
    },
    format: {
      comments: /^(\s*@license\s*.+)|(\s*@ts-nocheck\s*)|(\/\s*<.+\/>\s*)$/,
      max_line_len: 2048,
      ecma: 2020,
    },
  };

  const rollupOpts = {
    plugins: [
      replace(replaceOpts),
      virtual({
        "node:crypto": mock("createHmac", "randomBytes", "timingSafeEqual"),
      }),
      resolve(),
      swc(swcOpts),
    ],
    onwarn: (warning) => {
      throw new Error(warning.message);
    },
  };

  const rollupMinOpts = {
    ...rollupOpts,
    plugins: [rollupOpts.plugins, terser(terserOpts)],
  };

  const rollupNodeOpts = {
    plugins: [
      replace(replaceOpts),
      virtual({
        "@noble/hashes/hmac": mock("hmac"),
        "@noble/hashes/sha1": mock("sha1"),
        "@noble/hashes/sha2": mock("sha224", "sha256", "sha384", "sha512"),
        "@noble/hashes/sha3": mock("sha3_224", "sha3_256", "sha3_384", "sha3_512"),
      }),
      resolve(),
      swc(swcOpts),
    ],
    onwarn: (warning) => {
      throw new Error(warning.message);
    },
  };

  const rollupNodeMinOpts = {
    ...rollupNodeOpts,
    plugins: [rollupNodeOpts.plugins, terser(terserOpts)],
  };

  const outputOpts = {
    name: "OTPAuth",
    exports: "named",
    banner: [
      `// @license otpauth ${spec.version} | (c) Héctor Molinero Fernández | MIT | https://github.com/hectorm/otpauth`,
      `// @license noble-hashes ${spec.dependencies["@noble/hashes"]} | (c) Paul Miller | MIT | https://github.com/paulmillr/noble-hashes`,
      `// @ts-nocheck`,
      `/// <reference types="./otpauth.d.ts" />`,
    ].join("\n"),
  };

  const outputMinOpts = {
    ...outputOpts,
    sourcemap: true,
  };

  const outputNodeOpts = {
    name: "OTPAuth",
    exports: "named",
    banner: [
      `// @license otpauth ${spec.version} | (c) Héctor Molinero Fernández | MIT | https://github.com/hectorm/otpauth`,
      `// @ts-nocheck`,
      `/// <reference types="./otpauth.d.ts" />`,
    ].join("\n"),
  };

  const outputNodeMinOpts = {
    ...outputNodeOpts,
    sourcemap: true,
  };

  return [
    {
      ...rollupOpts,
      input: "./src/index.js",
      output: [
        { ...outputOpts, file: "./dist/otpauth.esm.js", format: "es" },
        { ...outputOpts, file: "./dist/otpauth.umd.js", format: "umd" },
      ],
    },
    {
      ...rollupMinOpts,
      input: "./src/index.js",
      output: [
        { ...outputMinOpts, file: "./dist/otpauth.esm.min.js", format: "es" },
        { ...outputMinOpts, file: "./dist/otpauth.umd.min.js", format: "umd" },
      ],
    },
    {
      ...rollupNodeOpts,
      input: "./src/index.js",
      output: [
        { ...outputNodeOpts, file: "./dist/otpauth.node.mjs", format: "es" },
        { ...outputNodeOpts, file: "./dist/otpauth.node.cjs", format: "cjs" },
      ],
    },
    {
      ...rollupNodeMinOpts,
      input: "./src/index.js",
      output: [
        { ...outputNodeMinOpts, file: "./dist/otpauth.node.min.mjs", format: "es" },
        { ...outputNodeMinOpts, file: "./dist/otpauth.node.min.cjs", format: "cjs" },
      ],
    },
    {
      input: "./types/index.d.ts",
      output: [
        { file: "./dist/otpauth.d.ts", format: "es" },
        { file: "./dist/otpauth.d.cts", format: "cjs" },
      ],
      plugins: [dts()],
    },
  ];
};
