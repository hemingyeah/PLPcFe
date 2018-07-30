/** webpack 开发环境配置  @author dongls */
const path = require('path')

const merge = require('webpack-merge');
const baseConfig = require('./webpack.base.conf')

module.exports = merge(baseConfig, {
  resolve: {
    alias: {
      'app.config': path.resolve(__dirname,'../src/config/development.js'),
    }
  }
})