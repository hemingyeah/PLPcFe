const KoaRouter = require('koa-router')
const HttpClient = require('../util/HttpClient')
const Template = require('../util/Template')

const router = new KoaRouter();
const modules = require('../../config/modules');

router.get('/customer', async ctx => {
  let script = ['/customer.list.js'];
  let modConfig = modules['customer.list'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/v2/customer/jump', 'get', null, {headers: reqHeaders});
  let body = result.body;
  console.log('body', body);

  ctx.body = Template.renderWithHtml('客户管理', body, script, modConfig.template)
});

router.get('/customer/create', async ctx => {
  let modConfig = modules['customer.edit'];
  let reqHeaders = ctx.request.headers;
  let script = ['/customer.edit.js'];
  let result = await HttpClient.request('/v2/customer/create', 'get', null, {headers: reqHeaders});
  let body = result.body;
  ctx.body = Template.renderWithHtml('新建客户', body, script, modConfig.template)
});

module.exports = router;