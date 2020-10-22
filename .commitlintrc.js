module.exports = {
	extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['anno', 'build', 'ci', 'chore', 'docs', 'feat', 'fix', 'merge', 'perf', 'refactor', 'revert', 'style', 'test']
    ]
  }
}