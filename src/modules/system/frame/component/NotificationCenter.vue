<template>
  <base-panel
    :show.sync="show"
    width="468px"
    class="notification-center">
    <div class="notification-center-header" slot="header">
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
    </keep-alive>
  </base-panel>
</template>

<script>
import JobNotification from './notificationCenter/JobNotification'
import SystemNotification from './notificationCenter/SystemNotification'

export default {
  name: 'notification-center',
  components: {
    [JobNotification.name]: JobNotification,
    [SystemNotification.name]: SystemNotification,
  },
  props: {
    info: Object
  },
  data(){
    return {
      component: 'job-notification',
      show: false,
      workMore: '',
      systemMore: '',
    }
  },
  methods: {
    notificationChange (event) {
      event.target.checked ? this.component = event.target.id : '';
    },
    showComponent () {
      this.show = true;
    },
    clearNum (val, n) {
      this.$emit('clearNum', val, n);
    },
    getNum (count) {
      if(this.info.workMsg < count) {
        this.$emit('getNum');
      }
    }
  },
  watch: {
    info: {
      handler(newValue) {
        if(newValue.workMsg > 99) {
          this.workMore = '99+';
        } else {
          this.workMore = '';
        }
        if(newValue.systemMsg > 99) {
          this.systemMore = '99+';
        } else {
          this.systemMore = '';
        }
      }
    }
  }
}
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
  background: #55B7B4;
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
  &:checked + label{
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
      background: #CB0C0C;
      border-radius: 12px;
      opacity: 1;
    }
  }
}
.notification-center-tab-left {
  &:checked + label{
    div:nth-child(3) {
      position: absolute;
      top: 62px;
      left: 330px;
      height: 5px;
      width: 28px;
      z-index: 99;
      border-radius: 5px;
      background: #55B7b4;
      transition: all .3s cubic-bezier(.645,.045,.355,1);
      transform: translateX(-233px);
    }
  }
}
.notification-center-tab-right {
  &:checked + label{
    div:nth-child(3) {
      position: absolute;
      top: 62px;
      left: -137px;
      height: 5px;
      width: 28px;
      z-index: 99;
      border-radius: 5px;
      background: #55B7b4;
      transition: all .3s cubic-bezier(.645,.045,.355,1);
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
</style>
