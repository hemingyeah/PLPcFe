const presets = [
  ["@babel/env", {useBuiltIns: "usage"}]
];

const plugins = [
  '@babel/plugin-syntax-dynamic-import',
  '@babel/plugin-proposal-object-rest-spread',
  "@babel/plugin-proposal-class-properties",
  "@babel/plugin-syntax-jsx",
  "transform-vue-jsx",
  'lodash',
  ["@babel/plugin-proposal-decorators", { 
    "legacy": true 
  }],
  ["component", {
    "libraryName": "element-ui",
    "styleLibraryName": "theme-chalk"
  }]
]

module.exports = {presets, plugins};