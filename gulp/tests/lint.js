import gulp from 'gulp';
import eslint from 'gulp-eslint';

gulp.task('lint', () => {
    return gulp.src(['**/*.js', '!node_modules/**', '!app/node_modules/**', '!app/lib/**', '!lib/**', '!built-tests/**', '!coverage/**'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});
