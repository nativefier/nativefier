import path from 'path';

const paths = {
  APP_SRC: 'app/src',
  APP_DEST: 'app/lib',
  CLI_SRC: 'src',
  CLI_DEST: 'lib',
  TEST_SRC: 'test',
  TEST_DEST: 'built-tests',
};

paths.APP_MAIN_JS = path.join(paths.APP_SRC, '/main.js');
paths.APP_ALL = `${paths.APP_SRC}/**/*`;
paths.APP_STATIC_ALL = `${path.join(paths.APP_SRC, 'static')}/**/*`;
paths.APP_STATIC_JS = `${path.join(paths.APP_SRC, 'static')}/**/*.js`;
paths.APP_STATIC_DEST = path.join(paths.APP_DEST, 'static');
paths.CLI_SRC_JS = `${paths.CLI_SRC}/**/*.js`;
paths.CLI_DEST_JS = `${paths.CLI_DEST}/**/*.js`;
paths.TEST_SRC_JS = `${paths.TEST_SRC}/**/*.js`;
paths.TEST_DEST_JS = `${paths.TEST_DEST}/**/*.js`;

export default paths;
