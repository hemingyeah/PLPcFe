<template>
  <!-- start 新用户向导 -->
  <div 
    class="guide-view" 
    v-loading.lock="loading"
    element-loading-text="正在设置您的自定义系统..."
    element-loading-spinner="iconfont icon-loading1">

    <!-- start 步骤条 -->
    <div class="guide-view-step" v-if="!isLast">

      <base-steps
        :steps="steps"
        :active="stepIndex"
        :align-center="stepsOptions.alignCenter"
        :finish-status="stepsOptions.finishStatus">
      </base-steps>
      
    </div>
    <!-- end 步骤条 -->

    <!-- start 内容 -->
    <div class="guide-view-content">

      <keep-alive>
        <!-- start 组件 -->
        <component 
          :is="componentId"
          :key="`guide_${componentId}`"
          :data="guideValue"
          @next="next"
          @updateLoading="updateLoading">
        </component>
      </keep-alive>
      <!-- end 组件 -->

    </div>
    <!-- end 内容 -->

  </div>
  <!-- end 新用户向导 -->
</template>

<script>
import GuideStepOneTrade from './GuideStepOneTrade.vue';
import GuideStepTwoAllot from './GuideStepTwoAllot.vue';
import GuideStepThreeAdmin from './GuideStepThreeAdmin.vue';
import GuideStepFourQrcode from './GuideStepFourQrcode.vue'

export default {
  name: 'guide-view',
  inject: ['initData'],
  data() {
    return {
      componentMap: {
        0: 'guide-step-one-trade',
        1: 'guide-step-two-allot',
        2: 'guide-step-three-admin',
        3: 'guide-step-four-qrcode'
      },
      guideValue: {
        profession: '',
        role: [],
        code: '',
        qrcode: '',
        isShowUserGuide: false,
      },
      loading: false,
      stepIndex: 0, // 第几步
      steps: [
        {
          description: '请选择行业信息'
        },
        {
          description: '分配试用资格'
        }
      ],
      stepsOptions: {
        alignCenter: true,
        finishStatus: 'finsh',
      }
    }
  },
  computed: {
    // 组件id名字
    componentId() {
      return this.componentMap[this.stepIndex];  
    },
    isLast() {
      return this.stepIndex == 3;
    },
    // 跳过文字
    jumpText() {
      return '跳过'
    },
  },
  watch: {
    isLast: {
      handler(newValue, oldValue) {
        if(newValue) {
          this.$emit('isLast', true);
        }
      },
      immediate: true
    }
  },
  methods: {
    next(args) {
      let index = args[0];
      let { key, value } = args[1] || {};
      
      this.stepIndex = Number(index) || 0;
      this.guideValue[key] = value;

      let isShowUserGuide = this.guideValue.isShowUserGuide;

      if(isShowUserGuide) {
        this.$emit('guideUpdateModalShow', isShowUserGuide);
      }

    },
    updateLoading(isLoading) {
      this.loading = isLoading;
    }
  },
  components: {
    [GuideStepOneTrade.name]: GuideStepOneTrade,
    [GuideStepTwoAllot.name]: GuideStepTwoAllot,
    [GuideStepThreeAdmin.name]: GuideStepThreeAdmin,
    [GuideStepFourQrcode.name]: GuideStepFourQrcode
  }
}
</script>

<style lang="scss">
.guide-main {
  height: 100%;
}

.guide-view {
  height: 100%;
  margin: 0 auto;

  .el-loading-mask {

    background-color: #fff;
    i {
      width: 60px;
      height: 60px;
      margin-bottom: 30px;

      text-align: center;
      font-size: 48px;
      line-height: 60px;
    }
    i.icon-loading1 {
      animation: rotating 2s linear infinite;
      display: inline-block;
    }
    .el-loading-spinner {
      transform: translateY(-50%);
    }

  }

  .guide-view-title {
    border-bottom: 1px solid #eee;

    font-size: 14px;
    line-height: 30px;

    height: 30px;
    padding: 0 10px;
  }

  .guide-view-step {
    height: 92px;
    padding-top: 30px;
  }

  .guide-view-content {
    height: 100%;
    padding-top: 20px;
  }

  .guide-view-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;

    height: 108px;
    width: 100%;
    padding: 0 80px;

    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;

    .base-button {
      border-radius: 5px;

      height: 38px;
      width: 100px;

      margin: 0 auto;
    }

    .icon-left {
      margin-right: 8px;
    }
    .icon-right {
      margin-left: 8px;
    }

    span {
      display: flex;
      align-items: center;

      color: $color-primary;
      cursor: pointer;
      // line-height: 108px;
    }

    &-left {
      position: absolute;
      top: 50%;
      left: 80px;
      transform: translateY(-50%);
    }
    &-right {
      position: absolute;
      top: 50%;
      right: 80px;
      transform: translateY(-50%);
    }

  }

}

.guide-allot-view,
.guide-admin-main {
  padding: 0 80px;
}
.guide-trade-main {
  padding: 10px 80px;
}
.guide-qrcode-view {
  padding: 0 140px;
}

.guide-view-step {

  .el-step {

    .el-step__icon {
      border-color: #999;
      background-color: #999;
      color: #fff;

      height: 30px;
      width: 30px;
    }
    .el-step__line {
      margin: 0 40px !important;
    }
    .el-step__description {
      color: #333;
      font-size: 14px;
      margin-top: 12px;
    }
    .el-step__line-inner {
      border-style: hidden;
    }
    .el-step__icon-inner {
      font-size: 16px;
      font-weight: normal;
    }

    .is-process,
    .is-finsh {
      .el-step__icon {
        border-color: $color-primary;
        background-color: $color-primary;
      }
    }

    .el-step__description.is-process {
      color: $color-primary;
    }

  }

}
</style>