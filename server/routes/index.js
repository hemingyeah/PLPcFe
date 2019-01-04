const KoaRouter = require('koa-router')
const HttpClient = require('../util/HttpClient')
const Template = require('../util/Template')

const modules = require('../../config/modules');
const router = new KoaRouter();

const customerRouter = require('./customer')
const openRouter = require('./open')
const settingRouter = require('./setting')

router.get('/', async ctx => {
  let modConfig = modules['system.frame'];
  let script = ['/system.frame.js'];
  let reqHeaders = ctx.request.headers;
  let headers = {};
  let body = null;

  let result = await HttpClient.request('/', 'get', null, {headers: reqHeaders});
  
  //请求失败,模拟登陆
  if(!result.status){
    let loginRes = await HttpClient.request('/dd/mockLogin?code=dev_code&corpId=dev_corpId', 'get', null);
    
    if(loginRes.status){
      let cookie = loginRes.headers['set-cookie'] || {};
      headers['set-cookie'] = cookie;
      reqHeaders['cookie'] = cookie[0];

      //再次请求
      result = await HttpClient.request('/', 'get', null, {headers: reqHeaders});
    }else{
      console.log(loginRes)
    }
  }

  headers = Object.assign(headers, result.headers);
  body = result.body;

  //补全headers
  for(let name in headers){
    ctx.response.set(name, headers[name])
  }

  //返回html
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

router.get('/customer/createOnTask', async ctx => {
  ctx.redirect('/customer/create/task')
});

router.get('/customer/createOnEvent', async ctx => {
  ctx.redirect('/customer/create/event');
});

router.use("", customerRouter.routes(), customerRouter.allowedMethods())
router.use("", openRouter.routes(), openRouter.allowedMethods())
router.use("", settingRouter.routes(), settingRouter.allowedMethods())
router.all('/*', ctx => HttpClient.proxy(ctx))

module.exports = router;
