<template>
  <div class="screen-map" :style="mapFixStylestr">
    <!-- 地图 -->
    <div id="screen-data-map"></div>
  </div>
</template>

<script>

/**
 * level使用，默认第一次进后台存储level为null值，此时请求后台代表请求初始化数据
 */

import {getCustomerUiWidth, getStaffUIClass} from './mapConfig';
import EventMap from '@src/modules/dataScreen/event';

let map = null;
let districtExplorer = null;

let notCTMarkers = []; // not completeTaskMarkers
let staffMarkers = [];
let spareMarkers = [];
let serverTagMarkers = [];
let customerMarkers = [];
let areaNameMarkers = [];

// 建议等到测试完成或需求不再改变后删除注释
// const fixedMapHeight1 = 742;
// const fixedMapHeight2 = 853;

// let areaList = getAreaList();
// let colors = getMapProvinceColorEnum(); // 目前版本的需求中不再需要 省级别区域固定颜色的需求

export default {
  name: 'screen-map',
  props: {
    scope: {
      type: Object,
      default: () => ({})
    },
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      current: {
      }
    }
  },
  computed: {
    /**
     * fixed 高德地图父容器transform带来的偏移
     * 11.49
     */
    mapFixStylestr() {
      if (!this.scope || !this.scope.widthRatio) return '';

      let shrink = this.scope.screenRatio <= this.scope.maxRatio;
      let scope = this.scope.heightRatio;

      let baseWidth = 1026;
      // 原比例: 841.5, 16/9: 742, 16/10: 796.5, 3/2: 841.5
      let baseHeight = shrink ? 1026 : 742; 
      let w = baseWidth * scope;
      let h = baseHeight * scope; // 684 531
      
      this.setFitView();

      return `width: ${w}px; height: ${h}px; transform: scale(${1 / scope}); transform-origin: top left;`;
    }
  },
  methods: {
    
    getRegionConfig() {
      if (!this.current.regionCode) {
        return this.config.mapRegion;
      }
      return this.current;
    },

    /**
     * 初始化高德地图与高德UI 
     */
    initAMapWithAMapUI() {
      map = new window.AMap.Map('screen-data-map', {
        zoom: 4,
        features: [], // bg, road, building, point
        zooms: [4, 20],
        resizeEnable: false
      });
      
      // 设置边界
      // 获取边界 https://lbs.amap.com/api/javascript-api/example/map/map-bounds
      // let northEast = new window.AMap.LngLat(-145, 60);
      // let southWest = new window.AMap.LngLat(-27, -26);
      // let limitBounds = new window.AMap.Bounds(southWest, northEast);
      // map.setLimitBounds(limitBounds);

      // 初始化高德地区UI
      window.AMapUI.load(['ui/geo/DistrictExplorer', 'lib/$'], this.initializeMapUI)
    },

    // 供开发调试
    mapDevLog() {
      // 为地图注册click事件获取鼠标点击出的经纬度坐标
      // map.on('click', function(e) {
      //   let res = `${e.lnglat.getLng() },${ e.lnglat.getLat()}`
      // });
      window.__map = map;
      window.__ds = districtExplorer;
      // const show = function () {
      //   let zoom = map.getZoom();
      //   let center = map.getCenter();
      //   let bounds = map.getBounds();
      // }
      // map.on('moveend', show);
      // map.on('zoomend', show);
    },

    /**
     * 初始化高德地区UI
     */
    initializeMapUI(DistrictExplorer, $) {
      // 放大缩小监听事件
      // map.on('zoomchange', this.zoomHandler);

      // 创建实例
      districtExplorer = window.districtExplorer = new DistrictExplorer({
        eventSupport: true, // 打开事件支持
        map,
      });

      this.mapDevLog(); // just for dev
      
      // districtExplorer.on('featureMouseout featureMouseover', function(e, feature) {
      //   toggleHoverFeature(feature, e.type === 'featureMouseover',
      //     e.originalEvent ? e.originalEvent.lnglat : null);
      // });

      districtExplorer.on('featureClick', this.featureClickHandler)

      districtExplorer.on('outsideClick', this.outsideClickHandler);

      // 初始化默认地图
      let regionCode = this.config.regionCode;
      this.current = {
        regionCode,
        regionName: this.config.regionName || '',
        level: this.config.level,
        acroutes: this.config.acroutes || [],
        lastFeature: this.config.lastFeature || {}
      }

      // 切换地图，这里如果是初始化进入，regionCode为 null
      this.switchArea(regionCode || 100000, false);

      // function toggleHoverFeature(feature, isHover, position) {
      // if (!feature) return;

      // let {adcode, name, center} = feature.properties;

      // if (adcode === this.mapData.adcode) return;

      // mapData.adcode = adcode;
      // mapData.name = name;
      // mapData.center = center;
      // }
    },

    switchArea(code, clear = true) {
      clear && this.clearMarkers(true);
      this.setFeatureByCode(code);
    },

    setFitView() {
      if (!map) return;

      let mapLevel = this.current.level || 0;
      let isNational = mapLevel === 0;

      this.$nextTick(() => {
        map.setFitView();

        if (isNational) {
          const nationalCenter = new window.AMap.LngLat(104.300154, 37.93196);
          map.setCenter(nationalCenter);
        }
      })
    },

    /**
     * 设置国家视图
     */
    setNationMapLocation() {
      let lngLat = new window.AMap.LngLat(104.300154, 37.93196);
      // let baseZoom = 4;
      // 缩放层级

      this.$nextTick(() => {
        // let zoom = this.getAdapteZoomLevel(baseZoom);
        // map.setZoom(zoom);
        // 设置中心点以及限制点
        map.setCenter(lngLat);
      });
    },

    getAdapteZoomLevel(zoom) {
      let scope = this.scope.x || 0;
      if (!scope) return zoom;

      let offset = scope - 1;

      return zoom + offset;
    },

    zoomHandler() {
      // let zoom = map.getZoom();
      // let adcode = mapData.adcode;
      // if (zoom > 6) return;
    },
    
    /**
     * UI绘制区域点击事件
     */
    featureClickHandler(e, feature) {      
      let props = feature.properties;
      // 如果没有子元素停止缩放
      // console.info('%cno childnum', 'color: red;', feature)
      if (props.childrenNum < 1) return;

      // console.info('%c@clickFeature', 'color: blue; font-weight: bold;', feature);
      let currConfig = {
        level: props.acroutes.length,
        regionName: props.name,
        regionCode: props.adcode,
        acroutes: props.acroutes,
        lastFeature: { // 上一个feature的信息
          level: this.current.level || 0,
          regionCode: this.current.regionCode || 100000,
          regionName: this.current.regionName || '',
          acroutes: this.current.acroutes || [],
          lastFeature: {}
        }
      };
      
      this.current = currConfig;

      this.broadcastConfigChange(currConfig);
      this.switchArea(props.adcode);
    },

    /**
     * UI绘制区域外点击事件
     */
    outsideClickHandler() {

      let acroutes = this.current.acroutes;
      // console.info('%c click outside', 'color: blue; font-weight: bold;', acroutes);
      let hasRoutes = acroutes && acroutes.length > 0;
      let isRoot = !hasRoutes || this.current.regionCode === 100000 || this.current.regionCode === null;
      isRoot = !(this.current.level > 0) && isRoot;

      if (isRoot) return;

      let code = acroutes[acroutes.length - 1] || 100000;
      // eslint-disable-next-line operator-linebreak
      this.current = this.current.lastFeature.regionCode ?
        this.current.lastFeature : { level: 0, regionCode: 100000, regionName: '' }

      this.broadcastConfigChange(this.current);
      this.switchArea(code);
    },

    loadAreaNode(adcode, callback) {
      districtExplorer.loadAreaNode(adcode, function(error, areaNode) {
        if (error) {
          if (callback) {
            callback(error);
          }
          console.error(error);
          return;
        }
        if (callback) {
          callback(null, areaNode);
        }
      });
    },

    setFeatureByCode(adcode) {

      map && areaNameMarkers.length && map.remove(areaNameMarkers);

      // let isNational = adcode === 100000;
      // districtExplorer.clearFeaturePolygons();

      this.loadAreaNode(adcode, (error, areaNode) => {
        // let parent = areaNode.getParentFeature(); // 可在此记录层级数据

        map.setBounds(areaNode.getBounds(), null, null, true);

        this.setFitView();

        districtExplorer.clearFeaturePolygons();

        districtExplorer.setAreaNodesForLocating([areaNode]);


        // this.mapData.currSecondFeatures = areaNode.getSubFeatures();

        districtExplorer.renderSubFeatures(areaNode, function (feature, i) {
          // 
          // let childAdCode = feature.properties.adcode;
          let fillColor = 'transparent';
          // let strokeColor = fillColor; // 动态设置颜色
          let strokeColor = '#32FFCD';

          // 市区名I改为白色

          // 省的视图 添加 地址标志（city）
          // 市的区图，同上显示
          let props = feature.properties;
          let center = props.centroid || props.center;
          let name = props.name;
          let level = props.level;
          
          if (level !== 'province') {
            let position = new window.AMap.LngLat(center[0], center[1]);

            let marker = new window.AMap.Marker({
              position,
              anchor: 'center',
              content: `<div class="area-name">${name}</div>`,
              map,
              offset: new window.AMap.Pixel(-48, -8),
              bubble: true
            })


            areaNameMarkers.push(marker);
          }


          return {
            cursor: 'default',
            bubble: true,
            strokeOpacity: 0.6, // 线透明度
            strokeWeight: 0.5, // 线宽
            strokeColor,
            fillColor, // 填充色
            fillOpacity: 1, // 填充透明度
          }
        });
      });

    },

    broadcastConfigChange(config) {
      this.$eventBus.$emit(EventMap.MAP_CONFIG_CHANGE, config);
    },

    updateMap(data) {
      if (!data) return;

      // 获取配置信息，其中也包含mapRegion字段
      let {
        staffInformation, // 人员信息
        notCompleteTask, // 为完成工单
        taskState, // 为完成工单状态
        staffState, // 人员状态

        serverTag, // 服务团队
        sparePartsLibrary, // 备件库
        customerInformation, // 客户信息
      } = data;

      // 未完成工单
      notCompleteTask && notCompleteTask.length && this.setNCTaskUI(notCompleteTask, taskState);
      // 人员信息
      staffInformation && staffInformation.length && this.setStaffUI(staffInformation, staffState);
      // 服务团队
      serverTag && serverTag.length && this.setServerTagUI(serverTag);
      // 备件库
      sparePartsLibrary && sparePartsLibrary.length && this.setSpareUI(sparePartsLibrary);
      // 客户信息
      customerInformation && customerInformation.length && this.setCustomerUI(customerInformation);
    },

    /**
     * set notCompleteTask
     */
    setNCTaskUI(data, params) {
      // 
      notCTMarkers.length && map.remove(notCTMarkers);

      data.forEach(item => {
        if (!item.center) return;

        let center = item.center.split(',');
        let number = item.num;
        let color = item.color || '';
        color = 'rgba(3,169,255, .4)';
        let baseWidth = 20;
        if (number < 10) {
          baseWidth = 14;
        } else if (number < 100) {
          baseWidth = 19;
        } else if (number < 1000) {
          baseWidth = 29;
        } else if (number < 10000) {
          baseWidth = 34;
        } else {
          baseWidth = 41;
        }

        let style = `background-color: ${color}; width: ${baseWidth}px; height: ${baseWidth}px;`;

        let lng = center[0];
        let lat = center[1];
        let position = new window.AMap.LngLat(lng, lat);

        let marker = new window.AMap.Marker({
          position,
          map,
          content: `<div class="map-ui-task">
            <div class="map-ui-task-circle" style="${style}"><div class="map-ui-task-circle-number">${number}</div></div>
            <div class="map-ui-task-bottom"></div>
          </div>`,
          // 宽度 28，高度为 28 + 8
          size: new window.AMap.Size(baseWidth, baseWidth + 8),
          anchor: 'bottom-center',
          offset: new window.AMap.Pixel(-(baseWidth / 2), -(baseWidth + 8)),
          bubble: true
        });
        notCTMarkers.push(marker);
      })
    },

    /**
     * 人员信息
     */
    setStaffUI(data) {
      staffMarkers.length > 0 && map.remove(staffMarkers);

      const defaultColor = '#33FFCD';
      // setUI
      data.forEach(item => {
        if (!item || !item.latitude || !item.longitude) return;

        let lng = item.longitude;
        let lat = item.latitude;
        let color = item.color || defaultColor;
        let style = `background-color: ${color}; box-shadow: 0px 0px 10px 2px ${color};`
        let extClassStr = getStaffUIClass(color);

        let position = new window.AMap.LngLat(lng, lat);
        let marker = new window.AMap.Marker({
          position,
          map,
          content: `<div class="map-ui-staff ${extClassStr}" style="${style}"></div>`,
          size: new window.AMap.Size(3, 3),
          offset: new window.AMap.Pixel(-1.5, -1.5),
          bubble: true
        });
        staffMarkers.push(marker);
      })
    },

    /**
     * 服务团队
     */
    setServerTagUI(data) {
      //
      serverTagMarkers.length && map.remove(serverTagMarkers);
      const mapLevel = this.current.level;

      const getUIConfig = function (count) {
        // let paddingTop = 7;
        let fontSize = 12;
        let number = count;

        let width = 14;
        if (number < 10) {
          width = 14;
        } else if (number < 100) {
          width = 19;
        } else if (number < 1000) {
          width = 29;
        } else if (number < 10000) {
          width = 34;
        } else {
          width = 41;
        }

        let style = `width: ${width}px; height: ${width}px; font-size: ${fontSize}px`;

        return {
          style,
          width
        }
      }

      data.forEach(item => {
        if (!item.center) return;
        let center = item.center.split(',');
        let label = item.regionName || '';
        // if (mapLevel === 0 && label.length > 3) {
        //   label = label.substr(0, 3);
        // }
        let showName = mapLevel === 0;

        let lng = center[0];
        let lat = center[1];
        let position = new window.AMap.LngLat(lng, lat);

        let {width, style} = getUIConfig(item.num);

        let marker = new window.AMap.Marker({
          position,
          map,
          content: `<div class="map-ui-server" style="${style}">
            <div class="map-ui-server-number">${item.num}</div>
            <div class="map-ui-server-name" style="${!showName && 'display: none;'}">${label}</div>
          </div>`,
          size: new window.AMap.Size(width, width),
          offset: new window.AMap.Pixel(-width / 2, - width / 2),
          bubble: true
        });
        serverTagMarkers.push(marker);
      })
    },

    /**
     * 备件仓库
     */
    setSpareUI(data) {
      //
      spareMarkers.length && map.remove(spareMarkers);
      const mapLevel = this.current.level || 0;
      const hiddenNameLabel = mapLevel !== 0;


      data.forEach(item => {
        if (!item.center) return;
        let center = item.center.split(',');
        let name = item.regionName || '';
        let num = item.num || 0;

        let isInt = num % 1 === 0; // 是否为整数
        let intPart = String(num).split('.')[0];
        let decimalsPart = String(num).split('.')[1];


        let width = 14;
        if (num < 10) {
          width = 14;
        } else if (num < 100) {
          width = 19;
        } else if (num < 1000) {
          width = 29;
        } else if (num < 10000) {
          width = 34;
        } else if (num < 100000) {
          width = 41;
        } else if (num < 1000000) {
          width = 47;
        } else {
          width = 54;
        }

        // eslint-disable-next-line operator-linebreak
        let spareNumberHTML = isInt ? 
          `${num}` : `<span class="map-ui-spare-number-part">${intPart}</span><span class="map-ui-spare-decimals">.${decimalsPart}</span>`;
        width = isInt ? width : (width + 7);

        let styleStr = `width: ${width}px; height: ${width}px;`;

        let lng = center[0];
        let lat = center[1];
        let position = new window.AMap.LngLat(lng, lat);
        let marker = new window.AMap.Marker({
          position,
          map,
          content: `<div class="map-ui-spare" style="${styleStr}">
            <div class="map-ui-spare-number">${spareNumberHTML}</div>
            <div class="map-ui-spare-name" style="${hiddenNameLabel && 'display: none;'}">${name}</div>
          </div>`,
          size: new window.AMap.Size(width, width),
          offset: new window.AMap.Pixel(-width / 2, -width / 2),
          bubble: true
        });
        spareMarkers.push(marker);
      })
    },

    /**
     * 客户信息, 颜色固定
     * 个十百千
     * 4px 6px 8px 
     */
    setCustomerUI(data) {
      //
      customerMarkers.length && map.remove(customerMarkers);

      let mapLevel = this.current.level || 0;
      // setUI
      data.forEach(item => {
        if (!item.center) return;
        let center = item.center.split(',');
      
        let number = item.num;
        let baseWidth = getCustomerUiWidth(mapLevel, number);
        let style = `width:${baseWidth}px;height:${baseWidth}px;`;


        let lng = center[0];
        let lat = center[1];
        let position = new window.AMap.LngLat(lng, lat);
        let marker = new window.AMap.Marker({
          position,
          map,
          content: `<div class="map-ui-customer" style="${style}" data-num="${number}"></div>`,
          size: new window.AMap.Size(baseWidth, baseWidth),
          offset: new window.AMap.Pixel(-baseWidth / 2, -baseWidth / 2),
          bubble: true
        });
        customerMarkers.push(marker);
      })
    },

    /**
     * 清除Markers 事件派发 
     * @param {Boolean} clearALl 是否清除所有markers
     * @param {Object} prams 当前显示的参数，在非clearAll时生效
     */
    clearMarkers(clearAll = false, params = {}) {
      let {
        notCompleteTask,
        staffInformation,
        serverTag,
        sparePartsLibrary,
        customerInformation
      } = params;

      (clearAll || !notCompleteTask) && this.clearNCTMakers();
      (clearAll || !staffInformation) && this.clearStaffMakers();
      (clearAll || !serverTag) && this.clearServerTagMarkers();
      (clearAll || !sparePartsLibrary) && this.clearSpareMakers();
      (clearAll || !customerInformation) && this.clearCustomerMarkers();
    },

    clearNCTMakers() {
      notCTMarkers.length && map.remove(notCTMarkers);
    },

    clearStaffMakers() {
      staffMarkers.length && map.remove(staffMarkers);
    },

    clearSpareMakers() {
      spareMarkers.length && map.remove(spareMarkers);
    },

    clearServerTagMarkers() {
      serverTagMarkers.length && map.remove(serverTagMarkers);
    },

    clearCustomerMarkers() {
      customerMarkers.length && map.remove(customerMarkers);
    },
    
    /**
     * 上层地图面板更新配置时，下发文件
     */
    updateMarkerByConfig(params) {
      // console.info('@@UPDATE_MARKER', params);
      
      this.clearMarkers(false, params);
    },


    setDemoUI(data) {
      //
      // customerMarkers.length && map.remove(customerMarkers);
      // setUI
      data.forEach((item, idx ) => {

        if (idx > 20000) return;
        let add = item.customerAddress;

        let lng = add.adLongitude;
        let lat = add.adLatitude;

        if (!lng || !lat) return;

        let position = new window.AMap.LngLat(lng, lat);
        let marker = new window.AMap.Marker({
          position,
          map,
          content: '<div class="map-ui-customer"></div>',
          size: new window.AMap.Size(6, 6),
          offset: new window.AMap.Pixel(-3, -3)
        });
        staffMarkers.push(marker);
      })
    },
  },
  mounted() {
    this.initAMapWithAMapUI();
    this.$eventBus.$on(EventMap.NEED_REFRESH_MAP, this.updateMap);
    this.$eventBus.$on(EventMap.UPDATE_MAP_CONFIG, this.updateMarkerByConfig);

    // DSApi.getTestMapData().then(res => {
    //   console.log('获取测试数据', res);
    //   this.setDemoUI(res);
    // })
  },
  beforeDestroy() {
    map = null;
    districtExplorer = null;
    this.$eventBus.$off(EventMap.NEED_REFRESH_MAP, this.updateMap);
    this.$eventBus.$off(EventMap.UPDATE_MAP_CONFIG, this.updateMarkerByConfig);
  }
}
</script>

<style lang="scss">
  @import './marker.scss';

  .screen-map {
    position: relative;
    height: 100%;
    #screen-data-map {
      height: 100%;
      background: transparent !important;
    }

    // 覆盖，修复非chromium版本edge显示白边
    .amap-container {
      & > object {
        opacity: 0;
      }
    }

    .map-ui-staff {
      width: 3px;
      height: 3px;
      border-radius: 50%;
      background-color: #33FFCD;
      box-shadow: 0px 0px 10px 2px #33FFCD;

      animation: ds-staff-ui linear infinite 3s;
      transition-duration: .3s;
    }

    // 工单ui
    .map-ui-task {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      .map-ui-task-circle {
        display: flex;
        justify-content: center;
        align-items: center;
        // width: 100%;
        // height: 28px;
        flex-grow: 0;
        background-color: #00A8FF; // default
        line-height: 1;
        font-size: 12px;
        color: #ffffff;
        font-weight: 400;
        border-radius: 50%;
        text-align: center;
        box-shadow: 0 0 5px 1px rgba(255,255,255,0.3) inset;
        .map-ui-task-circle-number {
          transform: scale(0.67);
        }
      }
      .map-ui-task-bottom {
        width: 1px;
        height: 8px;
        background-color: #00A8FF; // default
      }
    }


    // 
    // padding 6px 0 8px
    // width: 42px height; 42px
    // font-size: 12px
    .map-ui-server {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background-color: rgba($color: #00FFF6, $alpha: 0.3);
      .map-ui-server-number {
        color: #ffffff;
        // color: #00FFF6;
        font-weight: 400;
        font-size: 12px;
        text-align: center;
        line-height: 1;
      }
      .map-ui-server-name {
        color: #ffffff;
        font-size: 12px;
        font-weight: 400;
        text-align: center;
        white-space: nowrap;
        line-height: 1;
        // 
        position: absolute;
        bottom: -17px;
        left: 50%;
        transform: translateX(-50%) scale(0.67);
      } 
    }

    .map-ui-spare {
      position: relative;
      display: flex;
      // justify-content: space-between;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      border-radius: 50%;
      border: 1px solid #C1FD72;
      background-color: rgba($color: #000000, $alpha: 0.38);
      box-shadow: 0 0 13px 0px rgba(255,255,255,0.3) inset;

      width: 40px;
      height: 40px;
      padding: 7px 0 5px;
      .map-ui-spare-number {
        color: #C1FD72;
        text-align: center;
        white-space: nowrap;
        font-size: 12px;
        line-height: 1;
        .map-ui-spare-number-part {
          display: inline-block;
          transform-origin: right top;
          transform: scale(0.85);
        }
        .map-ui-spare-decimals {
          display: inline-block;
          transform-origin: left top;
          transform: scale(0.8);
        }
      }
      .map-ui-spare-name {
        color: #C1FD72;
        text-align: center;
        white-space: nowrap;
        font-size: 12px;
        line-height: 1;

        position: absolute;
        bottom: -17px;
        left: 50%;
        transform: translateX(-50%) scale(0.67);
      }
    }

    .map-ui-customer {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: #FFDE00;
      transition-duration: .3s;
    }

    .area-name {
      color: rgba($color: #ffffff, $alpha: 0.8);
      font-size: 12px;
      white-space: nowrap;

      display: inline-block;
      height: 16px;
      width: 96px;
      text-align: center;
      transform: scale(0.67);
    }
  }

  // 地图
  .amap-logo, .amap-copyright {
      display: none !important;
  }

  // .amap-vectors {
    // transform-origin: 50% 50% !important; 
    // transform: translate3d(0px, 0px, 0px) !important; 
    // width: 700px !important; 
    // height: 600px !important;
    // top: unset !important;
    // left: unset !important;
  // }


</style>