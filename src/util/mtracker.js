// 默认配置
const defaultConfig = {
        appId: '46376303A1B9461885158BF1E31107FD',
        vn: '',
        vc: ''
    }
    /**
     * 集成TalkingData SDK
     * http://doc.talkingdata.com/posts/36
     * @param {Object} options - 参数(可选)
     * @param {String} options.appId - AppId
     * @param {String} options.vn - 应用版本名称
     * @param {String} options.vc - 应用版本id
     */
export default function(options = {}) {
    // 防止SDK引入失败阻塞其他流程
    window.TDAPP = {
        onEvent() {
            return '';
        }
    }
    const script = document.createElement('script');

    const isHttps = document.location.protocol === 'https:';
    const srcPrefix = isHttps ? 'https://jic.talkingdata.com/app/h5/v1?' : 'http://sdk.talkingdata.com/app/h5/v1?';

    const appId = options.appId || defaultConfig.appId;
    const vn = options.vn || defaultConfig.vn;
    const vc = options.vc || defaultConfig.vc;
    const src = `${srcPrefix}appid=${appId}&vn=${vn}&vc=${vc}`;

    

    script.setAttribute('src', src);
    document.querySelector('head').appendChild(script);
}