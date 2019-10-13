<template>
  <div class="pie-chart-panel">
    <div
      v-for="(feature, idx) in features"
      :key="idx"
      class="feature-item"
    >
      <component
        :is="getComponentName(feature)"
        :data="feature"
        :params="params"
        :up-img="upImg"
        :down-img="downImg"
      ></component>
    </div>
  </div>
</template>

<script>

import EventMap from '../../event';
// import * as mock from '../../mock';

import CycleTaskType from './pieCharts/CycleTaskType.vue';
import CycleTaskProductType from './pieCharts/CycleTaskProductType.vue';
import CycleReviewedTaskSatisfact from './pieCharts/CycleReviewedTaskSatisfact.vue';

const cycleTaskType = 'cycleCompleteTaskTypeCount';
const cycleTaskProductType = 'cycleCompleteTaskProductCount';
const cycleReviewedTaskSatisfact = 'cycleEvaluateTaskCustomerSatisfied';

import UP_IMG from '@src/assets/img/screen-data-up.png';
import DOWN_IMG from '@src/assets/img/screen-data-down.png';


export default {
  name: 'pie-chart-panel',
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
      features: [],

      upImg: UP_IMG,
      downImg: DOWN_IMG
    }
  },
  methods: {
    getComponentName(feature) {
      let name = '';
      switch (feature.key) {
      case cycleReviewedTaskSatisfact:
        name = CycleReviewedTaskSatisfact.name;
        break;
      case cycleTaskType:
        name = CycleTaskType.name;
        break;
      case cycleTaskProductType:
        name = CycleTaskProductType.name;
        break;
      default:
        break;
      }
      
      return name;
    },

    /**
     * 为饼状图设置数据
     * 这里后台返回数据与setting中配置的字段不相同, 需要手动配置
     * @result 设置scope.features
     */
    setPieData (featureItems, response) {
      let showData = response.taskProuctTypeAndDegteeCount || {};
      let compareData = response.typeCountContrast || {};

      const taskTypeKey = cycleTaskType;
      const taskProductTypeKey = cycleTaskProductType;
      const taskReviewedStatisfiedKey = cycleReviewedTaskSatisfact;

      this.features = featureItems.filter(feature => feature.value).map(feature => {
        let base = { ...feature };

        if (feature.key === taskTypeKey) {
          base.data = this.getFormatTaskData(showData[taskTypeKey], compareData[taskTypeKey]);
        } else if (feature.key === taskProductTypeKey) {
          base.data = this.getFormatTaskData(showData[taskProductTypeKey], compareData[taskProductTypeKey]);
        } else if (feature.key === taskReviewedStatisfiedKey) {
          base.data = this.getReviewedSatisfiedData(showData[taskReviewedStatisfiedKey], compareData[taskReviewedStatisfiedKey]);
        }
        return base;
      })

      // 校对数量
      let featureLimit = this.config.limit;
      if (this.features.length > featureLimit) {
        this.features = this.features.slice(0, featureLimit);
      }
    },
    
    /**
     * 获取为charts格式化的工单类型相关数据
     * @params {Object} show 用于显示的数据
     * @params {Object} compare 用户比较的数据
     * @return {Object} 供ECharts绑定的数据DTO
     */
    getFormatTaskData(show, compare) {
      let result = [];
      // 遍历属性
      for (let i in show) {
        let showValue = show[i] || 0;
        let compareValue = compare[i] || 0;
        let change = showValue - compareValue; // 相对于上次的比较

        let item = {
          label: i || '',
          value: showValue,
          change,
          name: i
        }
        result.push(item);
      }

      return result;
    },

    /**
     * 获取为charts格式化的满意度
     */
    getReviewedSatisfiedData(show, compare) {
      const transMap = {
        satifaction: {
          label: '满意',
          // color: '#EB6100'
          color: '#42FACC'
        },
        general: {
          label: '一般',
          // color: '#747474'
          color: '#00AB95'
        },
        unSatifaction: {
          label: '不满意',
          // color: '#6E2592'
          color: '#147F52'
        }
      };
      let result = [];
      // 遍历属性
      for (let i in show) {
        let showValue = show[i] || 0;
        let compareValue = compare[i] || 0;
        let change = showValue - compareValue; // 相对于上次的比较

        let transItem = transMap[i] || {};
        let label = transItem.label || '';
        let color = transItem.color || '';

        let item = {
          label,
          color,
          value: showValue,
          change,
          name: label // legend使用
        }
        result.push(item);
      }

      return result;
    },

      
    updateFeaturesHandler(update) {
      console.info('%c@rc-update rightPie', 'color: red;font-weight: bold')

      let data = update;
      let featureItems = this.config.items || [];

      this.setPieData(featureItems, data);
      this.broadcast();
    },

    broadcast() {
      this.$nextTick(() => {
        this.$eventBus.$emit(EventMap.NEED_REFRESH_RIGHT_PIE_TT);
        this.$eventBus.$emit(EventMap.NEED_REFRESH_RIGHT_PIE_TPT);
        this.$eventBus.$emit(EventMap.NEED_REFRESH_RIGHT_PIE_RTS);
      })
    }
  },
  mounted() {
    this.$eventBus.$on(EventMap.NEED_UPDATE_RIGHT_PIECHART, this.updateFeaturesHandler);
  },
  beforeDestroy() {
    this.$eventBus.$off(EventMap.NEED_UPDATE_RIGHT_PIECHART, this.updateFeaturesHandler);
  },
  components: {
    [CycleTaskType.name]: CycleTaskType,
    [CycleTaskProductType.name]: CycleTaskProductType,
    [CycleReviewedTaskSatisfact.name]: CycleReviewedTaskSatisfact
  }
}
</script>

<style lang="scss">
  $panelHeightRatio: 37%;

  .pie-chart-panel {
    position: relative;
    height: $panelHeightRatio;
    flex-shrink: 0;
    margin-top: 12px;

    display: flex;
    justify-content: space-between;
    flex-wrap: nowrap;

    .feature-item {
      $headerHeight: 31px;
      height: 100%;
      background-color: rgba(8, 77, 72, 0.3);

      .right-pie-item {
        height: 100%;
      }

      .pie-header {
        height: $headerHeight;
        min-width: 422px;
        flex-grow: 0;

        display: flex;
        flex-wrap: nowrap;
        justify-content: flex-start;
        align-items: center;

        background: linear-gradient(90deg, #1666AB 0%, transparent 70%);

        .pie-title-main {
          display: flex;
          flex-wrap: nowrap;
          align-items: center;
          justify-content: flex-start;
          margin-right: 31px; 
          padding-left: 16px;

          font-weight: 400;
          font-size: 14px;
          color: #ffffff;
        }

      }
      .pie-container {
        height: calc(100% - 31px); 
      }
    }
  }
</style>