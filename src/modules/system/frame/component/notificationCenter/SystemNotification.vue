/* eslint-disable vue/html-indent */
<template>
  <div class="system-notification-main">
    <div class="system-notification" v-if="detailShow">
      <div class="system-notification-header">
        <div class="system-notification-readed">
          <button class="system-notification-readed-btn" :style="btnStyle" @click="setReaded"></button>
          <span class="system-notification-readed-text">全部标记为已读</span>
        </div>
        <el-select class="system-notification-select-left" :value="systemOption" placeholder="消息来源" @input="getSource">
          <el-option
            v-for="(item, index) in systemOptions"
            :key="index"
            :label="item.label"
            :value="item.value"></el-option>
        </el-select>
        <el-select class="system-notification-select-right" :value="dataOption" placeholder="日期" @input="getTime">
          <el-option
            v-for="(item, index) in dataOptions"
            :key="index"
            :label="item.label"
            :value="item.value"></el-option>
        </el-select>  
      </div>
      <div class="system-notification-content">
        <div class="system-notification-item" 
             v-for="(item, index) in info"
             :key="index">
          <div class="system-notification-item-header">
            <span class="system-notification-item-new" v-if="info.readed == 0"></span>
            <span>{{ item.title }}</span>
            <button type="button" @click="deleteItem(item)" class="system-notification-item-btn">
              <i class="iconfont icon-fe-close"></i>
            </button>
          </div>
          <img class="system-notification-item-img" :src="item.img">
          <p class="system-notification-item-info">{{ item.content }}</p> 
          <div class="system-notification-item-footer">
            <button class="system-notification-item-detail" @click="toSystemNotificationDetail(item)">查看详情</button>
            <p class="system-notification-item-time">{{item.createTime}}</p>
          </div>
        </div>
        <div class="system-notification-footer">
          <button class="system-notification-footer-more" @click="getMore" v-if="moreShow">加载更多</button>
          <div v-else>没有更多信息了</div>
        </div>
      </div>
    </div>
    <system-notification-details
      v-else
      @returnUrl="detailShow = true"
      :info="detailInfo">123</system-notification-details>
  </div>
</template>

<script>
import * as Lang from '../../../../../util/lang/index.js';
import * as NotificationApi from '@src/api/NotificationApi';
import SystemNotificationDetails from '../notificationCenter/SystemNotificationDetails'

export default {
  name: 'system-notification',
  components: {
    [SystemNotificationDetails.name]: SystemNotificationDetails
  },
  data () {
    return {
      detailShow: true,
      moreShow: '',
      detailInfo: {},
      info: {},
      btnShow: false,
      btnStyle: {
        'border': '5px solid #eaeaea'
      },
      params: {
        pageSize: 20,
        pageNum: 1
      },
      title: '售后宝双十一活动大促销',
      readedOption: false,
      readedOptions: [{
        value: null,
        label: '全部'
      }, {
        value: false,
        label: '未读'
      }, {
        value: true,
        label: '已读'
      }],
      systemOption: '',
      systemOptions: [{
        value: null,
        label: '全部'
      }, {
        value: 'update',
        label: '更新通知'
      }, {
        value: 'activity',
        label: '活动通知'
      }, {
        value: 'maintenance',
        label: '维护通知'
      }],
      dataOption: '',
      dataOptions: [{
        value: null,
        label: '全部'
      }, {
        value: 1,
        label: '今日'
      }, {
        value: 2,
        label: '昨日'
      }, {
        value: 7,
        label: '近七天'
      }, {
        value: 30,
        label: '近30天'
      }, {
        value: 100,
        label: '30天以前'
      }, ]
    }
  },
  async created () {
    // TODO:给已读未读字段赋值
    this.info = await NotificationApi.getSystemList(this.params);
    this.info = [{
      title: this.title,
      content: '一直知道html5 input有个新类型range，可以有个滑动条的效果，但是感觉丑不拉几的，又不知道如何美化，所以一直没用过。最近在网上瞅了瞅，发现滑动条还是可以美化的，所以掏出来给大家摆摆~~',
      img: 'http://pic29.nipic.com/20130601/12122227_123051482000_2.jpg'
    }]
  },
  methods: {
    async getInfo () {
      try {
        await NotificationApi.getSystemList(this.params);
      } catch (error) {
        console.error(error);
      }
    },
    async deleteItem (info) {
      try {
        let params = {
          type: 'system',
          primaryId: info.primaryId
        }
        await NotificationApi.deleteNotification(params);
        this.getInfo();
      } catch (error) {
        console.error(error);
      }
    },
    async toSystemNotificationDetail (info) {
      try {
        let params = {
          type: 'system',
          primaryId: info.primaryId
        }
        this.detailInfo = info;
        await NotificationApi.haveRead(params);
        this.detailShow = false;
        this.getInfo();
      } catch (error) {
        console.error(error);
      }
    },
    getReaded (value) {
      this.readedOption = value;
      // TODO:给已读未读字段赋值
      this.getInfo();
    },
    getSource (value) {
      this.systemOption = value;
      this.params.source = value;
      this.getInfo();
    },
    getTime (value) {
      this.dataOption = value;

      let startTime = '';
      let endTime = '';

      if(value != 100 && value != null && value != 1) {
        endTime = `${Lang.formatDate(new Date()).split(' ')[0] } 23:59:59`;
      } else if (value == 1) {
        endTime = `${Lang.formatDate(new Date() - (1 * 24 * 60 * 60 * 1000)).split(' ')[0] } 23:59:59`;
      } else {
        endTime = `${Lang.formatDate(new Date() - (30 * 24 * 60 * 60 * 1000)).split(' ')[0] } 23:59:59`;
      }

      if(value == 0) {
        startTime = `${Lang.formatDate(new Date()).split(' ')[0] } 00:00:00`;
      } else if (value == 1) {
        startTime = `${Lang.formatDate(new Date() - (1 * 24 * 60 * 60 * 1000)).split(' ')[0] } 00:00:00`;
      } else if (value == 7) {
        startTime = `${Lang.formatDate(new Date() - (6 * 24 * 60 * 60 * 1000)).split(' ')[0] } 00:00:00`;
      } else if (value == 30) {
        startTime = `${Lang.formatDate(new Date() - (29 * 24 * 60 * 60 * 1000)).split(' ')[0] } 00:00:00`;
      } else if (value == 100) {
        startTime = '1900-01-01 00:00:00';
      }

      this.params.startTime = startTime;
      this.params.endTime = endTime;
      this.getInfo();
    },
    async setReaded () {
      try {
        let param = {};
        param.type = 'system';

        this.btnShow = !this.btnShow;
        if(this.btnShow) {
          await NotificationApi.haveRead(param);
          this.getInfo();
          this.btnStyle = {
            'border': '5px solid #55B7B4'
          }
        } else {
          this.btnStyle = {
            'border': '5px solid #eaeaea'
          }
        }
      } catch (error) {
        console.error(error);
      }
    },
    getMore () {

    }
  }
}
</script>

<style lang="scss">
.system-notification-main {
  flex: 1;
  display: flex;
  flex-flow: column;
}
.system-notification {
  display: flex;
  flex-flow: column;
}
.system-notification-header {
  text-align: right;
  padding: 20px;
  background: #fff;
  height: 70px;
  font-size: 0;
}
.system-notification-select-readed {
  display: inline-block;
  width: 80px;
  margin-right: 5px;
  input {
    color: #525252 !important;
    background: #EAEAEA;
    border: 0;
    border-radius: 4px;
  }
  input::-webkit-input-placeholder, textarea::-webkit-input-placeholder {
      /* WebKit browsers */
    color: #525252;
  }
  input:-moz-placeholder, textarea:-moz-placeholder {
    /* Mozilla Firefox 4 to 18 */
    color: #525252;
  }
  input::-moz-placeholder, textarea::-moz-placeholder {
    /* Mozilla Firefox 19+ */
    color: #525252;
  }
  input:-ms-input-placeholder, textarea:-ms-input-placeholder {
    /* Internet Explorer 10+ */
    color: #525252;
  }
}
.system-notification-select-left {
  display: inline-block;
  width: 100px;
  border-right: 1px solid #fff;
  input {
    color: #525252 !important;
    background: #EAEAEA;
    border: 0;
    border-radius: 4px 0 0 4px;
  }
  input::-webkit-input-placeholder, textarea::-webkit-input-placeholder {
      /* WebKit browsers */
    color: #525252;
  }
  input:-moz-placeholder, textarea:-moz-placeholder {
    /* Mozilla Firefox 4 to 18 */
    color: #525252;
  }
  input::-moz-placeholder, textarea::-moz-placeholder {
    /* Mozilla Firefox 19+ */
    color: #525252;
  }
  input:-ms-input-placeholder, textarea:-ms-input-placeholder {
    /* Internet Explorer 10+ */
    color: #525252;
  }
}
.system-notification-select-right {
  display: inline-block;
  width: 100px;
  input {
    color: #525252 !important;
    background: #EAEAEA;
    border: 0;
    color: #ccc;
    border-radius: 0 4px 4px 0;
  }
  input::-webkit-input-placeholder, textarea::-webkit-input-placeholder {
      /* WebKit browsers */
    color: #525252;
  }
  input:-moz-placeholder, textarea:-moz-placeholder {
    /* Mozilla Firefox 4 to 18 */
    color: #525252;
  }
  input::-moz-placeholder, textarea::-moz-placeholder {
    /* Mozilla Firefox 19+ */
    color: #525252;
  }
  input:-ms-input-placeholder, textarea:-ms-input-placeholder {
    /* Internet Explorer 10+ */
    color: #525252;
  }
}
.system-notification-item {
  position: relative;
  margin: 10px;
  padding: 20px 28px;
  background: #fff;
}
.system-notification-item-new {
  position: absolute;
  top: 28px;
  left: 15px;
  width: 9px;
  height: 9px;
  background: #f44552;
  border: 1px solid #fff;
  border-radius: 50%;
}
.system-notification-item-header {
  display: inline-block;
  width: 320px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  height: 24px;
  line-height: 24px;
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: bold;
}
.system-notification-item-img {
  width: 100%;
  margin-bottom: 10px;
}
.system-notification-item-btn {
  position: absolute;
  right: 25px;
  width: 24px;
  height: 24px;
  line-height: 24px;
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
.system-notification-item-info {
  color: #3E3E3E;
  word-break: break-all;
  line-height: 24px;
}
.system-notification-item-detail {
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
.system-notification-item-time {
  float: right;
  line-height: 28px;
  color: #3E3E3E;
}
.system-notification-readed {
  display: inline-block;
}
.system-notification-readed-btn {
  position: relative;
  bottom: 2px;
  margin: 0;
  padding: 0;
  outline: none;
  width: 15px;
  height: 15px;
  background: #fff;
  border-radius: 50%
}
.system-notification-readed-text {
  font-size: 13px;
  padding: 0 5px;
  color: #525252;
}
.system-notification-content {
  flex: 1;
  overflow: auto;
}
.system-notification-footer {
  text-align: center;
  height: 40px;
  line-height: 30px;
  color: #8C8989;
}
.system-notification-footer-more {
  margin: 0;
  padding: 0;
  outline: none;
  border: none;
  background: none;
  color: #8C8989;
  &:hover {
    color: #55B7B4;
  }
}
.system-notification-detail {
  flex: 1;
  overflow: auto;
}
</style>