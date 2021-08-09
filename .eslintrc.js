module.exports = {
  "root": true,
  "env": {
    "es6": true,
    "node": true
  },
  "extends": [
    "plugin:@typescript-eslint/recommended-requiring-type-checking", // *1
    "eslint-config-gev", // https://github.com/SrBrahma/eslint-config-gev-gev
  ],
  "globals": {
    "Atomics": "readonly",
    "SharedArrayBuffer": "readonly"
  },
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "tsconfigRootDir": __dirname, // *1
    "project": ['./tsconfig.lint.json'], // *1
    "ecmaVersion": 12,
    "sourceType": "module"
  },
  "plugins": ["@typescript-eslint"],
  "ignorePatterns": [
    "/lib/**/*", // Ignore built files.
    "/dist/**/*",
    "/.eslintrc.js" // Ignore itself
  ],
  "rules": {
  }
}

// [*1]: Optional but improves the linting for Typescript:
// https://github.com/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/linting/TYPED_LINTING.md#getting-started---linting-with-type-information