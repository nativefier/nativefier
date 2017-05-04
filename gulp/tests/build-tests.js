import gulp from 'gulp';
import PATHS from './../helpers/src-paths';
import helpers from './../helpers/gulp-helpers';

const { buildES6 } = helpers;

gulp.task('build-tests', done => buildES6(PATHS.TEST_SRC_JS, PATHS.TEST_DEST, done));
