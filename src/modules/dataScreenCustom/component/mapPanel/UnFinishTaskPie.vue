<template>
  <div class="map-pie-item unfinish-task-pie">
    <!-- 头部 title显示 -->
    <div class="pie-header">
      <div class="pie-title-main">
        未完成工单
      </div>
    </div>
    <!-- 报表 报表与附属信息显示 -->
    <div id="map-task-pie" class="pie-item-container"></div>
  </div>
</template>

<script>

import echarts from 'echarts';

import {commonPieConfig} from './mapConfig';
import EventMap from '../../event';

let currCharts = null;

export default {
  name: 'unfinish-task-pie',
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  methods: {
    initECharts() {
      currCharts = echarts.init(document.querySelector('#map-task-pie'));
    },

    getEChartsOption(data) {
      const chartsData = data;

      const option = {
        grid: {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0
        },
        series : [
          {
            ...commonPieConfig,
            data: chartsData,
            label: {
              show: true,
              position: 'outside',
              formatter(params) {
                let {data, percent} = params;
                let {label} = data;

                // return `{name|${label}}\n {number|${percent}%}`;
                return `{name|${label}} {number|${percent}%}`;
              },
              rich: {
                name: {
                  fontSize: 12
                },
                number: {
                  fontSize: 12
                },
                bgUp: {
                  backgroundColor: {
                    image: this.upImg,
                  },
                  width: 10,
                  height: 12,
                },
                bgDown: {
                  backgroundColor: {
                    image: this.downImg,
                  },
                  width: 10,
                  height: 12,
                }
              }
            },
            labelLine: {
              length: 5,  
              length2: 7,
            },
            color(params) {
              let {color} = params.data || {};
              return color;
            }
          },
        ]
      }
      return option;
    },

    getEchartsData(data) {
      // 特殊处理
      // let data = (this.data)
      return data || this.data;
    },

    updateCharts(update) {
      let data = this.getEchartsData(update);
      let option = this.getEChartsOption(data);

      currCharts.setOption(option);
    }
  },
  mounted() {
    this.initECharts();
    this.$eventBus.$on(EventMap.NEED_REFRESH_MAP_TASK_PIE, this.updateCharts);
  },
  beforeDestroy() {
    this.currCharts = null;
    this.$eventBus.$off(EventMap.NEED_REFRESH_MAP_TASK_PIE, this.updateCharts);
  },
}
</script>

<style lang="scss">

  .unfinish-task-pie {
    position: relative;
  }
</style>