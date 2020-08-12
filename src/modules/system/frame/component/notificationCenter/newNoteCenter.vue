<template>
  <div class="job-notification">
    <!-- <div class="job-notification-header">
      <div class="job-notification-readed" @click="setReaded">
        <button class="job-notification-readed-btn" :style="btnStyle"></button>
        <span class="job-notification-readed-text">全部标记为已读</span>
      </div>
    </div>-->
    <div class="job-notification-content" v-show="!dailyShow">
      <div v-if="notificationPage.list.length != 0">
        <div v-for="(item, index) in notificationPage.list" :key="index">
          <job-notification-item
            v-if="params.source!=='system'"
            :info="item"
            :index="index"
            @getInfo="getInfo"
            @clearNum="clearNum"
            @toDaily="toDaily"
          ></job-notification-item>
          <div
            v-if="params.source==='system'"
            class="system-notification-item"
            @click="toSystemNotificationDetail(item)"
          >
            <div class="system-notification-item-header">
              <span class="system-notification-item-new" v-if="item.readed == 0"></span>
              <img class="system-notification-item-img" v-if="item.img" :src="item.img" />
            </div>
            <span class="system-notification-item-title">{{ item.title }}</span>
            <p class="system-notification-item-info">{{ item.content }}</p>
            <div class="system-notification-item-footer">
              <p class="system-notification-item-time">{{ item.createTime | fmt_datetime }}</p>
            </div>
          </div>
        </div>

        <div class="job-notification-footer">
          <button
            class="job-notification-footer-more"
            @click="getMore"
            v-if="moreShow && !loading"
          >加载更多</button>
          <div v-if="loading">正在加载...</div>
          <div class="flex-x" v-if="!moreShow && !loading">
            <span class="job-notification-footer-line"></span>
            <span class="job-notification-footer-text">没有更多数据</span>
            <span class="job-notification-footer-line"></span>
          </div>
        </div>
      </div>
      <!-- <div
        class="job-notification-footer"
        v-else-if="notificationPage.list.length == 0 && !loading"
      >暂时没有信息</div>-->
      <no-data-view-new
        v-else-if="notificationPage.list.length == 0 && !loading"
        :notice-msg="'暂无消息'"
      ></no-data-view-new>
      <div class="job-notification-footer" v-else>正在加载...</div>
    </div>
    <div class="job-notification-daily" v-show="dailyShow">
      <iframe :src="dailyUrl" class="job-notification-daily-iframe" v-if="dailyShow" @load="onload"></iframe>
      <button
        type="button"
        class="job-notification-details-return"
        @click="close"
        v-if="returnShow"
      >
        <i class="iconfont">&#xe61e;</i>
      </button>
    </div>
  </div>
</template>

<script>
import JobNotificationItem from "./JobNotificationItem.vue";
import * as NotificationApi from "@src/api/NotificationApi";
import * as Lang from "@src/util/lang/index.js";
import Page from "@model/Page";
import platform from "@src/platform";
import NoDataViewNew from "@src/component/common/NoDataViewNew";

export default {
  name: "new-note-center",
  components: {
    [JobNotificationItem.name]: JobNotificationItem,
    [NoDataViewNew.name]: NoDataViewNew
  },
  props: {
    // info: Object
  },
  data() {
    return {
      returnShow: false,
      dailyShow: false,
      loading: false,
      btnShow: false,
      params: {
        pageSize: 20,
        pageNum: 1
      },
      notificationPage: new Page()
    };
  },
  methods: {
    changeParams(e) {
      this.params = { ...this.params, ...e };
      this.getInfo(true);
    },
    clearAllRead() {
      if (this.notificationPage.list && this.notificationPage.list.length > 0) {
        this.notificationPage.list.forEach(item => {
          item.readed = 1;
        });
      }
    },
    /** 获取信息，刷新列表 */
    async getInfo(falsh = false) {
      try {
        if (falsh) {
          this.notificationPage.list = [];
          this.params.pageNum = 1;
          this.dailyShow = false;
        }
        this.loading = true;

        let notificationPage = await NotificationApi.newGetMessageQuery({
          ...this.params
        });
        if (notificationPage.status == 0) {
          this.notificationPage.list = [
            ...this.notificationPage.list,
            ...notificationPage.data.dataList
          ];
          if (
            this.notificationPage.list.length < notificationPage.data.totalCount
          ) {
            this.params.pageNum++;
            this.notificationPage.hasNextPage = true;
          } else {
            this.notificationPage.hasNextPage = false;
          }
        }
        this.loading = false;
      } catch (error) {
        console.error(error);
      }
    },

    /** 分页处理 */
    async getMore() {
      try {
        this.getInfo();
      } catch (error) {
        console.error(error);
      }
    },
    clearNum(e) {
      this.$emit("clearNum", e);
    },
    // haveNotRead() {
    //   let res = false;
    //   if (!this.notificationPage.list || this.notificationPage.list.length <= 0)
    //     return res;
    //   for (let index = 0; index < this.notificationPage.list.length; index++) {
    //     if (this.notificationPage.list[index].readed == 0) {
    //       res = true;
    //       break;
    //     }
    //   }
    //   return res;
    // },
    toDaily(e) {
      this.dailyUrl = e.url;
      this.dailyShow = true;
    },
    close() {
      this.dailyShow = false;
      this.returnShow = false;
    },
    onload() {
      this.returnShow = true;
    },
    /** 打开系统通知详情页 */
    async toSystemNotificationDetail(info = {}) {
      try {
        this.systemNotificationOpen(info);
      } catch (error) {
        console.error(error);
      }
    },
    systemNotificationOpen(info = {}) {
      // 系统通知点击跳转网页内页面 feat:2612 by bodz
      // 判断是否是内部域名
      let url = info.url || "";
      let urlReg = /shb.ltd/;

      if (urlReg.test(url)) {
        info.url = info.url
          .split("/")
          .slice(3)
          .join("/");
        platform.openTab(info);
      } else {
        platform.openLink(info.url);
      }
      this.$emit("clearNum", { count: 1, needHide: true, readed: info.readed });
      info.readed = 1;
    }
  },
  computed: {
    /** ture：显示加载更多按钮
     *  false：不显示
     */
    moreShow() {
      return this.notificationPage.hasNextPage;
    }
    // change() {
    //   return this.info.workMsg;
    // }
  },
  watch: {
    // info: {
    //   deep: true,
    //   handler(newValue) {
    //     if (newValue.source !== "none") {
    //       console.log(newValue, "newValue");
    //       this.dailyShow = false;
    //     }
    //   }
    // }
    // change(newValue, oldValue) {
    //   if (newValue > oldValue) {
    //     this.getInfo();
    //   }
    // }
  }
};
</script>

<style lang="scss" scoped>
.job-notification {
  display: flex;
  flex-flow: column;
  height: 100%;
}
.job-notification-header {
  position: relative;
  z-index: 99;

  background: #fff;
  box-shadow: 0 3px 5px #e5e5e5;
  font-size: 0;
  text-align: right;

  padding: 20px;
  height: 70px;

  display: flex;
  justify-content: space-around;
  align-items: center;

  .notification-header-select-view {
    flex: 1;
  }
}
.job-notification-select {
  display: inline-block;
  input {
    color: #525252 !important;
    background: #eaeaea;
    border: 0;
  }
  input::-webkit-input-placeholder,
  textarea::-webkit-input-placeholder {
    /* WebKit browsers */
    color: #525252;
  }
  input:-moz-placeholder,
  textarea:-moz-placeholder {
    /* Mozilla Firefox 4 to 18 */
    color: #525252;
  }
  input::-moz-placeholder,
  textarea::-moz-placeholder {
    /* Mozilla Firefox 19+ */
    color: #525252;
  }
  input:-ms-input-placeholder,
  textarea:-ms-input-placeholder {
    /* Internet Explorer 10+ */
    color: #525252;
  }
}
.job-notification-select-readed {
  width: 80px;
  margin-right: 10px;
  input {
    border-radius: 4px;
  }
}
.job-notification-select-left {
  width: 92px;
  input {
    border-radius: 4px 0 0 4px;
  }
}
.job-notification-select-right {
  width: 95px;
  input {
    border-radius: 0 4px 4px 0;
  }
}
.job-notification-content {
  flex: 1;
  overflow: auto;
}
.job-notification-readed {
  display: inline-block;
  padding-right: 10px;
}
.job-notification-readed-btn {
  position: relative;
  bottom: 2px;
  margin: 0;
  padding: 0;
  outline: none;
  width: 15px;
  height: 15px;
  background: #fff;
  border-radius: 50%;
}
.job-notification-readed-text {
  font-size: 13px;
  padding: 0 5px;
  color: #525252;
}
.job-notification-footer {
  text-align: center;
  margin: 10px;
  height: 30px;
  color: #8c8989;
}
.job-notification-footer-more {
  margin: 0;
  padding: 0;
  outline: none;
  border: none;
  background: none;
  color: #8c8989;
  &:hover {
    color: #55b7b4;
  }
}
.job-notification-dividing-line {
  width: 2px;
  height: 15px;
  background: #fff;
  position: absolute;
  right: 113px;
  top: 28px;
  z-index: 100;
}
.job-notification-footer-line {
  position: relative;
  display: inline-block;
  background: #d0d0d0;
  height: 1px;
  // width: 158px;
  flex: 1;
}
.job-notification-footer-text {
  padding: 0 16px;
}
.job-notification-daily {
  flex: 1;
  overflow: auto;
  position: relative;
}
.job-notification-details-return {
  position: absolute;
  top: 5px;
  left: 5px;
  width: 30px;
  height: 30px;
  padding: 0;
  margin: 0;
  border: none;
  outline: none;
  background-color: transparent;
  transition: color ease 0.15s;
  color: #979797;
  i {
    font-size: 18px;
  }

  &:hover {
    color: #55b7b4;
  }
}
.job-notification-daily-iframe {
  display: block;
  width: 100%;
  height: 100%;
}

.system-notification-item-info {
  color: #8c8989;
  word-break: break-all;
  line-height: 24px;
  margin: 0;
}
.system-notification-item {
  position: relative;
  margin: 10px;
  padding: 0 21px;
  background: #fff;
  cursor: pointer;
}
.system-notification-item-new {
  position: absolute;
  top: 25px;
  left: 7px;
  width: 9px;
  height: 9px;
  background: #f44552;
  border: 1px solid #fff;
  border-radius: 50%;
}
.system-notification-item-header {
  display: inline-block;
}
.system-notification-item-title {
  display: inline-block;
  width: 320px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  height: 24px;
  line-height: 24px;
  font-size: 16px;
  font-weight: bold;
  color: #525252;
}
.system-notification-item-img {
  width: 100%;
  padding: 24px 0 14px 0;
}
.system-notification-item-time {
  color: #8c8989;
  margin: 0;
  padding: 4px 0 8px 0;
}
.system-notification-item-footer {
  text-align: right;
}
</style>