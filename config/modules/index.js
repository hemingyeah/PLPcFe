/** 定义各个模块的配置，路径相对于项目根路径 @author dongls */

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

  // ------------ 客户 ------------
  "customer.list": {
    entry: './src/modules/customer/list/index.js'
  },
  "customer.edit": {
    entry: './src/modules/customer/edit/index.js',
    template: 'src/modules/customer/edit/index.html'
  }
}