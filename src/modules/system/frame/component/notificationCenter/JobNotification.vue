<template>
  <div class="job-notification">
    <div class="job-notification-header">
      <div class="job-notification-readed">
        <button class="job-notification-readed-btn" :style="btnStyle" @click="setReaded"></button>
        <span class="job-notification-readed-text">全部标记为已读</span>
      </div>
      <el-select class="job-notification-select-readed" :value="readedOption" @input="getReaded">
        <el-option
          v-for="(item, index) in readedOptions"
          :key="index"
          :label="item.label"
          :value="item.value"></el-option>
      </el-select>
      <el-select class="job-notification-select-left" :value="jobOption" placeholder="消息来源" @input="getSource">
        <el-option
          v-for="(item, index) in jobOptions"
          :key="index"
          :label="item.label"
          :value="item.value"></el-option>
      </el-select>
      <el-select class="job-notification-select-right" :value="dataOption" @input="getTime" placeholder="日期">
        <el-option
          v-for="(item, index) in dataOptions"
          :key="index"
          :label="item.label"
          :value="item.value"></el-option>
      </el-select>
    </div>
    <div class="job-notification-content">
      <job-notification-item
        v-for="(item, index) in notificationPage"
        :key="index"
        :info="item"
        @getInfo="getInfo">
      </job-notification-item>
      <div class="job-notification-footer">
        <button class="job-notification-footer-more" @click="getMore" v-if="moreShow">加载更多</button>
        <div v-else>没有更多信息了</div>
      </div>
    </div>
  </div>
</template>

<script>
import JobNotificationItem from './JobNotificationItem.vue'
import * as NotificationApi from '@src/api/NotificationApi';
import * as Lang from '@src/util/lang/index.js'
import Page from '@model/Page';

export default {
  name: 'job-notification',
  components: {
    [JobNotificationItem.name]: JobNotificationItem
  },
  data () {
    return {
      // info: {},
      btnShow: false,
      moreShow: true,
      btnStyle: {
        'border': '5px solid #eaeaea'
      },
      notificationCount: 0,
      params: {
        pageSize: 20,
        pageNum: 1,
      },
      notificationPage: new Page(),
      readedOption: ' ',
      readedOptions: [{
        value: ' ',
        label: '全部'
      }, {
        value: false,
        label: '未读'
      }, {
        value: true,
        label: '已读'
      }],
      jobOption: '',
      jobOptions: [{
        value: null,
        label: '全部'
      }, {
        value: 'task',
        label: '工单'
      }, {
        value: 'event',
        label: '服务台'
      }, {
        value: 'spare',
        label: '备件'
      }, {
        value: 'approve',
        label: '审批'
      }, {
        value: 'daily',
        label: '日报'
      }, {
        value: 'timing',
        label: '定时提醒'
      }, {
        value: 'authority',
        label: '权限变更'
      }, {
        value: 'notice',
        label: '通知公告'
      },  {
        value: 10,
        label: '关注'
      }],
      dataOption: '',
      dataOptions: [{
        value: null,
        label: '全部'
      }, {
        value: 0,
        label: '今日'
      }, {
        value: 1,
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
    // TODO:给已读未读字段赋值,获取通知总数量，第一次判断加载更多按钮是否出现
    let notificationPage = this.getInfo();
    // this.info = info.data.list;
    
    this.notificationPage = [{
      pcUrl: 'https://www.baidu.com',
      readed: 0,
      createTime: '2018-12-24 10:03:56',
      body: {
        title: '工单更新通知',
        content: '工单池有一个新工单，请您关注',
        forms: [{
          '客户': '众联成业'
        }, {
          '负责人': '王越'
        }, {
          '地址': '山东省青岛市市北区黑龙江南路1号'
        }, {
          '计划时间': '2018-12-16 12:12:12'
        }, ]
      }
    }, {
      pcUrl: 'https://www.baidu.com',
      readed: 1,
      createTime: '2018-12-24 10:03:56',
      body: {
        title: '工单更新通知',
        content: '工单池有一个新工单，请您关注',
        forms: [{
          '客户': '众联成业'
        }, {
          '负责人': '王越'
        }, {
          '地址': '山东省青岛市市北区黑龙江南路1号'
        }, {
          '计划时间': '2018-12-16 12:12:12'
        }, ]
      }
    }, {
      pcUrl: 'https://www.baidu.com',
      readed: 0,
      createTime: '2018-12-24 10:03:56',
      body: {
        title: '工单更新通知',
        content: '工单池有一个新工单，请您关注',
        // forms: [{
        //   '客户': '众联成业'
        // }, {
        //   '负责人': '王越'
        // }, {
        //   '地址': '山东省青岛市市北区黑龙江南路1号'
        // }, {
        //   '计划时间': '2018-12-16 12:12:12'
        // }, ]
      }
    }, {
      pcUrl: 'https://www.baidu.com',
      readed: 1,
      createTime: '2018-12-24 10:03:56',
      body: {
        title: '工单更新通知',
        content: '工单池有一个新工单，请您关注',
        forms: [{
          '客户': '众联成业'
        }, {
          '负责人': '王越'
        }, {
          '地址': '山东省青岛市市北区黑龙江南路1号'
        }, {
          '计划时间': '2018-12-16 12:12:12'
        }, ]
      }
    }, {
      pcUrl: 'https://www.baidu.com',
      readed: 1,
      createTime: '2018-12-24 10:03:56',
      body: {
        title: '工单更新通知',
        content: '工单池有一个新工单，请您关注',
        forms: [{
          '客户': '众联成业'
        }, {
          '负责人': '王越'
        }, {
          '地址': '山东省青岛市市北区黑龙江南路1号'
        }, {
          '计划时间': '2018-12-16 12:12:12'
        }, ]
      }
    }, {
      pcUrl: 'https://www.baidu.com',
      readed: 1,
      createTime: '2018-12-24 10:03:56',
      body: {
        title: '工单更新通知',
        content: '工单池有一个新工单，请您关注',
        forms: [{
          '客户': '众联成业'
        }, {
          '负责人': '王越'
        }, {
          '地址': '山东省青岛市市北区黑龙江南路1号'
        }, {
          '计划时间': '2018-12-16 12:12:12'
        }, ]
      }
    }, {
      pcUrl: 'https://www.baidu.com',
      readed: 1,
      createTime: '2018-12-24 10:03:56',
      body: {
        title: '工单更新通知',
        content: '工单池有一个新工单，请您关注',
        forms: [{
          '客户': '众联成业'
        }, {
          '负责人': '王越'
        }, {
          '地址': '山东省青岛市市北区黑龙江南路1号'
        }, {
          '计划时间': '2018-12-16 12:12:12'
        }, ]
      }
    }, {
      pcUrl: 'https://www.baidu.com',
      readed: 1,
      createTime: '2018-12-24 10:03:56',
      body: {
        title: '工单更新通知',
        content: '工单池有一个新工单，请您关注',
        forms: [{
          '客户': '众联成业'
        }, {
          '负责人': '王越'
        }, {
          '地址': '山东省青岛市市北区黑龙江南路1号'
        }, {
          '计划时间': '2018-12-16 12:12:12'
        }, ]
      }
    }, {
      pcUrl: 'https://www.baidu.com',
      readed: 1,
      createTime: '2018-12-24 10:03:56',
      body: {
        title: '工单更新通知',
        content: '工单池有一个新工单，请您关注',
        forms: [{
          '客户': '众联成业'
        }, {
          '负责人': '王越'
        }, {
          '地址': '山东省青岛市市北区黑龙江南路1号'
        }, {
          '计划时间': '2018-12-16 12:12:12'
        }, ]
      }
    }]
  },
  methods: {
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
    getReaded (value) {
      this.readedOption = value;
      // TODO:给已读未读字段赋值
      this.getInfo();
    },
    getSource (val) {
      this.jobOption = val;
      this.params.source = val;
      this.getInfo();
    },
    async setReaded () {
      try {
        let param = {};
        param.type = 'work';

        this.btnShow = !this.btnShow;
        if(this.btnShow) {
          await NotificationApi.haveRead(param);
          this.getInfo();
          this.btnStyle = {
            'border': '5px solid #55B7B4'
          }
        } else {
          this.getInfo();
          this.btnStyle = {
            'border': '5px solid #eaeaea'
          }
        }
      } catch (error) {
        console.error(error);
      }
    },
    async getInfo () {
      try {
        return await NotificationApi.getJobList(this.params);
      } catch (error) {
        console.error(error);
      }
    },
    getMore () {
      if (this.params.pageSize * this.params.pageNum >= this.info.count) {
        this.moreShow = false;
      } else {
        this.params.pageNum += 1;
        let notificationPage = this.getInfo();
        this.notificationPage.merge(Page.as(notificationPage));
      }
    }
  }
}
</script>

<style lang="scss">
.job-notification {
  flex: 1;
  display: flex;
  flex-flow: column;
}
.job-notification-header {
  text-align: right;
  padding: 20px;
  background: #fff;
  height: 70px;
  font-size: 0;
}
.job-notification-select-readed {
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
.job-notification-select-left {
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
.job-notification-select-right {
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
.job-notification-content {
  // padding-top: 185px;
  flex: 1;
  overflow: auto;
}
.job-notification-readed {
  display: inline-block;
}
.job-notification-readed-btn {
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
.job-notification-readed-text {
  font-size: 13px;
  padding: 0 5px;
  color: #525252;
}
.job-notification-footer {
  text-align: center;
  height: 40px;
  line-height: 30px;
  color: #8C8989;
}
.job-notification-footer-more {
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
</style>