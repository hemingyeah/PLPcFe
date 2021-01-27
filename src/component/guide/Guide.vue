<template>
  <!-- tour-content-out-box start -->
  <div>
    <div class="cover" v-if="needCover && showGuide"></div>
    <div
      class="cover-dom"
      v-if="needCover && showGuide && !canUse"
      :style="
        `width:${guideDom.width || 0}px;height:${guideDom.height ||
        0}px;top:${guideDom.top || 0}px;left:${guideDom.left || 0}px;`
      "
    ></div>
    <div id="vmDom"></div>
    <div
      :id="id"
      class="tour-content-out-box"
      :class="[guideMounted && showGuide && guideDom.top > -1 ? 'have-mounted' : '', guideSizeClass[guideSize]]"
      ref="guideCom"
      :style="guideStyle"
    >
      <div
        v-if="arrowDirection == 'up'"
        class="normal-arrow-top tour-arrow"
        :style="arrowStyle"
      ></div>
      <div
        v-if="arrowDirection == 'down'"
        class="normal-arrow-down tour-arrow-down"
        :style="arrowStyle"
      ></div>
      <div
        v-if="arrowDirection == 'left'"
        class="normal-arrow-left tour-arrow"
        :style="arrowStyle"
      ></div>
      <div
        v-if="arrowDirection == 'right'"
        class="normal-arrow-right tour-arrow"
        :style="arrowStyle"
      ></div>
      <div class="tour-content-box">
        <div v-if="haveStep" class="tour-left-tips">
          {{ `${nowStep}/${totalStep}` }}
        </div>
        <div class="tour-content" @click="watchContentClick($event)">
          <div class="flex-x tour-content-head">
            <div class="flex-1 overHideCon-1">{{ title }}</div>
            <i
              @click.prevent="
                stopStep().then(() => {
                  showGuide = false;
                })
              "
              class="iconfont icon-fe-close"
            ></i>
          </div>
          <div class="tour-content-con" v-if="!diyContent">{{ content }}</div>
          <slot name="diyContent"></slot>
        </div>
      </div>
      <div slot="actions" class="tour-bottom">
        <!-- <div
        v-if="totalStep > 1 && nowStep > 1"
        class="text"
        @click.prevent="previousStep(1), (showGuide = false)"
      >
        上一步
      </div> -->
        <div
          v-if="totalStep > 1 && nowStep > 0 && nowStep < totalStep"
          class="btns"
          @click.prevent="
            nextStep(nowStep).then(() => {
              showGuide = false;
            })
          "
        >
          下一步
        </div>
        <div
          class="btns"
          @click.prevent="
            finishBtnFn().then(() => {
              showGuide = false;
            })
          "
        >
          {{ finishBtn }}
        </div>
      </div>
    </div>
  </div>
  <!-- tour-content-out-box end -->
</template>
<script>
import _ from 'lodash';
export default {
  name: 'guide-compoment',
  props: {
    totalStep: {
      type: Number | String,
      default: 1,
    },
    nowStep: {
      type: Number | String,
      default: 1,
    },
    title: {
      type: Number | String,
      default: '',
    },
    content: {
      type: Number | String,
      default: '',
    },
    needCover: {
      type: Boolean,
      default: false,
    },
    canUse: {
      type: Boolean,
      default: false,
    },
    finishBtn: {
      type: Number | String,
      default: 'ok',
    },
    gStyle: {
      type: Number | String,
      default: '',
    },
    id: {
      type: Number | String,
      default: '',
    },
    domId: {
      type: Number | String,
      default: '',
    },
    domObj: {
      type: Function,
    },
    stopStep: {
      type: Function,
    },
    finishBtnFn: {
      type: Function,
    },
    watchContentClick: {
      type: Function,
    },
    diyContent: {
      type: Boolean,
      default: false,
    },
    nextStep: {
      type: Function,
    },
    haveStep: {
      type: Boolean,
      default: false,
    },
    inside: {
      type: Boolean,
      default: false,
    },
    copyDom: {
      type: Boolean,
      default: false,
    },
    direction: {
      type: String,
      default: 'column',
    },
    guideSize: {
      type: String,
      default: 'size-1',
    },
  },
  data() {
    return {
      showGuide: true,
      guideStyle: '',
      arrowStyle: '',
      guideDom: {},
      loop: null,
      arrowDirection: 'up',
      guideMounted: false,
      guideSizeClass: {
        'size-1': 'size-240',
        'size-2': 'size-280',
        'size-3': 'size-320',
        'size-4': 'size-350',
      },
    };
  },
  methods: {
    clearGuide() {
      if (this.needCover) {
        let dom_ = this.domObj
          ? this.domObj()
          : document.getElementById(`${this.domId}`);
        dom_.classList.remove('guide-point');
        if (this.copyDom) {
          try {
            document.getElementById('vmDom').children[0].remove();
          } catch (error) {
            console.warn(error, 'error try catch');
          }
        }
      }
      clearInterval(this.loop);
    },
  },
  created() {},
  mounted() {
    this.loop = setInterval(() => {
      // console.log(this.domObj(), 321321);
      let res_;
      let guideDom = {
        width: 350,
        height: 400,
      };
      let dom
      try {
        dom = this.domObj
          ? this.domObj()
          : document.getElementById(`${this.domId}`);
        if (dom) res_ = dom.getBoundingClientRect();
        guideDom = this.$refs.guideCom.getBoundingClientRect();
       
      } catch (error) {
        console.warn(error, 'error try catch');
      }
      if (!res_ || ( this.guideDom && res_ && this.guideDom.top == res_.top && this.guideDom.left == res_.left )) return;
      let style_ = '';

      if (this.needCover && this.copyDom) {
        // 针对部分无法sticky的父元素使用直接复制引导dom元素 需要引入css不推荐使用
        try {
          document.getElementById('vmDom').children[0].remove();
        } catch (error) {
          console.warn(error, 'error try catch');
        }
        let dom_clone = dom.cloneNode(true);
        dom_clone.setAttribute('id', '');
        dom_clone.style.cssText = `position: fixed;z-index: 997;top:${
          res_.top
        }px;left:${res_.left}px;width:${res_.width}px;height:${
          res_.height
        }px;background:#fff;`;
        document.getElementById('vmDom').appendChild(dom_clone);
      }

      if (this.direction == 'row') {
        if (
          document.documentElement.clientWidth - res_.left - res_.width >= guideDom.width + 8
        ) {
          // 右侧有足够的位置
          this.arrowDirection = 'left';
          if (!this.inside) {
            style_ = `${style_};left:${res_.left + res_.width + 8 || 0}px`;
          } else {
            style_ = `${style_};left:${res_.left + 8 || 0}px;z-index:998`;
          }
        } else {
          // 左侧有足够的位置
          this.arrowDirection = 'right';

          if (!this.inside) {
            style_ = `${style_};right:${document.documentElement.clientWidth
              - res_.left
              + 12 || 0}px`;
          } else {
            style_ = `${style_};right:${document.documentElement.clientWidth
              - res_.left
              - res_.width
              + 8 || 0}px;z-index:998`;
          }
        }
        let top_guide = 0;
        top_guide = res_.top + (res_.height - guideDom.height) / 2;
        if (
          top_guide + guideDom.height > document.documentElement.clientHeight
        ) {
          top_guide = res_.top + res_.height - guideDom.height - 4;
        } else if (top_guide < 0) {
          top_guide = 4;
        }
        style_ = `${style_};top:${top_guide}px;`;
        this.arrowStyle = `top:${res_.height / 2 + res_.top - 4 - top_guide}px`;
        if (this.guideStyle != style_)
          (this.guideStyle = style_),
          (this.guideDom = res_),
          this.guideMounted = true;

        return;
      }

      if (
        document.documentElement.clientHeight - res_.top - res_.height >= guideDom.height + 8
      ) {
        // 底部有足够的位置
        this.arrowDirection = 'up';
        if (!this.inside) {
          style_ = `${style_};top:${res_.top + res_.height + 8 || 0}px`;
        } else {
          style_ = `${style_};top:${res_.top + 8 || 0}px;z-index:998`;
        }
      } else {
        // 顶部
        this.arrowDirection = 'down';

        if (!this.inside) {
          style_ = `${style_};top:${res_.top - guideDom.height - 8}px`;
        } else {
          style_ = `${style_};right:${res_.top
            + res_.height
            - guideDom.height
            - 8}px;z-index:998`;
        }
      }
      let left_guide = 0;
      left_guide = res_.left + (res_.width - guideDom.width) / 2;
      if (left_guide < 0) {
        left_guide = 4;
      }
      if (left_guide > document.documentElement.clientWidth - guideDom.width) {
        left_guide = res_.left + res_.width - guideDom.width - 4;
      }
      style_ = `${style_};left:${left_guide}px;`;
      this.arrowStyle = `left:${res_.width / 2 + res_.left - 4 - left_guide}px`;
      if (this.guideStyle != style_)
        (this.guideStyle = style_),
        (this.guideDom = res_),
        this.guideMounted = true;

      return;
    }, 500);

    if (this.needCover && !this.copyDom) {
      let dom_ = this.domObj
        ? this.domObj()
        : document.getElementById(`${this.domId}`);
      dom_.classList.add('guide-point');
    }
  },
  watch: {
    showGuide(newVal, oldVal) {
      if (!newVal) {
        this.clearGuide();
      }
    },
  },
  destroyed() {
    this.clearGuide();
  },
};
</script>
<style lang="scss">
.task-detail-btn-group {
  position: absolute;
  right: 12px;
  top: 8px;

  font-size: 0;
  z-index: 991;

  .iconfont {
    margin-left: 16px;
    color: $text-color-secondary;
    cursor: pointer;

    &.icon-bianji1 {
      color: $color-primary;
    }

    &.icon-shanchu-copy {
      margin-left: 13px;
    }
  }
}
</style>
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
  // background: #fff;
}

.tour-content-out-box {
  position: fixed;
  -webkit-filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.5)) !important;
  filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.5)) !important;
  z-index: 996;
  border-radius: 4px;
  background: #fff;
  width: 280px;
  opacity: 0;
  max-height: 400px;
  .tour-arrow {
    position: absolute;
  }
  .tour-arrow-down {
    position: absolute;
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
    height: 28px;
    background: $color-primary;
    color: #fff;
    position: absolute;
    left: -40px;
    top: 0px;
    line-height: 35px;
    font-size: 12px;
    transform-origin: center top;
    transform: rotateZ(-45deg);
    text-align: center;
  }
  .tour-content {
    .tour-content-head {
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

.normal-arrow-left {
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
  transform: rotateZ(-90deg);
  position: absolute;
  left: -0.7rem;
}

.normal-arrow-right {
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
  transform: rotateZ(90deg);
  position: absolute;
  right: -0.7rem;
}

.have-mounted {
  opacity: 1;
}

.size-240 {
  width: 240px;
}
.size-280 {
  width: 280px;
}
.size-320 {
  width: 320px;
}
.size-350 {
  width: 350px;
}
</style>
