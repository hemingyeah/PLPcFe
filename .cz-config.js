module.exports = {
  // 类型
  types: [
    { value: 'anno',      name: 'anno:        增加注释' },
    { value: 'build',     name: 'build:       改变了build工具 如 webpack, 脚手架' },
    { value: 'ci',        name: 'ci:          持续集成新增' },
    { value: 'chore',     name: 'chore:       构建过程或辅助工具的变动或日常事务' },
    { value: 'docs',      name: 'docs:        文档改变' },
    { value: 'feat',      name: 'feat:        新功能' },
    { value: 'fix',       name: 'fix:         修复bug' },
    { value: 'merge',     name: 'merge:       git merge 合并操作' },
    { value: 'perf',      name: 'perf:        性能优化/提升性能' },
    { value: 'refactor',  name: 'refactor:    某个已有功能重构' },
    { value: 'revert',    name: 'revert:      撤销上一次的 commit' },
    { value: 'style',     name: 'style:       代码格式改变' },
    { value: 'test',      name: 'test:        增加测试' }
  ],
  // 模块范围
  scopes: [
    { name: '事件模块' },
    { name: '工单模块' },
    { name: '支付模块' },
    { name: '客户模块' },
    { name: '产品模块' },
    { name: '备件模块' },
    { name: '报表模块' },
    { name: '知识库模块' },
    { name: '信息公告模块' },
    { name: '角色管理模块' },
    { name: '权限管理模块' },
    { name: '团队模块' },
    { name: '设置模块' },
    { name: '自助门户模块' },
    { name: '组件' }
  ],
  // it needs to match the value for field type. Eg.: 'fix'
  /*
  scopeOverrides: {
    fix: [
      {name: 'merge'},
      {name: 'style'},
      {name: 'e2eTest'},
      {name: 'unitTest'}
    ]
  },
  */
  // override the messages, defaults are as follows
  messages: {
    type: '选择一种你的提交类型:',
    scope: '选择一个scope (可选):',
    // used if allowCustomScopes is true
    customScope: 'Denote the SCOPE of this change:',
    subject: '主题:\n',
    body: '详细说明，使用"|"换行(可选)：\n',
    breaking: '非兼容性说明或重要更改 (可选):\n',
    footer: '关联关闭的bug编号，例如：#31, #34(可选):\n',
    confirmCommit: '确定提交说明?'
  },
  // 允许自定义范围
  allowCustomScopes: true,
  allowBreakingChanges: ['特性', '修复'],
  // 内容长度显示
  subjectLimit: 100
}