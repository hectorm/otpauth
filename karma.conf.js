
const path = require('path');

module.exports = config => {
	config.set({
		frameworks: ['mocha', 'chai'],
		files: [
			path.join(__dirname, process.env.IS_MINIFIED
				? 'dist/otpauth.umd.min.js'
				: 'dist/otpauth.umd.js'),
			path.join(__dirname, 'test/test.js')
		],
		reporters: ['dots'],
		singleRun: true,
		autoWatch: false,
		browsers: ['FirefoxHeadless', 'ChromeHeadless'],
		plugins: [
			'karma-chai',
			'karma-chrome-launcher',
			'karma-firefox-launcher',
			'karma-mocha'
		]
	});
};
