const path = require('path');
const modules = require('../modules')

//https://github.com/jantimon/html-webpack-plugin
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  /** 生成sass-resources-loader */
  genSassResourceLoader(){
    return {
      loader: 'sass-resources-loader',
      options: {
        resources: [
          path.resolve(__dirname, '../src/assets/scss/_variables.scss'), 
          path.resolve(__dirname, '../src/assets/scss/_mixins.scss')
        ]
      }
    }
  },
  
  /** 根据各个模块的配置生成entry */
  genEntry(){
    let entry = {};
    for(let name in modules){
      //为支持热更新，必须为数组
      if(!Array.isArray(entry[name])) entry[name] = [];
      entry[name].push(modules[name].entry) ;
    }
    return entry;
  },
  /** 根据各个模块的配置生成HtmlPlugin, 构建生产环境资源时用 */
  genHtmlPlugins(){
    return Object.keys(modules).map(modName => {
      let mod = modules[modName];
      let chunks = ['vendors', "common", modName];
      
      if(mod.exclude) chunks = chunks.filter(item => mod.exclude.indexOf(item) < 0);
    
      return new HtmlWebpackPlugin({
        filename: modName + '.html',
        template: mod.template ? mod.template : 'src/index.html',
        inject: true,
        chunks: chunks,
        chunksSortMode: "manual",
        minify: { //压缩html
          collapseWhitespace: true,
          useShortDoctype: true
        }
      }); 
    })
  }
}