const KoaRouter = require('koa-router');
const Template = require('../util/Template');

const modules = require('../../config/modules');
const router = new KoaRouter();

router.get('/security/tag', async ctx => {
  let script = ['/team.list.js'];

  ctx.body = Template.renderWithData('团队列表', {}, script)
})


router.get('/security/tag/createTag', async ctx => {
  let script = ['/team.create.js'];
  let modConfig = modules['team.create'];

  ctx.body = Template.renderWithData('新建团队', {}, script, modConfig.template)
})

router.get('/security/tag/createChildrenTag', async ctx => {
  let script = ['/team.create.js'];

  ctx.body = Template.renderWithData('新建子团队', {}, script)
});

router.get('/security/tag/editTag', async ctx => {
  let script = ['/team.create.js'];

  ctx.body = Template.renderWithData('编辑团队', {}, script)
})

router.get('/security/tag/editChildrenTag', async ctx => {
  let script = ['/team.create.js'];

  ctx.body = Template.renderWithData('编辑子团队', {}, script)
});

router.get('/security/tag/view', async ctx => {
  let script = ['/team.detail.js'];
  let modConfig = modules['team.detail'];
  
  ctx.body = Template.renderWithHtml('团队详情', {}, script, modConfig.template)
})

module.exports = router;