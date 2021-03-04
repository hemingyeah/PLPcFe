<template>
  <div class="data-right-top-panel">
    <div
      v-for="(feature, idx) in features"
      :key="idx"
      class="feature-item"
      :class="getFeatureClassName(idx)"
    >
      <div class="feature-title">
        {{ feature.label }}
      </div>
      <div class="feature-content">
        {{ getContentText(feature) }}
      </div>
    </div>

  </div>
</template>

<script>
/**
 * 总营收金额
 * 总客户数量
 * 近30天服务的客户数量
 * 近30天工单数量
 * 近30天完成事件总数
 * 
 * 横向排序
 */

import EventMap from '../../event';
import {formatNumberSplit} from '../common/util';

const COMPLETE_TASK_OVERALL_REVENUE = 'completeTaskOverallRevenue';


export default {
  name: 'data-right-top-panel',
  props: {
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      features: []
    }
  },
  methods: {
    updateFeatures(update) {
      //
      let data = update;
      let featureItems = this.config.items || []; // 所有功能配置

      this.features = featureItems.filter(feature => feature.value).map(feature => {
        let base = {
          ...feature
        }
        let key = feature.key;
        base.count = data[key];

        return base;
      });
    },

    getContentText(feature) {
      let count = (feature || {}).count || 0;
      let countStr = formatNumberSplit(count);

      if (feature.key === COMPLETE_TASK_OVERALL_REVENUE) {
        return `¥ ${countStr}`;
      }
      
      return countStr;
    },

    /**
     * @params {Number} idx feature序号
     * @return {String} className 
     */
    getFeatureClassName(idx) {
      if (idx === 0 || idx === 2) {
        return 'feature-item-middle';
      }

      if (idx === 1) {
        return 'feature-item-large';
      }

      if (idx === 3 || idx === 4) {
        return 'feature-item-small';
      }
    }
  },
  mounted() {
    this.$eventBus.$on(EventMap.NEED_UPDATE_RIGHT_TOP_EVENT, this.updateFeatures);
  }
}
</script>

<style lang="scss">
  $panelHeightRatio: 19.8%;

  .data-right-top-panel {
    height: $panelHeightRatio;
    // height: 164px;
    padding: 23px 21px;
    flex-shrink: 0;

    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    position: relative;
    
    .feature-item {
      height: 95px;
      .feature-title {
        color: #00FBFF;
        font-size: 18px;
        font-weight: 400;
        line-height: 1;

        margin-bottom: 13px;
      }
      .feature-content {
        color: #ffffff;
        font-size: 32px;
        line-height: 1;
        font-weight: normal;
      }
    }

    .feature-item-large {
      width: 400px;
    }

    .feature-item-middle {
      width: 300px;
    }

    .feature-item-small {
      width: 230px;
    }
  }
</style>