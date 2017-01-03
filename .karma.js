'use strict';

module.exports = function (config) {
	config.set({
		'frameworks': ['mocha', 'chai'],
		'files': [
			__dirname + '/lib/otpauth.js',
			__dirname + '/test/test.js'
		],
		'reporters': ['dots'],
		'singleRun': true,
		'autoWatch': false,
		'browsers': ['PhantomJS'],
		'plugins': [
			'karma-mocha',
			'karma-chai',
			'karma-phantomjs-launcher'
		]
	});
};

