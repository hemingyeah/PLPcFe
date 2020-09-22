<template>
  <base-panel :show.sync="show" :diy-transfer="true" width="400px" class="notification-center">
    <div class="normal-note-box" slot="diyTransferCon" :style="`height:${windowInnerHeight}px`">
      <div class="normal-note-right-box">
        <div class="normal-note-right-header">
          <div class="normal-note-right-header-title">通知中心</div>
          <div class="normal-note-right-header-btn flex-x">
            <div
              :class="['flex-x' ,'curs-point',read_all?'color-primary curs-ban':'color-666 curs-point']"
              @click="clear_note('all')"
            >
              <i class="iconfont icon-quanbuyidu font-12 mar-r-5"></i>
              全标已读
            </div>
          </div>
        </div>
        <div class="normal-note-right-list" v-if="note_arr && note_arr.length>0">
          <div
            v-for="(item,index) in note_arr"
            :class="['flex-x','normal-note-right-item',note_index === index?'normal-note-right-item-chosed':'']"
            :key="index"
            @click.stop="showItem(index)"
          >
            <div class="normal-note-right-item-img">
              <img :src="note_obj[item.source].img || ''" alt />
            </div>
            <div class="flex-1">
              <div class="flex-x">
                <div
                  class="normal-note-right-item-title flex-1 overHideCon-1"
                >{{note_obj[item.source].title || ''}}</div>
                <div class="normal-note-right-item-time">{{item.createTime | noteTime}}</div>
              </div>
              <div class="flex-x">
                <div class="normal-note-right-item-con flex-1 overHideCon-1">{{item.description}}</div>
                <div
                  class="normal-note-right-item-number"
                  v-if="item.unReadNum>0"
                >{{item.unReadNum > 99? 99 :item.unReadNum}}</div>
              </div>
            </div>
          </div>
        </div>
        <no-data-view-new v-else-if="note_arr.length == 0 && !loading" :notice-msg="'暂无消息通知'"></no-data-view-new>
      </div>
      <div :class="['normal-note-left-box',note_index > -1?'normal-note-left-box-show':'']">
        <!-- normal-note-left-filter start -->
        <div class="normal-note-left-filter">
          <div class="flex-x mar-b-12">
            <div class="normal-note-left-filter-title flex-1">时间筛选标签：</div>
            <div
              :class="['flex-x','mar-r-12',readNoteAll?'color-primary curs-ban':'color-666 curs-point']"
              @click="clear_note('now_all')"
            >
              <i class="iconfont icon-quanbuyidu font-12 mar-r-5"></i>
              全标已读
            </div>
          </div>
          <div class="flex-x normal-note-left-filter-list mar-b-30">
            <div
              v-for="(item, index) in date_arr"
              :key="index"
              :class="['normal-note-left-filter-item',searchModel.date_index===index?'normal-note-left-filter-item-chosed':'']"
              @click="change_filter_item('date_index',index)"
            >{{item.name}}</div>
          </div>

          <div class="normal-note-left-filter-title mar-b-12">状态筛选标签：</div>

          <div class="flex-x normal-note-left-filter-list">
            <div
              v-for="(item, index) in state_arr"
              :key="index"
              :class="['normal-note-left-filter-item',searchModel.state_index===index?'normal-note-left-filter-item-chosed':'']"
              @click="change_filter_item('state_index',index)"
            >{{item.name}}</div>
          </div>
        </div>
        <!-- normal-note-left-filter end -->
        <!-- normal-note-left-data start -->
        <div class="normal-note-left-data">
          <keep-alive>
            <component
              :is="'new-note-center'"
              ref="newNoteCenter"
              @clearNum="clearNum"
              @getNum="getNum"
            ></component>
          </keep-alive>
        </div>
        <!-- normal-note-left-data end -->
      </div>
    </div>
  </base-panel>
</template>

<script>
import newNoteCenter from "./notificationCenter/newNoteCenter";
import * as Lang from "@src/util/lang/index.js";
import * as NotificationApi from "@src/api/NotificationApi";
import NoDataViewNew from "@src/component/common/NoDataViewNew";

import info_ from "./data.js";

// 引入图片
import note_img_1 from "@src/assets/img/noteCenter/task.png";
import note_img_2 from "@src/assets/img/noteCenter/workBench.png";
import note_img_3 from "@src/assets/img/noteCenter/part.png";
import note_img_4 from "@src/assets/img/noteCenter/approve.png";
import note_img_5 from "@src/assets/img/noteCenter/daily.png";
import note_img_6 from "@src/assets/img/noteCenter/value.png";
import note_img_7 from "@src/assets/img/noteCenter/inTime.png";
import note_img_8 from "@src/assets/img/noteCenter/permissions.png";
import note_img_9 from "@src/assets/img/noteCenter/info.png";
import note_img_10 from "@src/assets/img/noteCenter/wiki.png";
import note_img_11 from "@src/assets/img/noteCenter/system.png";
import note_img_12 from "@src/assets/img/noteCenter/attention.png";
// to do 
import note_img_13 from "@src/assets/img/noteCenter/shopOrder.png";

export default {
  name: "notification-center",
  components: {
    [newNoteCenter.name]: newNoteCenter,
    [NoDataViewNew.name]: NoDataViewNew
  },
  props: {
    info: Object,
    allCount: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      component: "job-notification",
      show: false,
      loading: true,
      note_obj: {
        task: {
          img: note_img_1,
          title: "工单"
        },
        event: {
          img: note_img_2,
          title: "服务台"
        },
        spare: {
          img: note_img_3,
          title: "备件"
        },
        approve: {
          img: note_img_4,
          title: "审批"
        },
        daily: {
          img: note_img_5,
          title: "日报"
        },
        performance: {
          img: note_img_6,
          title: "绩效"
        },
        timing: {
          img: note_img_7,
          title: "定时提醒"
        },
        authority: {
          img: note_img_8,
          title: "权限变更"
        },
        notice: {
          img: note_img_9,
          title: "信息公告"
        },
        wiki: {
          img: note_img_10,
          title: "知识库"
        },
        system: {
          img: note_img_11,
          title: "系统通知"
        },
        attention: {
          img: note_img_12,
          title: "售后宝"
        },
        // to do 
        shopOrder: {
          img: note_img_13,
          title: "商城订单"
        },
        
      },
      note_arr: [],
      note_index: -1,
      now_note: -1,
      date_arr: [
        { name: "全部", value: "all" },
        { name: "今日", value: "0" },
        { name: "昨日", value: "1" },
        { name: "近七天", value: "7" },
        { name: "近30天", value: "30" }
      ],
      state_arr: [
        { name: "全部", value: "" },
        { name: "未读", value: "" },
        { name: "已读", value: "" }
      ],
      searchModel: {
        date_index: 0,
        state_index: 0
      },
      readedParams: {
        0: "",
        1: "0",
        2: "1"
      },
      nowInfo: {},
      windowInnerHeight: 0
    };
  },
  filters: {
    noteTime(value) {
      let time_source = Lang.formatDate(new Date(value), "YYYY-MM-DD");
      let time_now = Lang.formatDate(new Date(), "YYYY-MM-DD");
      let res;
      if (time_now === time_source) {
        res = Lang.formatDate(new Date(value), "HH:mm");
      } else {
        res = Lang.formatDate(new Date(value), "YYYY-MM-DD");
      }
      return res;
    }
  },
  methods: {
    async clear_note(type) {
      if (type == "all" && this.allCount <= 0) {
        return;
      }
      if (type == "now_all") {
        if (this.note_arr[this.note_index].unReadNum <= 0) {
          return;
        }
        // let haveNotRead = this.$refs.newNoteCenter.haveNotRead();
        // if (!haveNotRead) return;
      }
      let confirm_con = {
        all: "您确定将全部未读通知信息标记为已读?",
        now_all: "您确定将该类型通知信息全部标记为已读？"
      };
      let confirm_res = await this.$platform.confirm(confirm_con[type]);
      if (!confirm_res) {
        return;
      }
      if (type == "all") {
        NotificationApi.newGetMessageMark().then(result => {
          if (result.status == 0) {
            this.$refs.newNoteCenter.clearAllRead();
            if (this.note_arr && this.note_arr.length > 0) {
              this.note_arr.forEach(item => {
                item.unReadNum = 0;
              });
            }
            this.$emit("clearNum", { count: "-1" });
          }
        });
      } else {
        let { startTime, endTime } = this.choseTime;
        let source = this.note_arr[this.note_index].source;
        let count = this.note_arr[this.note_index].unReadNum * 1;

        NotificationApi.newGetMessageMark({
          source,
          startTime,
          endTime
        }).then(result => {
          if (result.status == 0) {
            this.$emit("clearNum", {
              count: count || 0
            });
            this.note_arr[this.note_index].unReadNum = 0;
            this.$refs.newNoteCenter.clearAllRead();
          }
        });
      }
    },
    showComponent() {
      this.show = true;
    },
    clearNum(e) {
      let source = this.note_arr[this.note_index].source;
      let { id } = e;
      if (e.readed == 1) {
        if (e.needHide) {
          this.hideItem();
        }
        return;
      }
      NotificationApi.newGetMessageMark({
        source,
        id
      }).then(result => {
        if (result.status == 0) {
          this.note_arr[this.note_index].unReadNum -= e.count || 0;
          this.$emit("clearNum", e);

          if (e.needHide) {
            this.hideItem();
          }
        }
      });
    },
    getNum(count) {
      if (this.allCount != count) {
        this.$emit("getNum");
      }
    },
    // new 通知中心
    async showItem(index) {
      if (this.now_note !== index) {
        this.$set(this.searchModel, "state_index", 0);
        this.$set(this.searchModel, "date_index", 0);
        this.now_note = index;
        this.$refs.newNoteCenter.changeParams({
          source: this.note_arr[index].source,
          readed: this.readedParams[this.searchModel.state_index],
          ...this.choseTime
        });
      }
      this.note_index = this.note_index == index ? -1 : index;
    },
    hideItem() {
      this.note_index = -1;
    },
    change_filter_item(key, val) {
      if (this.searchModel[key] == val) return;
      this.searchModel[key] = val;
      this.$refs.newNoteCenter.changeParams({
        source: this.note_arr[this.note_index].source,
        readed: this.readedParams[this.searchModel.state_index],
        ...this.choseTime
      });
    },
    loadData() {
      this.loading = true;
      NotificationApi.newGetMessageGroup().then(result => {
        if (result.status == 0) {
          let num = 0;
          if (result.data && result.data.length > 0) {
            // 过滤掉不属于规定source的异常数据
            for (let index = result.data.length - 1; index >= 0; index--) {
              if (!this.note_obj.hasOwnProperty(result.data[index].source)) {
                result.data.splice(index, 1);
              } else {
                num += result.data[index].unReadNum * 1;
              }
            }
            this.getNum(num);
          }

          this.note_arr = result.data || [];
          this.loading = false;
        }
      });
    },
    handleLableWidth() {
      this.windowInnerHeight = window.innerHeight * 1 - 91;
    }
  },
  computed: {
    choseTime() {
      let value = _.cloneDeep(this.date_arr[this.searchModel.date_index].value);
      let startTime = "";
      let endTime = "";

      if (value != 100 && value != null && value != 1) {
        endTime = Lang.formatDate(new Date(), "YYYY-MM-DD 23:59:59");
      } else if (value == 1) {
        endTime = Lang.formatDate(
          new Date() - 1 * 24 * 60 * 60 * 1000,
          "YYYY-MM-DD 23:59:59"
        );
      } else if (value == 100) {
        endTime = Lang.formatDate(
          new Date() - 30 * 24 * 60 * 60 * 1000,
          "YYYY-MM-DD 23:59:59"
        );
      } else {
        endTime = null;
      }

      if (value == 0) {
        startTime = Lang.formatDate(new Date(), "YYYY-MM-DD 00:00:00");
      } else if (value == 1) {
        startTime = Lang.formatDate(
          new Date() - 1 * 24 * 60 * 60 * 1000,
          "YYYY-MM-DD 00:00:00"
        );
      } else if (value == 7) {
        startTime = Lang.formatDate(
          new Date() - 6 * 24 * 60 * 60 * 1000,
          "YYYY-MM-DD 00:00:00"
        );
      } else if (value == 30) {
        startTime = Lang.formatDate(
          new Date() - 29 * 24 * 60 * 60 * 1000,
          "YYYY-MM-DD 00:00:00"
        );
      } else {
        startTime = null;
      }
      return {
        startTime,
        endTime
      };
    },
    read_all() {
      return this.allCount <= 0;
    },
    readNoteAll() {
      return !(
        this.note_arr[this.now_note] &&
        this.note_arr[this.now_note].unReadNum > 0
      );
    }
  },
  mounted() {
    window.onresize = () => {
      return (() => {
        this.handleLableWidth();
      })();
    };
    this.handleLableWidth();
  },
  watch: {
    show: {
      handler(newValue) {
        if (newValue == false) {
          this.note_index = -1;
          this.now_note = -1;
        } else {
          this.loadData();
        }
      }
    }
  }
};
</script>

<style lang="scss">
.notification-center {
  top: 91px;
  display: flex;
  flex-flow: column;
  background: #eee;
  overflow: none;
  box-shadow: -3px 0px 5px #ccc;
}
.notification-center-header {
  height: 50px;
  line-height: 50px;
  background: #55b7b4;
  text-align: center;
  font-size: 18px;
  padding: 0 2px;
}
.notification-center-btn {
  float: left;
  height: 50px;
}
.notification-center-title {
  display: inline-block;
  margin: 0;
  color: #fff;
}
.notification-center-type {
  display: flex;
  text-align: center;
  list-style: none;
  height: 65px;
  padding: 0 13px;
  font-size: 16px;
  background: #fff;
  z-index: 100;
  span {
    color: #474747;
    opacity: 0.64;
  }
}
.notification-center-tab {
  display: none;
  &:checked + label {
    span {
      color: #474747;
      opacity: 1;
    }
    div:nth-child(2) {
      min-width: 18px;
      height: 18px;
      position: absolute;
      top: 20px;
      left: 145px;
      font-size: 13px;
      padding: 0 5px;
      color: #fff;
      background: #cb0c0c;
      border-radius: 12px;
      opacity: 1;
    }
  }
}
.notification-center-tab-left {
  &:checked + label {
    div:nth-child(3) {
      position: absolute;
      top: 62px;
      left: 330px;
      height: 5px;
      width: 28px;
      z-index: 99;
      border-radius: 5px;
      background: #55b7b4;
      transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      transform: translateX(-233px);
    }
  }
}
.notification-center-tab-right {
  &:checked + label {
    div:nth-child(3) {
      position: absolute;
      top: 62px;
      left: -137px;
      height: 5px;
      width: 28px;
      z-index: 99;
      border-radius: 5px;
      background: #55b7b4;
      transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      transform: translateX(233px);
    }
  }
}
.notification-center-tab-text {
  position: relative;
  padding-top: 30px;
  margin: 0;
  flex: 1;
  background: #fff;
  border-bottom: 1px solid #cbcbcb;
  user-select: none;
  &:hover {
    cursor: pointer;
  }
}
.notification-center-tab-new {
  min-width: 18px;
  height: 18px;
  position: absolute;
  top: 20px;
  left: 145px;
  font-size: 13px;
  padding: 0 5px;
  color: #fff;
  background: #cb0c0c;
  border-radius: 12px;
  opacity: 0.64;
}
.notification-center-tab-number {
  position: relative;
  top: -5px;
  font-size: 8px;
  color: #fff;
}
.notification-close {
  color: #fff;
  font-size: 18px;
}
.icon-notification {
  margin-right: 5px;
  font-size: 18px;
}
.icon-fenzu {
  color: #fff;
  font-size: 18px;
}
.notification-center-close {
  float: right;
  height: 50px;
}

// new 通知中心
.flex-x {
  display: flex;
  align-items: center;
}
.flex-1 {
  flex: 1;
}
.color-666 {
  color: #666;
  .iconfont {
    color: #999;
  }
}
.font-12 {
  font-size: 12px;
}
.mar-r-5 {
  margin-right: 5px;
}
.mar-r-12 {
  margin-right: 12px;
}
.mar-b-12 {
  margin-bottom: 12px;
}
.mar-b-30 {
  margin-bottom: 30px;
}
.overHideCon-1 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
  white-space: normal;
  word-wrap: break-word;
  word-break: break-all;
}
.normal-note-box {
  width: 400px;
  position: absolute;
  min-height: 300px;
  max-height: 878px;
  right: 0;
  z-index: 99;
  box-shadow: none !important;
}
//  normal-note-right-box  start
.normal-note-right-box {
  width: 400px;
  height: 100%;
  overflow-y: scroll;
  right: 0;
  z-index: 99;
  background: rgba(245, 250, 250, 1);
  box-shadow: -6px 0px 16px 0px rgba(0, 0, 0, 0.1);
  .normal-note-right-header {
    position: sticky;
    position: -webkit-sticky;
    top: 0;
    z-index: 98;
    width: 100%;

    .normal-note-right-header-title {
      background: $color-primary;
      color: #fff;
      width: 100%;
      text-align: center;
      height: 48px;
      font-size: 18px;
      line-height: 48px;
      font-weight: 500;
    }
    .normal-note-right-header-btn {
      width: 100%;
      height: 48px;
      padding: 0 16px;
      justify-content: flex-end;
      background: rgba(245, 250, 250, 1);
    }
  }

  .normal-note-right-list {
    padding: 0 16px;
    // height: 100%;
    box-sizing: border-box;
    & .normal-note-right-item {
      margin-bottom: 12px;
    }
    & .normal-note-right-item-chosed {
      box-shadow: 0px 3px 6px 0px rgba(0, 0, 0, 0.12);
    }
    .normal-note-right-item {
      cursor: pointer;
      padding: 14px 12px;
      background: #fff;
      border-radius: 4px;
      min-height: 68px;
      .normal-note-right-item-img {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        // background: #ff0000;
        margin-right: 11px;
        img {
          width: 100%;
          height: 100%;
        }
      }
      .normal-note-right-item-title {
        font-size: 16px;
        font-weight: 500;
      }
      .normal-note-right-item-con {
        color: $text-color-secondary;
        font-size: 12px;
      }
      .normal-note-right-item-time {
        color: $text-color-secondary;
        font-size: 12px;
      }
      .normal-note-right-item-number {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #f56c6c;
        text-align: center;
        font-size: 12px;
        line-height: 18px;
        color: #fff;
      }
    }
  }
}
//  normal-note-right-box  end
//  normal-note-left-box  start
.normal-note-left-box {
  width: 400px;
  background: rgba(245, 250, 250, 1);
  position: absolute;
  height: 100%;
  overflow-y: scroll;
  transform: translateX(0);
  transition: all 0.3s;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
  z-index: 97;
  .normal-note-left-filter {
    background: #fff;
    padding: 16px 4px 20px 16px;
    position: sticky;
    position: -webkit-sticky;
    top: 0;
    box-shadow: 0px 6px 16px 0px rgba(0, 0, 0, 0.1);
    z-index: 98;
    .normal-note-left-filter-title {
      font-size: 16px;
      font-weight: 500;
    }
    .normal-note-left-filter-list {
      flex-wrap: wrap;
      & .normal-note-left-filter-item {
        margin-right: 12px;
      }
      .normal-note-left-filter-item {
        cursor: pointer;
        width: 56px;
        height: 28px;
        line-height: 28px;
        text-align: center;
        border-radius: 4px;
        border: 1px solid rgba(220, 230, 230, 1);
        box-sizing: border-box;
      }
      .normal-note-left-filter-item-chosed {
        background: rgba(19, 194, 194, 1);
        border: none;
        color: #fff;
      }
    }
  }
  .normal-note-left-data {
    height: 100%;
  }
}
::-webkit-scrollbar {
  display: none;
}
//  normal-note-left-box  end
.normal-note-left-box-show {
  transform: translateX(-400px);

  box-shadow: -6px 0px 16px 0px rgba(0, 0, 0, 0.1);
}
.curs-point {
  cursor: pointer;
}
.curs-ban {
  cursor: not-allowed;
}
.color-primary {
  color: $color-primary;
}
</style>
