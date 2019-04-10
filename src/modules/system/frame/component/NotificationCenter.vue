<template>
  <base-panel
    :show.sync="show"
    width="420px"
    class="notification-center">
    <div class="notification-center-header" slot="header">
      <button type="button" class="btn-text notification-center-btn" @click="show = false">
        <i class="iconfont icon-Takeup"></i>
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
        <div class="notification-center-tab-new">
          <span class="notification-center-tab-number">31</span>
        </div>
      </label>
      <input class="notification-center-tab" type="radio" id="system-notification" :checked="component == 'system-notification'" @change="notificationChange" />
      <label class="notification-center-tab-text" for="system-notification">系统通知
        <div class="notification-center-tab-new">
          <span class="notification-center-tab-number">3</span>
        </div>
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
  position: absolute;
  top: 50px;
  background: #eee;
}
.notification-center-header {
  height: 72px;
  background: #55B7B4;
  text-align: center;
  padding: 22px 32px 22px 16px;
  font-size: 20px;
}
.notification-center-btn {
  float: left;
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
  height: 70px;
  padding: 0 10px;
  font-size: 16px;
  color: #969696;
  background: #fff;
}
.notification-center-tab {
  display: none;
  &:checked + label{
    color: #000;
    border-bottom: 2px solid #55B7b4;
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
    border-bottom: 2px solid #55B7b4;
  }
}
.notification-center-tab-new {
  display: inline-block;
  width: 20px;
  height: 15px;
  background: #CB0C0C;
  border-radius: 12px;
}
.notification-center-tab-number {
  position: relative;
  top: -5px;
  font-size: 8px;
  color: #fff;
}
.icon-Takeup {
  color: #fff;
  font-size: 20px;
}
.icon-notification {
  margin-right: 5px;
  font-size: 20px;
}
.icon-fenzu {
  color: #fff;
  font-size: 20px;
}
.notification-center-close {
  float: right;
}
</style>
