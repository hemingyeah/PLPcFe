const KoaRouter = require('koa-router');
const Template = require('../util/Template');
const HttpClient = require('../util/HttpClient')

const modules = require('../../modules');
const router = new KoaRouter();

router.get('/department/view', async ctx => {
  let modConfig = modules['department.view'];
  let reqHeaders = ctx.request.headers;
  let script = ['/department.view.js'];
  let result = await HttpClient.request('/department/view', 'get', null, { headers: reqHeaders });
  let body = result.body;

  ctx.body = Template.renderWithHtml('组织架构', body, script, modConfig.template)
})

module.exports = router;