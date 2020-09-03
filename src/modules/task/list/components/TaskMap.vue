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
      <div
        ref="container"
        :style="`height: ${mapHeight - 90}px`"
        @click="infoClick"
      ></div>
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
        <task-map-list
          :mapHeight="mapHeight"
          :mapList="mapList"
          @next="next"
          @openInfo="openInfo"
          :type="1"
          ref="taskMapList"
        />
        <!-- 已选中列表 and 未选中 -->
        <div
          class="task-map-check"
          :style="
            `transition: all ease 0.3s;transform: translate(${checkPostion}px,0);`
          "
        >
          <task-map-list
            ref="taskMapList"
            :mapHeight="mapHeight"
            :mapList="mdataFilter"
            @openInfo="openInfo"
          />
        </div>
        <!-- foot -->
        <div class="task-map-select" v-show="selectShow">
          <div @click="chooseFilter('select')">仅显示已选中项</div>
          <div @click="chooseFilter('unselect')">仅显示未选中项</div>
        </div>
        <div class="task-map-foot task-flex task-ai">
          <span class="task-span1" @click="reallotBatch"
            >批量工单转派({{ selectIds.length }}/{{
              checkPostion === 8 ? mdataFilter.length : mapList.length
            }})</span
          >
          <span class="task-map-foot-select" @click="selectShow = !selectShow"
            ><i class="iconfont icon-shaixuan"></i
          ></span>
        </div>
      </div>
    </div>
    <!-- S 工单转换 -->
    <task-transfer ref="TaskTransfer" :taskIdList="selectIds" />
    <!-- E 工单转换 -->
  </div>
</template>
<script>
/* Api */
import vue from "vue";
import * as TaskApi from "@src/api/TaskApi.ts";
import TaskMapList from "./TaskMapList.vue";
import TaskTransfer from "./TaskTransfer";
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
      currentMarkId: "", //当前打开marker的id
      selectShow: false,
      page: 1,
      map: "",
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
  computed: {
    selectIds() {
      const ids = this.mapList
        .filter(function(item) {
          return item.selected; // 目前不可进行转交的工单不在允许选中
        })
        .map((item) => {
          return item.id;
        });
      return ids;
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
      this.map = new AMap.Map(this.$refs.container, {
        resizeEnable: true,
        zoom: 5,
        center: [116.480983, 40.0958],
        animateEnable: false,
      });

      let markerList = [];
      mapList.forEach((item, index) => {
        if (item.address.longitude) {
          const marker = new AMap.Marker({
            position: [item.address.longitude, item.address.latitude],
            extData: { index: index, data: item },
            map: this.map,
            content: `<div class="task-map-body-workSide-body-item-index ${
              item.selected ? "active" : ""
            }">${item.i}</div>`,
          });
          marker.on("click", this.jumpToAmap);
          markerList.push(marker);
        }
      });

      this.map.add(markerList);
    },
    // 地图坐标点击事件
    jumpToAmap({ target }) {
      const item = target.getExtData().data;
      const allowReallot = this.$refs.taskMapList.allowReallot(item);

      if (allowReallot) {
        // let currSelected = !item.selected;
        item["selected"] = true;
      }
      this.openInfo({ allowReallot, item: item });
    },

    openInfo({ allowReallot, item, index, type }) {
      if (type) {
        let list = this.mapList.filter((val) => {
          return item.id !== val.id;
        });
        list = [...list, ...[item]];
        this.createMarker(list);
      }
      if (!item.selected && typeof item.selected === "boolean") {
        this.infoWindow.close();
        return;
      }

      this.openInfoWindow(item, allowReallot);
    },
    //信息框事件
    infoClick({ target }) {
      const { id } = target;
      if (id === "view" || id === 'ids') {
        let fromId = window.frameElement.getAttribute("id");
        this.$platform.openTab({
          id: `task_view_${this.currentMarkId}`,
          title: "工单详情",
          close: true,
          url: `/task/view/${this.currentMarkId}?noHistory=1`,
          fromId,
        });
      } else if (id === 'transfer') {
        this.reallotBatch()
      }
    },
    // 信息窗
    openInfoWindow(marker, allowReallot) {
      const { id, address, taskNo, linkMan, createTime } = marker;
      const { infoWindow, map } = this;
      const lat = [address.longitude, address.latitude];
      this.currentMarkId = id;

      const button = allowReallot
        ? `<button type="button" class="btn btn-primary" id="transfer">转派</button>`
        : `<button type="button" class="btn btn-primary map-modal-view-btn" id="view">查看</button>`;
      const taddress = `${address.province}${address.city}${address.dist}${address.address}`;

      const phoneIcon = this.has_call_center_module
        ? `<i data-toggle="tooltip" title="拨打电话" style="width: 14px!important;margin-left: 5px;color: #55b7b4;font-size: 14px;cursor: pointer;" class="iconfont icon-dianhua1"></i>`
        : "";
      const content = `<div class="map-mark-box">
                    <div class="map-mark-head task-flex">
                      <a class="open-new-tab task-span1" id="ids">${taskNo}</a>${button}
                    </div>
                    <div class="map-mark-body">
                      <p>联系人：${linkMan.name}</p>
                      <p>电话：${linkMan.phone}</p>
                      <p>地址：${taddress}</p>
                      <p>创建时间：${createTime}</p>
                    </div>
                  </div>`;

      map.setZoomAndCenter(12, lat);

      infoWindow.setContent(content);
      infoWindow.open(map, lat);
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
        this.mapList.map((item, index) => {
          item["i"] = index + 1;
        });
        this.createMarker(this.mapList);
      }
    },
    /**
     * @description 工单转派
     */
    reallotBatch() {
      const { selectIds } = this;
      if (!selectIds.length) {
        this.$platform.alert("请选择要转派的工单");
        return;
      }
      this.$refs.TaskTransfer.openSendMessageDialog();
    },
  },
  components: {
    [TaskMapList.name]: TaskMapList,
    [TaskTransfer.name]: TaskTransfer,
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
.active {
  background: url("../../../../assets/img/task/16-16.png") no-repeat 0 -34px;
}
// 信息框
.map-mark-box {
  width: 300px;
  font-size: 13px;
  padding-top: 10px;
  padding-left: 8px;
  padding-bottom: 10px;
  a {
    text-decoration: none;
    color: #72afd2;
    font-size: 17px;
    font-weight: 100;
  }
  .map-mark-head {
    border-bottom: 1px solid #ccc;
    display: flex;
    flex-flow: row nowrap;
    padding-bottom: 5px;
    align-items: center;
    button,
    .map-modal-view-btn {
      color: #ffffff;
      background: #55b7b4;
      border-color: #55b7b4;
      font-size: 12px;
    }
  }
  .map-mark-body {
    p {
      margin: 0;
      margin-top: 5px;
    }
  }
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
