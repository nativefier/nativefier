import gulp from 'gulp';
import del from 'del';
import sourcemaps from 'gulp-sourcemaps';
import webpack from 'webpack-stream';
import babel from 'gulp-babel';
import runSequence from 'run-sequence';
import path from 'path';
import eslint from 'gulp-eslint';
import mocha from 'gulp-mocha';
import istanbul from 'gulp-istanbul';
import shellJs from 'shelljs';

const PATHS = setUpPaths();

gulp.task('default', ['build']);

gulp.task('build', callback => {
    runSequence('clean', ['build-cli', 'build-app', 'build-tests'], callback);
});

gulp.task('build-app', ['build-static'], () => {
    return gulp.src(PATHS.APP_MAIN_JS)
        .pipe(webpack(require(PATHS.WEBPACK_CONFIG)))
        .pipe(gulp.dest(PATHS.APP_DEST));
});

gulp.task('clean', callback => {
    del(PATHS.CLI_DEST).then(() => {
        del(PATHS.APP_DEST).then(() => {
            del(PATHS.TEST_DEST).then(() => {
                callback();
            });
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

gulp.task('build-static', ['build-static-js', 'build-static-not-js']);

gulp.task('build-static-not-js', () => {
    return gulp.src([PATHS.APP_STATIC_ALL, '!**/*.js'])
        .pipe(gulp.dest(PATHS.APP_STATIC_DEST));
});

gulp.task('build-static-js', done => {
    return gulp.src(PATHS.APP_STATIC_JS)
        .pipe(sourcemaps.init())
        .pipe(babel())
        .on('error', done)
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(PATHS.APP_STATIC_DEST));
});

gulp.task('watch', ['build'], () => {
    var handleError = function(error) {
        console.error(error);
    };
    gulp.watch(PATHS.APP_ALL, ['build-app'])
        .on('error', handleError);

    gulp.watch(PATHS.CLI_SRC_JS, ['build-cli'])
        .on('error', handleError);

    gulp.watch(PATHS.TEST_SRC_JS, ['build-tests'])
        .on('error', handleError);
});

gulp.task('publish', done => {
    shellExec('npm publish', false, done);
});

gulp.task('release', callback => {
    return runSequence('test', 'lint', 'build', 'publish', callback);
});

gulp.task('lint', () => {
    return gulp.src(['**/*.js', '!node_modules/**', '!app/node_modules/**', '!app/lib/**', '!lib/**', '!built-tests/**', '!coverage/**'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('build-tests', done => {
    return gulp.src(PATHS.TEST_SRC_JS)
        .pipe(sourcemaps.init())
        .pipe(babel())
        .on('error', done)
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(PATHS.TEST_DEST));
});

gulp.task('prune', done => {
    shellExec('npm prune', true, done);
});

gulp.task('test', callback => {
    return runSequence('prune', 'mocha', callback);
});

gulp.task('mocha', ['build'], () => {
    return gulp.src(PATHS.CLI_DEST_JS)
        .pipe(istanbul({includeUntested: true}))
        .on('finish', () => {
            return gulp.src(PATHS.TEST_DEST_JS, {read: false})
                .pipe(mocha())
                .pipe(istanbul.writeReports({
                    dir: './coverage',
                    reporters: ['lcov'],
                    reportOpts: {dir: './coverage'}
                }));
        });
});

gulp.task('ci', callback => {
    return runSequence('test', 'lint', callback);
});

function setUpPaths() {
    const paths = {
        WEBPACK_CONFIG: './webpack.config.js',
        APP_SRC: 'app/src',
        APP_DEST: 'app/lib',
        CLI_SRC: 'src',
        CLI_DEST: 'lib',
        TEST_SRC: 'test',
        TEST_DEST: 'built-tests'
    };

    paths.APP_MAIN_JS = path.join(paths.APP_SRC, '/main.js');
    paths.APP_ALL = paths.APP_SRC + '/**/*';
    paths.APP_STATIC_ALL = path.join(paths.APP_SRC, 'static') + '/**/*';
    paths.APP_STATIC_JS = path.join(paths.APP_SRC, 'static') + '/**/*.js';
    paths.APP_STATIC_DEST = path.join(paths.APP_DEST, 'static');
    paths.CLI_SRC_JS = paths.CLI_SRC + '/**/*.js';
    paths.CLI_DEST_JS = paths.CLI_DEST + '/**/*.js';
    paths.TEST_SRC_JS = paths.TEST_SRC + '/**/*.js';
    paths.TEST_DEST_JS = paths.TEST_DEST + '/**/*.js';

    return paths;
}

function shellExec(cmd, silent, callback) {
    shellJs.exec(cmd, {silent: silent}, (code, stdout, stderr) => {
        if (code) {
            callback(JSON.stringify({code, stdout, stderr}));
            return;
        }
        callback();
    });
}

