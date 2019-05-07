<template>
  <div class="job-notification-item" 
       @click="toJobNotificationDetails(info)">
    <div class="job-notification-item-header">
      <span class="job-notification-item-new" v-if="info.readed == 0"></span>
      <span>{{info.body.title}}</span>
    </div>
    <div class="job-notification-item-info" name="header" v-if="info.body.content">{{info.body.content}}</div>
    <div class="job-notification-item-content" v-if="info.body.forms">
      <p 
        v-for="(item, index) in info.body.forms"
        :key="index">{{item.key}} {{item.value}}</p>
    </div>
    <div class="job-notification-item-footer">
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
        if(info.pcUrl) {
          if(info.source != 'daily') {
            let itemId = this.getId(info);
            this.$platform.openTab({
              id: itemId,
              title: '正在查询',
              close: true,
              url: info.pcUrl,
            });
          } else {
            info.pcUrl = `${ info.pcUrl }&DingTalkFlag=false`;
            this.$emit('toDaily', info.pcUrl);
          }
        }
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
  padding: 14px 24px;
  background: #fff;
  cursor: pointer;
}
.job-notification-item-new {
  position: absolute;
  top: 11px;
  left: -10px;
  width: 9px;
  height: 9px;
  background: #f44552;
  border: 1px solid #fff;
  border-radius: 50%;
}
.job-notification-item-header {
  position: relative;
  display: inline-block;
  font-size: 16px;
  padding-top: 5px;
  font-weight: bold;
  color: #525252;
  padding-left: 4px;
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
  padding: 4px;
}
.job-notification-item-content {
  padding: 10px 0 14px 4px;
  color: #3E3E3E;
  border-bottom: 1px solid #EAE8E8;
  p {
    margin-bottom: 5px;
  }
}
.job-notification-item-footer {
  padding: 14px 0 0 4px;
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
  color: #3E3E3E;
  margin: 0;
}
</style>