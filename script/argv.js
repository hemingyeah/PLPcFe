/** 
 * 解析来自命令行的参数
 * 示例： npm run build -- -user=dongls
 * 注意 -- 两侧存在空格 
 * 
 * --user, -u 用于名
 * --env, -e 运行环境
 * 
 * @author dongls 
 */
const minimist = require('minimist');

module.exports = function(argv){
  let args = minimist(argv);

  return {
    user: args.user || args.u,
    env: args.env || args.e,
    _: args._
  }
}