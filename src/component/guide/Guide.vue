<template>
  <!-- tour-content-out-box start -->
  <div
    :id="id"
    class="tour-content-out-box"
    v-show="showGuide"
    :style="gStyle ? gStyle : ''"
  >
    <div
      class="normal-arrow-top tour-arrow"
      :style="arrowStyle"
    ></div>
    <div class="tour-content-box">
      <div v-if="haveStep" class="tour-left-tips">
        {{ `${nowStep}/${totalStep}` }}
      </div>
      <div class="tour-content">
        <div class="flex-x tour-content-head">
          <i
            @click.prevent="stopStep().then(()=>{showGuide = false})"
            class="iconfont icon-fe-close"
          ></i>
        </div>
        <div class="tour-content-con">{{ content }}</div>
      </div>
    </div>
    <div slot="actions" class="tour-bottom">
      <!-- <div
        v-if="haveStep && nowStep > 1"
        class="text"
        @click.prevent="previousStep(1), (showGuide = false)"
      >
        上一步
      </div> -->
      <div
        v-if="haveStep && nowStep > 0 && nowStep < totalStep"
        class="btns"
        @click.prevent="nextStep(nowStep).then(()=>{showGuide = false})"
      >
        下一步
      </div>
      <div
        v-if="onlyOne"
        class="btns"
        @click.prevent="finishBtnFn().then(()=>{showGuide = false})"
      >
        {{ finishBtn }}
      </div>
    </div>
  </div>
  <!-- tour-content-out-box end -->
</template>
<script>
export default {
  name: 'guide-compoment',
  // eslint-disable-next-line vue/require-prop-types
  props: [
    'totalStep',
    'nowStep',
    'content',
    'haveStep',
    'finishBtn',
    'gStyle',
    'onlyOne',
    'id',
    'arrowStyle',
    'stopStep',
    'finishBtnFn'
  ],
  data() {
    return {
      showGuide: true,
    };
  },
  methods: {
  },
};
</script>
<style lang="scss" scoped>
.tour-content-out-box {
  position: absolute;
  -webkit-filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.5)) !important;
  filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.5)) !important;
  z-index: 999;
  border-radius: 4px;
  background: #fff;
  min-width: 240px;
  max-width: 350px;
  max-height: 400px;
  .tour-arrow {
    position: absolute;
    left: 0;
    right: 0;
    margin: auto;
    top: -5px;
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
</style>