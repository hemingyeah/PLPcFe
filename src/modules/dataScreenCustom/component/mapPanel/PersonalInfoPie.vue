<template>
  <div class="map-pie-item personal-info-pie">
    <!-- 头部 title显示 -->
    <div class="pie-header">
      <div class="pie-title-main">
        人员信息
      </div>
    </div>
    <!-- 报表 报表与附属信息显示 -->
    <div id="map-person-pie" class="pie-item-container"></div>
  </div>
</template>

<script>

import echarts from 'echarts';

import {commonPieConfig} from './mapConfig';
import EventMap from '../../event';


let currCharts = null;

export default {
  name: 'personal-info-pie',
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  methods: {
    initECharts() {
      currCharts = echarts.init(document.querySelector('#map-person-pie'));
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
                let data = params.data;
                let {label, value} = data;
                
                // return `{name|${label}}\n {number|${value}人}`;
                return `{name|${label}} {number|${value}人}`;
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
              // let index = params.dataIndex;
              let color = params.data.color
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
    this.$eventBus.$on(EventMap.NEED_REFRESH_MAP_PERSON_PIE, this.updateCharts);
  },
  beforeDestroy() {
    this.currCharts = null;
    this.$eventBus.$off(EventMap.NEED_REFRESH_MAP_PERSON_PIE, this.updateCharts);
  },
}
</script>

<style lang="scss">

  .personal-info-pie {
    position: relative;
  }
</style>