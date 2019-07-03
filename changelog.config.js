module.exports = {
  'disableEmoji': false,
  'list': [
    'feat',
    'fix',
    'refactor',
    'docs',
    'ci',
    'test',
    'style',
    'perf'
  ],
  'maxMessageLength': 64,
  'minMessageLength': 4,
  'questions': [
    'type',
    'scope',
    'subject',
    'body',
    'breaking',
    'issues',
  ],
  'scopes': [],
  'types': {
    'chore': {
      'description': '构建流程或辅助工具更改',
      'emoji': '🤖',
      'value': 'chore'
    },
    'ci': {
      'description': 'CI相关的变化',
      'emoji': '🎡',
      'value': 'ci'
    },
    'docs': {
      'description': '只更改文档',
      'emoji': '✏️',
      'value': 'docs'
    },
    'feat': {
      'description': '新功能',
      'emoji': '🎸',
      'value': 'feat'
    },
    'fix': {
      'description': '错误修复',
      'emoji': '🐛',
      'value': 'fix'
    },
    'perf': {
      'description': '代码更改可以提高性能',
      'emoji': '⚡️',
      'value': 'perf'
    },
    'refactor': {
      'description': '代码更改既不修复错误也不添加功能',
      'emoji': '💡',
      'value': 'refactor'
    },
    'release': {
      'description': '创建发布提交',
      'emoji': '🏹',
      'value': 'release'
    },
    'style': {
      'description': '标记，空白，格式化，缺少分号......',
      'emoji': '💄',
      'value': 'style'
    },
    'test': {
      'description': '添加测试',
      'emoji': '💍',
      'value': 'test'
    }
  }
};