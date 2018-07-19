const KoaRouter = require('koa-router')
const HttpClient = require('../util/HttpClient')
const Template = require('../util/Template')

const modules = require('../../config/modules')
const router = new KoaRouter();

let isLogin = false;

router.get('/', async ctx => {
  //模拟登陆
  let reqHeaders = ctx.request.headers;
  if(!isLogin){
    let result = await HttpClient.request('/dd/login?code=dev_code&corpId=dev_corpId', 'get', null);

    let cookie = result.headers['set-cookie'];
    reqHeaders['cookie'] = cookie[0]
  }
  
  let modConfig = modules['system.frame'];
  let script = ['/system.frame.js'];
  let {body, headers} = await HttpClient.request('/v3', 'get', null, {headers: reqHeaders});

  //补全headers
  for(let name in headers){
    ctx.response.set(name, headers[name])
  }
  //返回html
  ctx.body = Template.renderWithHtml('首页', body, script, modConfig.template)
})

router.get('/home', async ctx => {
  let script = ['/system.home.js'];
  ctx.body = Template.renderWithData('首页', {}, script)
})

router.get('/demo', async ctx => {
  ctx.body = `hello demo`
})

router.get('/setting', async ctx => {
  ctx.body = `setting`
})

router.get('/demo2', async ctx => {
  ctx.body = `demo2`
})

router.all('/dd/*', ctx => HttpClient.proxy(ctx))
router.all('/files/*', ctx => HttpClient.proxy(ctx))
router.all('/mine/*', ctx => HttpClient.proxy(ctx))
router.all('/security/user/*', ctx => HttpClient.proxy(ctx))

module.exports = router;
