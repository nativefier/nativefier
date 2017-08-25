import gulp from 'gulp';
import runSequence from 'run-sequence';
import helpers from './helpers/gulp-helpers';

const { shellExec } = helpers;

gulp.task('publish', (done) => {
  shellExec('npm publish', false, done);
});

gulp.task('release', callback => runSequence('build', 'publish', callback));
