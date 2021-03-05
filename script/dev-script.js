const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function start(script) {
  execSync(script, {stdio: 'inherit'});
}

// 兼容”npm run dev -- -env=xx -user=xx“的写法
const argv = require('./argv')(process.argv.slice(2));
let user = argv.user || argv.u;
let env = argv.env || argv.e;
if(argv.user && argv.env){
  return start(`npm run serve -- -env=${env} -user=${user}`)
}

function readFileList(path_, filesList) {
  let files = fs.readdirSync(path_);
  files.forEach(function (itm, index) {
    let stat = fs.statSync(path_ + itm);
    if (stat.isDirectory()) {
      // 递归读取文件
      readFileList(`${path_ + itm }/`, filesList)
    } else {
  
      let obj = {};// 定义一个对象存放文件的路径和名字
      obj.path = path_;// 路径
      obj.filename = itm// 名字
      filesList.push(obj);
    }
  })
}

let getFiles = {
  // 获取文件夹下的所有文件
  getFileList (path_) {
    let userPath = path.resolve(__dirname, path_)
    console.log(userPath, 'userPath')
    let filesList = [];
    readFileList(`${userPath }/`, filesList);
    return filesList;
  }
};

let fileArr = getFiles.getFileList('./config');
fileArr = fileArr.map(item => {
  return item.filename.split('.')[0]
});
  
const ENV_MAP = {
  '本地环境': 'local',
  '测试环境': 'test',
  '预发环境': 'pre',
	'预发环境2': 'pre2',
	'多端': 'pre_mul',
  '生产环境': 'prod'
}

const DEV_QUESTIONS = [
  {
    type: 'list',
    name: 'env',
    message: '请选择启动环境',
    choices: Object.keys(ENV_MAP)
  },
  {
    type: 'list',
    name: 'user',
    message: '请选择启动用户(请确保选择的用户配置文件中有对应启动环境的配置)',
    choices: fileArr || ['huangbc']
  }
];
  
inquirer.prompt(DEV_QUESTIONS).then(result => {
  let env = result.env || result.e;
  if (env == '本地环境') {
    return start('npm run serve', result.user);
  }

  let user = result.user || result.u;
  let envVal = ENV_MAP[result.env];
  start(`npm run serve -- -env=${envVal} -user=${user}`)
});