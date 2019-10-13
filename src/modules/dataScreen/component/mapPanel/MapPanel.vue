<template>
  <div class="map-panel">
    <!-- 四周边角 -->
    <four-corners></four-corners>
    <!-- 面板容器 -->
    <div class="map-panel-container">
      <!-- 地图外围容器组件 用于多次需求修改 -->
      <div class="map-outside-container">
        <screen-map
          ref="screenMap"
          :scope="scope"
          :config="config.mapRegion"
        ></screen-map>
      </div>
      <!-- 饼状图容器 -->
      <div class="pie-container">
        <unfinish-task-pie 
          v-if="showUnCompleteTask"
          :data="{}"
        ></unfinish-task-pie>
        <personal-info-pie
          v-if="showStaffInfo"
          :data="{}"
        ></personal-info-pie>
      </div>
      <!-- 顶部筛选器容器 -->
      <div class="filter-container">
        <!-- 左侧选择器 -->
        <div class="filter-left-top">
          <div v-if="showUnCompleteTask" class="selector-group">
            <span class="filter-title">未完成工单</span>
            <el-select 
              v-model="params.taskState" 
              :popper-append-to-body="false"
              :placeholder="'选择状态'"
              @input="chooseLeftFilterHandler"
            >
              <el-option
                v-for="item in taskSelectorData"
                :key="item.key"
                :label="item.label"
                :value="item.key"
              ></el-option>
            </el-select>
          </div>

          <div v-if="showStaffInfo" class="selector-group">
            <span class="filter-title">人员信息</span>
            <el-select 
              v-model="params.staffState" 
              :popper-append-to-body="false"
              :placeholder="'选择状态'"
              @input="chooseLeftFilterHandler"
            >
              <el-option
                v-for="item in staffSelectorData"
                :key="item.key"
                :label="item.label"
                :value="item.key"
              ></el-option>
            </el-select>
          </div>

        </div>
        <!-- 右侧选择器 -->
        <div class="filter-right-top">
          <!-- datascreen-dropdown -->
          <div class="ds-dropdown" @mouseover="mainSelectorLock=true" @mouseleave="mainSelectorLock=false">
            <div @click="showMainFilter = !showMainFilter" class="ds-dropdown-title">
              显示数据 <i class="iconfont icon-up ds-dropdown-icon" :class="showMainFilter && 'ds-dropdown-icon-up'"></i>
              <input class="ds-input-trans" @blur="!mainSelectorLock && (showMainFilter = false)" readonly />
            </div>
            <transition name="ds-dropdown-fade">
              <div v-if="showMainFilter" class="ds-dropdown-items" >
                <!-- taskPerson -->
                <div 
                  v-for="item in taskPersonFilter"
                  :key="item.key"
                  class="ds-dropdown-item"
                >
                  <el-checkbox 
                    :value="item.selected" 
                    @input="chooseFilterHandler($event, item, 'taskPerson')"
                    :disabled="disabledPersonFilter"
                  >{{item.label}}</el-checkbox>
                </div>
                <!-- taskInfo -->
                <div 
                  v-for="item in taskInfoFilter"
                  :key="item.key"
                  class="ds-dropdown-item"
                >
                  <el-checkbox 
                    :value="item.selected" 
                    @input="chooseFilterHandler($event, item, 'taskInfo')"
                    :disabled="disabledInfoFilter"
                  >{{item.label}}</el-checkbox>
                </div>
              </div>
            </transition>
          </div>
          <!-- end of datascreen-dropdown -->
        </div>
      </div>
      <!-- 底部标注容器 -->
      <div class="filter-markpoint-container">
        <!-- 未完成工单状态 -->
        <template v-if="showUnCompleteTask">
          <div class="markpoint-item-wrap">
            <div class="mw-task-icon">
              <div class="mw-task-icon-h"></div>
              <div class="mw-task-icon-b"></div>
              未完成工单
            </div>
          </div>
          <!-- 动态配置颜色标记 目前暂时不用 -->
          <!-- <div
            v-for="item in taskSelectorData.filter(i => i.key)"
            :key="item.key"
            class="markpoint-item-wrap"
          >
            <div class="mw-task-icon">
              <div class="mw-task-icon-h" :style="'background-color:' + item.color"></div>
              <div class="mw-task-icon-b" :style="'background-color:' + item.color"></div>
            </div>
            {{item.label}}
          </div> -->
        </template>
        <!-- 人员状态 -->
        <template v-if="showStaffInfo">
          <div
            v-for="item in staffMarkPointList"
            :key="item.key"
            class="markpoint-item-wrap"
          >
            <div class="mw-staff-icon" :style="`background-color: ${item.color}; box-shadow: 0px 0px 10px 2px ${item.color};`"></div>
            {{item.label}}
          </div>
        </template>


        <!-- 客户信息，服务团队，备件库 -->
        <div class="markpoint-wrap">
          <div v-if="showCustomerInfo" class="markpoint-item-wrap"><span class="mw-customer"></span>客户信息</div>
          <div v-if="showServerTagInfo" class="markpoint-item-wrap"><span class="mw-server"></span>服务团队</div>
          <div v-if="showSparePartsInfo" class="markpoint-item-wrap"><span class="mw-spare"></span>备件数</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * 标注1 地图面板分为2组数据 两组互斥，不能互相选择
 * 后期维护可以更新数据分组逻辑
 * 1 为完成工单+人员信息
 * 2 客户信息+服务团队+备件库
 */

import ScreenMap from './ScreenMap.vue';
import PersonalInfoPie from './PersonalInfoPie.vue';
import UnFinishTaskPie from './UnFinishTaskPie.vue';
import FourCorners from '../common/FourCorners.vue';

import EventMap from '../../event';
import * as DSApi from '@src/api/ScreenDataApi';
import {getStaffPieItemConfig} from './mapConfig';
import _ from 'lodash';

// import _ from 'lodash';
// import * as mock from '../../mock';

// 未完成工单与人员信息
const taskPersonFilter = [
  { 
    label: '未完成工单', 
    key: 'notCompleteTask',
    selected: false,
    child: [
      { label: '全部', key: '' },
    ]
  },
  { 
    label: '人员信息',
    key: 'staffInformation',
    selected: false,
    child: [
      { label: '全部', key: '' },
    ]
  },
]

// 客户信息，服务团队，备件库
const taskInfoFilter = [
  { label: '客户信息', key: 'customerInformation', selected: false },
  { label: '服务团队', key: 'serverTag', selected: false },
  { label: '备件库', key: 'sparePartsLibrary', selected: false },
]

const getTaskPieItemConfig = function(key) {
  let color = '';
  let name = '';

  switch (key) {
  case 'created': // 待指派
    color = '#0CFF00'; 
    name = '待指派';
    break;
  case 'allocated': // 已指派
    color = '#B8B1B1'; 
    name = '已指派';
    break;
  case 'taskPool': // 工单池
    color = '#FF9700'; 
    name = '工单池';
    break;
  case 'accepted': // 已接受
    color = '#03A9FF'; 
    name = '已接受';
    break;
  case 'processing': // 进行中
    color = '#18FFFF';
    name = '进行中';
    break;
  case 'refused':
    color = '#FF3D45'; // 已拒绝
    name = '已拒绝';
    break;
  default:
    color = '#03A9FF';
    name = '';
    break;
  }

  return { label: name, color };
}

export default {
  name: 'map-panel',
  props: {
    config: {
      type: Object,
      default: () => ({

      })
    },
    scope: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      taskPersonFilter,
      taskInfoFilter,

      params: { // 页面selector绑定
        taskState: '',
        staffState: '',
      },

      showMainFilter: false, // 右上角自定义selector显示开关，可独立组件
      mainSelectorLock: false, // 右上角自定义selector操作锁

      taskSelectorData: [], // 当前工单selector下拉数据 
      staffSelectorData: [], // 当前人员selecotr下列数据

      requestTimes: 0, // 地图数据刷新统计，也用于事件锁
    }
  },
  computed: {
    isGroup1State() {
      let selected = this.taskPersonFilter.filter(i => i.selected).length;
      return selected > 0;
    },
    isGroup2State() {
      let selected = this.taskInfoFilter.filter(i => i.selected).length;
      return selected > 0;
    },
    disabledPersonFilter() {
      return this.isGroup2State;
    },
    disabledInfoFilter() {
      return this.isGroup1State;
    },
    showUnCompleteTask() {
      return this.isGroup1State && this.taskPersonFilter[0].selected;
    },
    showStaffInfo() {
      return this.isGroup1State && this.taskPersonFilter[1].selected;
    },
    showCustomerInfo() {
      return this.taskInfoFilter && this.taskInfoFilter[0].selected;
    },
    showServerTagInfo() {
      return this.taskInfoFilter && this.taskInfoFilter[1].selected;
    },
    showSparePartsInfo() {
      return this.taskInfoFilter && this.taskInfoFilter[2].selected;        
    },
    staffMarkPointList() {
      return this.staffSelectorData.filter(i => i.key).concat({
        key: '__other',
        label: '其他',
        color: '#e3e3e3'
      });
    }
  },
  methods: {

    /**
     * 右上角 显示选择器中checkbox更新后处理事件
     */
    chooseFilterHandler(selected, item, type) {
      if (type === 'taskPerson') {
        this.taskPersonFilter = this.taskPersonFilter.map(i => {
          if (i.key === item.key) {
            i.selected = selected;
          }
          return i;
        });
        // 将目前的配置收集通知frameView去更新配置
        return this.requestUpdateConfig();
      }

      if (type === 'taskInfo') {
        this.taskInfoFilter = this.taskInfoFilter.map(i => {
          if (i.key === item.key) {
            i.selected = selected;
          }
          return i;
        });
        // 将目前的配置收集通知frameView去更新配置
        return this.requestUpdateConfig();
      }      
    },

    /**
     * 左侧filter change事件处理
     */
    chooseLeftFilterHandler() {
      this.requestUpdateConfig();
    },

    /**
     * 1 获取当前页的配置内容，一并提交给frameView保存配置，
     * 2 将新的配置参与用于执行查询
     * 3 通知地图配合有更新，清除标记等待数据刷新  todo 移除方法
     */
    // requestUpdateConfig() {
    requestUpdateConfig: _.debounce(function() {
      console.info('@req -> update(config)')
      let params = this.getBuilderConfigParams();

      this.$eventBus.$emit(EventMap.UPDATE_MAP_CONFIG, params);
      this.$emit('update-config', params);

      this.getMapPanelData(params);
    // },
    }, 100),

    /**
     * 获取当前状态的请求参数
     */
    getBuilderConfigParams(initialize = false) {
      // 工单状态与人员状态
      let taskState = this.params.taskState || 'all';
      let staffState = this.params.staffState || 'all';
      
      // 地图当前配置
      let mapRegion = {};
      if (initialize && this.config.mapRegion) {
        mapRegion = this.config.mapRegion
      } else {
        let screenMap = this.$refs.screenMap;
        mapRegion = screenMap ? screenMap.getRegionConfig() : this.config.mapRegion;
      }

      // 设置默认
      if (!mapRegion || !mapRegion.regionCode) { // todoxiugailiucheng 
        mapRegion = {
          regionCode: 100000,
          regionName: '',
          level: 0,
        }
      }

      let params = {
        taskState,
        staffState,
        mapRegion
      }

      // 配置项
      this.taskInfoFilter.forEach(item => {
        params[item.key] = item.selected;
      });

      this.taskPersonFilter.forEach(item => {
        params[item.key] = item.selected;
      });

      return params;
    },
    
    /**
     * 设置初始化参数
     */
    setInitializeConfig() {
      let taskStateKey = 'taskState';
      let staffStateKey = 'staffState';

      // 设置为完成工单与人员信息
      this.taskPersonFilter = this.taskPersonFilter.map(item => {
        item.selected = this.config[item.key] || false;
        return item;
      });
      // 设置客户信心，服务团队，备件库
      this.taskInfoFilter = this.taskInfoFilter.map(item => {
        item.selected = this.config[item.key] || false;
        return item;
      })
      
      // 未完成工单与人员信息的selector绑定
      let taskState = this.config[taskStateKey];
      let staffState = this.config[staffStateKey];

      this.params.taskState = taskState === 'all' ? '' : taskState;
      this.params.staffState = staffState === 'all' ? '' : staffState;
    },

    /**
     * 辅助未独立的右上角selector “blur”状态关闭下拉框
     */
    clickHandler(e) {
      if (!this.showMainFilter) return;

      if (!this.mainSelectorLock) {
        this.showMainFilter = false;
      }
    },

    /**
     * 获取地图面板相关数据
     */
    getMapPanelData(params) {

      // 根据当前的配置决定发送哪个请求
      // eslint-disable-next-line operator-linebreak
      let request = this.isGroup1State ? 
        DSApi.getMapPanelTaskInfo : DSApi.getMapPanelCustomerInfo;

      let times = this.requestTimes;

      return request(params)
        .then(res => {
          if (!res.success || !res.result) {
            // return res.message && platform.alert(res.message);
            return console.info('%c获取地图面板Error', 'color: green; font-weight: bold', res);
          }
          let currRequest = times === this.requestTimes;

          currRequest && this.parseResponseData(res.result, params);

          // for dev
          if (!currRequest) console.info('times不匹配', times, this.requestTimes)
          // end of dev

          this.requestTimes += 1;
        })
        .catch(err => {
          console.error(`getMapPanelInfoError group1? ${this.isGroup1State}`, err);
        })
    },

    /**
     * 将查询面板数据接口返回值进行解析chuli
     * todo 方法拆分
     * @params {Object} result 接口返回的 response.result
     * @params {Object} 请求接口时穿的参数--用于地图参数绑定
     */
    parseResponseData(result, params) {
      let { // todo 代码优化
        mapRegion,
        notCompleteTask,
        staffInformation,
        serverTag,
        sparePartsLibrary,
        customerInformation
      } = result;

      let userPie = result.userPie || {};
      let taskPie = result.taskPie || {};
      let formatTaskData = [];
      let formatStaffPieData = [];
      let formatMapData = {};


      // 处理工单与人员饼状图
      // 未完成工单状态饼状图
      for (let name in taskPie) {
        let {label, color} = getTaskPieItemConfig(name);
        formatTaskData.push({
          value: taskPie[name],
          label,
          color,
          key: name,
        })
      }
      this.taskSelectorData = [{ label: '全部', key: '' }].concat(formatTaskData);

      // 人员信息饼状图
      this.staffSelectorData = [{ label: '全部', key: '' }];

      let staffNameList = Object.keys(userPie);
      staffNameList.forEach((name, idx) => {
        let {color} = getStaffPieItemConfig(name, idx);
        let item = {
          value: userPie[name],
          label: name,
          key: name,
          color
        }
        formatStaffPieData.push(item);
        this.staffSelectorData.push(item);
      })

      // 处理地图数据
      formatMapData = {
        staffInformation: this.getFormatStaffMapData(staffInformation, formatStaffPieData),
        notCompleteTask,
        taskState: params.taskState || 'all',
        staffState: params.staffState || 'all',
        serverTag,
        sparePartsLibrary,
        customerInformation,
        mapRegion
      }

      // 未完成工单地图数据处理
      formatMapData.notCompleteTask = (notCompleteTask || []).map(item => {
        let key = item.key;
        let {color} = getTaskPieItemConfig(key);

        item.color = color;
        return item;
      });

      this.$nextTick(() => {
        this.$eventBus.$emit(EventMap.NEED_REFRESH_MAP_TASK_PIE, formatTaskData);
        this.$eventBus.$emit(EventMap.NEED_REFRESH_MAP_PERSON_PIE, formatStaffPieData);
        this.$eventBus.$emit(EventMap.NEED_REFRESH_MAP, formatMapData);
      })
    },

    /**
     * 获取格式化的人员地图数据，主要用于匹配颜色
     */
    getFormatStaffMapData(data, colorData) {
      let colors = {};
      colorData.forEach(i => {
        if (!i || !i.key) return;
        colors[i.key] = i.color;
      })

      data = (data || []).map(item => {
        if (!item.state) {
          item.color = '#9E9E9E';
          return item;
        }
        item.color = colors[item.state];
        return item;
      })

      return data;
    },

    /**
     * 地图配置修改（点击区域）
     * 1 请求新数据
     * 2 通知上层更新配置
     */
    mapConfigChangeHandler: _.debounce(function() {
      let params = this.getBuilderConfigParams();
      // 
      this.getMapPanelData(params);

      this.requestUpdateConfig();
    }, 500)
  },
  mounted() {
    // 设置配置，获取数据
    this.setInitializeConfig();
    
    let params = this.getBuilderConfigParams(true);
    this.getMapPanelData(params);

    document.addEventListener('click', this.clickHandler);
    this.$eventBus.$on(EventMap.MAP_CONFIG_CHANGE, this.mapConfigChangeHandler);
  },
  beforeDestroy() {
    //
    document.removeEventListener('click', this.clickHandler)
    this.$eventBus.$off(EventMap.MAP_CONFIG_CHANGE, this.mapConfigChangeHandler);
  },
  components: {
    [FourCorners.name]: FourCorners,
    [ScreenMap.name]: ScreenMap,
    [PersonalInfoPie.name]: PersonalInfoPie,
    [UnFinishTaskPie.name]: UnFinishTaskPie
  }
}
</script>

<style lang="scss">
  $borderStyle: 1px solid #06A8A1;

  $mapLeft: 0; // 270
  $mapTop: 0; // 74
  $mapWidth: 100%;
  $mapHeight: 100%;

  $panelBg: rgba(0, 0, 0, 0.2);
  .map-panel {
    flex-grow: 1;
    flex-shrink: 0;
    height: 742px; // fix qq browser(chromium 70) 子容器无法继承仅设置了min-height父级的高度
    min-height: 742px;
    position: relative;
    border: $borderStyle;
    overflow: hidden;
    
    .map-panel-container {
      position: relative;
      height: 100%;
      background: $panelBg;

      // 地图面板外围容器
      .map-outside-container {
        position: absolute;
        height: 100%;

        top: $mapTop;
        left: $mapLeft;
        width: $mapWidth;
        height: $mapHeight;
      }

      //左侧选择器
      .filter-left-top {
        $width: 116px;
        $height: 36px;
        $bgc: rgba(11,89,84,1);

        position: absolute;
        left: 21px;
        top: 23px;

        display: flex;
        flex-wrap: nowrap;
        align-items: center;

        .selector-group {
          .filter-title {
            margin-right: 8px;
            color: #00FFCC;
            font-weight: 400;
            font-size: 14px;
          }

          .el-input {
            width: $width;
            height: $height;
            background-color: $bgc;
            border: $borderStyle;

            .el-input__inner {
              // background: unset;
              background: transparent; // ie 不持支unset
              border: none;
              user-select: none;
              color: #ffffff !important;
              font-size: 14px;
              &::placeholder {
                color: #ffffff;
                font-size: 14px;
              }
            }
          }
          
          .el-select-dropdown {
            margin: 0;
            background-color: $bgc;
            width: 100%;
            min-width: 100% !important;

            left: 0 !important;
            top: $height !important;
            border: none;

            .el-scrollbar__wrap {
              margin: 0;
            }

            .el-select-dropdown__list {
              padding: 0;
            }

            .el-select-dropdown__item {
              height: $height;
              border-bottom: $borderStyle;
              border-right: $borderStyle;
              border-left: $borderStyle;
              background-color: $bgc;
              color: #ffffff !important;

              padding-left: 10px;
              font-size: 14px;
            }

            .hover {
              background-color: unset;
            }

            .popper__arrow {
              display: none;
            }
          }
        }

        .selector-group:nth-child(2) {
          margin-left: 40px;
        }

        // 覆盖字体图标
        .el-input__suffix {
          display: flex;
          align-items: center;
          .el-icon-arrow-up {
            font-family: "iconfont" !important;
            font-size: 12px;
            font-style: normal;
            color: #06A987;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            &::before {
              content: '\e74d';
            }
          }
        }
      }

      // 右侧选择器
      .filter-right-top {
        position: absolute;
        top: 19px;
        right: 18px;

        $width: 133px;
        $bgc: rgba(11,89,84,1);
        $borderColor: rgba(6, 168, 161, 1);
        $borderStyle: 1px solid $borderColor;
        
        .ds-dropdown {
          $mainHeight: 36px;

          width: $width;
          height: $mainHeight;
          background-color: $bgc;
          border: $borderStyle;

          .ds-dropdown-title {
            position: relative;
            width: 100%;
            height: 100%;
            border: none;
            outline: none;
            user-select: none;
            background: unset;

            padding: 11px 10px;
            line-height: 1;
            display: flex;
            justify-content: space-between;
            color: #ffffff;
            cursor: pointer;

            .ds-input-trans {
              position: absolute;
              top: 0;
              left: 0;
              border: none;
              padding: none;
              margin: none;
              background: transparent;
              cursor: pointer;
            }

            .ds-dropdown-icon {
              display: inline-block;
              transition-duration: .3s;
              font-size: 12px;
              color: #06A987;
              transform: rotate(180deg);
            }

            .ds-dropdown-icon-up {
              transform: rotate(0deg);
            }
          }

          .ds-dropdown-items {
            position: absolute;
            top: $mainHeight;
            left: 0;
            width: 100%;
            .ds-dropdown-item {
              height: 35px;
              border-right: $borderStyle;
              border-bottom: $borderStyle;
              border-left: $borderStyle;
              background-color: $bgc;

              display: flex;
              justify-content: flex-start;
              align-items: center;

              padding: 10px;
              .el-checkbox {
                color: #ffffff;
                font-weight: normal;
                font-size: 14px;
                margin: 0;
                .el-checkbox__inner {
                  border: 1px solid #06A8A1;
                  background: transparent;
                }
              }
              .is-checked {
                .el-checkbox__inner {
                  background-color: #06A8A1;
                }
                .el-checkbox__label {
                  color: #ffffff;
                }
              }
            }
          }
        }
      }

      // 左侧饼状图容器 
      .pie-container {
        position: absolute;
        top: 100px;
        left: 0;

        width: 314px;

        .map-pie-item {
          width: 100%;
          height: 250px;
          margin-bottom: 12px;
          $pieHeaderHeight: 31px;
          $pieHeight: 228px;
          // background: rgba(8, 77, 72, 0.08);
          background: rgba(8, 77, 72, 0.3);

          .pie-header {
            height: $pieHeaderHeight;

            display: flex;
            flex-wrap: nowrap;
            justify-content: flex-start;
            align-items: center;

            background: linear-gradient(90deg, #1666AB 0%, transparent 70%);

            .pie-title-main {
              display: flex;
              flex-wrap: nowrap;
              align-items: center;
              justify-content: flex-start;
              margin-right: 31px;

              font-weight: 400;
              font-size: 14px;
              color: #ffffff;
              padding-left: 16px;
            }
          }

          .pie-item-container {
            height: $pieHeight;
          }
        }
      }
    }

    .filter-markpoint-container {
      position: absolute;
      bottom: 24px;
      left: 55%;
      transform: translateX(-50%);

      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      width: 650px;
      .markpoint-wrap {
        display: flex;
        flex-wrap: nowrap;
        margin-bottom: 10px;

      }
      .markpoint-item-wrap {
        color: #ffffff;
        font-size: 12px;
        font-weight: 400;
        margin: 10px 15px 0 0;
        display: flex;
        flex-wrap: nowrap;
        flex-shrink: 0;
        justify-content: flex-start;
        align-items: center;
        cursor: default;

        @mixin commonIconStyle2 {
          display: inline-block;
          width: 15px;
          height: 15px;
          border-radius: 50%;
          margin-right: 11px;
        }

        .mw-task-icon {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          margin-right: 9px;
          .mw-task-icon-h {
            width: 11px;
            height: 11px;
            border-radius: 50%;
            // 暂时不需要动态配置颜色
            background: rgba(3,169,255, .4);
          }
          .mw-task-icon-b {
            width: 1px;
            height: 8px;
            background: rgba(3,169,255, .4);
          }
        }

        .mw-staff-icon {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 7px;
        }

        .mw-customer {
          @include commonIconStyle2();
          background: #FFDE00;
        }
        .mw-server {
          @include commonIconStyle2();
          background: #18FFFF;
        }
        .mw-spare {
          @include commonIconStyle2();
          background: rgba(0,0,0,1);
          border: 3px solid rgba(193,253,114,1);
          opacity: 0.38;
        }
      }
    }
  }

  .ds-dropdown-fade-enter-active,
  .ds-dropdown-fade-leave-active {
    transition: opacity ease .2s;
  }

  .ds-dropdown-fade-enter,
  .ds-dropdown-fade-leave-to {
    opacity: 0;
  }

  .ds-fade-enter-active,
  .ds-fade-level-active {
    transition: opacity ease .2s;
  }

  .ds-fade-enter,
  .ds-fade-leave-to {
    opacity: 0;
  }
</style>