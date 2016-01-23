import gulp from 'gulp';
import del from 'del';
import sourcemaps from 'gulp-sourcemaps';
import webpack from 'webpack-stream';
import babel from 'gulp-babel';
import watchify from 'watchify';
import runSequence from 'run-sequence';

import path from 'path';

const PATHS = setUpPaths();

gulp.task('default', ['build']);

gulp.task('build', callback => {
    runSequence('clean', ['build-cli', 'build-app'], callback);
});

gulp.task('build-app', ['build-static'], () => {
    return gulp.src(PATHS.APP_MAIN_JS)
        .pipe(webpack(require(PATHS.WEBPACK_CONFIG)))
        .pipe(gulp.dest(PATHS.APP_DEST));
});

gulp.task('clean', callback => {
    del(PATHS.CLI_DEST).then(() => {
        del(PATHS.APP_DEST).then(() => {
            callback();
        });
    });
});

gulp.task('build-cli', done => {
    return gulp.src(PATHS.CLI_SRC_JS)
        .pipe(sourcemaps.init())
        .pipe(babel())
        .on('error', done)
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('lib'));
});

gulp.task('build-static', () => {
    // copy any html files in source/ to public/
    return gulp.src(PATHS.APP_STATIC_ALL)
        .pipe(gulp.dest(PATHS.APP_STATIC_DEST));
});

gulp.task('watch', ['build'], () => {
    var handleError = function (error) {
        console.error(error);
    };
    gulp.watch(PATHS.APP_ALL, ['build-app'])
        .on('error', handleError);

    gulp.watch(PATHS.CLI_SRC_JS, ['build-cli'])
        .on('error', handleError);
});

function setUpPaths() {
    const paths = {
        WEBPACK_CONFIG: './webpack.config.js',
        APP_SRC: 'app/src',
        APP_DEST: 'app/lib',
        CLI_SRC: 'src',
        CLI_DEST: 'lib'
    };

    paths.APP_MAIN_JS = path.join(paths.APP_SRC, '/main.js');
    paths.APP_ALL = paths.APP_SRC + '/**/*';
    paths.APP_STATIC_ALL = path.join(paths.APP_SRC, 'static') + '/**/*';
    paths.APP_STATIC_DEST = path.join(paths.APP_DEST, 'static');
    paths.CLI_SRC_JS = paths.CLI_SRC + '/**/*.js';

    return paths;
}
