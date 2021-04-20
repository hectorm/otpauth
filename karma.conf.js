process.env.CHROME_BIN = require('playwright-chromium').chromium.executablePath();
process.env.FIREFOX_BIN = require('playwright-firefox').firefox.executablePath();

module.exports = (config) => {
	config.set({
		frameworks: ['mocha'],
		files: [
			require.resolve('chai/chai.js'),
			process.env.IS_MINIFIED === 'true'
				? './dist/otpauth.umd.min.js'
				: './dist/otpauth.umd.js',
			'./test/test.js',
		],
		reporters: ['dots'],
		singleRun: true,
		autoWatch: false,
		browsers: ['FirefoxHeadless', 'ChromeHeadless'],
		plugins: [
			'karma-chrome-launcher',
			'karma-firefox-launcher',
			'karma-mocha',
		],
	});
};
