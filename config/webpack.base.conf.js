/** @author dongls */

const IS_PRODUCTION = process.env.NODE_ENV == 'production';
const path = require('path')

const util = require('./util')
const entry = require('./entry')

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
  mode: 'development',
  entry: entry,
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
      },

      { //处理字体,gif
        test: /\.(eot|svg|ttf|woff|woff2)(\?\S*)?$/,
        loader: 'file-loader',
        exclude: path.resolve(__dirname, '../src/assets/svg'),
        options: IS_PRODUCTION ? {
          name:'font/[name].[hash:8].[ext]'
        } : undefined
      },
      {
        test: /\.(png|jpe?g)(\?.*)?$/,
        loader: 'url-loader',
        options: IS_PRODUCTION ? {
          limit: 4096,
          path:'',
          name: 'img/[name.[hash:8].[ext]',
        } : undefined
      },
      { //gif单独处理
        test: /\.(gif)(\?.*)?$/,
        loader: 'file-loader',
        options: IS_PRODUCTION ? {
          path:'',
          name: 'img/[name].[hash:8].[ext]',
        } : undefined
      },
      { //svg图像，所有svg都需要放入该目录下，负责会被当做字体处理
        test: /\.(svg)(\?.*)?$/,
        include: path.resolve(__dirname, '../src/assets/svg'),
        loader: 'url-loader',
        options: IS_PRODUCTION ? {
          limit: 4096,
          path:'',
          name: 'svg/[name].[hash:8].[ext]',
        } : undefined
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin()
  ]
}