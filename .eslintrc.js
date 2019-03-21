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
    "indent": ["error", 2], // 两空格缩进
    "brace-style": "error", // 一致的大括号风格, 将else 放在与if块的右括号相同的行上
    "no-multi-spaces": "warn", //禁止使用多个空格
    "no-multiple-empty-lines": ["warn",{max: 3}], //禁止出现多行空行,
    "newline-per-chained-call": ["warn",{"ignoreChainWithDepth": 3}], //方法链中每个调用都有一个换行符
    "new-cap": "error",
    "space-infix-ops": "error", //要求操作符周围有空格
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
    "vue/require-default-prop": "off",
    "vue/singleline-html-element-content-newline": "off",

    //spec
    "no-var": "error", // 禁止使用 var 变量
    "object-shorthand": ["warn", "always"], // 在对象中 方法属性使用简写
    // "no-return-assign": "warn", // 禁止在return中 使用赋值运算符
    "no-const-assign": "error", // 禁止修改 const
    "no-dupe-class-members": "error", // 禁止在类中使用重复的名称
    // "prefer-destructuring": ["error", { "object": true, "array": false }], // 对象解构
    "quotes": ["error", "single"], // 要求字符串尽可能使用单引号
    "prefer-template": "error", // 字符串使用模板文字
    "no-duplicate-imports": ["error", { "includeExports": true }], // 仅从 一个路径导入
    // "first": "error", // 将所有导入语句放在非导入语句之上
    "operator-linebreak": ["warn", "none", {
      "overrides": {
        "&&": "before",
        "||": "before",
        "++": "before",
        "+": "before",
        "-": "before",
        "--": "before",
        "*": "before",
        "/": "before",
        "?": "before",
        ":": "before",
        "`": "before",
      }
    }
    ], // 在赋值中 避免在 = 之前之后换行
    "no-case-declarations": "error", // 将子句包装在块中
    "no-unneeded-ternary": "warn", // 避免不必要的三元表达式
    "no-mixed-operators": "error", // 混合运算时，请将表达式 包含在括号中
    "no-else-return": "error", // if return 语句
    "spaced-comment": ["warn", "always"], // 注释之前 跟一个空格
    "comma-spacing": ["error", { "before": false, "after": true }], // 逗号间距
    "computed-property-spacing": ["error", "never"], // 禁止属性内的空格
    "no-param-reassign": 1, // 不要改变参数
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