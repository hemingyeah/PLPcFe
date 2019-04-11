<template>
  <base-panel
    :show.sync="show"
    width="420px"
    class="notification-center">
    <div class="notification-center-header" slot="header">
      <button type="button" class="btn-text notification-center-btn" @click="show = false">
        <i class="iconfont icon-Takeup notification-close"></i>
      </button>
      <p class="notification-center-title">
        <i class="iconfont icon-notification"></i>通知中心
      </p>
      <button type="button" class="btn-text notification-center-close" @click="show = false">
        <i class="iconfont icon-fenzu"></i>
      </button>
    </div>

    <div class="notification-center-type">
      <input class="notification-center-tab" type="radio" id="job-notification" :checked="component == 'job-notification'" @change="notificationChange" />
      <label class="notification-center-tab-text" for="job-notification">工作通知
        <div class="notification-center-tab-new">31</div>
        <div class="notification-center-checked-border"></div>
      </label>
      <input class="notification-center-tab" type="radio" id="system-notification" :checked="component == 'system-notification'" @change="notificationChange" />
      <label class="notification-center-tab-text" for="system-notification">系统通知
        <div class="notification-center-tab-new">2</div>
        <div class="notification-center-checked-border"></div>
      </label>
    </div>

    <keep-alive>
      <component :is="component" @details="getdetails"></component>
    </keep-alive>
  </base-panel>
</template>

<script>
import JobNotification from './notificationCenter/JobNotification'
import SystemNotification from './notificationCenter/SystemNotification'
import SystemNotificationDetails from './notificationCenter/SystemNotificationDetails'

export default {
  name: 'notification-center',
  components: {
    [JobNotification.name]: JobNotification,
    [SystemNotification.name]: SystemNotification,
    [SystemNotificationDetails.name]: SystemNotificationDetails
  },
  data(){
    return {
      component: 'job-notification',
      show: false,
    }
  },
  methods: {
    notificationChange (event) {
      event.target.checked ? this.component = event.target.id : '';
    },
    showCompont () {
      this.show = true;
    },
    getdetails (val) {
      this.component = val;
    }
  }
}
</script>

<style lang="scss">
.notification-center {
  // position: absolute;
  // top: 50px;
  background: #eee;
}
.notification-center-header {
  position: fixed;
  top: 0;
  right: 0;
  width: 420px;
  z-index: 999;
  height: 50px;
  line-height: 50px;
  background: #55B7B4;
  text-align: center;
  font-size: 16px;
  padding: 0 10px;
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
  position: fixed;
  top: 50px;
  right: 0;
  width: 420px;
  z-index: 999;
  display: flex;
  text-align: center;
  list-style: none;
  height: 65px;
  padding: 0 12px;
  font-size: 16px;
  color: #969696;
  background: #fff;
}
.notification-center-tab {
  display: none;
  &:checked + label{
    color: #000;
    div:nth-child(1) {
      position: absolute;
      top: 20px;
      right: 45px;
      font-size: 13px;
      padding: 0 5px;
      color: #fff;
      background: #CB0C0C;
      border-radius: 12px;
      opacity: 1;
    }
    div:nth-child(2) {
      height: 5px;
      width: 28px;
      margin:10px 85px;
      border-radius: 5px;
      background: #55B7b4;
    }
  }
}
.notification-center-tab-text {
  position: relative;
  padding: 30px 0;
  margin: 0;
  flex: 1;
  background: #fff;
  border-bottom: 1px solid #cbcbcb;
  &:hover {
    color: #000;
    div:nth-child(1) {
      position: absolute;
      top: 20px;
      right: 45px;
      font-size: 13px;
      padding: 0 5px;
      color: #fff;
      background: #CB0C0C;
      border-radius: 12px;
      opacity: 1;
    }
    div:nth-child(2) {
      height: 5px;
      width: 28px;
      margin:10px 85px;
      border-radius: 5px;
      background: #55B7b4;
    }
  }
}
.notification-center-tab-new {
  position: absolute;
  top: 20px;
  right: 45px;
  font-size: 13px;
  padding: 0 5px;
  color: #fff;
  background: #CB0C0C;
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
  font-size: 16px;
}
.icon-notification {
  margin-right: 5px;
  font-size: 16px;
}
.icon-fenzu {
  color: #fff;
  font-size: 16px;
}
.notification-center-close {
  float: right;
  height: 50px;
}
</style>
