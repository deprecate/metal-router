var babelOptions = {
	presets: ['metal'],
	sourceMap: 'both'
};

module.exports = function (config) {
	config.set({
		frameworks: ['mocha', 'chai', 'sinon', 'source-map-support', 'commonjs'],

		files: [
			'bower_components/soyutils/soyutils.js',
			'bower_components/metal*/src/**/*.js',
			'bower_components/senna.js/src/**/*.js',
			'src/**/*.js',
			'test/**/*.js'
		],

		preprocessors: {
			'src/**/*.js': ['babel', 'commonjs'],
			'bower_components/metal*/**/*.js': ['babel', 'commonjs'],
			'bower_components/senna.js/**/*.js': ['babel', 'commonjs'],
			'test/**/*.js': ['babel', 'commonjs']
		},

		browsers: ['Chrome'],

		babelPreprocessor: {options: babelOptions}
	});
}
