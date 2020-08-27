/** @author dongls */

const IS_PRODUCTION = process.env.NODE_ENV == 'production';
const path = require('path')

const util = require('./util')

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
  mode: 'development',
  entry: util.genEntry(),
  output: {
    publicPath: '/'
  },
  module: {
    rules: [{
      test: /\.vue$/,
      loader: 'vue-loader'
    },
    {
      test: /\.tsx?$/,
      exclude: /node_modules/,
      use: [{
        loader: 'babel-loader',
      },
      {
        loader: 'ts-loader',
        options: {
          appendTsSuffixTo: [/\.vue$/],
        }
      }
      ],
    },
    {
      test: /\.m?js$/,
      loader: 'babel-loader',
      exclude: /node_modules/
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

    { // 处理字体,gif
      test: /\.(eot|svg|ttf|woff|woff2)(\?\S*)?$/,
      loader: 'file-loader',
      exclude: path.resolve(__dirname, '../src/assets/svg'),
      options: IS_PRODUCTION ? {
        name: 'font/[name].[hash:8].[ext]'
      } : undefined
    },
    {
      test: /\.(png|jpe?g)(\?.*)?$/,
      loader: 'url-loader',
      options: IS_PRODUCTION ? {
        limit: 4096,
        path: '',
        name: 'img/[name].[hash:8].[ext]',
      } : undefined
    },
    { // gif单独处理
      test: /\.(gif)(\?.*)?$/,
      loader: 'file-loader',
      options: IS_PRODUCTION ? {
        path: '',
        name: 'img/[name].[hash:8].[ext]',
      } : undefined
    },
    { // svg图像，所有svg都需要放入该目录下，负责会被当做字体处理
      test: /\.(svg)(\?.*)?$/,
      include: path.resolve(__dirname, '../src/assets/svg'),
      loader: 'url-loader',
      options: IS_PRODUCTION ? {
        limit: 4096,
        path: '',
        name: 'svg/[name].[hash:8].[ext]',
      } : undefined
    }
    ]
  },
  plugins: [
    new VueLoaderPlugin()
  ],

  resolve: {
    extensions: ['.js', '.json', '.vue', '.scss', '.css', '.ts'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@src': path.join(__dirname, '../src'),
      '@model': path.join(__dirname, '../model'),
      '@service': path.join(__dirname, '../service'),
      'src': path.join(__dirname, '../src'),
      'packages': path.join(__dirname, '../packages'),
      'element-scss': path.join(__dirname, '../node_modules/element-ui/packages/theme-chalk/src')
    }
  },
  externals: {
    jQuery: 'jQuery'
  },
  performance: {
    maxEntrypointSize: 2097152
  },
  devtool: IS_PRODUCTION ? 'nosources-source-map' : 'eval',
}