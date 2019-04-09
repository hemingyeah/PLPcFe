<template>
  <div class="job-notification-item">
    <span class="job-notification-item-new"></span>
    <div class="job-notification-item-header">{{title}}</div>
    <button type="button" @click="close" class="job-notification-item-btn">
      <i class="iconfont icon-fe-close"></i>
    </button>
    <slot class="job-notification-item-info" name="header"></slot>
    <div class="job-notification-item-content">
      <slot></slot>
    </div>
    <div class="job-notification-item-footer">
      <a href="#" class="job-notification-item-detail">查看详情</a>
      <p class="job-notification-item-time">{{time}}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'job-notification-item',
  props: {
    title: String,
    time: String
  },
  data () {
    return {

    }
  },
  methods: {
    close () {

    }
  }
}
</script>

<style lang="scss">
.job-notification-item {
  position: relative;
  margin-top: 20px;
  padding: 10px 20px 10px 30px;
  background: #fff;
  font-size: 12px;
  box-shadow: 6px 7px 7px #999;
}
.job-notification-item-new {
  position: absolute;
  top: 17px;
  left: 15px;
  width: 9px;
  height: 9px;
  background: #f44552;
  border: 1px solid #fff;
  border-radius: 50%;
}
.job-notification-item-header {
  display: inline-block;
  height: 24px;
  line-height: 24px;
  margin-bottom: 10px;
  font-size: 14px;
}
.job-notification-item-btn {
  float: right;
  line-height: 24px;
  width: 30px;
  height: 30px;
  padding: 0;
  margin: 0;
  border: none;
  outline: none;
  background-color: transparent;
  transition: color ease .15s;

  i {
    font-size: 14px;
  }

  &:hover{
    color: #e84040;
  }
}
.job-notification-item-info {
  font-size: 13px;
}
.job-notification-item-detail {
  display: block;
  margin-bottom: 5px;
  color: #55B7B4;
}
.job-notification-item-time {
  margin: 0;
  color: #999;
}
</style>