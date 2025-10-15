module.exports = {
  env: {
    node: true,
    es6: true,
  },
  extends: [
    "eslint:recommended",
  ],
  rules: {
    "no-unused-vars": ["error", {"argsIgnorePattern": "^_"}],
    "no-case-declarations": "off",
    "max-len": "off",
    "quotes": "off",
  },
  globals: {
    "module": "readonly",
    "require": "readonly", 
    "exports": "readonly",
    "process": "readonly",
  },
};
