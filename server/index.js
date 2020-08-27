const path = require('path')

const Koa = require('koa');
const koaStatic = require('koa-static')
const bodyParser = require('koa-bodyparser');

const server = new Koa();
const router = require('./routes');

// 中间件
const { shbEnvMiddleware } = require('./middleware/shb-env-middleware');
const cors = require('koa2-origin-cors');
// model
const { isNotLocalEnv } = require('./model/proxyConfigModel');
// util
const { getCookie } = require('./util/HttpUtil');

server.init = async function(){

  server.use(cors({allowAll: true}));

  // 参数解析
  server.use(bodyParser());

  // 静态资源
  server.use(koaStatic(path.resolve(__dirname, '../public'), {index: '_index.html'}));

  // 获取 cookie
  let cookie = isNotLocalEnv ? await getCookie() : '';

  // 售后宝环境中间件
  server.use(shbEnvMiddleware({ isNotLocalEnv, cookie }));

  // 路由 -> 可通过 router.stack 查看堆栈信息
  server.use(router.routes())
  server.use(router.allowedMethods())
}

// 初始化server
server.init();
// 启动server 4300 方便本地调试的
server.listen(4300);

module.exports = server;