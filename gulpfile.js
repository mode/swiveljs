var gulp = require('gulp');
var watch = require('gulp-watch');
var clean = require('gulp-clean');
var mocha = require('gulp-mocha');
var concat = require('gulp-continuous-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var filesize = require('gulp-filesize');

var distDir = 'dist';

gulp.task('clean', function () {
  return gulp.src(distDir, {read: false})
  .pipe(clean());
});

gulp.task('build', function() {
  return gulp.src('src/**/*.js')
    .pipe(gulp.dest(distDir))
    .pipe(filesize());
});

gulp.task('build:watch', function() {
  return gulp.src('src/**/*.js')
    .pipe(watch('src/**/*.js'))
    .pipe(concat('swivel.all.js'))
    .pipe(gulp.dest(distDir))
    .pipe(filesize());
});

gulp.task('test', function () {
  return gulp.src('test/*.js', {read: false})
    .pipe(mocha({reporter: 'nyan'}));
});

gulp.task('default', ['build:watch']);
