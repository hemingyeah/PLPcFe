/** webpack生产环境配置 @author dongls */

const path = require('path');

const merge = require('webpack-merge');
const baseConfig = require('./webpack.base.conf')

//https://github.com/webpack-contrib/mini-css-extract-plugin
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')

module.exports = merge(baseConfig, {
  mode: 'production',
  output: {
    publicPath: '/',
    filename: '[name].[chunkhash:8].js',
    chunkFilename: 'chunks/[name].[chunkhash:8].js'
  },
  optimization: {
    
  },
  plugins: [
    new CleanWebpackPlugin(['dist'], {
      root: path.join(__dirname,'..')
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].[chunkhash:8].css',
      chunkFilename: 'css/[name].[chunkhash:8].css'
    }),
    new OptimizeCSSPlugin(),
  ]
});