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

router.get('/task/edit', async ctx => {
  let modConfig = modules['task.edit'];
  let reqHeaders = ctx.request.headers;
  let script = ['/task.edit.js'];

  let url = '/task/edit';
  let result = await HttpClient.request(url, 'get', null, {headers: reqHeaders});
  let body = result.body;
  
  ctx.body = Template.renderWithHtml('编辑工单', body, script, modConfig.template)

}).get('/task/edit/:id', async ctx => {
  let modConfig = modules['task.edit'];
  let reqHeaders = ctx.request.headers;
  let script = ['/task.edit.js'];

  let url = `/task/edit/${ctx.params.id}`;
  let result = await HttpClient.request(url, 'get', null, {headers: reqHeaders});
  let body = result.body;
  
  ctx.body = Template.renderWithHtml('编辑工单', body, script, modConfig.template)
});

router.get('/task/view/:id', async ctx => {
  let modConfig = modules['task.view'];
  let script = ['/task.view.js'];
  
  ctx.body = Template.renderWithHtml('工单详情', {}, script, modConfig.template)
});

router.get('/task/receipt', async ctx => {
  let modConfig = modules['task.receipt'];
  let script = ['/task.receipt.js'];

  ctx.body = Template.renderWithData('表单回执', {}, script, modConfig.template)
});

router.get('/task/receipt/view/:id', async ctx => {
  let modConfig = modules['task.receipt.view'];
  let script = ['/task.receipt.view.js'];
  
  ctx.body = Template.renderWithHtml('回执表单详情', {}, script, modConfig.template)
});

module.exports = router;