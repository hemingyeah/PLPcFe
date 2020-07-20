const { SHB_ENV, LOGIN_USER } = require('./userConfigModel');

// 是否是本地环境
let isNotLocalEnv = Boolean(SHB_ENV);

// 环境变量map
const ENV_MAP = {
  'test': {
    user: LOGIN_USER.test || {},
    location: 'https://docker.shb.ltd',
    host: 'docker.shb.ltd',
    port: 443
  },
  'pre': {
    user: LOGIN_USER.pre || {},
    location: 'https://preapp.shb.ltd',
    host: 'preapp.shb.ltd',
    port: 443
  },
  'pre2': {
    user: LOGIN_USER.pre || {},
    location: 'https://pre2app.shb.ltd',
    host: 'pre2app.shb.ltd',
    port: 443
  },
  'prod': {
    user: LOGIN_USER.production || {},
    location: 'https://app.shb.ltd',
    host: 'app.shb.ltd',
    port: 443
  }
};

// 代理配置
const PROXY_CONFIG = isNotLocalEnv ? ENV_MAP[SHB_ENV] : {};

module.exports = {
  envMap: ENV_MAP,
  proxyConfig: PROXY_CONFIG,
  isNotLocalEnv
}
