/** webpack 开发环境配置  @author dongls */
const path = require('path')
const webpack = require('webpack')

const merge = require('webpack-merge');
const baseConfig = require('./webpack.base.conf')

module.exports = merge(baseConfig, {
  resolve: {
    alias: {
      'app.config': path.resolve(__dirname, '../src/config/development.js'),
    }
  },
  // plugins: [
  //   /**
  //    * 1. 使用运行Webpack ProfilingPlugin。
  //    * 2. 转到Chrome，打开DevTools，然后转到Performance选项卡（以前为Timeline）。
  //    * 3. 将生成的文件（profileEvents.json）拖放到分析器中。然后它将显示时间轴统计信息和每个插件的调用！ 
  //   */
  //   new webpack.debug.ProfilingPlugin({
  //     outputPath: path.join(__dirname, '../profiling/profileEvents.json')
  //   })
  // ],
})