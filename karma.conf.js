'use strict';

module.exports = function(config) {
	config.set({
		browsers: ['Chrome'],

		frameworks: ['mocha', 'chai', 'sinon'],

		files: [
			{
				pattern: 'test/**/*.js',
				watched: false,
				included: true,
				served: true
			}
		],

		plugins: [
			'karma-chai',
			'karma-chrome-launcher',
			'karma-mocha',
			'karma-sinon',
			'karma-webpack'
		],

		preprocessors: {
			'test/**/*.js': ['webpack']
		},

		webpack: {
			module: {
				rules: [{
					test: /\.js$/,
					exclude: /(node_modules)/,
					use: {
						loader: 'babel-loader',
						options: {
							compact: false,
							presets: ['env']
						}
					}
				}]
			}
		},

		singleRun: true
	});
};
