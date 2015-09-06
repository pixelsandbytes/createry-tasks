'use strict';

var gulp = require('gulp'),
    jscs = require('gulp-jscs'),
    jshint = require('gulp-jshint'),
    mocha = require('gulp-mocha');

gulp.task('codestyle', function() {
    return gulp.src(['./lib/**/*.js', './test/**/*.js'])
        .pipe(jscs());
});

gulp.task('lint', function() {
    return gulp.src(['./lib/**/*.js', './test/**/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(jshint.reporter('fail'));
});

gulp.task('critic', ['codestyle', 'lint']);

gulp.task('unit-tests', ['critic'], function() {
    return gulp.src('./test/**/*.js', { read: false })
        .pipe(mocha({
            bail: false,
            ignoreLeaks: false,
            reporter: 'spec',
            timeout: 3000,
            ui: 'bdd'
        }));
});

gulp.task('default', ['critic', 'unit-tests']);