import gulp from 'gulp';
import requireDir from 'require-dir';

requireDir('./gulp', {
  recurse: true,
  duplicates: true,
});

gulp.task('default', ['build']);
