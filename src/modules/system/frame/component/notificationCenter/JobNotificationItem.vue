<template>
  <div class="job-notification-item">
    <span class="job-notification-item-new" v-if="info.readed == 0"></span>
    <div class="job-notification-item-header">{{info.body.title}}</div>
    <button type="button" @click="deleteItem(info)" class="job-notification-item-btn">
      <i class="iconfont icon-fe-close"></i>
    </button>
    <div class="job-notification-item-info" name="header">{{info.body.content}}</div>
    <div class="job-notification-item-content" v-if="info.body.forms">
      <p 
        v-for="(item, index) in info.body.forms"
        :key="index">{{Object.keys(item)[0]}}：{{Object.values(item)[0]}}</p>
    </div>
    <div class="job-notification-item-footer">
      <button class="job-notification-item-detail" @click="toJobNotificationDetails(info)">查看详情</button>
      <p class="job-notification-item-time">{{info.createTime}}</p>
    </div>
  </div>
</template>

<script>
import * as NotificationApi from '@src/api/NotificationApi';

export default {
  name: 'job-notification-item',
  props: {
    info: Object,
  },
  data () {
    return {

    }
  },
  created () {

  },
  methods: {
    async deleteItem (info) {
      try {
        let params = {
          type: 'work',
          primaryId: info.primaryId
        }
        await NotificationApi.deleteNotification(params);
        this.$emit('getInfo');
      } catch (error) {
        console.error(error)
      }
    },
    async toJobNotificationDetails (info) {
      try {
        let params = {
          type: 'work',
          primaryId: info.primaryId
        }
        // TODO: 工作通知查看详情跳转
        await NotificationApi.haveRead(params);
        this.$emit('getInfo');
      } catch (error) {
        console.error(error);
      }
    }
  }
}
</script>

<style lang="scss">
.job-notification-item {
  position: relative;
  margin: 10px;
  padding: 25px;
  background: #fff;
}
.job-notification-item-new {
  position: absolute;
  top: 32px;
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
  font-size: 16px;
  font-weight: bold;
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
  color: #8C8989;
  padding-top: 5px;
}
.job-notification-item-content {
  padding: 20px 0 10px 0;
  color: #3E3E3E;
  border-bottom: 1px solid #c4c4c4;
  p {
    margin-bottom: 5px;
  }
}
.job-notification-item-footer {
  padding-top: 15px;
}
.job-notification-item-detail {
  display: inline-block;
  margin: 0;
  padding: 0;
  outline: none;
  width: 82px;
  height: 28px;
  line-height: 28px;
  border: 1px solid;
  border-radius: 4px;
  text-align: center;
  color: #55B7B4;
}
.job-notification-item-time {
  float: right;
  line-height: 28px;
  color: #3E3E3E;
}
</style>