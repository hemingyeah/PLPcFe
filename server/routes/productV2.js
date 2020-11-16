const KoaRouter = require('koa-router')
const HttpClient = require('../util/HttpClient')
const Template = require('../util/Template')

const router = new KoaRouter();
const modules = require('../../modules');
router.get('/productV2/productMenu/edit', async ctx => {
  let script = ['/productV2.productMenu.index.js'];
  let modConfig = modules['productV2.productMenu.index'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/productV2/productMenu/edit', 'get', null, {
    headers: reqHeaders
  });
  let body = result.body;
  ctx.body = Template.renderWithHtml('新增产品目录', body, script, modConfig.template)
});
router.get('/productV2/productMenu/list', async ctx => {
  let script = ['/productV2.productMenu.list.js'];
  let modConfig = modules['productV2.productMenu.list'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/productV2/productMenu/list', 'get', null, {
    headers: reqHeaders
  });
  let body = result.body;
  ctx.body = Template.renderWithHtml('产品目录列表', body, script, modConfig.template)
});

router.get('/productV2/list', async ctx => {
  let script = ['/productV2.list.js'];
  let modConfig = modules['productV2.list'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/productV2/list', 'get', null, {
    headers: reqHeaders
  });
  let body = result.body;
  ctx.body = Template.renderWithHtml('产品列表', body, script, modConfig.template)
});
module.exports = router;