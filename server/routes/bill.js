const KoaRouter = require('koa-router')
const HttpClient = require('../util/HttpClient')
const Template = require('../util/Template')

const router = new KoaRouter();
const modules = require('../../modules');

router.get('/bill', async ctx => {
  let script = ['/bill.list.js'];
  let modConfig = modules['bill.list'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/bill', 'get', null, {headers: reqHeaders});
  let body = result.body;
  
  ctx.body = Template.renderWithHtml('在线支付管理', body, script, modConfig.template)
})

module.exports = router;