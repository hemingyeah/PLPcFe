const KoaRouter = require('koa-router');
const HttpClient = require('../util/HttpClient');
const Template = require('../util/Template');

const router = new KoaRouter();
const modules = require('../../modules');

/**
 * 转跳地址
 */
router.get('/data-screen', async ctx => {
  let script = ['/dataScreen.frame.js'];
  let modConfig = modules['dataScreen.frame'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/stats/screenData/screenDataView', 'get', null, { headers: reqHeaders });
  let body = result.body;

  ctx.body = Template.renderWithHtml('数据大屏', body, script, modConfig.template);
});



router.use('/setting/screen/save', ctx => HttpClient.proxy(ctx, {
  host: WEB_URI,
  port: 8080,
  headers: {
    'cookie': `VIPPUBLINKJSESSIONID=${DS_COOKIE}`
  },
}))

router.use('/getOpenWebCode', ctx => HttpClient.proxy(ctx, {
  host: WEB_URI,
  port: 8080,
  headers: {
    'cookie': `VIPPUBLINKJSESSIONID=${DS_COOKIE}`
  },
}))


router.use('/stats/screenData/*', ctx => HttpClient.proxy(ctx, {
  host: WEB_URI,
  port: 8080,
  headers: {
    'cookie': `VIPPUBLINKJSESSIONID=${DS_COOKIE}`
  },
}))

module.exports = router;