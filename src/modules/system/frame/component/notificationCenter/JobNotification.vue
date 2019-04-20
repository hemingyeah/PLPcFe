/* eslint-disable indent */
<template>
  <div class="job-notification">
    <div class="job-notification-header">
      <div class="job-notification-readed">
        <button class="job-notification-readed-btn" :style="btnStyle" @click="setReaded"></button>
        <span class="job-notification-readed-text">全部标记为已读</span>
      </div>
      <el-select class="job-notification-select job-notification-select-readed" :value="readedOption" @input="getReaded">
        <el-option
          v-for="(item, index) in readedOptions"
          :key="index"
          :label="item.label"
          :value="item.value"></el-option>
      </el-select>
      <el-select class="job-notification-select job-notification-select-left" :value="jobOption" placeholder="消息来源" @input="getSource">
        <el-option
          v-for="(item, index) in jobOptions"
          :key="index"
          :label="item.label"
          :value="item.value"></el-option>
      </el-select>
      <el-select class="job-notification-select job-notification-select-right" :value="dataOption" @input="getTime" placeholder="日期">
        <el-option
          v-for="(item, index) in dataOptions"
          :key="index"
          :label="item.label"
          :value="item.value"></el-option>
      </el-select>
    </div>
    <div class="job-notification-content" v-if="notificationPage.list.length != 0">
      <job-notification-item
        v-for="(item, index) in notificationPage.list"
        :key="index"
        :info="item"
        :index="index"
        @getInfo="getInfo"
        @clearNum="clearNum"
        @deleteItem="deleteItem">
      </job-notification-item>
      <div class="job-notification-footer">
        <button class="job-notification-footer-more" @click="getMore" v-if="moreShow && !loading">加载更多</button>
        <div v-if="loading">正在加载...</div>
        <div v-if="!moreShow && !loading">没有更多信息了</div>
      </div>
    </div>
    <div class="job-notification-footer" v-else-if="notificationPage.list.length == 0 && !loading">暂时没有信息</div>
    <div class="job-notification-footer" v-else>正在加载...</div>
  </div>
</template>

<script>
import JobNotificationItem from './JobNotificationItem.vue'
import * as NotificationApi from '@src/api/NotificationApi';
import * as Lang from '@src/util/lang/index.js'
import Page from '@model/Page';
import platform from '@src/platform';

export default {
  name: 'job-notification',
  components: {
    [JobNotificationItem.name]: JobNotificationItem
  },
  props: {
    info: Object
  },
  data () {
    return {
      loading: false,
      btnShow: false,
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
        value: 0,
        label: '未读'
      }, {
        value: 1,
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
      }],
      // , {
      //   value: 10,
      //   label: '关注'
      // }],
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
  created () {
    this.getInfo();
  },
  methods: {
    getTime (value) {
      this.dataOption = value;

      let startTime = '';
      let endTime = '';

      if(value != 100 && value != null && value != 1) {
        endTime = Lang.formatDate(new Date(), 'YYYY-MM-DD 23:59:59');
      } else if (value == 1) {
        endTime = Lang.formatDate(new Date() - (1 * 24 * 60 * 60 * 1000), 'YYYY-MM-DD 23:59:59');
      } else if (value == 100) {
        endTime = Lang.formatDate(new Date() - (30 * 24 * 60 * 60 * 1000), 'YYYY-MM-DD 23:59:59');
      } else {
        endTime = null;
      }

      if(value == 0) {
        startTime = Lang.formatDate(new Date(), 'YYYY-MM-DD 00:00:00');
      } else if (value == 1) {
        startTime = Lang.formatDate(new Date() - (1 * 24 * 60 * 60 * 1000), 'YYYY-MM-DD 00:00:00');
      } else if (value == 7) {
        startTime = Lang.formatDate(new Date() - (6 * 24 * 60 * 60 * 1000), 'YYYY-MM-DD 00:00:00');
      } else if (value == 30) {
        startTime = Lang.formatDate(new Date() - (29 * 24 * 60 * 60 * 1000), 'YYYY-MM-DD 00:00:00');
      } else {
        startTime = null;
      }

      this.params.startTime = startTime;
      this.params.endTime = endTime;
      this.getInfo();
    },
    getReaded (value) {
      this.readedOption = value;
      this.params.readed = value;
      this.getInfo();
    },
    getSource (val) {
      this.jobOption = val;
      this.params.source = val;
      this.getInfo();
    },
    async setReaded () {
      try {
        if(this.info.workMsg == 0) {
          this.btnShow = false;
          this.btnStyle = {
            'border': '5px solid #eaeaea'
          }
          return;
        }
        let params = {
          type: 'work'
        };
        this.btnShow = !this.btnShow;
        if(this.btnShow) {
          if(await platform.confirm('确定要将所有信息标记为已读？')) {
            await NotificationApi.haveRead(params);
            this.getInfo();
            this.btnStyle = {
              'border': '5px solid #55B7B4'
            }
            this.$emit('clearNum', 'work');
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
    async getInfo () {
      try {
        this.notificationPage = new Page();
        this.params.pageNum = 1;
        this.loading = true;
        let notificationPage = await NotificationApi.getJobList(this.params);
        this.loading = false;
        this.notificationPage.merge(Page.as(notificationPage.data));
      } catch(error) {
        console.error(error);
      }
    },
    async getMore () {
      try {
        this.params.pageNum++;
        this.loading = true;
        let notificationPage = await NotificationApi.getJobList(this.params);
        this.loading = false;
        this.notificationPage.merge(Page.as(notificationPage.data));
      } catch(error) {
        console.error(error);
      }
    },
    clearNum () {
      this.$emit('clearNum', 'work', 1);
    },
    deleteItem (info, index) {
      this.notificationPage.list.splice(index, 1);
    }
  },
  computed: {
    moreShow () {
      return !(this.params.pageSize * this.params.pageNum >= this.notificationPage.total);
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
  padding: 20px 12px;
  background: #fff;
  height: 70px;
  font-size: 0;
  box-shadow: 0 3px 5px #E5E5E5;
  z-index: 99;
}
.job-notification-select {
  display: inline-block;
  input {
    color: #525252 !important;
    background: #EAEAEA;
    border: 0;
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
.job-notification-select-readed {
  width: 80px;
  margin-right: 5px;
  input {
    border-radius: 4px;
  }
}
.job-notification-select-left {
  width: 100px;
  border-right: 1px solid #fff;
  input {
    border-radius: 4px 0 0 4px;
  }
}
.job-notification-select-right {
  width: 100px;
  input {
    border-radius: 0 4px 4px 0;
  }
}
.job-notification-content {
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
  margin-top: 10px;
  height: 30px;
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