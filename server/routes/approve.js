const KoaRouter = require('koa-router');
const HttpClient = require('../util/HttpClient');
const Template = require('../util/Template')

const router = new KoaRouter();
const modules = require('../../modules');

router.get('/approve/list2', async ctx => {
  let script = ['/approve.list.js'];
  let modConfig = modules['approve.list'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/approve/list', 'get', null, { headers: reqHeaders });
  let body = result.body;

  ctx.body = Template.renderWithHtml('审批中心', body, script, modConfig.template);
})


module.exports = router;