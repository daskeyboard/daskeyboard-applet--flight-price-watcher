module.exports = {
    env: {
        es6: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
    ],
    globals: {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly",
    },
    parserOptions: {
        "ecmaVersion": 2018,
        "sourceType": "module",
    },
    "rules": {
        "max-len": [2, {"code": 100, "tabWidth": 4, "ignoreUrls": true}],
    },
};