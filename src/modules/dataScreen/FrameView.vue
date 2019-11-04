<template>
  <div v-if="init" v-show="!hidden" class="data-screen-frame" :style="frameStyleStr">

    <!-- 头部组件容器 便于控制css变量 -->
    <div class="header-container">
      <!-- 头部组件 -->
      <header-panel
        @show-setting="showSetting = true;"
        @outside="jumpToOutside"
        :scope="scaleScope"
        :title="nameForShort"
        :in-dd="inDingTalk"
      ></header-panel>
    </div>

    <!-- 正文容器 -->
    <div class="content-container">

      <!-- 正文左侧容器 -->
      <div class="content-left-container">
        <!-- 左上角数据面板 -->
        <data-left-top-panel
          :config="settingGroup.leftTop"
          :data="screenData.leftTopData"
        ></data-left-top-panel>
        <!-- 地图面板 -->
        <map-panel
          :config="settingParams"
          @update-config="updateMapPanelSetting"
          :scope="scaleScope"
        ></map-panel>
      </div>

      <!-- 正文右侧容器 -->
      <right-panel
        :config="settingGroup"
        :params="settingParams"
        @update-time="rightTimeUpdateHandler"
      ></right-panel>

    </div>

    <!-- 设置组件 -->
    <setting-dialog 
      v-if="settingParams && showSetting"
      :params="settingParams"
      :scope="scaleScope"
      @update="updateSettingDialogHandler"
      @close="showSetting = false"
      ref="setting"
    ></setting-dialog>
  </div>
</template>

<script>

import HeaderPanel from './component/HeaderPanel.vue';
import DataLeftTopPanel from './component/DataLeftTopPanel.vue';
import MapPanel from './component/mapPanel/MapPanel.vue';
import RightPanel from './component/rightPanel/RightPanel.vue';

import SettingDialog from './component/setting/SettingDialog.vue';
import FourCorners from './component/common/FourCorners.vue';

import _ from 'lodash';
// import * as mock from './mock';
import {getSettingGroup} from './component/setting/setting';
import dingTalk from '@src/util/dingtalk';
import EventMap from './event';
import * as DSApi from '@src/api/ScreenDataApi';
import platform from '../../platform';
// import {requestFullScreen} from './component/common/util';

/**
 * 暂定义的区块名称 
 * 左上方数据展示 leftTop
 * 右上方数据展示 rightTop
 * 右侧柱形图 rightHistogram
 * 右侧饼状图 rightPieChart
 * 
 * 以宽度为1920为标准
 * 高度支持最小 1280 (3:2)
 * 第二档 1080 (16:9)
 * 上述两档可以两侧不留白，
 * 当宽高比大于 16/9 时 两侧逐渐留白
 */

/**
 * 获取当前显示器的屏幕宽高
 */


const fixedWidth = 1920;
const fixedHeight1 = 1080;
const fixedHeight2 = 1280; // 1200 (16:10) 1280 (4:3)
const maxRatio = (fixedWidth / fixedHeight1) - 0.02; // 小于这个比例是不行的


export default {
  name: 'data-screen-frame-view',
  data() {
    return {
      frameStyleStr: '',
      inDingTalk: dingTalk.inDingTalk,

      init: false, // 是否初始化完成
      hidden: false, // 用于控制钉钉中显示时隐藏主画面
      showSetting: false,

      settingParams: null, // 设置信息用于绑定页面组件，先从initData中获取，更改settingDialog后会被settingDialog覆盖掉
      settingGroup: {}, // 分组字段
      screenData: {}, // 总数据

      cacheInterval: null,
      refreshInterval: null,

      scaleScope: {
        widthRatio: 1, // 浏览器宽度 与 基准宽度比例
        heightRatio: 1, // 浏览器高度 与 基准高度比例
        screenRatio: 1,
        maxRatio
      },

      outsideParams: {},
      outsideLock: false,
      nameForShort: '', // 公司简称
    }
  },
  methods: {
    domResizeHandler() {
      let {innerHeight, innerWidth} = window;

      // 计算基准宽高
      const screenWidth = window.screen.width;
      const screenHeight = window.screen.height;

      const screenRatio = screenWidth / screenHeight;
      const BASE_HEIGHT = screenRatio > maxRatio ? fixedHeight1 : fixedHeight2;
      const BASE_WIDTH = fixedWidth;

      let heightRatio = innerHeight / BASE_HEIGHT; // 基准比例
      let widthRatio = innerWidth / BASE_WIDTH;

      this.scaleScope.heightRatio = heightRatio; 
      this.scaleScope.widthRatio = widthRatio;
      this.scaleScope.screenRatio = screenRatio;

      this.frameStyleStr = `width: ${BASE_WIDTH}px; height: ${BASE_HEIGHT}px; transform: scale(${heightRatio}) translateX(-50%);`;
    },

    registerResizeListener() {
      let _scope = this;
      window.addEventListener('resize', _.debounce(function() {
        _scope.domResizeHandler();
      }, 100));
    },

    refreshFrameData () {
      let config = this.settingParams;

      // eslint-disable-next-line no-console
      console.time('dsApi耗时');

      DSApi.getScreenGroupData()
        .then(res => {
          // res.succ 联调特殊服务用
          if ((!res.succ) && (!res.success || !res.result)) {
            return res.message && platform.alert(res.message);
          }

          this.init = true;

          this.settingGroup = getSettingGroup(config);
          this.screenData = res.result || res.data; // res.data 特殊联调用

          // 发送更新广播
          this.broadcast(this.screenData);

        })
        .catch(err => {
          //
          this.init = true;
        })
        .finally(() => {
          // eslint-disable-next-line no-console
          console.timeEnd('dsApi耗时');
        });
    },

    broadcast(data) {
      this.$nextTick(() => {
        // console.info('%c发送广播', 'color: #0C1916; font-weight: bold; font-size: 16px;');
        // 左上角数据展示区块
        this.$eventBus.$emit(EventMap.NEED_UPDATE_LEFT_TOP_EVENT, data.leftTopData || {});
        // 右上角数据展示区块
        this.$eventBus.$emit(EventMap.NEED_UPDATE_RIGHT_TOP_EVENT, data.rightTopData || {});
        // 右侧报表区块
        this.$eventBus.$emit(EventMap.NEED_UPDATE_RIGHT_HISTOGRAM, data.rightFormData || {});
        // 右侧饼状图区块
        this.$eventBus.$emit(EventMap.NEED_UPDATE_RIGHT_PIECHART, data.rightPieChart || {});
      })
    },

    /**
     * 设置项更新后的处理方法
     * @params {Object} data 
     * data.params 配置参数 用于数据请求
     * data.group 配置分组配置
     */
    updateSettingDialogHandler: _.debounce(async function({params, group}) {
      this.settingParams = params;
      this.settingGroup = group;

      await this.saveSetting(params);
      this.refreshFrameData();
    }, 100),

    rightTimeUpdateHandler: _.debounce(async function(time) {
      let params = { cycleRange: (time || {}).key };
      await this.saveSetting(params);
      // ...刷新数据
      this.refreshFrameData();
    }, 100),

    /**
     * 请求保存配置
     * 先去请求获取最新配置，然后做merge
     * @params {Object} params 要更新的配置
     * 
     */
    async saveSetting(params) {
      let currentParams = {};
      try {
        let response = await DSApi.getSettingConfig();

        currentParams = response.screenDataConfig;
        params = _.assign(currentParams, params);
      } catch(e) {
        console.error('@DS GetSettingConfig Error', e);
      }

      return DSApi.saveSettingConfig(params)
        .then(res => {
          if (!res.succ) {
            res.message && platform.alert(res.message);
          }
          // res.succ 保存成功 
          // donoting
          // console.info('@SaveSettingSuccess');
        })
        .catch(err => {
          //
          console.error('@DS SaveSettingError', err)
        })
    },

    /**
     * 组件要求更新保存配置文件
     */
    updateMapPanelSetting: _.debounce(function(setting) {
      this.saveSetting(setting);
    }, 1000),

    /**
     * 注册循环事件interval
     */
    registerLoop() {
      if (this.refreshInterval) clearInterval(this.refreshInterval);
      this.refreshInterval = setInterval(this.refreshLoopFunc, 10 * 1000); // 10s

      if (this.cacheInterval) clearInterval(this.cacheInterval);
      this.cacheInterval = setInterval(this.cacheLoopFunc, 120 * 1000); // 120s
    },

    /**
     * 数据刷新定时器绑定事件
     */
    refreshLoopFunc() {
      this.refreshFrameData();
    },

    /**
     * 心跳检测请求方法
     */
    cacheLoopFunc() {
      DSApi.refreshCacheTime()
        .then(() => ({}))
        .catch(err => {
          console.error('@DS refreshCacheRequest Error', err);
        })
    },

    getUrlParams (url) {
      url = url || window.location.href;
      let paramsStr = url.split('?')[1];

      if (!paramsStr) return null;
      let arr = paramsStr.split('&');
      let params = {};
      arr.forEach(elm => {
        let param = elm.split('=');
        let key = param[0];
        let value = param[1];
        params[key] = value;
      })

      return params;
    },
    /**
     * 跳转到外部页面
     */
    async jumpToOutside() {
      if (this.outsideLock) return;
      this.outsideLock = true;
      // 后台 数据屏指向地址
      const dataScreenPath = '/stats/screenData/screenDataView';
      let {serverHost, corpId} = this.outsideParams;
      let code = null;

      try {
        let response = await DSApi.getOpenWebCode();
        code = response.data;
        this.outsideLock = false;
      } catch(e) {
        this.outsideLock = false;
        return console.error('DS @jumpToOutside getCode Error', e);
      }

      console.info('获取转跳参数', serverHost, corpId, code);

      let url = `${serverHost}/web/relogin?ua=webRelogin&corpId=${corpId}&code=${code}&withoutTab=true&pcUrl=${dataScreenPath}?fullScreen=true`;
      console.info('转跳地址', url);
      this.$platform.openLink(url);

      //
      let id = window.frameElement && window.frameElement.dataset.id;
      id && this.$platform.closeTab(id);
    },

  },
  async created() {
    const initData = window._init || {};

    try {
      const pageData = JSON.parse(initData);
      let {screenDataConfig, nickName} = pageData;
      this.settingParams = screenDataConfig;
      this.nameForShort = nickName || null;

      console.info('@初始化数据', pageData);

      // 如果当前url参数中没有标注需要全屏，那么尝试跳转
      // let params = this.getUrlParams() || {};
      // console.info('@页面参数', params)

      let {serverHost, corpId} = pageData;
      this.outsideParams = {
        serverHost, corpId
      }

      // URL参数中有fullScreen=true 说明当前URL是在钉钉中弹出的地址, 且需要在钉钉中
      if (this.inDingTalk) {
        this.hidden = true;
        const confirmOutside = await this.$platform.confirm('数据大屏功能推荐使用浏览器全屏查看\n点击确定继续');

        if (!confirmOutside) return (this.hidden = false);

        this.jumpToOutside();
      }
    } catch(e) {
      this.settingParams = {};
      console.error('@DS ParseInitData Error', initData, e);
    }
  },

  mounted () {
    this.domResizeHandler();
    this.registerResizeListener();

    this.refreshFrameData();
    this.registerLoop();
  },
  components: {
    [HeaderPanel.name]: HeaderPanel,
    [DataLeftTopPanel.name]: DataLeftTopPanel,
    [MapPanel.name]: MapPanel,
    [SettingDialog.name]: SettingDialog,
    [FourCorners.name]: FourCorners,
    [RightPanel.name]: RightPanel
  }
}
</script>

<style lang="scss">
  // https://lanhuapp.com/web/#/item/project/board?pid=0a67e448-6b65-4ffd-acfe-5a0f8ff9e74e
  // 以 1920 * 1080 视图为标准, 兼容 1920 * 1200 视图
  // header 8%
  // 内容区 left: 55%, right: 45%;

  // 内容区左侧: 486
  // left.top 25%
  // left.bottom 75%
  // 
  // 内容区右侧：486
  // right.top 25%
  // right.center 45%
  // right.bottom 30%

  @import './component/common/style.scss';

  body {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    // background: radial-gradient(circle at 75% 25%, rgba(35,107,115,1), #0C1916, #0C1916);
    background: radial-gradient(circle at 50% 50%, #236B73 1%, #143737 27%, #091919 51%);
    overflow: hidden;
  }

  .data-screen-frame {
    position: absolute;
    top: 0;
    left: 50%;
    height: $baseFrameHeight; // 注意这里会被js覆盖掉
    width: $baseFrameWidth;

    transform-origin: 0% 0%;

    .header-container {
      position: relative;
      width: 100%;
      height: $frameHeaderHeight;
      z-index: 1;
    }

    // 内容容器
    .content-container {
      $paddingTop: $frameHeaderHeight + 5px;

      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      padding: $paddingTop 8px 15px 8px;

      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;

      
      // 左侧容器
      .content-left-container {
        flex-grow: 1;
        flex-shrink: 0;
        // width: $leftRatio
        width: $leftPanelWidth;
        max-width: $leftPanelWidth;
        height: 100%;

        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;

        margin-top: $contentMarginTop;
      }
    }
  }
</style>