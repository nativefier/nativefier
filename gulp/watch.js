import gulp from 'gulp';
import PATHS from './helpers/src-paths';

const log = require('loglevel');

gulp.task('watch', ['build'], () => {
  const handleError = function watch(error) {
    log.error(error);
  };
  gulp.watch(PATHS.APP_ALL, ['build-app'])
    .on('error', handleError);

  gulp.watch(PATHS.CLI_SRC_JS, ['build-cli'])
    .on('error', handleError);

  gulp.watch(PATHS.TEST_SRC_JS, ['build-tests'])
    .on('error', handleError);
});
