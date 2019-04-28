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
const setting = require('./setting')
const team = require('./team')
const product = require('./product')
const performance = require('./performance')
const customer = require('./customer')

module.exports = {
  'window': {
    entry: './src/component/common/BaseWindow/demo.js'
  },
  'system.frame': {
    entry: './src/modules/system/frame/index.js',
    template: 'src/modules/system/frame/index.html'
  },
  'system.demo': {
    entry: './src/modules/system/demo/index.js'
  },
  
  // ------------ 订阅通知日报 ------------
  'open.dailyReport': {
    entry: './src/modules/open/DailyReport/index.js',
    exclude: ['common']
  },
  ...setting,
  ...team,
  ...product,
  ...performance,
  ...customer
}