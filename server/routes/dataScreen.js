const KoaRouter = require('koa-router');
const HttpClient = require('../util/HttpClient');
const Template = require('../util/Template');

const router = new KoaRouter();
const modules = require('../../modules');

const DS_COOKIE = '1722c4ae-7d17-4112-b446-3b67db5ac679';
const WEB_URI = '47.97.91.2';
const MONGO_URI = '47.98.255.79';
const PAGE_REDIRECT_URI = 'http://47.97.91.2:8080';

/**
 * 转跳地址
 */
router.get('/data-screen', async ctx => {
  let script = ['/dataScreen.frame.js'];
  let modConfig = modules['dataScreen.frame'];
  let reqHeaders = ctx.request.headers;
  
  reqHeaders.cookie = `VIPPUBLINKJSESSIONID=${DS_COOKIE}`;

  let result = await HttpClient.request(`${PAGE_REDIRECT_URI}/stats/screenData/screenDataView`, 'get', null, { headers: reqHeaders });

  console.log('-----------------')
  console.log(result);
  console.log('-----------------')

  let body = result.body;
  // let body = {};

  ctx.body = Template.renderWithHtml('数据大屏', body, script, modConfig.template);
});


router.use('/outside/*', ctx => HttpClient.proxy(ctx, {
  host: MONGO_URI,
  port: 10002,
  headers: {
    'cookie': `VIPPUBLINKJSESSIONID=${DS_COOKIE}`
  },
}))

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