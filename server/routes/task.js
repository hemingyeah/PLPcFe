const KoaRouter = require('koa-router')
const HttpClient = require('../util/HttpClient')
const Template = require('../util/Template')

const router = new KoaRouter();
const modules = require('../../modules');

router.get('/task/create', async ctx => {
  let modConfig = modules['task.edit'];
  let script = ['/task.edit.js'];
  
  ctx.body = Template.renderWithData('新建工单', {}, script, modConfig.template)
});

module.exports = router;