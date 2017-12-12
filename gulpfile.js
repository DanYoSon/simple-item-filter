var pump = require('pump');
const gulp = require('gulp');
const babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var filever = require('./gulp-version-filename.js'); //Until version 1.0.3 is pushed to NPM require it from a local file.
var rename = require("gulp-rename");
var exec = require('child_process').exec;
const del = require('del');
 
gulp.task('default', ['clean', 'babel', 'compress', 'docs']);

gulp.task('clean', function(){
     return del('dist/**', {force:true});
});

gulp.task('babel', ['clean'], function (cb) {
    pump([
    	gulp.src('src/*.js'),
        babel({
            presets: ['env']
        }),
        gulp.dest('dist'),
        filever(),
        gulp.dest('dist'),
    ], 
    cb);
});
 
gulp.task('compress', ['babel'], function (cb) {
  pump([
        gulp.src('dist/*.js'),
        uglify(),
        rename({ suffix: '.min' }),
        gulp.dest('dist')
    ],
    cb
  );
});

gulp.task('docs', ['clean'], function (cb) {
    exec('npm run docs', function (err, stdout, stderr) {
        cb(err);
    });
})