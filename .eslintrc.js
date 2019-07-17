module.exports = {
  env: {
    es6: true,
    node: true
  },
  extends: [
    'prettier',
    'standard'
  ],
  plugins: ['prettier'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  rules: {
    "prettier/prettier": "error",
    "space-before-function-paren": ["error", "never"],
    "camelcase": "off",
    "no-var": "error"
  }
}
