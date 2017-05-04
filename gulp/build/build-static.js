import gulp from 'gulp';
import PATHS from './../helpers/src-paths';
import helpers from './../helpers/gulp-helpers';

const { buildES6 } = helpers;

gulp.task('build-static-not-js', () => gulp.src([PATHS.APP_STATIC_ALL, '!**/*.js'])
        .pipe(gulp.dest(PATHS.APP_STATIC_DEST)));

gulp.task('build-static-js', done => buildES6(PATHS.APP_STATIC_JS, PATHS.APP_STATIC_DEST, done));

gulp.task('build-static', ['build-static-js', 'build-static-not-js']);
