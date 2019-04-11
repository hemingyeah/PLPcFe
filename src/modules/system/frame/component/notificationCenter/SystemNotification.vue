/* eslint-disable vue/html-indent */
<template>
  <div class="system-notification">
    <div class="system-notification-header">
      <div class="system-notification-readed">
        <button class="system-notification-readed-btn" :style="btnStyle" @click="setReaded"></button>
        <span class="system-notification-readed-text">将所有信息标记为已读</span>
      </div>
      <el-select class="system-notification-select-left" v-model="jobOption" placeholder="消息来源" @change="(val) => params.source = val">
        <el-option
          v-for="(item, index) in jobOptions"
          :key="index"
          :label="item.label"
          :value="item.value"></el-option>
      </el-select>
      <el-select class="system-notification-select-right" v-model="dataOption" placeholder="日期" @change="getTime">
        <el-option
          v-for="(item, index) in dataOptions"
          :key="index"
          :label="item.label"
          :value="item.value"></el-option>
      </el-select>
    </div>
    <div class="system-notification-content">
      <div class="system-notification-item" @click="systemNotificationDetail">
        <span class="system-notification-item-new"></span>
        <div class="system-notification-item-header">{{title}}</div>
        <button type="button" @click="close" class="system-notification-item-btn">
          <i class="iconfont icon-fe-close"></i>
        </button>
        <img class="system-notification-item-img" src="http://pic29.nipic.com/20130601/12122227_123051482000_2.jpg">
        <p class="system-notification-item-info">Lorem ipsum dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p> 
        <div class="system-notification-item-footer">
          <a href="#" class="system-notification-item-detail">查看详情</a>
          <p class="system-notification-item-time">2018-10-18 13:59:04</p>
        </div>
      </div>
      <div class="system-notification-item" @click="systemNotificationDetail">
        <span class="system-notification-item-new"></span>
        <div class="system-notification-item-header">{{title}}</div>
        <button type="button" @click="close" class="system-notification-item-btn">
          <i class="iconfont icon-fe-close"></i>
        </button>
        <img class="system-notification-item-img" src="http://pic29.nipic.com/20130601/12122227_123051482000_2.jpg">
        <p class="system-notification-item-info">Lorem ipsum dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p> 
        <div class="system-notification-item-footer">
          <a href="#" class="system-notification-item-detail">查看详情</a>
          <p class="system-notification-item-time">2018-10-18 13:59:04</p>
        </div>
      </div>
      <div class="system-notification-item" @click="systemNotificationDetail">
        <span class="system-notification-item-new"></span>
        <div class="system-notification-item-header">{{title}}</div>
        <button type="button" @click="close" class="system-notification-item-btn">
          <i class="iconfont icon-fe-close"></i>
        </button>
        <img class="system-notification-item-img" src="http://pic29.nipic.com/20130601/12122227_123051482000_2.jpg">
        <p class="system-notification-item-info">Lorem ipsum dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p> 
        <div class="system-notification-item-footer">
          <a href="#" class="system-notification-item-detail">查看详情</a>
          <p class="system-notification-item-time">2018-10-18 13:59:04</p>
        </div>
      </div>
      <div class="system-notification-item" @click="systemNotificationDetail">
        <span class="system-notification-item-new"></span>
        <div class="system-notification-item-header">{{title}}</div>
        <button type="button" @click="close" class="system-notification-item-btn">
          <i class="iconfont icon-fe-close"></i>
        </button>
        <img class="system-notification-item-img" src="http://pic29.nipic.com/20130601/12122227_123051482000_2.jpg">
        <p class="system-notification-item-info">Lorem ipsum dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p> 
        <div class="system-notification-item-footer">
          <a href="#" class="system-notification-item-detail">查看详情</a>
          <p class="system-notification-item-time">2018-10-18 13:59:04</p>
        </div>
      </div>
      <div class="system-notification-item" @click="systemNotificationDetail">
        <span class="system-notification-item-new"></span>
        <div class="system-notification-item-header">{{title}}</div>
        <button type="button" @click="close" class="system-notification-item-btn">
          <i class="iconfont icon-fe-close"></i>
        </button>
        <img class="system-notification-item-img" src="http://pic29.nipic.com/20130601/12122227_123051482000_2.jpg">
        <p class="system-notification-item-info">Lorem ipsum dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p> 
        <div class="system-notification-item-footer">
          <a href="#" class="system-notification-item-detail">查看详情</a>
          <p class="system-notification-item-time">2018-10-18 13:59:04</p>
        </div>
      </div>
      <div class="system-notification-item" @click="systemNotificationDetail">
        <span class="system-notification-item-new"></span>
        <div class="system-notification-item-header">{{title}}</div>
        <button type="button" @click="close" class="system-notification-item-btn">
          <i class="iconfont icon-fe-close"></i>
        </button>
        <img class="system-notification-item-img" src="http://pic29.nipic.com/20130601/12122227_123051482000_2.jpg">
        <p class="system-notification-item-info">Lorem ipsum dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p> 
        <div class="system-notification-item-footer">
          <a href="#" class="system-notification-item-detail">查看详情</a>
          <p class="system-notification-item-time">2018-10-18 13:59:04</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as Lang from '../../../../../util/lang/index.js';
import * as NotificationApi from '@src/api/NotificationApi';

export default {
  name: 'system-notification',
  data () {
    return {
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
      jobOption: '',
      jobOptions: [{
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
    this.info = await NotificationApi.getSystemList(this.params);
    console.log(this.info);
  },
  methods: {
    close () {

    },
    systemNotificationDetail () {
      this.$emit('details', 'system-notification-details');
    },
    getTime (value) {
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
      console.log(this.params);
    },
    setReaded () {
      let param = {};
      param.type = 'system';

      this.show = !this.show;
      if(this.show) {
        NotificationApi.haveRead(param);
        this.btnStyle = {
          'border': '5px solid #55B7B4'
        }
      } else {
        this.btnStyle = {
          'border': '5px solid #eaeaea'
        }
      }
    }
  }
}
</script>

<style lang="scss">
.system-notification-header {
  position: fixed;
  top: 115px;
  right: 0;
  width: 420px;
  z-index: 999;
  text-align: right;
  padding: 20px;
  background: #fff;
  height: 70px;
  font-size: 0;
}
.system-notification-select-left {
  display: inline-block;
  width: 70px;
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
  width: 70px;
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
  height: 24px;
  line-height: 24px;
  margin-bottom: 10px;
  font-size: 16px;
}
.system-notification-item-img {
  width: 100%;
  margin-bottom: 10px;
}
.system-notification-item-btn {
  float: right;
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
  line-height: 24px;
}
.system-notification-item-detail {
  display: inline-block;
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
  font-size: 14px;
  padding: 0 20px 0 10px;
  color: #525252;
}
.system-notification-content {
  padding-top: 185px;
}
</style>