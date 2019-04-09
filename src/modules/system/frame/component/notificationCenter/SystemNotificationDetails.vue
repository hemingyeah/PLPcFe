<template>
  <div>
    <div class="system-notification-details">
      <button type="button" class="system-notification-details-return" @click="returnUrl">
        <i class="iconfont">&#xe61e;</i>
      </button>
      <button type="button" @click="close" class="system-notification-details-btn">
        <i class="iconfont icon-fe-close"></i>
      </button>
      <div class="system-notification-details-header">{{title}}</div>
      <img class="system-notification-details-img" src="http://pic29.nipic.com/20130601/12122227_123051482000_2.jpg">
      <p class="system-notification-details-info">Lorem ipsum dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p> 
      <p class="system-notification-details-time">2018-10-18 13:59:04</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'system-notification-details',
  data () {
    return {
      title: '售后宝双十一活动大促开始'
    }
  },
  methods: {
    close () {

    },
    returnUrl () {

    }
  }
}
</script>

<style lang="scss">
.system-notification-details {
  position: relative;
  margin-top: 20px;
  padding: 10px 20px;
  background: #fff;
  font-size: 12px;
}
.system-notification-details-return {
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
    color: #55B7B4;
  }
}
.system-notification-details-header {
  height: 24px;
  line-height: 24px;
  margin-bottom: 10px;
  font-size: 14px;
  text-align: center;
}
.system-notification-details-img {
  width: 100%;
  margin-bottom: 10px;
}
.system-notification-details-btn {
  float: right;
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
.system-notification-details-info {
  line-height: 24px;
}
.system-notification-details-time {
  margin: 0;
  color: #999;
}
</style>