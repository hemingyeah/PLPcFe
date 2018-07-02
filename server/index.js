const Koa = require('koa');
const KoaRouter = require('koa-router');

const server = new Koa();
const router = require('./routes')




server.use(router.routes())
server.use(router.allowedMethods())

module.exports = server;