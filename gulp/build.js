import gulp from 'gulp';
import del from 'del';
import runSequence from 'run-sequence';
import PATHS from './helpers/src-paths';

gulp.task('build', (callback) => {
  runSequence('clean', ['build-cli', 'build-app', 'build-tests'], callback);
});

gulp.task('clean', (callback) => {
  del(PATHS.CLI_DEST).then(() => {
    del(PATHS.APP_DEST).then(() => {
      del(PATHS.TEST_DEST).then(() => {
        callback();
      });
    });
  });
});
