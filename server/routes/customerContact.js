const KoaRouter = require('koa-router')
const HttpClient = require('../util/HttpClient')
const Template = require('../util/Template')

const router = new KoaRouter();
const modules = require('../../modules');

router.get('/customerContact', async ctx => {
  let script = ['/customerContact.home.js'];
  let modConfig = modules['customerContact.home'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request(`/customerContact/${ctx.params.type}`, 'get', null, {headers: reqHeaders});
  let body = result.body;
  
  ctx.body = Template.renderWithHtml('客户联系人', body, script, modConfig.template)
});

module.exports = router;
