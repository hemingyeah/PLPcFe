const KoaRouter = require('koa-router');
const HttpClient = require('../util/HttpClient');
const Template = require('../util/Template')

const router = new KoaRouter();
const modules = require('../../modules');

// todo 改为实际地址
router.get('/approve/list', async ctx => {
  let script = ['/approve.list.js'];
  let modConfig = modules['approve.list'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/approve', 'get', null, { headers: reqHeaders });
  let body = result.body;

  ctx.body = Template.renderWithHtml('审批中心', body, script, modConfig.template);
})



module.exports = router;