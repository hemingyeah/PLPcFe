const presets = [
  ['@babel/env', {
    corejs: '3',  
    useBuiltIns: 'usage'
  }]
];

const plugins = [
  '@babel/plugin-syntax-dynamic-import',
  '@babel/plugin-proposal-object-rest-spread',
  '@babel/plugin-proposal-class-properties',
  '@babel/plugin-syntax-jsx',
  'transform-vue-jsx',
  '@babel/plugin-proposal-optional-chaining',
  'lodash', ['@babel/plugin-proposal-decorators', {
    'legacy': true
  }],
  ['component', {
    'libraryName': 'shb-element-ui',
    'styleLibraryName': 'theme-chalk'
  }]
]

module.exports = { presets, plugins };