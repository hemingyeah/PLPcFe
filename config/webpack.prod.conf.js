/** webpack生产环境配置 @author dongls */

const path = require('path');

const merge = require('webpack-merge');
const baseConfig = require('./webpack.base.conf')
const util = require('./util')


//https://github.com/webpack-contrib/mini-css-extract-plugin
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
//https://www.npmjs.com/package/webpack-bundle-analyzer
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = merge(baseConfig, {
  mode: 'production',
  output: {
    publicPath: '/resource/pc-fe/',
    filename: 'js/[name].[chunkhash:8].js',
    chunkFilename: 'chunks/[name].[chunkhash:8].js'
  },
  resolve: {
    alias: {
      'app.config': path.resolve(__dirname,'../src/config/production.js'),
    }
  },
  optimization: {
    //runtimeChunk: true
    splitChunks: {
      cacheGroups: {
        vendors: {
          name: 'vendors',
          test: /[\\/]node_modules[\\/]/,
          //https://github.com/webpack/webpack/blob/master/lib/optimize/SplitChunksPlugin.js#L283 
          // test(module, chunks){
          //   if(module.nameForCondition){
          //     let name = module.nameForCondition();
          //     console.log(name)
          //   }
          //   return false;
          // },
          priority: 1,
          chunks: 'all'
        }
      }
    }
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
    new LodashModuleReplacementPlugin(),
    ...util.genHtmlPlugins(),
    //new BundleAnalyzerPlugin()
  ]
});