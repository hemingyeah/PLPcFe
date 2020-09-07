const setting = require('./setting')
const team = require('./team')
const product = require('./product')
const performance = require('./performance')
const customer = require('./customer')
const approve = require('./approve')
const repository = require('./repository')
const dataScreen = require('./dataScreen')
const bill = require('./bill')
const jobtransfer = require('./jobtransfer')
const callcenter = require('./callcenter')

const doMyself = require('./doMyself')
const customerContact = require('./customerContact')

const sparePart = require('./sparePart')
const myShop = require('./myShop')

/** 
 * 定义各个模块的配置，路径相对于项目根路径 
 * 
 * 模块对象参数如下:
 * entry - 入口
 * template - 模板
 * exclude - 排除的chunk
 */
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
  ...customer,
  ...approve,
  ...repository,
  ...dataScreen,
  ...bill,
  ...jobtransfer,
  ...callcenter,
  ...doMyself,
  ...customerContact,
  ...sparePart,
  ...myShop
}