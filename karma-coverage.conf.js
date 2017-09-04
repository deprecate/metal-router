'use strict';

var metalKarmaConfig = require('metal-karma-config/coverage');

module.exports = function (config) {
	metalKarmaConfig(config);
	config.files.push('node_modules/metal/src/**/*.js');
	config.files.push('node_modules/senna/src/**/*.js');
	config.preprocessors['node_modules/metal/src/**/*.js'] = ['babel', 'commonjs'];
	config.preprocessors['node_modules/senna/**/*.js'] = ['babel', 'commonjs'];
};
