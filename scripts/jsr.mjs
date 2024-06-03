#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import url from "node:url";

import { format, resolveConfig } from "prettier";

const __dirname = url.fileURLToPath(path.dirname(import.meta.url));

const pkgPath = path.join(__dirname, "../package.json");
const pkgSpec = JSON.parse(await fs.readFile(pkgPath, "utf8"));

const jsrPath = path.join(__dirname, "../jsr.json");
const jsrSpec = {
  name: "@hectorm/otpauth",
  version: pkgSpec.version,
  exports: {
    ".": pkgSpec.exports["."].default,
  },
  publish: {
    include: ["./*.md", pkgSpec.exports["."].default, pkgSpec.exports["."].types.import],
  },
};

const prettierOpts = (await resolveConfig(__dirname)) ?? {};
prettierOpts.parser = "json";

await fs.writeFile(jsrPath, await format(JSON.stringify(jsrSpec, null, 2), prettierOpts));
