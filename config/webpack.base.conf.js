/** @author dongls */

const IS_PRODUCTION = process.env.NODE_ENV == 'production';

const util = require('./util')
const webpack = require('webpack');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
  mode: 'development',
  entry: {
    'system.frame': './src/modules/system/frame/index.js',
    'system.home': './src/modules/system/home/index.js'
  },
  output: {
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: file => (
          /node_modules/.test(file) &&
          !/\.vue\.js/.test(file)
        )
      },
      {
        test: /\.scss$/,
        use: [
          IS_PRODUCTION ? MiniCssExtractPlugin.loader : 'vue-style-loader',
          'css-loader',
          'postcss-loader',
          'sass-loader',
          util.genSassResourceLoader()
        ]
      },
      {
        test: /\.css$/,
        use: [
          IS_PRODUCTION ? MiniCssExtractPlugin.loader : 'vue-style-loader',
          'css-loader',
          'postcss-loader'
        ]
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin()
  ]
}