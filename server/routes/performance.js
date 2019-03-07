const KoaRouter = require('koa-router')
const HttpClient = require('../util/HttpClient')
const Template = require('../util/Template')

const router = new KoaRouter();
const modules = require('../../config/modules');

router.get('/setting/performance/v2/report', async ctx => {
  let script = ['/performance.list.js'];
  let modConfig = modules['performance.list'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/setting/performance/v2/report', 'get', null, {headers: reqHeaders});
  let body = result.body;
  
  ctx.body = Template.renderWithHtml('绩效报告', body, script, modConfig.template)
});

router.get('/setting/performance/v2/report/detail:id', async ctx => {
  
  // ctx.params.id
  let script = ['/performance.report.js'];
  let modConfig = modules['performance.report'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/setting/performance/v2/report', 'get', null, {headers: reqHeaders});
  let body = result.body;
  
  ctx.body = Template.renderWithHtml('绩效报告', body, script, modConfig.template)
});

module.exports = router;
