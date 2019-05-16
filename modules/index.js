/** 
 * 定义各个模块的配置，路径相对于项目根路径 
 * 
 * 模块对象参数如下:
 * entry - 入口
 * template - 模板
 * exclude - 排除的chunk
 * 
 * @author dongls
 */
const modules = require('../config/modules')

module.exports = {
  'window': {
    entry: './src/component/common/BaseWindow/demo.js'
  },
  ...modules
}