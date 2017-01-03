#!/usr/bin/env node
// Custom build of the Stanford Javascript Crypto Library (SJCL)

'use strict';

const path = require('path');
const fs = require('fs');

const sjclTarget = path.join(__dirname, 'src/.sjcl.custom.js');
const sjclPath = path.join(__dirname, 'node_modules/sjcl');
const sjclSources = [
	'core/sjcl.js',
	'core/bitArray.js',
	'core/codecArrayBuffer.js',
	'core/sha1.js',
	'core/sha256.js',
	'core/sha512.js',
	'core/hmac.js',
	'core/exports.js'
];

const sjclFile = sjclSources.reduce(function(sjcl, file) {
	let source = fs.readFileSync(path.join(sjclPath, file), {'encoding': 'utf8'});
	source = `\n/* === ${file} === */\n${source}`;

	return sjcl + source;
}, '');

fs.writeFileSync(sjclTarget, sjclFile, {'encoding': 'utf8'});

