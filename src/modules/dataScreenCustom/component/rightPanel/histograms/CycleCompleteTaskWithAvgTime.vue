<template>
  <div class="right-histogram-item cycle-ct-at-histogram">
    <!-- 头部 title显示 -->
    <div class="histogram-header">
      <div class="histogram-title-main">
        <span class="histogram-title-icon"></span>
        {{ mainTitle }}
      </div>
      <!-- <div class="histogram-extend-title">
        <img
          :src="timeIcon"
          class="histogram-title-time-icon"/>
        {{ extendTitle }}
      </div> -->
    </div>
    <!-- 报表 报表与附属信息显示 -->
    <!-- <div class="histogram-container" id="sd-ctat"></div> -->
    <div class="histogram-container">
      <el-carousel direction="vertical" :interval="5000" arrow="nerver" @change="changeCarousel" indicator-position="none" style="height:100%">
        <el-carousel-item v-for="index in Math.ceil(data.data.length/5)" :key="index">
          <div :ref="`sd-ctgs-p`" class="histogram-page" :key="index">xxx</div>
        </el-carousel-item>
      </el-carousel>
    </div>
  </div>
</template>

<script>

import echarts from 'echarts';
import TIME_IMG from '@src/assets/img/screen-data-time.png';

import EventMap from '../../../event';
import WorkTimeMixins from './mixins';
import * as DSApi from '@src/api/CustomScreenDataApi';
import { Carousel, CarouselItem} from 'element-ui'
import platform from '@src/platform';


let currChartsPList = []
let refreshDataTimeInterval = 10 * 1000

const baseStyleConfig = {
  itemColor: '#33FFCD', // 柱状图填充颜色
  histogramHeight: '20', // 柱状图item高度
  grid: {
    top: 15,
    right: 180,
    bottom: 10,
    left: 20,
  }
}

export default {
  name: 'cycle-ct-at-histogram',
  components:{
    elCarousel:  Carousel,
    elCarouselItem:CarouselItem
  },
  mixins: [WorkTimeMixins],
  props: {
    params: {
      type: Object,
      default: () => ({})
    },
    titleSuffix: {
      type: String,
      default: '月度工时利用率（本月）'
    },
    extendTitleSuffix: {
      type: String,
      default: ''
    },
    timeIcon: {
      type: [Object, String],
      default: TIME_IMG
    },
    // 自定义样式，要获取样式配置 通过getStyleConfig来获取merge后的配置
    styleConfig: {
      type: Object,
      default: () => ({})
    },
    max: { // 最多显示的条目
      type: Number,
      default: 100
    }
  },
  data(){
    return {
      data:{
        belong:'rightHistogram',
        data:[],
        key: 'cycleCompleteTaskCountAverageTime',
        label: '人员周期内完成工单数量及平均工单用时',
        name: 'cycleCompleteTaskCountAverageTime',
        value: true
      },
      refreshInterval:null,
      abc:21
    }
  },
  computed: {
    cycleRange() {
      let cyclerange = (this.params || {}).cycleRange || {};

      return cyclerange;
    },
    mainTitle() {
      let label = this.cycleRange.label || '';

      return `${this.titleSuffix}`;
    },
    extendTitle() {
      let label = this.cycleRange.label || '';

      return `${label}${this.extendTitleSuffix}`;
    },
  },
  methods: {
    changeCarousel (index) {
      setTimeout(() => {
        this.initEChartsP(index)
      }, 300);
    },
    initEChartsP (index = 0) {
      if (!currChartsPList[index]) {
        currChartsPList[index] = echarts.init(this.$refs['sd-ctgs-p'][index]);
      }
      this.updateCharts(index)
    },
    /**
     * 获取合并后的style配置，仅在更新chartsOptions时使用 无需computed
     */
    getCustomConfig() {
      let result = Object.assign(baseStyleConfig, this.styleConfig);

      return result;
    },


    getEChartsOption(data, maxXAxis) {
      const config = this.getCustomConfig();
      // const hasSupData = data2 && data2.length;

      const chartsData = this.getEChartsData(data);
      // const chartsDataSup = hasSupData && this.getEChartsData(data2);
      const markPointData = this.getMarkPointData(data);

      const option = {
        tooltip: {
          trigger: 'axis',
        },
        xAxis: {
          show: false,
          max:maxXAxis
        },
        yAxis: {
          type: 'category',
          show: false,
          inverse: true,
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
                    let hidden = params.data.hidden;
                    if (hidden) return '';
                    let hours = params.data.hours;

                    return `{wrap| }{text|${hours}%}`;
                  },
                  rich: {
                    img: {
                      backgroundColor: {
                        image: TIME_IMG,
                      },
                      width: 20,
                      height: 20,
                    },
                    wrap: {
                      width: 10
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

      // // 如果有辅助数据填充辅助数据
      // if (hasSupData) {
      //   option.series.push({
      //     type: 'bar',
      //     stack: 'one',
      //     data: chartsDataSup,
      //     itemStyle: {
      //       normal: {
      //         color: 'none'
      //       }
      //     }
      //   })
      // }

      return option;
    }, 

    /**
     * 获取echarts主数据
     */
    getEChartsData(data) {
      return (data || []).slice().map(item => {
        let efficiency = item.efficiency || 0;
        let isInteger = efficiency % 1 === 0;
        let hours = isInteger ? efficiency : item.efficiency.toFixed(2);

        return {
          name: item.userId,
          value: item.workDays,
          hours
        }
      });
    },
    /**
     * 获取markPointData
     */
    getMarkPointData(data) {
      return (data || []).map((item, index) => {
        let efficiency = item.efficiency || 0;
        let isInteger = efficiency % 1 === 0;
        let hours = isInteger ? efficiency : item.efficiency.toFixed(2);

        let idx = item.no;
        let label = item.userName;
        label = label ? label : item.tagUserCount ? '无' : '';

        return {
          yAxis: index,
          xAxis: 0,
          label,
          idx,
          hours,
          hidden: item.hidden
        }
      })
    },
    updateCharts(index = 0) { 
      let data = this.data.data.slice(index * 5, (index + 1) * 5)
      if(data.length < 5){
        for(let i = 0;5 - data.length;i++){
          data.push({hidden:true})
        }
      }

      let optionP = this.getEChartsOption(data, this.data.data[0].workDays || 10);
      currChartsPList[index].setOption(optionP);
    },

    /**
     * 请求刷新工时利用率
     */
    refreshWorkTime(){
      DSApi.getWorkingHoursEfficiency().then(res=>{
        if ((!res.succ) && (!res.success || (!res.data))) {
          return res.message && platform.alert(res.message);
        }
        this.data.data = res.data.cycleWorkingHoursEfficiencyCount
        refreshDataTimeInterval = res.data.nextRefresh * 1000
      })
    },
    registerLoop() {
      if (this.refreshInterval) clearInterval(this.refreshInterval);
      this.refreshInterval = setInterval(this.refreshWorkTime, refreshDataTimeInterval);
    },
  },
  created(){
    this.refreshWorkTime()
  },
  mounted() {
    this.registerLoop();
    // this.$eventBus.$on(EventMap.NEED_REFRESH_RIGHT_SEARCH_AT, this.updateCharts);

  },
  beforeDestroy() {
    clearInterval(this.refreshInterval);
    this.refreshInterval = null
    // this.$eventBus.$off(EventMap.NEED_REFRESH_RIGHT_SEARCH_AT, this.updateCharts);
  }
}
</script>

<style lang="scss">

  .cycle-ct-at-histogram {
    .histogram-title-icon {
      background-color: #32FFCD;
    }
  }
</style>
<style scoped lang="scss">
/deep/.el-carousel{
  overflow-y: hidden;
  .el-carousel__container{
  height: 100%;
  }
  .el-carousel__item.is-animating{
    transition:transform .8s ease-in-out
  }
}

</style>