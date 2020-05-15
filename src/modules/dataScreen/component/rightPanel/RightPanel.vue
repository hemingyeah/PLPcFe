<template>
  <div class="data-screen-right-panel">
    <!-- 四周边角 -->
    <four-corners :direction="['lt','rb','lb']"></four-corners>
    <!-- 右上角数据面板 -->
    <data-right-top-panel
      :config="config.rightTop"
      :params="rightParams"
    ></data-right-top-panel>
    <!-- 柱状图面板 -->
    <histogram-panel
      :config="config.rightHistogram"
      :params="rightParams"
    ></histogram-panel>
    <!-- 饼状图面板 -->
    <pie-chart-panel
      :config="config.rightPieChart"
      :params="rightParams"
    ></pie-chart-panel>
    <!-- 右上角时间选择器 -->
    <right-top-selector
      @input="changeTimeHandler"
      :params="rightParams"
    ></right-top-selector>
  </div>
</template>

<script>

import DataRightTopPanel from './DataRightTopPanel.vue';
import HistogramPanel from './RightHistogramPanel.vue';
import PieChartPanel from './RightPieChartPanel.vue';
import RightTopSelector from './RightTopSelector.vue';
import FourCorners from '../common/FourCorners.vue';


export default {
  name: 'right-panel',
  props: {
    config: {
      type: Object,
      default: () => ({})
    },
    params: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      rightParams: {} // 供右侧面板使用的params
    }
  },
  methods: {
    changeTimeHandler (time) {
      this.rightParams.cycleRange = time;

      this.$emit('update-time', time)
    }
  },
  mounted() {
    this.rightParams = {
      cycleRange: this.params.cycleRange
    }
  },
  components: {
    [DataRightTopPanel.name]: DataRightTopPanel,
    [HistogramPanel.name]: HistogramPanel,
    [PieChartPanel.name]: PieChartPanel,
    [RightTopSelector.name]: RightTopSelector,
    [FourCorners.name]: FourCorners
  }
}
</script>

<style lang="scss">
  @import '../common/style.scss';

  // 右侧容器
  .data-screen-right-panel {
    position: relative;
    width: $rightRatio;
    height: 100%;
    flex-shrink: 0;

    margin: $contentMarginTop 0 0 $rightPanelMarginLeft;
    border-bottom: $panelBorderStyle;
    border-left: $panelBorderStyle;
    background: rgba($color: #000000, $alpha: 0.2);

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: calc(100% - 194px); 
      height: $panelBorderWidth;
      background-color: $panelBorderColor;
    }

    &::after {
      content: '';
      position: absolute;
      right: 0;
      bottom: 0;
      width: $panelBorderWidth;
      height: calc(100% - 33px);
      background-color: $panelBorderColor;
    }
  }
</style>