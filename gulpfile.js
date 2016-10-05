'use strict';

var gulp = require('gulp');
var metal = require('gulp-metal');
var runSequence = require('run-sequence');

metal.registerTasks({
	bundleCssFileName: 'router.css',
	bundleFileName: 'router.js',
	mainBuildJsTasks: ['build:globals'],
	moduleName: 'metal-router'
});

gulp.task('default', function(done) {
	runSequence('clean', ['build:globals', 'build:amd'], 'uglify', done);
});
