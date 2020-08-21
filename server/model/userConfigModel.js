const ENVS = ['test', 'pre', 'prod', 'pre2'];
const SCRIPT_PATH = '../../script';

// 当前用户的配置
const argv = require(`${SCRIPT_PATH}/argv`)(process.argv.slice(2))
const user = argv.user || 'default';
// 售后宝环境
const SHB_ENV = argv.env && ENVS.includes(argv.env) ? argv.env : '';
// 用户配置
const USER_CONFIG = require(`${SCRIPT_PATH}/config/${user}`);
// 当前登录用户
const LOGIN_USER = USER_CONFIG.loginUser || {};

module.exports = {
  argv,
  user,
  SHB_ENV,
  USER_CONFIG,
  LOGIN_USER
}


