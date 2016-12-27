'use strict';

var gulp = require('gulp');
var metal = require('gulp-metal');
var runSequence = require('run-sequence');
var webserver = require('gulp-webserver');

metal.registerTasks({
	bundleCssFileName: 'router.css',
	bundleFileName: 'router.js',
	mainBuildJsTasks: ['build:globals'],
	moduleName: 'metal-router'
});

gulp.task('webserver', function() {
	gulp.src('./')
		.pipe(webserver({
			open: 'http://localhost:8000/demos/index.html'
		}));
});

gulp.task('default', function(done) {
	runSequence('clean', ['build:globals', 'build:amd'], 'uglify', done);
});
