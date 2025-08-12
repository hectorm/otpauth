import fs from "node:fs";
import module from "node:module";

import replace from "@rollup/plugin-replace";
import virtual from "@rollup/plugin-virtual";
import resolve from "@rollup/plugin-node-resolve";
import swc from "@rollup/plugin-swc";
import terser from "@rollup/plugin-terser";
import dts from "rollup-plugin-dts";

/** @typedef {import("rollup").RollupOptions} RollupOptions */
/** @typedef {import("rollup").InputPluginOption} InputPluginOption */
/** @typedef {import("rollup").OutputOptions} OutputOptions */
/** @typedef {Parameters<typeof replace.default>[0]} RollupReplaceOptions */
/** @typedef {Parameters<typeof virtual.default>[0]} RollupVirtualOptions */
/** @typedef {Parameters<typeof resolve.default>[0]} RollupResolveOptions */
/** @typedef {Parameters<typeof swc.default>[0]} RollupSwcOptions */
/** @typedef {Parameters<typeof terser.default>[0]} RollupTerserOptions */

/** @template T @param {{default: T}} f */
const t = (f) => /** @type {T} */ (f);

const require = module.createRequire(import.meta.url);

/** @type {(pkg: string) => any} */
const pkgSpec = (pkg) => {
  return JSON.parse(fs.readFileSync(require.resolve(`${pkg}/package.json`), "utf8"));
};

/** @type {(...exports: string[]) => string} */
const mock = (...exports) => {
  return exports.map((f) => `export const ${f} = undefined`).join(";\n");
};

/** @type {() => RollupOptions[]} */
export default () => {
  const spec = pkgSpec(".");

  const banner = [
    `//! otpauth ${spec.version} | (c) Héctor Molinero Fernández | MIT | https://github.com/hectorm/otpauth`,
    `//! noble-hashes ${spec.dependencies["@noble/hashes"]} | (c) Paul Miller | MIT | https://github.com/paulmillr/noble-hashes`,
    `/// <reference types="./otpauth.d.ts" />`,
    `// @ts-nocheck`,
  ].join("\n");

  const bannerNode = [
    `//! otpauth ${spec.version} | (c) Héctor Molinero Fernández | MIT | https://github.com/hectorm/otpauth`,
    `/// <reference types="./otpauth.d.ts" />`,
    `// @ts-nocheck`,
  ].join("\n");

  /** @type {RollupReplaceOptions} */
  const replaceOpts = {
    preventAssignment: true,
    __OTPAUTH_VERSION__: spec.version,
  };

  /** @type {RollupSwcOptions} */
  const swcOpts = {
    swc: {
      jsc: {
        target: "es2020",
      },
    },
  };

  /** @type {RollupTerserOptions} */
  const terserOpts = {
    compress: {
      passes: 2,
    },
    format: {
      comments: false,
      preamble: banner,
      max_line_len: 2048,
      ecma: 2020,
    },
  };

  /** @type {RollupTerserOptions} */
  const terserNodeOpts = {
    ...terserOpts,
    format: {
      ...terserOpts.format,
      preamble: bannerNode,
    },
  };

  /** @type {RollupOptions} */
  const rollupOpts = {
    plugins: [
      t(replace)(replaceOpts),
      t(virtual)({
        "node:crypto": mock("createHmac", "randomBytes", "timingSafeEqual"),
      }),
      t(resolve)(),
      t(swc)(swcOpts),
    ],
    onwarn: (warning) => {
      throw new Error(warning.message);
    },
  };

  /** @type {RollupOptions} */
  const rollupSlimOpts = {
    ...rollupOpts,
    external: [/^@noble\/hashes(\/.+)?$/],
  };

  /** @type {RollupOptions} */
  const rollupMinOpts = {
    ...rollupOpts,
    plugins: [rollupOpts.plugins, t(terser)(terserOpts)],
  };

  /** @type {RollupOptions} */
  const rollupSlimMinOpts = {
    ...rollupMinOpts,
    external: [/^@noble\/hashes(\/.+)?$/],
  };

  /** @type {RollupOptions} */
  const rollupNodeOpts = {
    plugins: [
      t(replace)(replaceOpts),
      t(virtual)({
        "@noble/hashes/hmac.js": mock("hmac"),
        "@noble/hashes/legacy.js": mock("sha1"),
        "@noble/hashes/sha2.js": mock("sha224", "sha256", "sha384", "sha512"),
        "@noble/hashes/sha3.js": mock("sha3_224", "sha3_256", "sha3_384", "sha3_512"),
      }),
      t(resolve)(),
      t(swc)(swcOpts),
    ],
    onwarn: (warning) => {
      throw new Error(warning.message);
    },
  };

  /** @type {RollupOptions} */
  const rollupNodeMinOpts = {
    ...rollupNodeOpts,
    plugins: [rollupNodeOpts.plugins, t(terser)(terserNodeOpts)],
  };

  /** @type {OutputOptions} */
  const outputOpts = {
    name: "OTPAuth",
    exports: "named",
    banner: banner,
  };

  /** @type {OutputOptions} */
  const outputMinOpts = {
    ...outputOpts,
    sourcemap: true,
  };

  /** @type {OutputOptions} */
  const outputNodeOpts = {
    ...outputOpts,
    banner: bannerNode,
  };

  /** @type {OutputOptions} */
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
      ...rollupSlimOpts,
      input: "./src/index.js",
      output: [{ ...outputOpts, file: "./dist/otpauth.slim.esm.js", format: "es" }],
    },
    {
      ...rollupSlimMinOpts,
      input: "./src/index.js",
      output: [{ ...outputMinOpts, file: "./dist/otpauth.slim.esm.min.js", format: "es" }],
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
