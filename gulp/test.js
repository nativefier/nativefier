import gulp from 'gulp';
import runSequence from 'run-sequence';
import helpers from '../lib/helpers/helpers.js';

const { shellExec } = helpers;

gulp.task('prune', (done) => {
  shellExec('npm prune', true, done);
});

gulp.task('test', callback => runSequence('prune', 'mocha', callback));
