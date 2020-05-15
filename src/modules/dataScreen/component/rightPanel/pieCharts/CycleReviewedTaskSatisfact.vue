<template>
  <div class="right-pie-item cycle-rts-pie">
    <!-- 头部 title显示 -->
    <div class="pie-header">
      <div class="pie-title-main">
        <span class="pie-title-icon"></span>
        {{ mainTitle }}
      </div>
    </div>
    <!-- 报表 报表与附属信息显示 -->
    <div id="sd-rp-rts" class="pie-container"></div>
  </div>
</template>

<script>
import echarts from 'echarts';

import EventMap from '../../../event';

const commonChartsConfig = {
  type: 'pie',
  radius: '50%',
  center: ['50%', '40%'],
  color(params) {
    let data = params.data;
    let color = data.color;
    return color;
  }
}

let currCharts = null;


export default {
  name: 'cycle-rts-pie',
  props: {
    params: {
      type: Object,
      default: () => ({})
    },
    data: {
      type: Object,
      default: () => ({})
    },
    titleSuffix: {
      type: String,
      default: '已评价工单的客户满意度'
    },
    // 自定义样式，要获取样式配置 通过getStyleConfig来获取merge后的配置
    styleConfig: {
      type: Object,
      default: () => ({})
    },
    upImg: {
      type: String,
      default: ''
    },
    downImg: {
      type: String,
      default: ''
    }
  },
  computed: {
    cycleRange() {
      let cyclerange = (this.params || {}).cycleRange || {};
      return cyclerange;
    },
    mainTitle() {
      let label = this.cycleRange.label || '';

      return `${label}${this.titleSuffix}`;
    }
  },
  methods: {
    initECharts() {
      currCharts = echarts.init(document.querySelector('#sd-rp-rts'));
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
            ...commonChartsConfig,
            data: chartsData,
            label: {
              show: true,
              position: 'outside',
              formatter(params) {
                let {data, percent} = params;
                let {change, value} = data
                
                let bgName = '';
                
                // change = Math.random() > 0.5 ? 3 : -100;
                if (change === 0) {
                  // return `{name|${label}}\n {number|${value}}`;
                  return `{number|${value}(${percent}%)}`;
                }
                if (change > 0) {
                  bgName = 'bgUp';
                }
                if (change < 0) {
                  bgName = 'bgDown';
                }

                // return `{name|${label}}\n {number|${value}} {${bgName}| }`;
                return `{number|${value}(${percent}%)} {${bgName}| }`
              },
              rich: {
                name: {
                  fontSize: 16
                },
                number: {
                  fontSize: 16
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
              length: 12,  
              length2: 15,
            },
          },
        ],
        legend: {
          bottom: 10,
          left: 'center',
          itemHeight: 10,
          itemWidth: 10,
          data,
          formatter(params) {
            return params;
          },
          textStyle: {
            color: '#ffffff',
            fontSize: 12
          }
        },
      }
      return option;
    }, 

    /**
     * 获取echarts主数据
     */
    getEChartsData() {
      let data = (this.data || []).data;

      return data;
    },
    updateCharts() {
      let data = this.getEChartsData();
      let option = this.getEChartsOption(data);

      currCharts.setOption(option);
    }
  },
  mounted() {
    this.initECharts();
    this.$eventBus.$on(EventMap.NEED_REFRESH_RIGHT_PIE_RTS, this.updateCharts);
  },
  beforeDestroy() {
    this.currCharts = null;
    this.$eventBus.$off(EventMap.NEED_REFRESH_RIGHT_PIE_RTS, this.updateCharts);
  }
}
</script>
