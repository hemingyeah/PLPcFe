/** development server @author dongls */

// 当前用户的配置
const argv = require('../../script/argv')(process.argv.slice(2))
const user = argv.user || 'dongls';
const USER_CONFIG = require(`../../script/config/${user}`);

const KoaRouter = require('koa-router')
const HttpClient = require('../util/HttpClient')
const HttpsClient = require('../util/HttpsClient')
const Template = require('../util/Template')

const modules = require('../../modules');
const router = new KoaRouter();

const customerRouter = require('./customer')
const openRouter = require('./open')
const settingRouter = require('./setting')
const teamRouter = require('./team')
const performanceRouter = require('./performance');
const productRouter = require('./product');
const approveRouter = require('./approve');

const repositoryPouter = require('./repository')

router.get('/', async ctx => {
  let modConfig = modules['system.frame'];
  let script = ['/system.frame.js'];
  let reqHeaders = ctx.request.headers;
  let headers = {};
  let body = null;

  let result = await HttpClient.request('/', 'get', null, {headers: reqHeaders});
  
  // 请求失败,模拟登陆
  if(!result.status){
    let mockUser = USER_CONFIG.loginUser;
    let userToken = 'dev_corpId';
    if(null != mockUser){
      userToken = `${mockUser.userId}_${mockUser.tenantId}`;
    }

    let loginRes = await HttpClient.request(`/dd/mockLogin?code=dev_code&corpId=${userToken}`, 'get', null);
    
    if(loginRes.status){
      let cookie = loginRes.headers['set-cookie'] || {};
      headers['set-cookie'] = cookie;
      reqHeaders['cookie'] = cookie[0];

      // 再次请求
      result = await HttpClient.request('/', 'get', null, {headers: reqHeaders});
    }else{
      console.log(loginRes)
    }
  }

  headers = Object.assign(headers, result.headers);
  body = result.body;

  // 补全headers
  for(let name in headers){
    ctx.response.set(name, headers[name])
  }

  // 返回html
  ctx.body = Template.renderWithHtml('售后宝', body, script, modConfig.template)
})

// router.get('/home', async ctx => {
//   let script = ['/system.home.js'];
//   ctx.body = Template.renderWithData('首页', {}, script)
// })

router.get('/demo', async ctx => {
  let script = ['/system.demo.js'];
  ctx.body = Template.renderWithData('demo', {}, script)
});

router.get('/performance/list', async ctx => {
  ctx.redirect('/performance/v2/report')
});

router.get('/window', async ctx => {
  let script = ['/window.js'];
  ctx.body = Template.renderWithData('window', {}, script)
});

// 审批列表 联调时临时使用
// /api/app/outside
// router.post('/outside/*', ctx => HttpClient.proxy(ctx, {
router.post('/approve/search', ctx => HttpClient.proxy(ctx, {
  host: '47.98.255.79',
  port: 10002
}))

router.use('', performanceRouter.routes());
router.use('', customerRouter.routes(), customerRouter.allowedMethods());
router.use('', openRouter.routes(), openRouter.allowedMethods());
router.use('', settingRouter.routes(), settingRouter.allowedMethods());
router.use('', teamRouter.routes(), teamRouter.allowedMethods());
router.use('', productRouter.routes(), productRouter.allowedMethods());
router.use('', approveRouter.routes(), productRouter.allowedMethods());

router.use('', repositoryPouter.routes(), repositoryPouter.allowedMethods());
router.all('/api/*', async ctx => {
  
  let option = {
    headers: Object.assign({}, ctx.request.headers)
  };
  
  const request = ctx.request;
  
  let result = await HttpsClient.request(request.url, request.method, request.rawBody, option);
  
  ctx.status = result.statusCode;
  ctx.body = result.body;
});

router.all('/*', ctx => HttpClient.proxy(ctx));

module.exports = router;
