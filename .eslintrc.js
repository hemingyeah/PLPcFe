module.exports = {
  "env": {
    "browser": true,
    "commonjs": true,
    "es6": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",    
    //https://github.com/vuejs/eslint-plugin-vue
    "plugin:vue/strongly-recommended"
  ],
  
  "parserOptions": {
    "ecmaVersion": 6,
    "sourceType": "module",
    "parser": "babel-eslint"
  },
  "rules": {
    //Possible Errors
    "no-console": "off", //禁用 console.log

    //Best Practices
    "default-case": "error",
    "no-eval": "error",
    "no-empty-function": "error",
    "no-multi-str": "warn", //禁止使用多行字符串
    "no-unmodified-loop-condition": "error", //禁用一成不变的循环条件
    "no-unused-labels": "off",
    "no-self-compare": "error", //禁止变量自身比较

    //Variables
    "no-unused-vars": ["warn", { "vars": "local", "args": "none"}], //禁止出现未使用过的变量
    "no-use-before-define": ["error", {functions: false}], //禁止定义前使用

    //Stylistic Issues
    "indent": ["warn", 2],
    "brace-style": "warn", //一致的大括号风格
    "no-multi-spaces": "warn", //禁止使用多个空格
    "no-multiple-empty-lines": ["warn",{max: 3}], //禁止出现多行空行,
    "newline-per-chained-call": ["warn",{"ignoreChainWithDepth": 3}], //方法链中每个调用都有一个换行符
    "new-cap": "warn",
    "space-infix-ops": "warn", //要求操作符周围有空格
    "no-whitespace-before-property": "error", //禁止属性前有空白
    "max-nested-callbacks": ["warn", 5],
    "no-array-constructor": "error", //禁用 Array 构造函数

    //vue 
    "vue/html-self-closing": "off",
    "vue/max-attributes-per-line": "off",
    "vue/html-indent": "warn",
    "vue/mustache-interpolation-spacing": "off",
    "vue/name-property-casing": ["error", "kebab-case"],
    "vue/comment-directives": "off",
    "vue/require-default-prop": "off"
  },
  "overrides": [
    {
      "files": ["src/**/*"],
      "rules": {
        "no-console": ["warn", { allow: ["info", "warn", "error"] }] //禁用 console.log
      }  
    }
  ]
};