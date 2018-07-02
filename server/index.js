const Koa = require('koa');
const KoaRouter = require('koa-router')

const server = new Koa();

const router = new KoaRouter();

router.get('/', async ctx => {
  ctx.body = `
    <div id="app"></div>
    <script src="/system.frame.js"></script>
  `
})

router.get('/home', async ctx => {
  ctx.body = `
    <div id="app"></div>
    <script src="/system.home.js"></script>
  `
})

server.use(router.routes())
server.use(router.allowedMethods())

module.exports = server;