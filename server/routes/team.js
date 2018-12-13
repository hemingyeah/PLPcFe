const KoaRouter = require('koa-router')
const Template = require('../util/Template')

const router = new KoaRouter();

router.get('/team/manage', async ctx => {
  let script = ['/team.manage.js'];

  ctx.body = Template.renderWithData('团队管理', {}, script)
})


router.get('/team/create', async ctx => {
  let script = ['/team.create.js'];

  ctx.body = Template.renderWithData('新建团队', {}, script)
})

router.get('/team/detail', async ctx => {
  let script = ['/team.detail.js'];

  ctx.body = Template.renderWithData('团队详情', {}, script)
})

module.exports = router;