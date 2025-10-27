module.exports = {
	globDirectory: 'public/',
	globPatterns: [
		'**/*.{png,webp,css,ico,json,txt}'
	],
	swDest: 'public/assets/js/sw.js',
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	]
};