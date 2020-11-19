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

// router.use('/outside/es/task/taskPool', (ctx) =>
//   HttpClient.proxy(ctx, {
//     force: true,
//     host: '127.0.0.1',
//     port: 10006,
//     headers: {
//       cookie: 'VIPPUBLINKJSESSIONID=8f84287b-6e2a-48da-97db-2fc35bd0e51b; shbversion=shbvip; __wpkreporterwid_=9e9c908a-d12b-4d35-1a1b-37fb2d1c6772',
//     },
//   })
// );

router.use('/outside/es/*', (ctx) =>
  HttpClient.proxy(ctx, {
    force: true,
    host: '127.0.0.1',
    port: 10006,
    headers: {
      cookie: '__wpkreporterwid_=a29f6a2c-991e-40c9-9bfc-38d3d3d15fd6; JSESSIONID=A3536B04F0DBE595A55AB8033A8AE2B7; VIPPUBLINKJSESSIONID=a644d918-3065-4760-b2a4-a47d50230230',
    },
  })
);

router.use('/outside/pc/task/*', (ctx) =>
  HttpClient.proxy(ctx, {
    force: true,
    host: '127.0.0.1',
    port: 10012,
    headers: {
      cookie: '__wpkreporterwid_=a29f6a2c-991e-40c9-9bfc-38d3d3d15fd6; JSESSIONID=A3536B04F0DBE595A55AB8033A8AE2B7; VIPPUBLINKJSESSIONID=a644d918-3065-4760-b2a4-a47d50230230',
    },
  })
);

router.use('/outside/task/*', (ctx) =>
  HttpClient.proxy(ctx, {
    force: true,
    host: '127.0.0.1',
    port: 10012,
    headers: {
      cookie: '__wpkreporterwid_=a29f6a2c-991e-40c9-9bfc-38d3d3d15fd6; JSESSIONID=A3536B04F0DBE595A55AB8033A8AE2B7; VIPPUBLINKJSESSIONID=a644d918-3065-4760-b2a4-a47d50230230',
    },
  })
);

router.use('/outside/dd/*', (ctx) =>
  HttpClient.proxy(ctx, {
    force: true,
    host: '127.0.0.1',
    port: 10012,
    headers: {
      cookie: '__wpkreporterwid_=fe0cddd4-415a-4200-2441-e0bcb1e62eee; Hm_lvt_2db58cd3a4e59dd1ab7d32ca59e15bdc=1604576853; VIPPUBLINKJSESSIONID=0215a313-57ff-4e24-96c0-3002e03a97cc; shbversion=shbvip',
    },
  })
);

router.use('/task/approve/allotTaskToPool', (ctx) =>
  HttpClient.proxy(ctx, {
    force: true,
    host: '127.0.0.1',
    port: 8080,
    headers: {
      cookie: '__wpkreporterwid_=a1b2ee96-b592-4bf2-26e4-7bd4ed06ceb2; PUBLINKJSESSIONID=4407d484-412c-4b93-a983-71de42819206; VIPPUBLINKJSESSIONID=da1308f2-2869-4aff-8519-d166a66db781; JSESSIONID=8554A74257381D76A534A6238D1A6799',
    },
  })
);

router.use('/task/taskPool/user/list', (ctx) =>
  HttpClient.proxy(ctx, {
    force: true,
    host: '127.0.0.1',
    port: 8080,
    headers: {
      cookie: '__wpkreporterwid_=a1b2ee96-b592-4bf2-26e4-7bd4ed06ceb2; PUBLINKJSESSIONID=4407d484-412c-4b93-a983-71de42819206; VIPPUBLINKJSESSIONID=da1308f2-2869-4aff-8519-d166a66db781; JSESSIONID=8554A74257381D76A534A6238D1A6799',
    },
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

router.all('/*', (ctx) => {
  return HttpClient.proxy(ctx);
});

module.exports = router;
