const KoaRouter = require('koa-router')
const HttpClient = require('../util/HttpClient')
const Template = require('../util/Template')

const router = new KoaRouter();
const modules = require('../../modules');

// router.get('/setting/serviceStation/customerPortal', async ctx => {
//   let script = ['/linkc.setting.js'];
//   let modConfig = modules['linkc.setting'];
//   let reqHeaders = ctx.request.headers;
//   let result = await HttpClient.request('/linkc/setting', 'get', null, {
//     headers: reqHeaders
//   });
//   let body = result.body;
//   ctx.body = Template.renderWithHtml('自助门户设置', body, script, modConfig.template)
// });
router.get('/linkc/goods', async ctx => {
  let script = ['/linkc.goods.js'];
  let modConfig = modules['linkc.goods'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/linkc/goods', 'get', null, {
    headers: reqHeaders
  });
  let body = result.body;
  ctx.body = Template.renderWithHtml('商品设置', body, script, modConfig.template)
});
router.get('/linkc/order/list', async ctx => {
  let script = ['/linkc.order.list.js'];
  let modConfig = modules['linkc.order.list'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/linkc/order/list', 'get', null, {
    headers: reqHeaders
  });
  let body = result.body;
  ctx.body = Template.renderWithHtml('订单管理', body, script, modConfig.template)
});
router.get('/linkc/order/detail', async ctx => {
  let script = ['/linkc.order.detail.js'];
  let modConfig = modules['linkc.order.detail'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/linkc/order/detail', 'get', null, {
    headers: reqHeaders
  });
  let body = result.body;
  ctx.body = Template.renderWithHtml('订单详情', body, script, modConfig.template)
});

module.exports = router;