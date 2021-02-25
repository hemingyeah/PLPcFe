const KoaRouter = require('koa-router')
const HttpClient = require('../util/HttpClient')
const Template = require('../util/Template')

const router = new KoaRouter();
const modules = require('../../modules');

// router.get('/abnormal/v2/list', async ctx => {
//   let script = ['/abnormal.list.js'];
//   let modConfig = modules['abnormal.list'];
//   let reqHeaders = ctx.request.headers;
//   let result = await HttpClient.request('/performance/v2/report', 'get', null, {headers: reqHeaders});
//   let body = result.body;
  
//   ctx.body = Template.renderWithHtml('工单异常统计报表', body, script, modConfig.template)
// });

router.get('/stats/abnormalList', async ctx => {
  let modConfig = modules['abnormal.list'];
  let script = ['/abnormal.list.js'];
  
  ctx.body = Template.renderWithData('工单异常统计报表', {}, script, modConfig.template)
});

module.exports = router;
