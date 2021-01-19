/** development server @author dongls */

// 当前用户的配置
const argv = require('../../script/argv')(process.argv.slice(2));
const user = argv.user || 'dongls';
const USER_CONFIG = require(`../../script/config/${user}`);

const KoaRouter = require('koa-router');
const HttpClient = require('../util/HttpClient');
const Template = require('../util/Template');

const modules = require('../../modules');
const router = new KoaRouter();

const customerRouter = require('./customer');
const openRouter = require('./open');
const settingRouter = require('./setting');
const teamRouter = require('./team');
const performanceRouter = require('./performance');
const productRouter = require('./product');
const approveRouter = require('./approve');
const dataScreenRouter = require('./dataScreen');

const repositoryRouter = require('./repository');
const BillRouter = require('./bill');
const jobtransferRouter = require('./jobtransfer');
const callCenterRouter = require('./callcenter');
const doMyselft = require('./doMyself');
const customerContact = require('./customerContact');
const taskRouter = require('./task');
const sparePartRouter = require('./sparePart');

const linkcRouter = require('./linkc')
const productV2Router = require('./productV2')

const superQrcodeRouter = require('./superQrcode')

router.get('/', async (ctx) => {
  let modConfig = modules['system.frame'];
  let script = ['/system.frame.js'];
  let reqHeaders = ctx.request.headers;
  let headers = {};
  let body = null;
  let result = await HttpClient.request('/', 'get', null, {
    headers: reqHeaders,
  });
  
  // 请求失败,模拟登陆
  if (!result.status) {
    console.warn('请求失败');
    let mockUser = USER_CONFIG.loginUser;
    let userToken = 'dev_corpId';
    if (null != mockUser) {
      userToken = `${mockUser.userId}_${mockUser.tenantId}`;
    }
    
    let loginRes = await HttpClient.request(
      `/dd/mockLogin?code=dev_code&corpId=${userToken}`,
      'get',
      null
    );
    if (loginRes.status) {
      let cookie = loginRes.headers['set-cookie'] || {};
      headers['set-cookie'] = cookie;
      reqHeaders['cookie'] = cookie[0];
      
      // 再次请求
      result = await HttpClient.request('/', 'get', null, {
        headers: reqHeaders,
      });
    } else {
      console.log(loginRes);
    }
  }
  
  headers = Object.assign(headers, result.headers);
  body = result.body;
  
  // 补全headers
  for (let name in headers) {
    ctx.response.set(name, headers[name]);
  }
  
  // 返回html
  ctx.body = Template.renderWithHtml(
    '售后宝',
    body,
    script,
    modConfig.template
  );
})

/** 
 * @description 示例：
 * router 里面不推荐写自定义的路由, 写路由也不要提交，仅供个人使用
*/
router.use('/temp', (ctx) =>
  HttpClient.proxy(ctx, {
    // 是否强制使用当前配置
    force: true,
    // http协议，非 http 则为 https
    httpProtocol: 'http',
    // 主机地址
    host: '127.0.0.1',
    // 端口
    port: 10012,
    // 头信息
    headers: {
      cookie: 'VIPPUBLINKJSESSIONID=a644d918-3065-4760-b2a4-a47d50230230',
    },
  })
)
router.use('/api/customer/outside/pc', (ctx) =>
  HttpClient.proxy(ctx, {
    host: '30.40.58.216',
    port: 10013,
  })
);

router.use('/api/linkc', (ctx) =>
  HttpClient.proxy(ctx, {
    host: '30.40.63.238',
    port: 10016,
  })
);

router.use('/setting/product/productConfig', (ctx) =>
  HttpClient.proxy(ctx, {
    host: '30.40.63.238',
    port: 8080,
  })
);

router.use('/api/elasticsearch/outside/es', (ctx) =>
  HttpClient.proxy(ctx, {
    host: '30.40.58.216',
    port: 10006,
  })
);
router.use('/files', (ctx) =>
  HttpClient.proxy(ctx, {
    host: '30.40.58.216',
    port: 8083,
  })
);

router.use('', performanceRouter.routes());
router.use('', customerRouter.routes(), customerRouter.allowedMethods());
router.use('', openRouter.routes(), openRouter.allowedMethods());
router.use('', settingRouter.routes(), settingRouter.allowedMethods());
router.use('', teamRouter.routes(), teamRouter.allowedMethods());
router.use('', productRouter.routes(), productRouter.allowedMethods());
router.use('', approveRouter.routes(), productRouter.allowedMethods());
router.use('', dataScreenRouter.routes(), dataScreenRouter.allowedMethods());
router.use('', repositoryRouter.routes(), repositoryRouter.allowedMethods());
router.use('', BillRouter.routes(), BillRouter.allowedMethods());
router.use('', jobtransferRouter.routes(), jobtransferRouter.allowedMethods());
router.use('', callCenterRouter.routes(), callCenterRouter.allowedMethods());
router.use('', doMyselft.routes(), doMyselft.allowedMethods());
router.use('', customerContact.routes(), customerContact.allowedMethods());
router.use('', taskRouter.routes(), taskRouter.allowedMethods());
router.use('', sparePartRouter.routes(), sparePartRouter.allowedMethods());
router.use('', linkcRouter.routes(), sparePartRouter.allowedMethods());
router.use('', productV2Router.routes(), sparePartRouter.allowedMethods());
router.use('', superQrcodeRouter.routes(), sparePartRouter.allowedMethods());


router.all('/*', (ctx) => {
  return HttpClient.proxy(ctx);
});

module.exports = router;
