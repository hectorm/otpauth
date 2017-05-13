'use strict';

const path = require('path');

module.exports = function (config) {
	config.set({
		'frameworks': ['mocha', 'chai'],
		'files': [
			path.join(__dirname, 'lib/otpauth.js'),
			path.join(__dirname, 'test/test.js')
		],
		'reporters': ['dots'],
		'singleRun': true,
		'autoWatch': false,
		'browsers': ['ChromeHeadless', 'PhantomJS'],
		'plugins': [
			'karma-chai',
			'karma-mocha',
			'karma-chrome-launcher',
			'karma-phantomjs-launcher'
		]
	});
};
