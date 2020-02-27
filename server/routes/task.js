const KoaRouter = require('koa-router')
const HttpClient = require('../util/HttpClient')
const Template = require('../util/Template')

const router = new KoaRouter();
const modules = require('../../modules');

// router.get('/task', async ctx => {
//   let script = ['/task.list.js'];
//   let modConfig = modules['task.list'];
//   let reqHeaders = ctx.request.headers;
//   let result = await HttpClient.request('/task', 'get', null, {headers: reqHeaders});
//   let body = result.body;
  
//   ctx.body = Template.renderWithHtml('工单列表', body, script, modConfig.template)
// });

router.get('/task/create', async ctx => {
  let modConfig = modules['task.edit'];
  let script = ['/task.edit.js'];

  ctx.body = Template.renderWithData('新建工单', {}, script, modConfig.template)
});

router.get('/task/receipt', async ctx => {
  let modConfig = modules['task.receipt'];
  let script = ['/task.receipt.js'];

  ctx.body = Template.renderWithData('表单回执', {}, script, modConfig.template)
});

router.get('/task/fields', async ctx => {
  let modConfig = modules['task.fields'];
  let script = ['/task.fields.js'];
  
  ctx.body = Template.renderWithData('工单设置', {}, script, modConfig.template)
});

module.exports = router;