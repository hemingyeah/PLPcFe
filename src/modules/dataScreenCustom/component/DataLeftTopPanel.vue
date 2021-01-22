<template>
  <div class="data-left-top-panel">

    <div 
      v-for="(group, index) in colGroup"
      :key="index"
      class="data-col-group"
      :class="getGroupClassName(colGroup.length, index)"
    >
      <!-- 每个Group遍历 -->
      <div 
        v-for="(feature, idx) in group"
        :key="idx"
        class="feature-item"
        :class="getFeatureClassName(feature)"
      >
        <!-- 四周边角 -->
        <four-corners></four-corners>

        <!-- 这里分为两种布局，feature数量是否大于2 -->
        <template v-if="features.length > 2">
          <div class="title-row">
            <span class="main-title">{{ getMainTitle(feature) }}</span>
            <span v-if="feature.hasChange && feature.key === 'toDayCompleteTaskAndYesterdayCompare'" class="grow-title">
              {{ getChangeTitle(feature) }}
            </span>
            <span v-if="feature.hasChange && feature.key === 'thisMonthCompleteTaskAndLastMonthCompare'" class="grow-title">
              <span @click="selectCompare(false,feature)" :style="{color:monthCompare?'#00FBFF':'#004791'}">同比</span>
              <span @click="selectCompare(true,feature)" :style="{color:monthCompare?'#004791':'#00FBFF'}">环比</span>
            </span>
          </div>
          <div class="content-row">
            <span class="main-value">{{ getCountText(feature) }}</span>
            <span 
              v-if="feature.hasChange" 
              class="grow-value"
              :class="feature.change >= 0 ? 'grow-value-up' : 'grow-value-down'"
              v-html="getChangeTextHTML(feature)"
            ></span>
          </div>
        </template>

        <!-- feature数量等于2 -->
        <template v-else-if="features.length === 2">
          <!-- feature是否有变换量显示(较昨日增长等） -->
          <!-- feature 有变化量 -->
          <template v-if="feature.hasChange">
            <div class="haschange-inner-2">
              <div class="haschange-left">
                <div class="main-title">{{ getMainTitle(feature) }}</div>
                <div class="count-value">{{ getCountText(feature) }}</div>
              </div>
              <div class="haschange-right" :class="feature.change >= 0 ? 'grow-value-up' : 'grow-value-down'">
                <div class="change-title">{{ getChangeTitle(feature) }}</div>
                <div 
                  class="change-value" 
                  v-html="getChangeTextHTML(feature)"
                ></div>
              </div>
            </div>
          </template>
          <!-- feature 没有变化量 -->
          <template v-else>
            <div class="title-text-row">{{ getMainTitle(feature) }}</div>
            <div class="content-text-row">{{ getCountText(feature) }}</div>
          </template>
        </template>

        <!-- feature数量为1 -->
        <template v-else-if="features.length === 1">
          <!-- feature是否有变换量显示(较昨日增长等） -->
          <!-- feature 有变化量 -->
          <template v-if="feature.hasChange">
            <div class="haschange-inner-1">
              <div class="haschange-left">
                <div class="main-title">{{ getMainTitle(feature) }}</div>
                <div class="count-value">{{ getCountText(feature) }}</div>
              </div>
              <div class="haschange-right" :class="feature.change >= 0 ? 'grow-value-up' : 'grow-value-down'">
                <div class="change-title">{{ getChangeTitle(feature) }}</div>
                <div 
                  class="change-value"
                  v-html="getChangeTextHTML(feature)"
                ></div>
              </div>
            </div>
          </template>
          <!-- feature 没有变化量 -->
          <template v-else>
            <div class="title-text-row">{{ getMainTitle(feature) }}</div>
            <div class="content-text-row">{{ getCountText(feature) }}</div>
          </template>
        </template>

      </div>
      <!-- end of Group内遍历feature -->
    </div>
    <!-- end of Group遍历 -->
  </div>
</template>

<script>
/**
 * 今日完成工单
 * 本月完成工单
 * 未完成工单
 * 未完成服务事件
 * 未完成工单客户数量
 * 服务台接入客户数量
 * 
 * 竖向排序
 */

import FourCorners from './common/FourCorners.vue';
import EventMap from '../event';
import {formatNumberSplit} from './common/util';


const TASK_TODAY_COMPARE_YESTERDAY = 'toDayCompleteTaskAndYesterdayCompare';
const TASK_COMPARE_LAST_MONTH = 'thisMonthCompleteTaskAndLastMonthCompare';

export default {
  name: 'data-left-top-panel',
  props: {
    config: {
      type: Object,
      default: () => ({})
    },
    data: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      features: [],
      colGroup: [],
      monthCompare:true
    }
  },
  methods: {
    updateFeaturesHandler(update) {
      // console.info('%c@rc-update dataLeftTop', 'color: red; font-weight: 400;', update);
      
      let data = update || this.data;
      let featureItems = this.config.items || [];

      this.features = featureItems.filter(feature => feature.value).map(feature => {
        let base = {
          ...feature
        }
        let key = feature.key;
        let featureData = data[key];

        // 含有比较数据, 这里返回数据格式不够统一，特殊处理下
        if (typeof featureData === 'object') {
          // 用于标记特殊feature
          base.hasChange = true;
          if (key === 'thisMonthCompleteTaskAndLastMonthCompare') {
            base.count = featureData.thisMonthFulfilTaskCount;
            base.current = featureData.thisMonthFulfilTaskCount;
         
            base.change = featureData.thisMonthFulfilTaskCount - featureData.lastMonthFulfilTaskCount;
            base.last = featureData.lastMonthFulfilTaskCount;
           
            base.changeYear = featureData.thisMonthFulfilTaskCount - featureData.yoyMonthFulfilTaskCount ;
            base.lastYear = featureData.yoyMonthFulfilTaskCount ;
          }
          if (key === 'toDayCompleteTaskAndYesterdayCompare') {
            base.count = featureData.todayFinish;
            base.change = featureData.todayFinish - featureData.yesterdayFinish;
            base.current = featureData.todayFinish;
            base.last = featureData.yesterdayFinish;
          }
        } else {
          base.count = featureData; 
        }
        return base;
      });
      this.setFeatureGroup();

    },

    setFeatureGroup () {
      this.colGroup = [];
      let length = this.features.length;
      let data = this.features.slice();

      if (length > 2) {
        while (length > 0) {
          length = length - 2;
          let splice = data.splice(0, 2);
          this.colGroup.push(splice);
        }
      } else if (length === 2) {
        this.colGroup.push([data[0]], [data[1]]);
      } else if (length === 1) {
        this.colGroup.push([data[0]]);
      }
    },

    /**
     * total, group里的总数量
     */
    getGroupClassName (total, index) {
      let extendClass = [];

      if (total === 3) {
        extendClass.push('data-col-group-3')
        index === 2 && extendClass.push('data-col-group-nomargin')
      } else if (total === 2) {
        extendClass.push('data-col-group-2')
        index === 1 && extendClass.push('data-col-group-nomargin')
      } else if (total === 1) {
        extendClass.push('data-col-group-1')
      }

      return `${extendClass.join(' ')}`;
    },

    getMainTitle(feature) {
      if (!feature) return '';
      let title = feature.label || '';

      if (feature.key === TASK_TODAY_COMPARE_YESTERDAY || feature.key === TASK_COMPARE_LAST_MONTH) {
        let substr = title.split('+')[0];
        return substr || title;
      } 

      return title;
    },

    getChangeTitle(feature) {
      if (!feature) return '';
      let title = feature.label || '';

      if (feature.key === TASK_TODAY_COMPARE_YESTERDAY) {
        let substr = title.split('+')[1];
        return substr || title;
      } 
      return '';
    },

    selectCompare(val, feature){
      this.monthCompare = val
      this.getChangeTextHTML(feature)
    },

    getCountText(feature) {
      if (!feature) return '';
      let count = feature.count;
      return formatNumberSplit(count);
    },

    getChangeTextHTML(feature) {
      if (!feature) return '';
      // let change = feature.change;
      let {change, current, last, changeYear, lastYear} = feature;
      if(!this.monthCompare && feature.key == 'thisMonthCompleteTaskAndLastMonthCompare'){
        last = lastYear
        change = changeYear
      }

      if (current === 0 && last) return '100% <i class="iconfont icon-long-arrow-down"></i>'; // 下降100%
      if (current === 0 && last === 0) return '0%'; // 保持不变
      if (current && last === 0) return '100% <i class="iconfont icon-long-arrow-up"></i>'; // 增长100%

      // 变化百分比
      let changeRatio = (current - last) / last;

      let isFloat = changeRatio % 1 !== 0;
      if (isFloat) {
        changeRatio = changeRatio.toFixed(4) * 100; // 可能出现精度丢失
        changeRatio = Number(changeRatio.toFixed(2));
      }

      if (change > 0) {
        if (!isFloat) {
          changeRatio = changeRatio * 100;
        }
        return `${changeRatio}% <i class="iconfont icon-long-arrow-up"></i>`
      }

      if (Number(change) === 0) {
        return '0%'; // 可能有变更
      }

      if (change < 0) {
        return `${changeRatio * -1}% <i class="iconfont icon-long-arrow-down"></i>`
      }
    },

    /**
     * 获取feature的额外className
     * 这里后期改动可能性较大
     * @params {Object} feature 单个feature
     */
    getFeatureClassName(feature) {
      let length = this.features.length;
      let result = [];

      if (length === 2 || length === 1) {
        result.push('feature-item-large');
        !feature.hasChange && result.push('feature-item-large-center')
      }

      return result.join(' ');
    }
    /**
     * 获取某个feature设置className
     * @params {Object} feature 格式化完成的单个feature
     * @params {Number} idx feature列表渲染对应的index
     * @return {String} className
     */
    // getClassName(feature, idx) {
    //   let length = this.features.length;
    //   let isSingular = Boolean(length % 2);
    //   let middleIdx = (length + 1) / 2;

    //   let className = `feature-item-${length}`;
    //   let suffix = (isSingular && middleIdx === (idx + 1)) ? ` ${className}-middle` : '';

    //   return className + suffix;
    // } 
  },
  mounted() {
    this.$eventBus.$on(EventMap.NEED_UPDATE_LEFT_TOP_EVENT, this.updateFeaturesHandler);
  },
  beforeDestroy() {
    this.$eventBus.$off(EventMap.NEED_UPDATE_LEFT_TOP_EVENT, this.updateFeaturesHandler);
  },
  components: {
    [FourCorners.name]: FourCorners
  }
}
</script>
<style scoped lang="scss">
   .grow-title{
     span{
       cursor:pointer;
     }
   }
</style>
<style lang="scss">
  // $panelHeightRatio: 25%;
  $panelHeight: 220px;
  $borderStyle: 1px solid #00FBFF;
  $titleColor: #00FBFF;
  $valueColor: #ffffff;
  $upColor: #FF414A; 
  $downColor: #00FF66;

  $baseHeight6: 105px;

  $groupWidth3: 336px;
  $groupWidth2: 509px;
  $groupWidth1: 100%;


  .data-left-top-panel {
    flex-grow: 1;
    flex-shrink: 0;
    min-height: $panelHeight;
    margin: 0 0 9px;

    display: flex;
    justify-content: flex-start;
    flex-wrap: nowrap;

    .data-col-group {
      height: 100%;

      display: flex;
      flex-direction: column;
      flex-wrap: nowrap;
      .feature-item {
        flex-grow: 1;
        flex-shrink: 0;
      }
      .feature-item:nth-child(2) {
        margin-top: 8px;
      }
    }

    .data-col-group-3 {
      width: $groupWidth3;
      margin: 0 10px 0 0;
    }

    .data-col-group-2 {
      width: $groupWidth2;
      margin: 0 10px 0 0 ;
    }

    .data-col-group-1 {
      width: $groupWidth1;
    }

    .data-col-group-nomargin {
      margin: 0;
    }

    .feature-item {
      position: relative;
      border: $borderStyle;
      padding: 18px 19px 5px;

      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;

      .title-row {
        position: relative;
        display: flex;
        justify-content: space-between;
        align-items: center;
        // padding: 16px 0 30px;
        width: 100%;
        line-height: 1;
        margin-bottom: 20px;
        .main-title {
          color: $titleColor;
          font-size: 18px;
          font-weight: 400;
        }
        .grow-title {
          color: $titleColor;
          font-size: 16px;
          font-weight: 400;
        }
      }

      .content-row {
        position: relative;
        display: flex;
        justify-content: space-between;
        align-items: center;
        line-height: 1;
        width: 100%;
        .main-value {
          color: $valueColor;
          color: $valueColor;
          font-size: 38px;
        }
        .grow-value {
          font-size: 24px;
          font-weight: 400;
          .iconfont {
            font-size: 23px;
          }
        }
      }

      .grow-value-up {
        color: $upColor;
      }
      .grow-value-down {
        color: $downColor;
      }

      .title-text-row {
        text-align: center;
        margin: 56px 0 25px;
        font-size: 15px;
        font-weight: 400;
        color: #00FFCC;
      }
      .content-text-row {
        text-align: center;
        color: #ffffff;
        font-weight: 500;
        font-size: 33px;
      }

      .haschange-inner-2 {
        $marginBottom: 25px;
        $width: 140px;

        display: flex;
        justify-content: space-between;
        flex-wrap: nowrap;
        height: 100%;
        padding: 56px 69px;
        .haschange-left {
          width: $width;
          height: 100%;
          margin-right: 33px;
          .main-title {
            font-size: 15px;
            font-weight: 400;
            color: #00FFCC;
            margin-bottom: $marginBottom;
          }
          .count-value {
            font-size: 33px;
            font-weight: 500;
            color: #ffffff;
          }
        }
        .haschange-right {
          width: 130px;
          height: 100%;
          .change-title {
            font-size: 15px;
            font-weight: 400;
            color: #00FFCC;
            margin-bottom: $marginBottom + 8px;
          }
          .change-value {
            font-size: 20px;
          }
        }
      }

      .haschange-inner-1 {
        $marginBottom: 25px;
        $width: 140px;

        display: flex;
        justify-content: space-between;
        flex-wrap: nowrap;
        height: 100%;
        padding: 56px 290px;
        .haschange-left {
          width: $width;
          height: 100%;
          margin-right: 33px;
          .main-title {
            font-size: 15px;
            font-weight: 400;
            color: #00FFCC;
            margin-bottom: $marginBottom;
            text-align: center;
          }
          .count-value {
            font-size: 33px;
            font-weight: 500;
            color: #ffffff;
            text-align: center;
          }
        }
        .haschange-right {
          width: 130px;
          height: 100%;
          .change-title {
            font-size: 15px;
            font-weight: 400;
            color: #00FFCC;
            margin-bottom: $marginBottom;
            text-align: center;
          }
          .change-value {
            font-size: 33px;
            text-align: center;
          }
        }
      }
    }
  }
</style>