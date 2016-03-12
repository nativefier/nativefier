module.exports = {
    globals: {
        // mocha
        describe: false,
        it: false,
        before: false,
        beforeEach: false,
        after: false,
        afterEach: false
    },
    rules: {
        indent: [
            2,
            4,
            {SwitchCase: 1}
        ],
        quotes: [
            2,
            'single'
        ],
        'linebreak-style': [
            2,
            'unix'
        ],
        semi: [
            2,
            'always'
        ],
        'max-len': 0,
        'require-jsdoc': 0,
        'padded-blocks': 0,
        'no-throw-literal': 0,
        camelcase: 0,
        'valid-jsdoc': 0,
        'no-path-concat': 1,
        'quote-props': [2, 'as-needed'],
        'no-warning-comments': 1
    },
    env: {
        es6: true,
        browser: true,
        node: true
    },
    ecmaFeatures: {
        modules: true
    },
    extends: 'google'
};
