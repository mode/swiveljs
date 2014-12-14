var gulp = require('gulp');
var watch = require('gulp-watch');
var clean = require('gulp-clean');
var mocha = require('gulp-mocha');
var concat = require('gulp-continuous-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var filesize = require('gulp-filesize');
var connect = require('gulp-connect');

var distDir = 'dist';

gulp.task('connect', function() {
  return connect.server({
    port: 9095,
    livereload: true
  });
});

gulp.task('build', function() {
  return gulp.src('src/**/*.js')
    .pipe(gulp.dest(distDir))
    .pipe(filesize())
    .pipe(connect.reload());
});

gulp.task('test', function () {
  return gulp.src('test/*.js', {read: false})
    .pipe(mocha({reporter: 'nyan'}));
});

gulp.task('build:watch', function() {
  return gulp.watch(['src/**/*.js'], ['build']);
});

gulp.task('test:watch', function () {
  return gulp.watch(['src/**/*.js, test/**/*.js'], ['test']);
});

gulp.task('clean', function () {
  return gulp.src(distDir, {read: false})
  .pipe(clean());
});

gulp.task('default', ['connect', 'build:watch']);
