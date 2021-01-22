<template>
  <div class="right-pie-item cycle-tt-pie">
    <!-- 头部 title显示 -->
    <div class="pie-header">
      <div class="pie-title-main">
        <span class="pie-title-icon"></span>
        {{ mainTitle }}
      </div>
    </div>
    <!-- 报表 报表与附属信息显示 -->
    <div id="sd-rp-tt" class="pie-container"></div>

  </div>
</template>

<script>
import echarts from 'echarts';

import EventMap from '../../../event';

const colorEnum = [
  // '#31B2A6', '#3CFEDF', '#FFDB43', '#FF9F6A', '#FA6E6D',
  // '#D661A9', '#B55CBE', '#9286E8', '#6370E0', '#3767D5',
  '#42FACC', '#00AB95', '#147F52', '#4F8415', '#33A8D0',
  '#378BCD', '#115D9E', '#115D9E', '#5D8FAE', '#7BA2BD',
];

// mock kehuyanshiyong
// const zz = ['设备维修', '家电维修', '办公设备工单', '设备交机培训', '默认工单', '水电煤保修']

const commonChartsConfig = {
  type: 'pie',
  radius: '50%',
  // radius : [15, '65%'],
  center: ['50%', '40%'],
  // roseType : 'radius',
  color(params) {
    let index = params.dataIndex;
    let colorEnumLength = colorEnum.length;

    return colorEnum[index % colorEnumLength]
  }
}

let currCharts = null;


export default {
  name: 'cycle-tt-pie',
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
      default: '工作类别'
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
      currCharts = echarts.init(document.querySelector('#sd-rp-tt'));
    },

    getEChartsOption(data) {

      const chartsData = data;

      const option = {
        grid: {
          left: 20,
          right: 20,
          top: 20,
          bottom: 20
        },
        series : [
          {
            ...commonChartsConfig,
            data: chartsData,
            label: {
              show: true,
              position: 'outside',
              formatter(params) {
                let {percent, data} = params;
                let { value} = data
                // let bgName = '';
                return `{name|${value}(${percent}%)}`

                // label = (label && label.length > 4 ) ? 
                //   `${label.substr(0, 4)}...` : label;

                // if (change === 0) {
                //   // return `{name|${label} ${percent}%} {number|${value}}`;
                // }
                // if (change > 0) {
                //   bgName = 'bgUp';
                // }
                // if (change < 0) {
                //   bgName = 'bgDown';
                // }
                // // return `{name|${label} ${percent}%} {number|${value}} {${bgName}| }`;
                // // return `{name|${percent}%} {number|${value}} {${bgName}| }`;
                // return `{name|${value}(${percent}%)} {${bgName}| }`;
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
              length: 8,  
              length2: 10,
              // show: false
            },
          },
        ],
        legend: {
        // orient: 'vertical',
        // top: 'middle',
          bottom: 10,
          left: 'center',
          itemHeight: 10,
          itemWidth: 10,
          // data: data.map(i => i.label)
          data,
          formatter(params) {
            return params;
          },
          // 不支持rich
          textStyle: {
            color: '#ffffff',
            fontSize: 12
          }
        },
      }
      return option;
    },

    /**
     * 获取echarts主数据, 也用于调试
     */
    getEChartsData() {
      let data = (this.data || []).data;

      // data = data.slice(0, 6); // just for dev

      // data = data.map((i, idx) => {
      //   i.name = zz[idx];
      //   return i;
      // })

      return data;
    },
    updateCharts(im) {
      this.$nextTick(() => {
        let data = this.getEChartsData();
        let option = this.getEChartsOption(data);

        currCharts.setOption(option);
      })

    }
  },
  mounted() {
    this.initECharts();
    this.$eventBus.$on(EventMap.NEED_REFRESH_RIGHT_PIE_TT, this.updateCharts);
  },
  beforeDestroy() {
    this.currCharts = null;
    this.$eventBus.$off(EventMap.NEED_REFRESH_RIGHT_PIE_TT, this.updateCharts);
  }
}
</script>
