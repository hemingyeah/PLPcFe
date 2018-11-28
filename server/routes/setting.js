const KoaRouter = require('koa-router')
const HttpClient = require('../util/HttpClient')
const Template = require('../util/Template')

const router = new KoaRouter();
const modules = require('../../config/modules');

router.get('/setting/customer/fields', async ctx => {
  let script = ['/setting.customer.fields.js'];
  let modConfig = modules['setting.customer.fields'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/setting/customer/fields', 'get', null, {headers: reqHeaders});
  let body = result.body;

  ctx.body = Template.renderWithHtml('客户设置', body, script, modConfig.template)
})

module.exports = router;