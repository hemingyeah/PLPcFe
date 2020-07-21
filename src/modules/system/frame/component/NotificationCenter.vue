<template>
  <base-panel :show.sync="show" :diy-transfer="true" width="400px" class="notification-center">
    <div class="normal-note-box" slot="diyTransferCon">
      <div class="normal-note-right-box">
        <div class="normal-note-right-header">
          <div class="normal-note-right-header-title">通知中心</div>
          <div class="normal-note-right-header-btn flex-x">
            <div class="flex-x color-666">
              <i class="iconfont icon-setting"></i>
              全标已读
            </div>
          </div>
        </div>
        <div class="normal-note-right-list">
          <div
            v-for="(item,index) in note_arr"
            :class="['flex-x','normal-note-right-item',note_index === index?'normal-note-right-item-chosed':'']"
            :key="index"
            @click.stop="showItem(index)"
          >
            <div class="normal-note-right-item-img">
              <img :src="item.img" alt />
            </div>
            <div class="flex-1">
              <div class="flex-x">
                <div class="normal-note-right-item-title flex-1 overHideCon-1">{{item.title}}</div>
                <div class="normal-note-right-item-time">{{item.time}}</div>
              </div>
              <div class="flex-x">
                <div class="normal-note-right-item-con flex-1 overHideCon-1">{{item.con}}</div>
                <div class="normal-note-right-item-number">{{item.number > 99? 99 :item.number}}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div :class="['normal-note-left-box',note_index > -1?'normal-note-left-box-show':'']">
        <!-- normal-note-left-filter start -->
        <div class="normal-note-left-filter">
          <div class="normal-note-left-filter-title mar-b-12">时间筛选标签：</div>
          <div class="flex-x normal-note-left-filter-list mar-b-30">
            <div
              v-for="(item, index) in date_arr"
              :key="index"
              :class="['normal-note-left-filter-item',date_index===index?'normal-note-left-filter-item-chosed':'']"
              @click="change_filter_item('date_index',index)"
            >{{item.name}}</div>
          </div>
          <div class="flex-x mar-b-12">
            <div class="normal-note-left-filter-title flex-1">状态筛选标签：</div>
            <div class="flex-x color-666 mar-r-12">
              <i class="iconfont icon-setting"></i>
              全标已读
            </div>
          </div>

          <div class="flex-x normal-note-left-filter-list">
            <div
              v-for="(item, index) in state_arr"
              :key="index"
              :class="['normal-note-left-filter-item',state_index===index?'normal-note-left-filter-item-chosed':'']"
              @click="change_filter_item('state_index',index)"
            >{{item.name}}</div>
          </div>
        </div>
        <!-- normal-note-left-filter end -->
        <!-- normal-note-left-data start -->
        <div class="normal-note-left-data">
          <keep-alive>
            <component :is="'new-note-center'" :info="info" @clearNum="clearNum" @getNum="getNum"></component>
          </keep-alive>
        </div>
        <!-- normal-note-left-data end -->
      </div>
    </div>
    <!-- <div class="notification-center-header" slot="header">
      <button type="button" class="btn-text notification-center-btn" @click="show = false">
        <i class="iconfont icon-open notification-close"></i>
      </button>
      <p class="notification-center-title">
        <i class="iconfont icon-notification"></i>通知中心
      </p>
    </div>

    <div class="notification-center-type">
      <input class="notification-center-tab notification-center-tab-left" type="radio" id="job-notification" :checked="component == 'job-notification'" @change="notificationChange" />
      <label class="notification-center-tab-text" for="job-notification">
        <span>工作通知</span>
        <div class="notification-center-tab-new" v-show="info.workMsg && info.workMsg >= 0">{{workMore || info.workMsg}}</div>
        <div class="notification-center-checked-border"></div>
      </label>
      <input class="notification-center-tab notification-center-tab-right" type="radio" id="system-notification" :checked="component == 'system-notification'" @change="notificationChange" />
      <label class="notification-center-tab-text" for="system-notification">
        <span>系统通知</span>
        <div class="notification-center-tab-new" v-show="info.systemMsg && info.systemMsg >= 0">{{systemMore || info.systemMsg}}</div>
        <div class="notification-center-checked-border"></div>
      </label>
    </div>

    <keep-alive>
      <component :is="component" :info="info" @clearNum="clearNum" @getNum="getNum"></component>
    </keep-alive>-->
  </base-panel>
</template>

<script>
import JobNotification from "./notificationCenter/JobNotification";
import SystemNotification from "./notificationCenter/SystemNotification";
import newNoteCenter from "./notificationCenter/newNoteCenter";

import info_ from "./data.js";

// 引入图片
import note_img_1 from "@src/assets/img/noteCenter/task-small.png";
import note_img_2 from "@src/assets/img/noteCenter/workBench.png";
import note_img_3 from "@src/assets/img/noteCenter/part.png";
import note_img_4 from "@src/assets/img/noteCenter/approval-small.png";
import note_img_5 from "@src/assets/img/noteCenter/approval-small.png";
import note_img_6 from "@src/assets/img/noteCenter/jx.png";
import note_img_7 from "@src/assets/img/noteCenter/jx.png";
import note_img_8 from "@src/assets/img/noteCenter/help_zhqx.png";
import note_img_9 from "@src/assets/img/noteCenter/info.png";
import note_img_10 from "@src/assets/img/noteCenter/wiki.png";

export default {
  name: "notification-center",
  components: {
    [JobNotification.name]: JobNotification,
    [SystemNotification.name]: SystemNotification,
    [newNoteCenter.name]: newNoteCenter
  },
  props: {
    info: Object
  },
  data() {
    return {
      component: "job-notification",
      show: true,
      workMore: "",
      systemMore: "",
      note_arr: [
        {
          img: note_img_1,
          title: "工单",
          con: "副标题",
          number: 0,
          time: "07-20",
          value: "task"
        },
        {
          img: note_img_2,
          title: "服务台",
          con: "副标题",
          number: 0,
          time: "07-20",
          value: "event"
        },
        {
          img: note_img_3,
          title: "备件",
          con: "副标题",
          number: 0,
          time: "07-20",
          value: "spare"
        },
        {
          img: note_img_4,
          title: "审批",
          con: "副标题",
          number: 0,
          time: "07-20",
          value: "approve"
        },
        {
          img: note_img_5,
          title: "日报",
          con: "副标题",
          number: 0,
          time: "07-20",
          value: "daily"
        },
        {
          img: note_img_6,
          title: "绩效",
          con: "副标题",
          number: 0,
          time: "07-20",
          value: "performance"
        },
        {
          img: note_img_7,
          title: "定时提醒",
          con: "副标题",
          number: 0,
          time: "07-20",
          value: "timing"
        },
        {
          img: note_img_8,
          title: "权限变更",
          con: "副标题",
          number: 0,
          time: "07-20",
          value: "authority"
        },
        {
          img: note_img_9,
          title: "信息公告",
          con: "副标题",
          number: 0,
          time: "07-20",
          value: "notice"
        },
        {
          img: note_img_10,
          title: "知识库",
          con: "副标题",
          number: 0,
          time: "07-20",
          value: "wiki"
        }
      ],
      note_index: 1,
      date_arr: [
        { name: "全部", value: "" },
        { name: "今日", value: "" },
        { name: "昨日", value: "" },
        { name: "近七天", value: "" },
        { name: "近30天", value: "" }
      ],
      date_index: 0,
      state_arr: [
        { name: "全部", value: "" },
        { name: "未读", value: "" },
        { name: "已读", value: "" }
      ],
      state_index: 0,
      data_list: info_
    };
  },
  methods: {
    notificationChange(event) {
      event.target.checked ? (this.component = event.target.id) : "";
    },
    showComponent() {
      this.show = true;
    },
    clearNum(val, n) {
      this.$emit("clearNum", val, n);
    },
    getNum(count) {
      if (this.info.workMsg < count) {
        this.$emit("getNum");
      }
    },
    // new 通知中心
    showItem(index) {
      this.note_index = this.note_index == index ? -1 : index;
    },
    change_filter_item(key, val) {
      this[key] = val;
    }
  },
  watch: {
    info: {
      handler(newValue) {
        if (newValue.workMsg > 99) {
          this.workMore = "99+";
        } else {
          this.workMore = "";
        }
        if (newValue.systemMsg > 99) {
          this.systemMore = "99+";
        } else {
          this.systemMore = "";
        }
      }
    },
    show: {
      handler(newValue) {
        if (newValue == false) {
          this.note_index = -1;
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
  height: auto;
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
    height: 100%;
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
</style>
