'use strict';

const path = require('path');

module.exports = function (config) {
	config.set({
		frameworks: ['mocha', 'chai'],
		files: [
			path.join(__dirname, process.env.IS_MINIFIED
				? 'dist/otpauth.min.js'
				: 'dist/otpauth.js'
			),
			path.join(__dirname, 'test/test.js')
		],
		reporters: ['dots'],
		singleRun: true,
		autoWatch: false,
		browsers: ['FirefoxHeadless', 'ChromeHeadless', 'PhantomJS'],
		plugins: [
			'karma-chai',
			'karma-chrome-launcher',
			'karma-firefox-launcher',
			'karma-mocha',
			'karma-phantomjs-launcher'
		]
	});
};
