<template>
  <!-- tour-content-out-box start -->
  <div>
    <div class="cover"
         v-if="needCover && showGuide"></div>
    <div class="cover-dom"
         v-if="needCover && showGuide && !canUse"
         :style="`width:${guideDom.width || 0}px;height:${guideDom.height || 0}px;top:${guideDom.top || 0}px;left:${guideDom.left || 0}px;`"></div>
    <div :id="id"
         class="tour-content-out-box"
         ref="guideCom"
         v-show="showGuide && guideDom.top >-1"
         :style="guideStyle">
      <div v-if="arrowUp"
           class="normal-arrow-top tour-arrow"
           :style="arrowStyle"></div>
      <div v-if="!arrowUp"
           class="normal-arrow-down tour-arrow-down"
           :style="arrowStyle"></div>
      <div class="tour-content-box">
        <div v-if="haveStep"
             class="tour-left-tips">
          {{ `${nowStep}/${totalStep}` }}
        </div>
        <div class="tour-content"
             @click="watchContentClick($event)">
          <div class="flex-x tour-content-head">
            <i @click.prevent="stopStep().then(()=>{showGuide = false})"
               class="iconfont icon-fe-close"></i>
          </div>
          <div class="tour-content-con"
               v-if="!diyContent">{{ content }}</div>
          <slot name="diyContent"></slot>
        </div>
      </div>
      <div slot="actions"
           class="tour-bottom">
        <!-- <div
        v-if="totalStep > 1 && nowStep > 1"
        class="text"
        @click.prevent="previousStep(1), (showGuide = false)"
      >
        上一步
      </div> -->
        <div v-if="totalStep > 1 && nowStep > 0 && nowStep < totalStep"
             class="btns"
             @click.prevent="nextStep(nowStep).then(()=>{showGuide = false})">
          下一步
        </div>
        <div class="btns"
             @click.prevent="finishBtnFn().then(()=>{showGuide = false})">
          {{ finishBtn }}
        </div>
      </div>
    </div>
  </div>
  <!-- tour-content-out-box end -->
</template>
<script>
import { set } from 'lodash';
export default {
  name: 'guide-compoment',
  props: {
    totalStep: {
      type: Number | String,
      default: 1
    },
    nowStep: {
      type: Number | String,
      default: 1
    },
    content: {
      type: Number | String,
      default: ''
    },
    needCover: {
      type: Boolean,
      default: false
    },
    canUse: {
      type: Boolean,
      default: false
    },
    finishBtn: {
      type: Number | String,
      default: 'ok'
    },
    gStyle: {
      type: Number | String,
      default: ''
    },
    id: {
      type: Number | String,
      default: ''
    },
    domId: {
      type: Number | String,
      default: ''
    },
    domObj: {
      type: Function
    },
    stopStep: {
      type: Function
    },
    finishBtnFn: {
      type: Function
    },
    watchContentClick: {
      type: Function
    },
    diyContent: {
      type: Boolean,
      default: false
    },
    nextStep: {
      type: Function
    },
    haveStep: {
      type: Boolean,
      default: false
    },
    inside: {
      type: Boolean,
      default: false
    },
  },
  data () {
    return {
      showGuide: true,
      guideStyle: '',
      arrowStyle: '',
      guideDom: {},
      loop: null,
      arrowUp: true
    };
  },
  methods: {
    clearGuide(){
      if (this.needCover) (this.domObj ? this.domObj() : document.getElementById(`${this.domId}`)).classList.remove('guide-point')
      clearInterval(this.loop)
    }
  },
  created () {
    this.loop = setInterval(() => {

      // console.log(this.domObj, 321321);
      let res_;
      try {
        let dom = this.domObj ? this.domObj() : document.getElementById(`${this.domId}`);
        if(dom) res_ = dom.getBoundingClientRect();
      } catch (error) {
        console.warn(error, 'error try catch');
      }
      if(!res_) return
      let style_ = '';

      if (document.documentElement.clientWidth - res_.left < 350) {
        style_ = `${style_};right:${document.documentElement.clientWidth - res_.left - res_.width || 0}px`;
        this.arrowStyle = `right:${((res_.width / 2) - 8) > 112 ? 112 : (res_.width / 2) - 8}px`;
      } else {
        style_ = `${style_};left:${res_.left || 0}px`
        this.arrowStyle = `left:${((res_.width / 2) - 8) > 112 ? 112 : (res_.width / 2) - 8}px`;
      }
      if (!this.inside) {
        if (document.documentElement.clientHeight - res_.top - res_.height < 400) {
          style_ = `${style_};bottom:${document.documentElement.clientHeight - res_.top + 12 || 0}px;`
          this.arrowUp = false;
        } else {
          style_ = `${style_};top:${res_.top + res_.height + 12 || 0}px`
          this.arrowUp = true;
        }
      } else {
        style_ = `${style_};top:${res_.top + 12 || 0}px;z-index:998`
        this.arrowUp = true;
      }

      this.guideStyle = style_;
      this.guideDom = res_;

    }, 500)
    if (this.needCover) {
      (this.domObj ? this.domObj() : document.getElementById(`${this.domId}`)).classList.add('guide-point')
    }
  },
  watch: {
    showGuide (newVal, oldVal) {
      if (!newVal) {
        this.clearGuide()
      }
    },
  },
  destroyed () {
    this.clearGuide()
  }
};
</script>
<style lang="scss" scoped>
.cover {
  width: 100vw;
  height: 100vh;
  background: rgba($color: #000000, $alpha: 0.5);
  position: fixed;
  z-index: 995;
  top: 0;
  left: 0;
}
.cover-dom {
  position: fixed;
  z-index: 998;
  opacity: 0;
}

.tour-content-out-box {
  position: fixed;
  -webkit-filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.5)) !important;
  filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.5)) !important;
  z-index: 996;
  border-radius: 4px;
  background: #fff;
  min-width: 240px;
  max-width: 350px;
  max-height: 400px;
  .tour-arrow {
    position: absolute;
    top: -5px;
  }
  .tour-arrow-down {
    position: absolute;
    bottom: -5px;
  }
}
.tour-content-box {
  position: relative;
  overflow: hidden;
  padding: 0 20px;
  border-radius: 4px;
  overflow: hidden;
  .tour-left-tips {
    width: 80px;
    height: 32px;
    background: $color-primary;
    color: #fff;
    position: absolute;
    left: -40px;
    top: 0px;
    line-height: 40px;
    font-size: 12px;
    transform-origin: center top;
    transform: rotateZ(-45deg);
    text-align: center;
  }
  .tour-content {
    .tour-content-head {
      justify-content: flex-end;
      padding-bottom: 10px;
      padding-top: 16px;
      .iconfont {
        font-size: 10px;
        margin-bottom: 2px;
        color: #999;
        cursor: pointer;
      }
    }
    .tour-content-con {
      text-align: start;
      padding-bottom: 12px;
    }
  }
}

.tour-bottom {
  height: 52px;
  padding: 0 20px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  .btns {
    width: 60px;
    height: 28px;
    background: $color-primary;
    color: #fff;
    text-align: center;
    line-height: 28px;
    border-radius: 4px;
  }
  .text {
    color: $color-primary;
  }
  :nth-child(n) {
    cursor: pointer;
  }
  :not(:last-child) {
    margin-right: 12px;
  }
}

/* 向上的箭头 */

.normal-arrow-top {
  font-size: 0;
  line-height: 0;
  border-width: 0.5rem;
  border-color: #fff;
  width: 0;
  border-top-width: 0;
  border-style: dashed;
  border-bottom-style: solid;
  border-left-color: transparent;
  border-right-color: transparent;
  position: absolute;
  top: -0.5rem;
}

.normal-arrow-down {
  font-size: 0;
  line-height: 0;
  border-width: 0.5rem;
  border-color: #fff;
  width: 0;
  border-top-width: 0;
  border-style: dashed;
  border-bottom-style: solid;
  border-left-color: transparent;
  border-right-color: transparent;
  transform: rotateZ(180deg);
  position: absolute;
  bottom: -0.5rem;
}
</style>