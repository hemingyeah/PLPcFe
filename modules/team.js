module.exports = {
  'team.list': {
    template: 'src/modules/team/index.html',
    entry: './src/modules/team/list.js',
  },
  'team.edit': {
    entry: './src/modules/team/edit.js',
    template: 'src/modules/team/index.html'
  },
  'team.detail': {
    entry: './src/modules/team/detail.js',
    template: 'src/modules/team/index.html'
  }
}