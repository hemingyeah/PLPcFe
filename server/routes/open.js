const KoaRouter = require('koa-router')
const HttpClient = require('../util/HttpClient')
const Template = require('../util/Template')

const router = new KoaRouter();
const modules = require('../../config/modules');

router.get('/v_open/dailyReport', async ctx => {
  let script = ['/open.dailyReport.js'];
  // let modConfig = modules['report.subscibe'];
  // let reqHeaders = ctx.request.headers;
  // let result = await HttpClient.request('/v2/report/subscibe', 'get', null, {headers: reqHeaders});
  // let body = result.body; ctx.body = Template.renderWithData('demo', {}, script)

  ctx.body = Template.renderWithData('订阅汇总信息每日通知日报', {}, script)
});

module.exports = router;