/** 定义各个模块的配置，路径相对于项目根路径 @author dongls */
const setting = require('./setting')
const team = require('./team')
const product = require('./product')
const performance = require('./performance')
const customer = require('./customer')

module.exports = {
  'system.frame': {
    entry: './src/modules/system/frame/index.js',
    template: 'src/modules/system/frame/index.html'
  },
  'system.home': {
    entry: './src/modules/system/home/index.js'
  },
  'system.demo': {
    entry: './src/modules/system/demo/index.js'
  },
  'open.dailyReport': {
    entry: './src/modules/open/DailyReport/index.js',
    exclude: ['common']
  },
  ...setting,
  ...team,
  ...product,
  ...performance,
  ...customer,
}