/** 
 * 构建生产环境资源 
 * 示例： npm run build -- dongls
 * 这里会读取名为dongls的配置文件，根据配置构建  注意-- 和 dongls 之间存在空格 
 * @author dongls 
 */
process.env.NODE_ENV = 'production';

const user = process.argv.splice(2)[0] || 'dongls'
const config = require('./config/' + user);

const fs = require('fs');
const path = require('path');
const shell = require('shelljs');

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
  genJSP(path.resolve(__dirname, '../dist'));
});

async function genJSP(directory){
  let files = fs.readdirSync(directory);
  //过滤html
  let htmls = files.filter(file => file.endsWith('.html'));

  //生成jsp
  let microTask = htmls.map(html => gen(directory, html));

  await Promise.all(microTask);

  //复制文件
  let distOriginPath = path.resolve(__dirname, '../dist');
  let distTargetPath = config.targetRootPath + '/src/main/webapp/resource/pc-fe';
  let jspTatgetPath = config.targetRootPath + '/src/main/webapp/WEB-INF/views/dist'
  
  //复制静态资源
  shell.rm('-rf', distTargetPath);
  shell.mkdir('-p', distTargetPath);
  shell.cp('-r', distOriginPath + '/*', distTargetPath);

  //复制jsp
  shell.rm('-rf', jspTatgetPath);
  shell.mkdir('-p', jspTatgetPath);
  shell.cp('-r', distOriginPath + '/jsp/*', jspTatgetPath);

  console.log(`build on ${new Date().toLocaleString()}`)
}

function gen(directory, fileName){
  return new Promise((resolve, reject) => {
    let jspName = fileName.substring(0, fileName.lastIndexOf('.')) + ".jsp";

    //1.读取html
    fs.readFile(path.resolve(directory, fileName), (err, data) => {
      if(err) reject(err)
      let template = data.toString();
  
      //2.生成jsp内容
      //#{} => ${}
      template = template.replace(/#\{(.*)\}/g, "${$1}");
      //注入jsp头部信息
      template = '<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>\n' + template;
      //注入构建信息
      template += `\n<!-- build on ${new Date().toLocaleString()}. -->`;
      
      let dirPath = path.resolve(directory, 'jsp');
      if(!existsSync(dirPath)) {
        fs.mkdirSync(dirPath)
      }
    
      //3.写入文件
      fs.writeFile(path.resolve(dirPath, jspName), template, () => {
        if(err) reject(err);
        resolve();
      });
    });
  });
}

function existsSync(path) {
  try{
    fs.accessSync(path,fs.F_OK);
  }catch(e){
    return false;
  }
  return true;
}