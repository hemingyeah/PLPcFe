<template>
  <div class="sample-tooltip-container" ref="sampleTooltipContainer">

    <!-- start 示例数据 角标 -->
    <el-tooltip :content="tip" placement="top" v-if="isGuideData" :disabled="!isGuideData">
      <div class="superscript"></div>
    </el-tooltip>
    <!-- <el-tooltip :content="tip" placement="top">
      <div class="superscript"></div>
    </el-tooltip> -->
    <!-- end 示例数据 角标 -->

    <!-- start 内容 -->
    <div class="sample-tooltip-content" ref="sampleTooltipContent" :class="isGuideData ? 'sample-tooltip-content-padding' : ''">
        <slot name="content" :isContentTooltip="isContentTooltip"></slot>
    </div>
    <!-- end 内容 -->

  </div>
</template>

<script>

export default {
  name: "sample-tooltip",
  data(){
    return {
      isContentTooltip: false,
    }
  },
  props: {
    row: {
      type: Object,
      dafault: () => ({})
    },
    tip: {
      type: String,
      default: '这是一条示例数据，您可以在系统管理-系统日志中清除该数据'
    }
  },
  computed: {
    isGuideData() {
      return this.row.isGuideData === true;
    }
  },
  mounted() {
    const EL = this.$refs.sampleTooltipContent || {};

    if(EL.offsetWidth < EL.scrollWidth) {
      this.isContentTooltip = true;
    }
  },
}
</script>

<style lang="scss" >
  .sample-tooltip-container {
    display: flex;
  }

  .superscript{
    width: 24px;
    height: 24px;

    position: absolute;
    z-index: 1;

    padding-left: 0px !important;

    &::before{
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 24px;
      height: 24px;
      background: linear-gradient(135deg, #ff9900 50%, transparent 50%);
    }

    &::after{
      content: "示例";
      position: absolute;
      left: -1px;
      top: -1px;
      height: 24px;
      width: 24px;
      line-height: 16px;
      font-size: 12px;
      color: #fff;
      text-align: center;
      transform: scale(0.7166666) rotateZ(-45deg);
    }
  }

  .sample-tooltip-content {
    flex: 1;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

    & > * {
      white-space: nowrap;
    }
  }

  .sample-tooltip-content-padding {
    padding-left: 20px;
  }
</style>