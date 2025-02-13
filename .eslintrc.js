module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:vue/vue3-recommended",
    "plugin:@typescript-eslint/recommended" // TypeScript ルールを適用
  ],
  parser: "vue-eslint-parser", // Vue ファイルを解析
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
    parser: "@typescript-eslint/parser", // TypeScript のパーサーを指定
    extraFileExtensions: [".vue"], // `.vue` ファイルをサポート
  },
  plugins: ["vue", "@typescript-eslint"],
  rules: {
    "@typescript-eslint/no-unused-vars": "warn", // TypeScript の未使用変数を警告
    "@typescript-eslint/no-explicit-any": "off", // `any` を許容
  },
  globals: {
    defineProps: "readonly",
    defineEmits: "readonly",
    defineExpose: "readonly",
    withDefaults: "readonly",
  },
};
