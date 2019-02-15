const KoaRouter = require('koa-router')
const HttpClient = require('../util/HttpClient')
const Template = require('../util/Template')

const router = new KoaRouter();
const modules = require('../../config/modules');

router.get('/performance_v2', async ctx => {
  let script = ['/performance.list.js'];
  let modConfig = modules['performance.list'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/customer', 'get', null, {headers: reqHeaders});
  let body = result.body;
  
  ctx.body = Template.renderWithHtml('绩效管理', body, script, modConfig.template)
});

module.exports = router;
