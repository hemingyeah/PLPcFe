<template>
  <div class="job-notification-item">
    <div class="job-notification-item-header">
      <span class="job-notification-item-new" v-if="info.readed == 0"></span>
      <span>{{info.body.title}}</span>
    </div>
    <button type="button" @click="deleteItem(info)" class="job-notification-item-btn">
      <i class="iconfont icon-fe-close"></i>
    </button>
    <div class="job-notification-item-info" name="header">{{info.body.content}}</div>
    <div class="job-notification-item-content" v-if="info.body.forms">
      <p 
        v-for="(item, index) in info.body.forms"
        :key="index">{{item.key}} {{item.value}}</p>
    </div>
    <div class="job-notification-item-footer">
      <button class="job-notification-item-detail" @click="toJobNotificationDetails(info)" v-show="info.pcUrl">查看详情</button>
      <p class="job-notification-item-time">{{ info.createTime | fmt_datetime }}</p>
    </div>
  </div>
</template>

<script>
import * as NotificationApi from '@src/api/NotificationApi';
import platform from '@src/platform';

export default {
  name: 'job-notification-item',
  props: {
    info: Object,
    index: Number
  },
  created () {
    console.log(this.info);
  },
  methods: {
    /** 删除通知 */
    async deleteItem (info) {
      try {
        let params = {
          type: 'work',
          id: info.id
        }
        if(await platform.confirm('确定要删除该信息吗？')) {
          let result = await NotificationApi.deleteNotification(params);
          if(result.status == 0) {
            this.$emit('deleteItem', info, this.index)
          }
        }
      } catch (error) {
        console.error(error)
      }
    },

    /** 打开工作通知详情页 */
    async toJobNotificationDetails (info) {
      try {
        let itemId = this.getId(info);
        this.$platform.openTab({
          id: itemId,
          title: '正在查询',
          close: true,
          url: info.pcUrl,
        });
        if(info.readed == 0) {
          let params = {
            type: 'work',
            id: info.id
          }
          let result = await NotificationApi.haveRead(params);
          if(result.status == 0) {
            info.readed = 1;
            this.$emit('clearNum', 'work', 1);
          }
        }
      } catch (error) {
        console.error(error);
      }
    },
    getId (info) {
      if(info.pcUrl.indexOf('/task/view/') != -1) return `taskView_${info.primaryId}`;
      if(info.pcUrl.indexOf('/partV2/repertory/record') != -1) return 'M_VIP_SPAREPART_RECORD';
      if(info.pcUrl.indexOf('/event/view/') != -1) return 'M_SERVICE_PROJECT';
      return 'PcUrl';
    }
  }
}
</script>

<style lang="scss">
.job-notification-item {
  margin: 10px;
  padding: 25px;
  background: #fff;
}
.job-notification-item-new {
  position: absolute;
  top: 8px;
  left: -12px;
  width: 9px;
  height: 9px;
  background: #f44552;
  border: 1px solid #fff;
  border-radius: 50%;
}
.job-notification-item-header {
  position: relative;
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
  height: 43px;
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
  margin: 0;
}
</style>