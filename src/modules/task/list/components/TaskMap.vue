<template>
  <div class="task-map" v-show="!mapShow">
    <!-- 头部 -->
    <div class="task-flex task-map-header">
      <div class="task-span1" @click="$emit('hide')">
        <base-button type="ghost">返回列表</base-button>
      </div>
      <span class="task-font16 task-c6 task-fw6 task-ai"
        >列表仅显示有客户定位信息的工单。</span
      >
    </div>
    <div class="task-map-body">
      <!-- 地图 -->
      <div ref="container" :style="`height: ${mapHeight - 90}px`"></div>
      <!-- 列表 -->
      <div
        class="task-map-body-workSide"
        :style="
          `height: ${mapHeight - 90}px;transform: translate(${mapPostion}px,0);`
        "
      >
        <div class="fold_btn" @click="show">
          <i class="iconfont icon-xiangzuo" v-show="mapPostion === 282"></i>
          <i class="iconfont icon-xiangzuo-copy" v-show="mapPostion === 8"></i>
        </div>
        <div class="task-map-body-workSide-header task-flex task-ai">
          <span class="task-span1">工单数量 {{ mapList.length }}</span>
          <span @click="checkPostion = 282" v-show="checkPostion === 8"
            ><i class="iconfont icon-yemianshanchu task-font12"></i
          ></span>
        </div>
        <!-- 列表 -->
        <task-map-list :mapHeight="mapHeight" :mapList="mapList" @next="next" />
        <!-- 已选中列表 and 未选中 -->
        <div
          class="task-map-check"
          :style="
            `transition: all ease 0.3s;transform: translate(${checkPostion}px,0);`
          "
        >
          <task-map-list :mapHeight="mapHeight" :mapList="mdataFilter" />
        </div>
        <!-- foot -->
        <div class="task-map-select" v-show="selectShow">
          <div @click="chooseFilter('select')">仅显示已选中项</div>
          <div @click="chooseFilter('unselect')">仅显示未选中项</div>
        </div>
        <div class="task-map-foot task-flex task-ai">
          <span class="task-span1">批量工单转派(0/{{ mapList.length }})</span>
          <span class="task-map-foot-select" @click="selectShow = !selectShow"
            ><i class="iconfont icon-shaixuan"></i
          ></span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
/* Api */
import * as TaskApi from "@src/api/TaskApi.ts";
import TaskMapList from "./TaskMapList.vue";
export default {
  name: "task-map",
  props: {
    config: {
      type: Object, //接口测试
    },
    mapShow: {
      type: Boolean,
    },
  },
  data() {
    return {
      mapHeight: window.innerHeight, //根据屏幕尺寸而变
      mapPostion: 8, // 列表滑动距离
      checkPostion: 282, // 仅显示已选中项活动距离
      mapList: [], //地图数据
      mdataFilter: [], //筛选的地图数据
      selectShow: false,
      page: 1,
      infoWindow: new AMap.InfoWindow({ offset: new AMap.Pixel(0, -28) }),
    };
  },
  watch: {
    mapShow(v) {
      if (!v) {
        this.mapList = [];
        this.search();
      }
    },
  },
  mounted() {
    const that = this;
    window.onresize = () => {
      console.log(window.innerHeight);
      return (() => {
        that.mapHeight = window.innerHeight;
      })();
    };
  },
  methods: {
    show() {
      const { mapPostion } = this;
      this.mapPostion = mapPostion === 8 ? 282 : 8;
    },
    // 创建地图坐标
    createMarker(mapList) {
      const _that = this;
      const map = new AMap.Map(this.$refs.container, {
        resizeEnable: true,
        zoom: 10,
        center: [116.480983, 40.0958],
        animateEnable: false,
      });

      let markerList = [];
      mapList.forEach((item, index) => {
        const marker = new AMap.Marker({
          position: [item.address.longitude, item.address.latitude],
          extData: { index: index, data: item },
          map: map,
          content: `<div class="task-map-body-workSide-body-item-index">${index +
            1}</div>`,
        });
        marker.on("click", this.jumpToAmap);
        markerList.push(marker);
      });

      map.add(markerList);
    },
    // 地图坐标点击事件
    jumpToAmap({ target }) {
      const markerId = target.getExtData().data.id;
      console.log(target, markerId);
    },
    // 仅显示已选中项活动距离
    chooseFilter(type) {
      this.checkPostion = 8;
      this.selectShow = false;
      if (type === "select") {
        this.mdataFilter = this.mapList.filter(function(item) {
          return item.selected; // 目前不可进行转交的工单不在允许选中
        });
      }
      if (type === "unselect") {
        this.mdataFilter = this.mapList.filter(function(item) {
          return !item.selected;
        });
      }
    },
    // 加载更多
    next() {
      this.page++;
      this.search();
    },
    // 列表数据
    async search() {
      const { searchParams, selectedIds } = this.config;
      const params = {
        ...searchParams,
        ids: selectedIds,
        ...{ page: this.page },
      };
      const { success, result } = await TaskApi.search(params);
      if (success) {
        this.mapList = [...this.mapList, ...result.content];
        this.createMarker(this.mapList);
      }
    },
  },
  components: {
    [TaskMapList.name]: TaskMapList,
  },
};
</script>
<style lang="scss">
// 地图图标
.task-map-body-workSide-body-item-index {
  background: url("../../../../assets/img/task/16-16.png") no-repeat 0 -65px;
  width: 24px;
  height: 30px;
  margin-right: 10px;
  line-height: 24px;
  text-align: center;
  color: #fff;
  font-family: tahoma;
  font-size: 12px;
  font-weight: bold;
}
</style>
<style lang="scss" scoped>
.task-map {
  padding: 15px;
  &-header {
    padding: 10px;
    background-color: #fff;
    border-radius: 3px;
    line-height: 34px;
  }
  &-body {
    margin-top: 10px;
    position: relative;
    overflow: hidden;
    &-workSide {
      width: 282px;
      position: absolute;
      top: 0px;
      right: 0;
      border-left: 1px solid #e5e5e5;
      background-color: #fff;
      z-index: 9;
      &-header {
        height: 50px;
        padding: 0 10px;
        padding-right: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid rgb(204, 204, 204);
        font-size: 16px;
        font-weight: 700;
      }
      &-body {
        overflow: hidden;
        overflow-y: scroll;
        background-color: #fff;
        color: #a0a0a0;
        font-size: 13px;
        &-item {
          padding: 10px;
          border-bottom: 1px dotted #ccc;
          &-info {
            margin-top: -5px;
          }
          &-index {
            background: url("../../../../assets/img/task/16-16.png") no-repeat 0 -65px;
            width: 24px;
            height: 30px;
            margin-right: 10px;
            line-height: 24px;
            text-align: center;
            color: #fff;
            font-family: tahoma;
            font-size: 12px;
            font-weight: bold;
          }
          p {
            margin-bottom: 5px;
            font-weight: normal;
          }
        }
        span {
          color: #3c8dbc;
        }
      }
      .fold_btn {
        position: absolute;
        top: 50%;
        left: -22px;
        margin-top: -22px;
        z-index: 10;
        background-color: #fff;
        width: 22px;
        height: 43px;
        line-height: 43px;
        padding-left: 5px;
        > i {
          font-size: 12px;
          color: #6666;
          font-weight: 600;
        }
      }
    }
  }
  &-select {
    position: absolute;
    right: 11px;
    bottom: 33px;
    background-color: #fff;
    border-radius: 4px;
    border: 1px solid rgba(0, 0, 0, 0.15);
    z-index: 101;
    > div {
      padding: 5px 20px;
      line-height: 26px;
      text-align: center;
      color: #777;
      font-size: 14px;
      transition: background-color ease 0.3s, color ease 0.3s,
        border-color ease 0.3s;
      cursor: pointer;
      &:hover {
        background-color: #55b7b4;
        color: #fff;
      }
    }
  }
  &-check {
    width: 100%;
    position: absolute;
    top: 50px;
    z-index: 100;
  }
  &-foot {
    text-align: center;
    color: #fff;
    height: 30px;
    line-height: 30px;
    background-color: rgb(85, 183, 180);
    cursor: pointer;
    font-weight: 600;
    font-size: 12px;
    &-select {
      display: flex;
      -webkit-box-pack: center;
      justify-content: center;
      -webkit-box-align: center;
      align-items: center;
      width: 30px;
      background-color: #05c3b1;
      cursor: pointer;
      position: relative;
      left: -8px;
      > i {
        font-size: 25px;
      }
    }
  }
}
</style>
