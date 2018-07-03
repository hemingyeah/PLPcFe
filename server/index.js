const path = require('path')

const Koa = require('koa');
const koaStatic = require('koa-static')

const server = new Koa();
const router = require('./routes')

//路由
server.use(router.routes())
server.use(router.allowedMethods())

//静态资源
server.use(koaStatic(path.resolve(__dirname, '../public'), {index: '_index.html'}));

module.exports = server;