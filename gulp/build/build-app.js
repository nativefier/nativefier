import gulp from 'gulp';
import PATHS from './../helpers/src-paths';

import webpack from 'webpack-stream';

gulp.task('build-app', ['build-static'], () => {
    return gulp.src(PATHS.APP_MAIN_JS)
        .pipe(webpack(require('./../../webpack.config.js')))
        .pipe(gulp.dest(PATHS.APP_DEST));
});
