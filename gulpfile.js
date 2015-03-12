var gulp = require('gulp');
var watch = require('gulp-watch');
var clean = require('gulp-clean');
var mocha = require('gulp-mocha');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var filesize = require('gulp-filesize');
var connect = require('gulp-connect');
var istanbul = require('gulp-istanbul');
var coveralls = require('gulp-coveralls');

var dist     = 'dist';
var examples = 'examples';

gulp.task('connect', function() {
  return connect.server({
    port: 9095,
    root: examples
  });
});

gulp.task('build', function() {
  return gulp.src('src/**/*.js')
    .pipe(concat('swivel.js'))
    .pipe(gulp.dest(dist))
    .pipe(filesize())
    .pipe(gulp.dest(examples));
});

gulp.task('build:min', function() {
  gulp.src('src/**/*.js')
    .pipe(concat('swivel.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(dist))
    .pipe(filesize())
    .pipe(gulp.dest(examples));
});

gulp.task('clean', function () {
  return gulp.src(dist, {read: false})
    .pipe(clean());
});

gulp.task('test', function (cb) {
  gulp.src(['./dist/swivel.js'])
    .pipe(istanbul()) // Covering files
    .pipe(istanbul.hookRequire()) // Force `require` to return covered files
    .on('finish', function () {
      gulp.src(['test/*.js'])
        .pipe(mocha({reporter: 'nyan'}))
        .pipe(istanbul.writeReports()) // Creating the reports after tests runned
        .on('end', cb);
    });
});

gulp.task('test:travis', function (cb) {
  gulp.src(['./dist/swivel.js'])
    .pipe(istanbul()) // Covering files
    .pipe(istanbul.hookRequire()) // Force `require` to return covered files
    .on('finish', function () {
      gulp.src(['test/*.js'])
        .pipe(mocha({reporter: 'nyan'}))
        .pipe(istanbul.writeReports()) // Creating the reports after tests runned
        .on('end', cb);
      gulp.src(['coverage/lcov-report/lcov.info'])
        .pipe(coveralls());
    });
});

gulp.task('build:watch', function() {
  return gulp.watch(['src/**/*.js'], ['build']);
});

gulp.task('test:watch', function () {
  return gulp.watch(['src/**/*.js', 'test/**/*.js'], ['build', 'test']);
});

gulp.task('default', ['connect', 'build:watch']);
