module.exports = {
  'task.edit': {
    entry: './src/modules/task/edit/index.js',
    template: 'src/templates/map.html'
  },
  'task.receipt': {
    entry: './src/modules/task/edit/receipt.js',
    template: 'src/templates/map.html'
  },
  'task.view': {
    entry: './src/modules/task/view/index.js',
    template: 'src/templates/map.html'
  },
  'task.receipt.view': {
    entry: './src/modules/task/view/receipt.js',
    template: 'src/templates/map.html'
  },
  // 工单列表
  'task.list': {
    entry: './src/modules/task/list/index.js',
    template: 'src/modules/task/index.html'
  }
}