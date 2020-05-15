<template>
  <div class="right-histogram-item cycle-ct-gs-histogram">
    <!-- 头部 title显示 -->
    <div class="histogram-header">
      <div class="histogram-title-main">
        <span class="histogram-title-icon"></span>
        {{ mainTitle }}
      </div>
      <div class="histogram-extend-title">
        <img
          :src="engineerIcon" 
          class="histogram-title-engineer-icon"
        />
        {{ extendTitleSuffix }}
      </div>
    </div>
    <!-- 报表 报表与附属信息显示 -->
    <!-- <div id="sd-ctgs" class="histogram-container"></div> -->
    <!-- 需要将报表展示2组 -->
    <div class="histogram-container">
      <div id="sd-ctgs-p1" class="histogram-page" :class="{'hisgotram-page-animation-p1': chartsPage > 1}"></div>
      <div v-if="chartsPage > 1" id="sd-ctgs-p2" class="histogram-page" :class="{'hisgotram-page-animation-p2': chartsPage > 1}"></div>
    </div>
  </div>
</template>

<script>
import echarts from 'echarts';
import ENGINEER_IMG from '@src/assets/img/screen-data-engineer.png';

import EventMap from '../../../event';
import HistogramMixins from './mixins';

// let currCharts = null;
let currChartsP1 = null;
let currChartsP2 = null;

const baseStyleConfig = {
  itemColor: '#FFCC00', // 柱状图填充颜色
  histogramHeight: '20', // 柱状图item高度
}

export default {
  name: 'cycle-ct-gs-histogram',
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
      default: '完成的工单'
    },
    extendTitleSuffix: {
      type: String,
      default: '当前团队人数'
    },
    engineerIcon: {
      type: [Object, String],
      default: ENGINEER_IMG
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
      currChartsP1 = echarts.init(document.querySelector('#sd-ctgs-p1'));
    },

    initEChartsP2() {
      if (!this.needPage) return;
      currChartsP2 = echarts.init(document.querySelector('#sd-ctgs-p2'));
    },

    /**
     * 获取合并后的style配置，仅在更新chartsOptions时使用 无需computed
     */
    getCustomConfig() {
      let result = Object.assign(baseStyleConfig, this.styleConfig);

      return result;
    },

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
        grid: {
          top: 15,
          right: 180,
          bottom: 10,
          left: 20,
        },
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
              symbolOffset: [0, -27],
              label: {
                normal: {
                  position: 'right',
                  distance: 0,
                  formatter(params) {
                    let data = params.data;
                    let {label, idx} = data;

                    let labelType = typeof label;
                    if (labelType !== 'string' || !label) return ''; 

                    return `{idx|${idx}.}  {st|${label}}`;
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
          // 辅助数据数据列，同stack，
          {
            type: 'bar',
            stack: 'one',
            data: chartsData,
            itemStyle: {
              normal: {
                color: 'none'
              }
            },
            // 显示右侧固定描述信息
            markPoint: {
              symbol: 'pin',
              symbolSize: 1,
              symbolOffset: [280, 0],
              label: {
                normal: {
                  position: 'right',
                  distance: 0,
                  formatter(params) {
                    let hidden = params.data.hidden
                    if (hidden) return '';

                    let engineerCount = params.data.person || 0;

                    return `{img| }{wrap| }{text|${engineerCount}人}`;
                  },
                  rich: {
                    img: {
                      backgroundColor: {
                        image: ENGINEER_IMG,
                      },
                      width: 20,
                      height: 25,
                    },
                    wrap: {
                      width: 8
                    },
                    text: {
                      color: '#ffffff',
                      fontWeight: '500',
                      fontSize: '16'
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
            },
          }
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
          name: item.userId,
          value: item.completeCount,
        }
      });
    },
    /**
     * 获取markPointData
     */
    getMarkPointData(data) {

      return (data || []).map((item, index) => {
        let label = item.tagName;
        let idx = item.idx;
        label = label ? label : item.tagUserCount ? '无' : '';
        
        return {
          yAxis: index,
          xAxis: 0,
          label,
          idx,
          person: item.tagUserCount || 0,
          hidden: item.hidden
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

      // currCharts.setOption(option);
    }
  },
  mounted() {
    // this.initECharts();
    this.initEChartsP1();
    this.initEChartsP2();
    this.$eventBus.$on(EventMap.NEED_REFRESH_RIGHT_SEARCH_GS, this.updateCharts);
  },
  beforeDestroy() {
    // currCharts = null;
    currChartsP1 = null;
    currChartsP2 = null;
    this.$eventBus.$off(EventMap.NEED_REFRESH_RIGHT_SEARCH_GS, this.updateCharts);
  }
}
</script>

<style lang="scss">

  @import './common.scss';

  .cycle-ct-gs-histogram {
    .histogram-title-icon {
      background-color: #FFCC01;
    }
  }
</style>