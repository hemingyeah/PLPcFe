<template>
  <div class="right-histogram-item cycle-cet-histogram">
    <!-- 头部 title显示 -->
    <div class="histogram-header">
      <div class="histogram-title-main">
        <span class="histogram-title-icon"></span>
        {{ mainTitle }}
      </div>
    </div>
    <!-- 报表 报表与附属信息显示 -->
    <!-- <div id="sd-et" class="histogram-container"></div> -->
    <div class="histogram-container">
      <div id="sd-et-p1" class="histogram-page" :class="{'hisgotram-page-animation-p1': chartsPage > 1}"></div>
      <div v-if="chartsPage > 1" id="sd-et-p2" class="histogram-page" :class="{'hisgotram-page-animation-p1': chartsPage > 1}"></div>
    </div>
  </div>
</template>

<script>
import echarts from 'echarts';

import EventMap from '../../../event';
import HistogramMixins from './mixins';

let currChartsP1 = null;
let currChartsP2 = null;

const baseStyleConfig = {
  itemColor: '#FFCC00', // 柱状图填充颜色
  histogramHeight: '20', // 柱状图item高度
  grid: {
    top: 15,
    right: 180,
    bottom: 10,
    left: 20,
  },
  markPoint: {
    symbolOffset: [0, -27]
  }
}

export default {
  name: 'cycle-et-histogram',
  mixins: [HistogramMixins],
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
      default: '服务类型排名'
    },
    // 自定义样式，要获取样式配置 通过getStyleConfig来获取merge后的配置
    styleConfig: {
      type: Object,
      default: () => ({})
    },
    max: {
      type: Number,
      default: 10
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
    },
  },
  methods: {
    initEChartsP1() {
      currChartsP1 = echarts.init(document.querySelector('#sd-et-p1'));
    },

    initEChartsP2() {
      if (!this.needPage) return;
      currChartsP2 = echarts.init(document.querySelector('#sd-et-p2'));
    },

    /**
     * 获取合并后的style配置，仅在更新chartsOptions时使用 无需computed
     */
    getCustomConfig() {
      let result = Object.assign(baseStyleConfig, this.styleConfig);

      return result;
    },

    /**
     * @param {Array} data 主数据
     * @param {Array} data2 辅助数据, 隐藏显示用于控制第二页数据中最大数据计算与表一不符合的问题
     */
    getEChartsOption(data, data2) {

      const config = this.getCustomConfig();
      const hasSupData = data2 && data2.length;

      const chartsData = this.getEChartsData(data);
      const chartsDataSup = hasSupData && this.getEChartsData(data2);
      const markPointData = this.getMarkPointData(data);

      const option = {
        tooltip: {
          trigger: 'axis',
        },
        xAxis: {
          show: false,
        },
        yAxis: {
          type: 'category',
          show: false,
          inverse: true 
        },
        grid: config.grid,
        series: [
          // 显示柱状图的数据列
          {
            type: 'bar',
            stack: 'one',
            data: chartsData,
            itemStyle: {
              normal: {
                color(params) {
                  return config.itemColor;
                },
              }
            },
            barWidth: config.histogramHeight,
            barMaxWidth: config.histogramHeight,
            // 显示柱状图右侧描述
            label: {
              normal: {
                show: true,
                position: 'right',
                distance: 8,
                formatter(params) {
                  let data = params.data;
                  return `{count|${data.value}}`;
                },
                rich: {
                  count: {
                    color: '#ffffff',
                    fontWeight: 500,
                    fontSize: 14,
                    width: 80, // important
                  },
                }
              },
            },
            // 显示柱状图上方描述
            markPoint: {
              symbol: 'pin',
              symbolSize: 1,
              symbolOffset: config.markPoint.symbolOffset,
              label: {
                normal: {
                  position: 'right',
                  distance: 0,
                  formatter(params) {
                    let data = params.data;
                    let {label, idx} = data;

                    let labelType = typeof label;
                    if (labelType !== 'string' || !label) return '';

                    return `{idx|${idx}.} {st|${label}}`;
                  },
                  rich: {
                    idx: {
                      fontSize: '16',
                      fontWeight: 700,
                      color: '#ffffff'
                    },
                    st: {
                      align: 'left',
                      color: '#ffffff',
                      fontSize: '14',
                      fontWeight: 400
                    }
                  }
                }
              },
              itemStyle: {
                normal: {
                  color: 'none',
                  borderColor: 'none',
                }
              },
              data: markPointData
            }
          },
        ]
      }

      // 如果有辅助数据填充辅助数据
      if (hasSupData) {
        option.series.push({
          type: 'bar',
          stack: 'one',
          data: chartsDataSup,
          itemStyle: {
            normal: {
              color: 'none'
            }
          }
        })
      }

      return option;
    }, 

    /**
     * 获取echarts主数据
     */
    getEChartsData(data) {
      return (data || []).slice().map(item => {
        return {
          value: item.count,
        }
      })
    },
    /**
     * 获取markPointData
     */
    getMarkPointData(data) {

      return (data || []).map((item, index) => {
        let label = item.serviceType;
        label = label ? label : item.count ? '无' : '';
        return {
          yAxis: index,
          xAxis: 0,
          label,
          idx: item.idx
        }
      })
    },
    
    updateCharts() {
      let {dataP1, dataP2} = this.getFormatOriginData();

      let optionP1 = this.getEChartsOption(dataP1);
      currChartsP1.setOption(optionP1);

      if (dataP2 && dataP2.length > 0 && this.needPage) {
        !currChartsP2 && this.initEChartsP2();

        let optionP2 = this.getEChartsOption(dataP2, dataP1);
        currChartsP2.setOption(optionP2);
      }
    }
  },
  mounted() {
    // this.initECharts();
    this.initEChartsP1();
    this.initEChartsP2();
    this.$eventBus.$on(EventMap.NEED_REFRESH_RIGHT_SEARCH_ET, this.updateCharts);
  },
  beforeDestroy() {
    // this.currCharts = null;
    currChartsP1 = null;
    currChartsP2 = null;
    this.$eventBus.$off(EventMap.NEED_REFRESH_RIGHT_SEARCH_ET, this.updateCharts);
  }
}
</script>

<style lang="scss">


  .cycle-cet-histogram {
    .histogram-title-icon {
      background-color: #FFCC01;
    }
  }
</style>