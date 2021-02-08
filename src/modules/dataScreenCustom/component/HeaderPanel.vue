<template>
  <div class="header-panel">
    <!-- 左右两侧时间与操作栏 -->
    <div class="app-topbar">
      <div class="app-width-adapter" :style="headerBgFixStyleStr"></div>
      <div class="time">{{ currDateStr }}</div>
      <div class="actions">
        <span @click="fullScreenHandler" class="action-item" style="margin-right: 25px"><i class="iconfont icon-quanping2 action-icon-logout"></i>{{ fullScreenLabel }}</span>
        <!-- <span @click="$emit('show-setting')" class="action-item"><i class="iconfont icon-setting action-icon-setting"></i>设置</span> -->
        <span v-if="inDingTalk" @click="exit" class="action-item"><i class="iconfont icon-logout1 action-icon-logout"></i>退出</span>
      </div>
    </div>

    <!-- 中间标题独占部分 -->
    <div class="top-center-container">
      <!-- 两侧切割图形 -->
      <div class="clip-block clip-block-left" :style="clipFixStyleStr"></div>
      <div class="clip-block clip-block-right" :style="clipFixStyleStr"></div>
      <!-- 两侧动图 -->
      <img :src="getImage('left')" class="top-center-img-left"/>
      <img :src="getImage('right')" class="top-center-img-right"/>
      <!-- 主标题 -->
      <!-- <div class="app-title">{{ title || '' }}服务运营大屏</div> -->
      <div class="app-title">库柏电气服务运营大屏</div>
    </div>

  </div>
</template>

<script>

import {formatDate} from '../../../util/lang';
import * as util from '../component/common/util';
import dingTalk from '@src/util/dingtalk';
import _ from 'lodash';

import HEADER_SIDE_GIF from '@src/assets/img/screen-data-header.gif';
// import HEADER_SIDE_GIF from '@src/assets/img/screen-data-header-left.gif';
const ZH_DAY_NAMES = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

export default {
  name: 'header-panel',
  props: {
    scope: {
      type: Object,
      default: () => ({})
    },
    title: {
      type: String,
      default: ''
    },
    inDingTalk: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      currDateStr: '',
      timer: null,
      fullScreenLabel: '全屏'
    }
  },
  computed: {
    headerBgFixStyleStr() {
      if (!this.scope || !this.scope.heightRatio) return '';

      let scope = this.scope.heightRatio;
      // let scope = this.scope.offsetX;
      scope = scope > 1 ? scope : (1 / scope);

      return `transform: scaleX(${scope}); transform-origin: center center;`;
    },
    /**
     * 后期如果再有其他分辨率支持 或修改当前 16:9, 16:10(最小)支持，可以重写该逻辑
     */
    clipFixStyleStr() {
      let width = 44;
      let height = 44;
      if (this.scope.screenRatio && this.scope.screenRatio <= 1.6) {
        width = height = 48;
      }
      return `width:${width}px;height:${height}px`
    }
  },
  methods: {
    getImage(type) {
      return HEADER_SIDE_GIF; // 目前版本是显示同一张图片 右侧显示翻转
    },
    refreshDate() {
      let currDate = new Date();
      // 可封装工具中
      let day = currDate.getDay();
      let dayStr = ZH_DAY_NAMES[day];

      this.currDateStr = formatDate(currDate, 'YYYY年MM月DD日 ') + dayStr;
    },

    resigterDateInterval() {
      if (this.timer) clearInterval(this.timer);

      this.refreshDate();
      this.timer = setInterval(this.refreshDate, 1000);
    },

    fullScreenHandler() {
      if (dingTalk.inDingTalk) {
        return this.$emit('outside');
      }

      if (util.isFullScreen()) {
        return util.cancelFullScreen();
      }
      return util.requestFullScreen();
    },

    resizeHandler: _.debounce(function() {
      let isFullScreen = util.isFullScreen();
      
      this.fullScreenLabel = isFullScreen ? '缩小' : '全屏';
    }, 100),

    registerResizeHanlder() {
      window.addEventListener('resize', this.resizeHandler)
    },

    /**
     * 退出按钮点击事件处理
     * 仅在钉钉pc中显示该按钮，点击后关闭tab
     */
    exit() {
      let id = window.frameElement && window.frameElement.dataset.id;
      this.$platform.closeTab(id);
    }

  },
  mounted() {
    this.registerResizeHanlder();
    this.resigterDateInterval()
  } 
}
</script>

<style lang="scss">
  
  $borderColor:#78BAFF;
  $bgColor: #005BBB;
  // $bgColor: transparent;
  $borderBottom: 1px solid $borderColor;

  // 考虑到border，不适合使用 clip-path
  .header-panel {
    position: relative;
    height: 100%;

    .app-topbar {
      position: relative;
      width: 100%;
      height: 65%;

      display: flex;
      justify-content: space-between;
      align-items: center;

      padding: 0 8px 0 20px;

      .app-width-adapter {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        border-bottom: 1px solid $borderColor;
        background-color: $bgColor;
      }

      .time {
        position: relative;
        font-size: 24px;
        color: #ffffff;
        font-weight: normal;
      }

      .actions {
        position: relative;
        display: flex;
        flex-wrap: nowrap;
        align-items: center;
        .action-item {
          font-size: 18px;
          font-weight: 400;
          color: #ffffff;
          cursor: pointer;

          .action-icon-setting {
            font-size: 19px;
            margin-right: 8px;
          }
          .action-icon-logout {
            display: inline-block;
            transform: rotate(-90deg);

            margin: 0 8px 0 23px;
            font-size: 19px;
          }
        }
      }
    }

    .top-center-container {
      // $slideImgSpacing: -174px;
      $slideImgSpacing: -215px;

      position: absolute;
      top: 0;
      left: 50%;

      height: 100%;
      transform: translateX(-50%);
      text-align: center;

      display: flex;
      justify-content: center;
      align-items: center;
      
      .top-center-img-left {
        position: absolute;
        width: 228px;
        height: 54px;
        top: 0;
        left: $slideImgSpacing;
      }

      .top-center-img-right {
        position: absolute;
        width: 227px;
        height: 54px;
        top: 0;
        right: $slideImgSpacing;

        transform: rotateY(180deg);
      }

      .app-title {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;

        font-size: 36px;
        font-weight: 500;
        color: #ffffff;
        // padding: 0 140px;
        width: 604px;

        border-bottom: $borderBottom;
        background: $bgColor;
      }

      .clip-block {
        position: absolute;
        bottom: 0;

        width: 44px;
        height: 44px;

        background: $bgColor;
      }
      .clip-block-left {
        left: 0.3px;
        transform-origin: left bottom;
        transform: rotate(-45deg);
        border-left: $borderBottom;
      }
      .clip-block-right {
        right: 0.3px;
        transform-origin: right bottom;
        transform: rotate(45deg);
        border-right: $borderBottom;
      }
    }
  }
</style>