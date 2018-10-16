/** dev server @author dongls */
process.env.NODE_ENV = 'development';

const colors = require('colors')
const server = require('../server')
const koaWebpack = require('koa-webpack')

const webpackDevConfig = require('../config/webpack.deve.conf')
const koaWebpackConfig = {
  config: webpackDevConfig,
  devMiddleware: {
    watchOptions: {
      aggregateTimeout: 1500, // The default
      ignored: ['dist', 'public', 'node_modules']
    }
  },
  //IE11对websocket报SecurityError
  //解决方案： Internet选项->安全->本地Internet->站点，把所有勾选取消
  hotClient: false
};

koaWebpack(koaWebpackConfig).then(middleware => {
  middleware.devMiddleware.waitUntilValid(() => {
    console.log(colors.bgGreen('[本地地址]:') + ' http://127.0.0.1:9000'); // outputs green text
  })

  server.use(middleware);
  server.init();

  //启动server
  server.listen(9000)
});