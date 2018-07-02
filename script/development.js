/** dev server @author dongls */
process.env.NODE_ENV = 'development';

const server = require('../server')
const koaWebpack = require('koa-webpack')

const webpackDevConfig = require('../config/webpack.base.conf')
const koaWebpackConfig = {
  config: webpackDevConfig,
  hotClient: false,
};

koaWebpack(koaWebpackConfig).then(middleware => {
  server.use(middleware);
});

//启动server
server.listen(9000)