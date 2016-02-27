import gulp from 'gulp';
import runSequence from 'run-sequence';

gulp.task('ci', callback => {
    return runSequence('test', 'lint', callback);
});
