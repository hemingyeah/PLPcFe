/** 构建生产环境资源 @author dongls */
process.env.NODE_ENV = 'production';

const fs = require('fs');
const path = require('path');

const webpack = require('webpack')
const webpackConfig = require('../config/webpack.prod.conf');

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
  //genJSP(path.resolve(__dirname, '../dist'), 'index.html');
  //拷贝至目标目录
});

function genJSP(directory, fileName){
  let jspName = fileName.substring(0, fileName.lastIndexOf('.')) + ".jsp";
  let fullPath = path.resolve(directory, jspName);

  //1.读取html
  let templateBuffer = fs.readFileSync(path.resolve(directory, fileName));
  let template = templateBuffer.toString();
  
  //2.生成jsp内容
  //#{} => ${}
  template = template.replace(/#\{(.*)\}/g, "${$1}");
  //注入jsp头部信息
  template = '<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>\n' + template;

  //3.写入文件
  fs.writeFileSync(fullPath, template);
}