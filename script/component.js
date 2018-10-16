/** 
 * 构建外部组件库，用于兼容旧有页面, PC端改造完成后删除
 * 示例： npm run build -- dongls
 * 这里会读取名为dongls的配置文件，根据配置构建  注意-- 和 dongls 之间存在空格 
 * @author dongls 
 */
process.env.NODE_ENV = 'production';

const user = process.argv.splice(2)[0] || 'dongls'
const config = require('./config/' + user);

const path = require('path');
const shell = require('shelljs');

const webpack = require('webpack')
const webpackConfig = require('../config/webpack.comp.conf');

//编译
webpack(webpackConfig, function (err, stats) {
  if (err) throw err;

  process.stdout.write(stats.toString({
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false
  }) + '\n');

  //读取html生成jsp
  copy(path.resolve(__dirname, '../dist'));
});

function copy(directory){
  //复制文件
  let distOriginPath = path.resolve(__dirname, '../dist/component');
  let distTargetPath = config.targetRootPath + '/shb-web/src/main/webapp/resource/component';
  //复制静态资源
  shell.cp('-r', distOriginPath + '/*', distTargetPath);

  console.log(`build on ${new Date().toLocaleString()}`)
}

