const { getESLintConfig } = require("@iceworks/spec");

module.exports = getESLintConfig("react-ts", {
  ignorePatterns: ["public/**/*"],
  plugins: ["prettier"],
  extends: ["plugin:prettier/recommended"],
  rules: {
    "prettier/prettier": "error",
  },
});
