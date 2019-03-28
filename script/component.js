/** 
 * 构建外部组件库，用于兼容旧有页面, PC端改造完成后删除
 * @author dongls 
 */

process.env.NODE_ENV = 'production';

const argv = require('./argv')(process.argv.slice(2))
const user = argv.user || 'dongls';

const config = require(`./config/${ user }`);

const path = require('path');
const shell = require('shelljs');

const webpack = require('webpack')
const webpackConfig = require('../config/webpack.comp.conf');

// 编译
webpack(webpackConfig, function (err, stats) {
  if (err) throw err;

  process.stdout.write(`${stats.toString({
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false
  })} \n`);

  // 读取html生成 jsp
  copy();
});

function copy(){
  // 复制文件
  let distOriginPath = path.resolve(__dirname, '../dist/component');
  let distTargetPath = `${ config.targetRootPath }/shb-web/src/main/webapp/resource/component`;
  // let distTargetPath = '/Users/dongls/Desktop/work/sm4-pc/resource/component';
  // 复制静态资源
  shell.cp('-r', `${ distOriginPath }/*`, distTargetPath);

  console.log(`build on ${new Date().toLocaleString()}`)
}

