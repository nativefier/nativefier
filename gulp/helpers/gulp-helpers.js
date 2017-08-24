import gulp from 'gulp';
import sourcemaps from 'gulp-sourcemaps';
import babel from 'gulp-babel';

function buildES6(src, dest, callback) {
  return gulp.src(src)
        .pipe(sourcemaps.init())
        .pipe(babel())
        .on('error', callback)
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(dest));
}

export default {
  buildES6,
};
