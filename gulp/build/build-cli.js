import gulp from 'gulp';
import PATHS from './../helpers/src-paths';
import helpers from './../helpers/gulp-helpers';

const { buildES6 } = helpers;

gulp.task('build-cli', done => buildES6(PATHS.CLI_SRC_JS, PATHS.CLI_DEST, done));
