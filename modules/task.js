module.exports = {
  // 'task.list': {
  //   template: 'src/modules/task/list/index.html',
  //   entry: './src/modules/task/list/index.js'
  // },
  'task.edit': {
    entry: './src/modules/task/edit.js',
    template: 'src/templates/map.html'
  },
  'task.receipt': {
    entry: './src/modules/task/receipt.js',
    template: 'src/templates/map.html'
  },
  'task.fields': {
    entry: './src/modules/setting/task/fields.js',
  }

}