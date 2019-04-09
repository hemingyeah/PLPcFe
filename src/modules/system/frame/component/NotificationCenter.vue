<template>
  <base-panel
    :show.sync="show"
    class="notification-center">
    <div class="notification-center-header" slot="header">
      <button type="button" class="btn-text notification-center-btn" @click="show = false">
        <i class="iconfont icon-open"></i>
      </button>
      <p class="notification-center-title">通知中心</p>
    </div>

    <div class="notification-center-type">
      <input class="notification-center-tab" type="radio" id="job-notification" :checked="component == 'job-notification'" @change="notificationChange" />
      <label class="notification-center-tab-text" for="job-notification">工作通知
        <span class="notification-center-tab-new"></span>
      </label>
      <input class="notification-center-tab" type="radio" id="system-notification" :checked="component == 'system-notification'" @change="notificationChange" />
      <label class="notification-center-tab-text" for="system-notification">系统通知
        <span class="notification-center-tab-new"></span>
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
  background: #eee;
}
.notification-center-header {
  text-align: center;
  padding: 30px 10px 10px 10px;
}
.notification-center-btn {
  float: left;
}
.notification-center-title {
  display: inline-block;
  padding: 5px 0;
}
.notification-center-type {
  text-align: center;
  list-style: none;
}
.notification-center-tab {
  display: none;
  &:checked + label{
    background: #55B7B4;
    color: #fff;
  }
}
.notification-center-tab-text {
  position: relative;
  padding: 5px 10px;
  margin: 0;
  border-radius: 4px;
  background: #fff;
  &:hover {
    background: #55B7B4;
    color: #fff;
  }
}
.notification-center-tab-new {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 5px;
  height: 5px;
  background: #f44552;
  border-radius: 50%;
}
</style>
