import gulp from 'gulp';
import PATHS from './../helpers/src-paths';

import istanbul from 'gulp-istanbul';
import mocha from 'gulp-mocha';

gulp.task('mocha', ['build'], done => {
    gulp.src(PATHS.CLI_DEST_JS)
        .pipe(istanbul({includeUntested: true}))
        .on('finish', () => {
            return gulp.src(PATHS.TEST_DEST_JS, {read: false})
                .pipe(mocha())
                .pipe(istanbul.writeReports({
                    dir: './coverage',
                    reporters: ['lcov'],
                    reportOpts: {dir: './coverage'}
                }))
                .on('finish', () => {
                    done();
                });
        });
});
