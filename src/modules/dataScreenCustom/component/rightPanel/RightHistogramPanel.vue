<template>
  <div class="right-histogram-panel">
    <div
      v-for="(feature, idx) in features"
      :key="idx"
      class="feature-item"
    >
      <component 
        :is="getComponentName(feature)"
        :data="feature"
        :params="params"
      ></component>
    </div>
  </div>
</template>

<script>

import EventMap from '../../event';
// import * as mock from '../../mock';

const cycleCompleteTaskCountAverageTime = 'cycleCompleteTaskCountAverageTime';
const cycleCompleteTaskAndTagUserCount = 'cycleCompleteTaskAndTagUserCount';
const cycleServerContent = 'cycleServerContent';
const cycleServerTypeRankingCount = 'cycleServerTypeRankingCount';

/**
 * 命名  
 * "Task" => "Task"
 * "Event" => "Server"
 */
import CycleGTATHistogram from './histograms/CycleCompleteTaskWithAvgTime.vue'
import CycleCTGSHistogram from './histograms/CycleCompleleTaskWithGroupSize.vue';
import CycleECHistogram from './histograms/CycleEventContent.vue';
import CycleETHistogram from './histograms/CycleEventType.vue';

export default {
  name: 'histogram-panel',
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
    }
  },
  methods: {
    getComponentName(feature) {
      let name = '';
      switch (feature.key) {
      case cycleCompleteTaskCountAverageTime:
        // name = 'cycle-ct-gs-histogram';
        name = CycleGTATHistogram.name
        break;
      case cycleCompleteTaskAndTagUserCount:
        name = CycleCTGSHistogram.name;
        break;
      case cycleServerContent:
        name = CycleECHistogram.name;
        break;
      case cycleServerTypeRankingCount:
        name = CycleETHistogram.name;
        break;
      default:
        break;
      }

      return name;
    },

    updateFeaturesHandler(update) {
      let data = update;
      let featureItems = this.config.items || [];
      this.features = featureItems.filter(feature => feature.value && feature.key).map(feature => {
        let base = { ...feature };
        let key = feature.key;

        base.data = data[key] || [];

        // if (key === 'cycleServerContent') {
        //   base.data = [ ]
        // }
        // if (key === 'cycleServerTypeRankingCount') {
        //   base.data = [ ]
        // }
        return base;
      });

      // 校对数量
      let featureLimit = this.config.limit;
      if (this.features.length > featureLimit) {
        this.features = this.features.slice(0, featureLimit);
      }

      this.broadcast();

    },
    broadcast() {
      this.$nextTick(() => {
        // this.$eventBus.$emit(EventMap.NEED_REFRESH_RIGHT_SEARCH_AT);
        this.$eventBus.$emit(EventMap.NEED_REFRESH_RIGHT_SEARCH_GS);
        this.$eventBus.$emit(EventMap.NEED_REFRESH_RIGHT_SEARCH_EC);
        this.$eventBus.$emit(EventMap.NEED_REFRESH_RIGHT_SEARCH_ET);
      })
    },
  },
  mounted() {
    this.$eventBus.$on(EventMap.NEED_UPDATE_RIGHT_HISTOGRAM, this.updateFeaturesHandler);

  },
  beforeDestroy() {
    this.$eventBus.$off(EventMap.NEED_UPDATE_RIGHT_HISTOGRAM, this.updateFeaturesHandler);
  },
  components: {
    [CycleGTATHistogram.name]: CycleGTATHistogram,
    [CycleCTGSHistogram.name]: CycleCTGSHistogram,
    [CycleECHistogram.name]: CycleECHistogram,
    [CycleETHistogram.name]: CycleETHistogram
  }
}
</script>

<style lang="scss">
  $panelHeightRatio: 42%;

  .right-histogram-panel {
    position: relative;
    height: $panelHeightRatio;
    flex-shrink: 0;

    display: flex;
    justify-content: space-between;
    flex-wrap: nowrap;

    // 公共样式
    .feature-item {
      $height: 31px;
      height: 100%;
      background-color: rgba(8, 77, 72, 0.3);

      .right-histogram-item {
        height: 100%;
      }

      .histogram-header {
        height: $height;
        min-width: 422px;
        flex-grow: 0;

        display: flex;
        flex-wrap: nowrap;
        justify-content: flex-start;
        align-items: center;

        // background: linear-gradient(90deg, #1666AB 0%, transparent 70%);
        background: linear-gradient(90deg, #004791 0%, rgba(0, 91, 187, 0) 100%);

        .histogram-title-main {
          display: flex;
          flex-wrap: nowrap;
          align-items: center;
          justify-content: flex-start;
          margin-right: 31px; 

          font-weight: 400;
          font-size: 14px;
          color: #ffffff;

          .histogram-title-icon {
            display: inline-block;
            width: 10px;
            height: 10px;
            // background-color: #EF752D;

            margin: 0 6px 0 15px;
          }
        }

        .histogram-extend-title {
          display: flex;
          flex-wrap: nowrap;
          align-items: center;
          justify-content: flex-start;

          font-weight: 400;
          font-size: 14px;
          color: #ffffff;

          .histogram-title-time-icon {
            width: 12px;
            height: 12px;
            margin-right: 5px;
            margin-top: 1px;
          }

          .histogram-title-engineer-icon {
            width: 11px;
            height: 14px;
            margin-right: 7px;
          }
        }
      }
      .histogram-container {
        height: calc(100% - 31px); 
        padding: 12px 0 8px;
      }
    }
  }
</style>