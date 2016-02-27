import gulp from 'gulp';
import PATHS from './../helpers/src-paths';

import babel from 'gulp-babel';
import sourcemaps from 'gulp-sourcemaps';

gulp.task('build-static-not-js', () => {
    return gulp.src([PATHS.APP_STATIC_ALL, '!**/*.js'])
        .pipe(gulp.dest(PATHS.APP_STATIC_DEST));
});

gulp.task('build-static-js', done => {
    return gulp.src(PATHS.APP_STATIC_JS)
        .pipe(sourcemaps.init())
        .pipe(babel())
        .on('error', done)
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(PATHS.APP_STATIC_DEST));
});

gulp.task('build-static', ['build-static-js', 'build-static-not-js']);
