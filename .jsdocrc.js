module.exports = {
	sourceType: 'module',
	source: {
		includePattern: '.+\\.js(doc|x)?$',
		excludePattern: '(^|\\/|\\\\)_'
	},
	recurseDepth: 10,
	tags: {
		allowUnknownTags: false,
		dictionaries: ['jsdoc', 'closure']
	},
	plugins: [
		'plugins/markdown'
	],
	templates: {
		cleverLinks: false,
		monospaceLinks: false,
		default: {
			outputSourceFiles: true
		}
	}
};
