const KoaRouter = require('koa-router')
const HttpClient = require('../util/HttpClient')
const Template = require('../util/Template')

const router = new KoaRouter();
const modules = require('../../modules');

router.get('/doMyself', async ctx => {
  let script = ['/doMyself.home.js'];
  let modConfig = modules['doMyself.home'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request(`/doMyself/${ctx.params.type}`, 'get', null, {headers: reqHeaders});
  let body = result.body;
  
  ctx.body = Template.renderWithHtml('微信公众号设置', body, script, modConfig.template)
});

module.exports = router;
