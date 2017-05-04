import gulp from 'gulp';
import shellJs from 'shelljs';
import sourcemaps from 'gulp-sourcemaps';
import babel from 'gulp-babel';

function shellExec(cmd, silent, callback) {
  shellJs.exec(cmd, { silent }, (code, stdout, stderr) => {
    if (code) {
      callback(JSON.stringify({ code, stdout, stderr }));
      return;
    }
    callback();
  });
}

function buildES6(src, dest, callback) {
  return gulp.src(src)
        .pipe(sourcemaps.init())
        .pipe(babel())
        .on('error', callback)
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(dest));
}

export default {
  shellExec,
  buildES6,
};
