import gulp from 'gulp';
import webpack from 'webpack-stream';
import PATHS from './../helpers/src-paths';

const webpackConfig = require('./../../webpack.config.js');

gulp.task('build-app', ['build-static'], () => gulp.src(PATHS.APP_MAIN_JS)
        .pipe(webpack(webpackConfig))
        .pipe(gulp.dest(PATHS.APP_DEST)));
