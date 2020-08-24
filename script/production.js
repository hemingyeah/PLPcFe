/** 
 * 构建生产环境资源 
 * 示例： npm run build -- dongls
 * 这里会读取名为dongls的配置文件，根据配置构建  注意-- 和 dongls 之间存在空格 
 * @author dongls 
 */
process.env.NODE_ENV = 'production';

const argv = require('./argv')(process.argv.slice(2))
const user = argv.user || 'dongls';
// const config = require(`./config/${user}`);

const fs = require('fs');
const path = require('path');
const shell = require('shelljs');

const webpack = require('webpack')
const webpackConfig = require('../config/webpack.prod.conf');
function searchWeb(path_) {
  let files = fs.readdirSync(path_);
  let haveWeb = {
    have: false,
    url: ''
  };
  files.forEach(function (itm, index) {
    // 兼容阿里云
    if (itm == 'web' || itm.indexOf('web') > -1) {
      haveWeb.have = true
      haveWeb.url = path_ + itm
    }
  })
  return haveWeb

}

let userPath = path.resolve(__dirname, '../../')
let searchResult = searchWeb(`${userPath }/`);
// if (searchResult.have == false) {
//   return console.log('未找到同级文件中的web文件夹，打包失败')
// }
// const ROOT_PATH = searchResult.url;
const ROOT_PATH = "/Users/MAC/Desktop/test/web";

// const ROOT_PATH = config.targetRootPath;
const monitorScript = '<script>!(function(c,i,e,b){var h=i.createElement("script");var f=i.getElementsByTagName("script")[0];h.type="text/javascript";h.defer=true;h.crossorigin=true;h.onload=function(){c[b]||(c[b]=new c.wpkReporter({bid:window.location.host=="app.shb.ltd"||window.location.href.indexOf("dingtalk")>-1?"dta_2_3144":"dta_2_3397"}));c[b].installAll()};f.parentNode.insertBefore(h,f);h.src=e})(window,document,"https://g.alicdn.com/woodpeckerx/jssdk??wpkReporter.js","__wpk");</script>'

// 编译
webpack(webpackConfig, function (err, stats) {
  if (err) throw err;

  // eslint-disable-next-line prefer-template
  process.stdout.write(stats.toString({
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false
  }) + '\n');

  // 读取html生成 jsp
  genJSP(path.resolve(__dirname, '../dist'));
  // 复制静态资源
  copyResource()
});

function copyResource(){
  let targetPath = `${ROOT_PATH}/shb-web/src/main/webapp/resource/pc-fe-static`;
  let originPath = path.resolve(__dirname, '../public/resource/pc-fe-static');

  shell.rm('-rf', targetPath);
  shell.mkdir('-p', targetPath);
  shell.cp('-r', `${originPath}/*`, targetPath);
  console.log(`copy resource => ${targetPath}`)
}

async function genJSP(directory){
  let files = fs.readdirSync(directory);
  // 过滤html
  let htmls = files.filter(file => file.endsWith('.html'));

  // 生成jsp
  let microTask = htmls.map(html => gen(directory, html));

  await Promise.all(microTask);

  // 复制文件
  let distOriginPath = path.resolve(__dirname, '../dist');
  let distTargetPath = `${ROOT_PATH}/shb-web/src/main/webapp/resource/pc-fe`;
  let jspTargetPath = `${ROOT_PATH}/shb-web/src/main/webapp/WEB-INF/views/dist`;

  // 复制jsp
  shell.rm('-rf', jspTargetPath);
  shell.mkdir('-p', jspTargetPath);
  shell.cp('-r', `${distOriginPath}/jsp/*`, jspTargetPath);
  // 清空jsp
  shell.rm('-rf', `${distOriginPath}/jsp`);
  
  // 复制静态资源
  shell.rm('-rf', distTargetPath);
  shell.mkdir('-p', distTargetPath);
  shell.cp('-r', `${distOriginPath}/*`, distTargetPath);

  console.log(`build on ${new Date().toLocaleString()}`)
}

function gen(directory, fileName){
  return new Promise((resolve, reject) => {
    let jspName = `${fileName.substring(0, fileName.lastIndexOf('.'))}.jsp`;

    // 1.读取html
    fs.readFile(path.resolve(directory, fileName), (err, data) => {
      if(err) reject(err)
      let template = data.toString();
  
      // 2.生成jsp内容
      // #{} => ${}
      template = template.replace(/#\{(.*?)\}/g, '${$1}');
      // 注入jsp头部信息
      template = `<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>\n${template}`;
      // 注入构建信息
      // template += `\n<!-- build on ${new Date().toLocaleString()}. -->`;
      // 注入监控脚本
      template = template.replace('</head>', `${monitorScript}</head>`);
      
      let dirPath = path.resolve(directory, 'jsp');
      if(!existsSync(dirPath)) {
        fs.mkdirSync(dirPath)
      }
    
      // 3.写入文件
      fs.writeFile(path.resolve(dirPath, jspName), template, () => {
        if(err) reject(err);
        resolve();
      });
    });
  });
}

function existsSync(path) {
  try{
    fs.accessSync(path, fs.F_OK);
  }catch(e){
    return false;
  }
  return true;
}