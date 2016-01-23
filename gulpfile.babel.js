import gulp from 'gulp';
import del from 'del';
import sourcemaps from 'gulp-sourcemaps';
import webpack from 'webpack-stream';
import babel from 'gulp-babel';
import watchify from 'watchify';
import runSequence from 'run-sequence';

gulp.task('default', ['build']);

gulp.task('build', callback => {
    runSequence('clean', ['build-cli', 'build-app'], callback);
});

gulp.task('build-app', ['build-static'], function () {
    return gulp.src('app/src/main.js')
        .pipe(webpack(require('./webpack.config.js')))
        .pipe(gulp.dest('app/lib'));
});

gulp.task('clean', callback => {
    del('lib').then(() => {
        del('app/lib').then(() => {
            callback();
        });
    });
});

gulp.task('build-cli', () => {
    return gulp.src("src/**/*.js")
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('lib'));
});

gulp.task('build-static', () => {
    // copy any html files in source/ to public/
    return gulp.src('app/src/static/**/*')
        .pipe(gulp.dest('app/lib/static/'));
});
