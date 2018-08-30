const path = require('path')

const Koa = require('koa');
const koaStatic = require('koa-static')
const bodyParser = require('koa-bodyparser');

const server = new Koa();
const router = require('./routes')

server.init = function(){
  //参数解析
  server.use(bodyParser());

  //静态资源
  server.use(koaStatic(path.resolve(__dirname, '../public'), {index: '_index.html'}));

  //路由
  server.use(router.routes())
  server.use(router.allowedMethods())
}

module.exports = server;