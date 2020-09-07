const KoaRouter = require('koa-router')
const HttpClient = require('../util/HttpClient')
const Template = require('../util/Template')

const router = new KoaRouter();
const modules = require('../../modules');

router.get('/myShop/setting', async ctx => {
  let script = ['/myShop.setting.js'];
  let modConfig = modules['myShop.setting'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/myShop/setting', 'get', null, {
    headers: reqHeaders
  });
  let body = result.body;
  ctx.body = Template.renderWithHtml('门户设置', body, script, modConfig.template)
});
router.get('/myShop/goods', async ctx => {
  let script = ['/myShop.goods.js'];
  let modConfig = modules['myShop.goods'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/myShop/goods', 'get', null, {
    headers: reqHeaders
  });
  let body = result.body;
  ctx.body = Template.renderWithHtml('商品设置', body, script, modConfig.template)
});
router.get('/myShop/order/list', async ctx => {
  let script = ['/myShop.order.list.js'];
  let modConfig = modules['myShop.order.list'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/myShop/order/list', 'get', null, {
    headers: reqHeaders
  });
  let body = result.body;
  ctx.body = Template.renderWithHtml('订单管理', body, script, modConfig.template)
});
router.get('/myShop/order/detail', async ctx => {
  let script = ['/myShop.order.detail.js'];
  let modConfig = modules['myShop.order.detail'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/myShop/order/detail', 'get', null, {
    headers: reqHeaders
  });
  let body = result.body;
  ctx.body = Template.renderWithHtml('订单详情', body, script, modConfig.template)
});

module.exports = router;