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
  },
  'teamV2.list': {
    template: 'src/modules/teamV2/index.html',
    entry: './src/modules/teamV2/list.js',
  },
  'teamV2.edit': {
    entry: './src/modules/teamV2/edit.js',
    template: 'src/modules/teamV2/index.html'
  },
  'teamV2.detail': {
    entry: './src/modules/teamV2/detail.js',
    template: 'src/modules/teamV2/index.html'
  }
}