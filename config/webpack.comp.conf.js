/** webpack生产环境配置 @author dongls */

const path = require('path');

const merge = require('webpack-merge');
const baseConfig = require('./webpack.base.conf')

// https://github.com/webpack-contrib/mini-css-extract-plugin
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
// https://www.npmjs.com/package/webpack-bundle-analyzer
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

let config = merge(baseConfig, {
  mode: 'production',
  output: {
    publicPath: '/resource/component/',
    path: path.resolve(__dirname, '../dist/component'),
    filename: '[name].js',
    library: 'pc_components',
    libraryTarget: 'umd'
  },
  resolve: {
    alias: {
      'app.config': path.resolve(__dirname, '../src/config/production.js'),
    }
  },
  plugins: [
    new CleanWebpackPlugin(['dist/component'], {
      root: path.join(__dirname, '..')
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
    }),
    new OptimizeCSSPlugin(),
    new LodashModuleReplacementPlugin()
  ],
  externals: {
    vue: 'Vue'
  }
});

config.entry = {
  'component_v2': './src/exports/component.js',
  'component_v2_pc': './src/exports/component_pc.js'
}

module.exports = config;