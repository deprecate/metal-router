'use strict';

var metal = require('gulp-metal');

metal.registerTasks({
	bundleCssFileName: 'router.css',
	bundleFileName: 'router.js',
	mainBuildJsTasks: ['build:globals'],
	moduleName: 'metal-router'
});
