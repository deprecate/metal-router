var isparta = require('isparta');

var babelOptions = {
	presets: ['metal'],
	sourceMap: 'both'
};

module.exports = function (config) {
	config.set({
		frameworks: ['mocha', 'chai', 'sinon', 'source-map-support', 'commonjs'],

		files: [
			'node_modules/closure-templates/soyutils.js',
			'node_modules/metal*/src/**/*.js',
			'node_modules/senna/src/**/*.js',
			'src/**/*.js',
			'test/**/*.js'
		],

		preprocessors: {
			'src/**/!(*.soy).js': ['coverage', 'commonjs'],
			'src/**/*.soy.js': ['babel', 'commonjs'],
			'node_modules/metal*/**/*.js': ['babel', 'commonjs'],
			'node_modules/senna/**/*.js': ['babel', 'commonjs'],
			'test/**/*.js': ['babel', 'commonjs']
		},

		browsers: ['Chrome'],

		reporters: ['coverage', 'progress'],

		babelPreprocessor: {options: babelOptions},

		coverageReporter: {
			instrumenters: {isparta : isparta},
			instrumenter: {'**/*.js': 'isparta'},
			instrumenterOptions: {isparta: {babel: babelOptions}},
			reporters: [
				{type: 'lcov', subdir: 'lcov'},
				{type: 'text-summary'}
			]
		}
	});
}
