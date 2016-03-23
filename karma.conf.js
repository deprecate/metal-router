'use strict';

var babelOptions = {
	presets: ['metal'],
	sourceMap: 'both'
};

module.exports = function (config) {
	config.set({
		frameworks: ['mocha', 'chai', 'sinon', 'source-map-support', 'commonjs'],

		files: [
			'node_modules/metal-soy-bundle/build/bundle.js',
			'node_modules/html2incdom/src/*.js',
			'node_modules/metal*/src/**/*.js',
			'node_modules/senna/src/**/*.js',
			'src/**/*.js',
			'test/**/*.js'
		],

		preprocessors: {
			'src/**/*.js': ['babel', 'commonjs'],
			'node_modules/html2incdom/src/*.js': ['babel', 'commonjs'],
			'node_modules/metal-soy-bundle/build/bundle.js': ['commonjs'],
			'node_modules/metal*/src/**/*.js': ['babel', 'commonjs'],
			'node_modules/senna/**/*.js': ['babel', 'commonjs'],
			'test/**/*.js': ['babel', 'commonjs']
		},

		browsers: ['Chrome'],

		babelPreprocessor: {options: babelOptions}
	});
};
