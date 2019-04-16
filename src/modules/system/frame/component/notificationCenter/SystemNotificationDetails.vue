<template>
  <div class="system-notifications">
    <div class="system-notification-details">
      <button type="button" class="system-notification-details-return" @click="close">
        <i class="iconfont">&#xe61e;</i>
      </button>
      <button type="button" @click="close" class="system-notification-details-btn">
        <i class="iconfont icon-fe-close"></i>
      </button>
      <div class="system-notification-details-header">{{ info.title }}</div>
      <p class="system-notification-details-content">{{ info.createTime | fmt_datetime }}</p>
      <img class="system-notification-details-img" :src="info.img">
      <p class="system-notification-details-info">{{info.content}}</p> 
    </div>
  </div>
  
</template>

<script>
export default {
  name: 'system-notification-details',
  props: {
    info: Object,
  },
  data () {
    return {}
  },
  methods: {
    close () {
      this.$emit('returnUrl');
    },
  }
}
</script>

<style lang="scss">
.system-notifications {
  flex: 1;
  overflow: auto;
}
.system-notification-details {
  margin: 10px;
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
  color: #979797;
  i {
    font-size: 16px;
  }

  &:hover{
    color: #55B7B4;
  }
}
.system-notification-details-header {
  height: 35px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  line-height: 40px;
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: bold;
}
.system-notification-details-content {
  color: #8C8989;
  font-size: 12px;
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
  color: #979797;
  i {
    font-size: 14px;
  }

  &:hover{
    color: #e84040;
  }
}
.system-notification-details-info {
  word-break: break-all;
  line-height: 24px;
}
.system-notification-details-time {
  margin: 0;
  color: #999;
}
</style>