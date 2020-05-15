<template>
  <div class="job-notification">
    <div class="job-notification-header">
      <div class="job-notification-readed" @click="setReaded">
        <button class="job-notification-readed-btn" :style="btnStyle"></button>
        <span class="job-notification-readed-text">全部标记为已读</span>
      </div>
      <div class="notification-header-select-view">
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
        <span class="job-notification-dividing-line"></span>
        <el-select class="job-notification-select job-notification-select-right" :value="dataOption" @input="getTime" placeholder="选择日期">
          <el-option
            v-for="(item, index) in dataOptions"
            :key="index"
            :label="item.label"
            :value="item.value"></el-option>
        </el-select>
      </div>
    </div>
    <div class="job-notification-content" v-show="!dailyShow">
      <div v-if="notificationPage.list.length != 0">
        <job-notification-item
          v-for="(item, index) in notificationPage.list"
          :key="item.id - 0"
          :info="item"
          :index="index"
          @getInfo="getInfo"
          @clearNum="clearNum"
          @toDaily="toDaily"
          @deleteItem="deleteItem">
        </job-notification-item>
        <div class="job-notification-footer">
          <button class="job-notification-footer-more" @click="getMore" v-if="moreShow && !loading">加载更多</button>
          <div v-if="loading">正在加载...</div>
          <div v-if="!moreShow && !loading">
            <span class="job-notification-footer-line"></span>
            <span class="job-notification-footer-text">没有更多数据</span>
            <span class="job-notification-footer-line"></span>
          </div>
        </div>
      </div>
      <div class="job-notification-footer" v-else-if="notificationPage.list.length == 0 && !loading">暂时没有信息</div>
      <div class="job-notification-footer" v-else>正在加载...</div>
    </div>
    <div class="job-notification-daily" v-show="dailyShow">
      <iframe :src="dailyUrl" class="job-notification-daily-iframe" v-if="dailyShow" @load="onload"></iframe>
      <button type="button" class="job-notification-details-return" @click="close" v-if="returnShow">
        <i class="iconfont">&#xe61e;</i>
      </button>
    </div>
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
      dailyUrl: '',
      returnShow: false,
      dailyShow: false,
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
        value: 'performance',
        label: '绩效'
      }, {
        value: 'timing',
        label: '定时提醒'
      }, {
        value: 'authority',
        label: '权限变更'
      }, {
        value: 'notice',
        label: '信息公告'
      }, {
        value: 'wiki',
        label: '知识库'
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
      } ]
    }
  },
  created () {
    this.getInfo();
  },
  methods: {
    /** 将选择的时间格式化 */
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

    /** 设置为全部已读 */
    async setReaded () {
      try {
        if(this.info.workMsg == 0) {
          this.btnShow = false;
          this.btnStyle = {
            'border': '5px solid #eaeaea'
          }
          return;
        }
        this.btnShow = !this.btnShow;
        if(this.btnShow) {
          if(await platform.confirm('您确定将全部未读通知信息标记为已读?')) {
            let params = {
              type: 'work'
            };
            let result = await NotificationApi.haveRead(params);
            if(result.status == 0) {
              this.getInfo();
              this.btnStyle = {
                'border': '5px solid #55B7B4'
              }
              this.$emit('clearNum', 'work');
            }
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

    /** 获取信息，刷新列表 */
    async getInfo () {
      try {
        this.notificationPage.list = [];
        this.params.pageNum = 1;
        this.loading = true;
        let notificationPage = await NotificationApi.getJobList(this.params);
        if(notificationPage.status == 0) {
          this.notificationPage.merge(Page.as(notificationPage.data));
          this.getNum();
        }
        this.loading = false;
      } catch(error) {
        console.error(error);
      }
    },

    /** 分页处理 */
    async getMore () {
      try {
        this.params.pageNum++;
        this.loading = true;
        let notificationPage = await NotificationApi.getJobList(this.params);
        if(notificationPage.status == 0) {
          this.notificationPage.merge(Page.as(notificationPage.data));
        }
        this.loading = false;
      } catch(error) {
        console.error(error);
      }
    },
    clearNum () {
      this.$emit('clearNum', 'work', 1);
    },
    deleteItem (info, index) {
      this.notificationPage.list.splice(index, 1);
      if(info.readed == 0) {
        this.$emit('clearNum', 'work', 1);
      }
    },
    getNum () {
      let count = 0;
      if(this.notificationPage.list.length != 0 && this.notificationPage.list[0].readed == 0) {
        this.notificationPage.list.forEach(item => {
          if(item.readed == 0) {
            count++;
          }
        })
        this.$emit('getNum', count);
      }
    },
    toDaily (url) {
      this.dailyUrl = url;
      this.dailyShow = true;
    },
    close () {
      this.dailyShow = false;
      this.returnShow = false;
    },
    onload () {
      this.returnShow = true;
    }
  },
  computed: {
    /** ture：显示加载更多按钮
     *  false：不显示
     */
    moreShow () {
      return this.notificationPage.hasNextPage;
    },
    change () {
      return this.info.workMsg;
    }
  },
  watch: {
    change(newValue, oldValue) {
      if(newValue > oldValue) {
        this.getInfo();
      }
    }
  }
}
</script>

<style lang="scss">
.job-notification {
  display: flex;
  flex-flow: column;
  height: calc(100% - 115px);
}
.job-notification-header {
  position: relative;
  z-index: 99;

  background: #fff;
  box-shadow: 0 3px 5px #E5E5E5;
  font-size: 0;
  text-align: right;

  padding: 20px;
  height: 70px;

  display: flex;
  justify-content: space-around;
  align-items: center;
  
  .notification-header-select-view {
    flex: 1;
  }
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
  margin-right: 10px;
  input {
    border-radius: 4px;
  }
}
.job-notification-select-left {
  width: 92px;
  input {
    border-radius: 4px 0 0 4px;
  }
}
.job-notification-select-right {
  width: 95px;
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
  padding-right: 10px;
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
.job-notification-dividing-line {
  width: 2px;
  height: 15px;
  background: #fff;
  position: absolute;
  right: 113px;
  top: 28px;
  z-index: 100;
}
.job-notification-footer-line {
  position: relative;
  bottom: 4px;
  display: inline-block;
  background: #D0D0D0;
  height: 1px;
  width: 158px;
}
.job-notification-footer-text {
  padding: 0 16px;
}
.job-notification-daily {
  flex: 1;
  overflow: auto;
  position: relative;
}
.job-notification-details-return {
  position: absolute;
  top: 5px;
  left: 5px;
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
    font-size: 18px;
  }

  &:hover{
    color: #55B7B4;
  }
}
.job-notification-daily-iframe {
  display: block;
  width: 100%;
  height: 100%;
}
</style>