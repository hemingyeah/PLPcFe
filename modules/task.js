module.exports = {
  // 'task.list': {
  //   template: 'src/modules/task/list/index.html',
  //   entry: './src/modules/task/list/index.js'
  // },
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
}