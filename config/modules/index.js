/** TODO: 待迁移 */

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
  'system.demo': {
    entry: './src/modules/system/demo/index.js'
  },

  // ------------ 客户 ------------
  'customer.list': {
    entry: './src/modules/customer/list/index.js',
    template: 'src/modules/customer/list/index.html'
  },
  'customer.edit': {
    entry: './src/modules/customer/edit/index.js',
    template: 'src/modules/customer/edit/index.html'
  },
  'customer.view': {
    entry: './src/modules/customer/view/index.js',
    template: 'src/modules/customer/view/index.html'
  },
  'customer.edit.modal': {
    entry: './src/modules/customer/editForModal/index.js',
    template: 'src/modules/customer/editForModal/index.html'
  },
  
  // ------------ 绩效 ------------
  "performance.list": {
    entry: './src/modules/performance/ListIndex.ts'
    // template: 'src/modules/performance/list/index.html'
  },
  "performance.report": {
    entry: './src/modules/performance/PerformanceReportIndex.ts'
    // template: 'src/modules/performance/list/index.html'
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
}