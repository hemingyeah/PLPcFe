/** dev server @author dongls */
process.env.NODE_ENV = 'development';

const colors = require('colors')
const server = require('../server')
const koaWebpack = require('koa-webpack')

const webpackDevConfig = require('../config/webpack.dev.conf')
const koaWebpackConfig = {
  config: webpackDevConfig,
  //IE11对websocket报SecurityError
  //解决方案： Internet选项->安全->本地Internet->站点，把所有勾选取消
  hotClient: {}
};

koaWebpack(koaWebpackConfig).then(middleware => {
  middleware.devMiddleware.waitUntilValid(() => {
    console.log(colors.bgGreen('[本地地址]: http://127.0.0.1:9000')); // outputs green text
  })

  server.use(middleware);
});

//启动server
server.listen(9000)