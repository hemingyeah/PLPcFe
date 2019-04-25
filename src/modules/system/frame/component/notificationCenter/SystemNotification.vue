<template>
  <div class="system-notification-main">
    <div class="system-notification" v-if="detailShow">
      <div class="system-notification-header">
        <div class="system-notification-readed">
          <button class="system-notification-readed-btn" :style="btnStyle" @click="setReaded"></button>
          <span class="system-notification-readed-text">全部标记为已读</span>
        </div>
        <el-select class="system-notification-select system-notification-select-left" :value="systemOption" placeholder="消息来源" @input="getSource">
          <el-option
            v-for="(item, index) in systemOptions"
            :key="index"
            :label="item.label"
            :value="item.value"></el-option>
        </el-select>
        <el-select class="system-notification-select system-notification-select-right" :value="dataOption" placeholder="日期" @input="getTime">
          <el-option
            v-for="(item, index) in dataOptions"
            :key="index"
            :label="item.label"
            :value="item.value"></el-option>
        </el-select>  
      </div>
      <div class="system-notification-content" v-if="systemPage.list.length != 0">
        <div class="system-notification-item" 
             v-for="(item, index) in systemPage.list"
             :key="item.id - 0">
          <div class="system-notification-item-header">
            <span class="system-notification-item-new" v-if="item.readed == 0"></span>
            <span>{{ item.title }}</span>
            <button type="button" @click="deleteItem(item, index)" class="system-notification-item-btn">
              <i class="iconfont icon-fe-close"></i>
            </button>
          </div>
          <img class="system-notification-item-img" :src="item.img">
          <p class="system-notification-item-info">{{ item.content }}</p> 
          <div class="system-notification-item-footer">
            <button class="system-notification-item-detail" @click="toSystemNotificationDetail(item, index)">查看详情</button>
            <p class="system-notification-item-time">{{ item.createTime | fmt_datetime }}</p>
          </div>
        </div>
        <div class="system-notification-footer">
          <button class="system-notification-footer-more" @click="getMore" v-if="moreShow && !loading">加载更多</button>
          <div v-if="loading">正在加载...</div>
          <div v-if="!moreShow && !loading">没有更多信息了</div>
        </div>
      </div>
      <div class="job-notification-footer" v-else-if="systemPage.list.length == 0 && !loading">暂时没有信息</div>
      <div class="job-notification-footer" v-else>正在加载...</div>
    </div>
    <system-notification-details
      v-else
      @back="back"
      @deleteItem="deleteItem"
      :info="detailInfo"
      :index="detailIndex">123</system-notification-details>
  </div>
</template>

<script>
import * as Lang from '@src/util/lang/index.js';
import * as NotificationApi from '@src/api/NotificationApi';
import SystemNotificationDetails from '../notificationCenter/SystemNotificationDetails'
import Page from '@model/Page';
import platform from '@src/platform';

export default {
  name: 'system-notification',
  components: {
    [SystemNotificationDetails.name]: SystemNotificationDetails
  },
  props: {
    info: Object
  },
  data () {
    return {
      detailShow: true,
      loading: false,
      systemReaded: 0,
      detailInfo: {},
      detailIndex: null,
      systemPage: new Page(),
      btnShow: false,
      btnStyle: {
        'border': '5px solid #eaeaea'
      },
      params: {
        pageSize: 20,
        pageNum: 1
      },
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
    this.getInfo();
  },
  methods: {
    /** 获取信息，刷新列表 */
    async getInfo () {
      try {
        this.systemPage.list = [];
        this.params.pageNum = 1;
        this.loading = true;
        let systemPage = await NotificationApi.getSystemList(this.params);
        if(systemPage.status == 0) {
          this.systemPage.merge(Page.as(systemPage.data));
        }
        this.loading = false;
      } catch (error) {
        console.error(error);
      }
    },

    /** 删除单个通知 */
    async deleteItem (info, index) {
      try {
        let params = {
          type: 'system',
          id: info.id
        }
        if(await platform.confirm('确定要删除该信息吗？')) {
          let result = await NotificationApi.deleteNotification(params);
          if(result.status == 0) {
            this.systemPage.list.splice(index, 1);
          }
        }
        if(info.readed == 0) {
          this.$emit('clearNum', 'system', 1);
        }
      } catch (error) {
        console.error(error);
      }
    },

    /** 打开系统通知详情页 */
    async toSystemNotificationDetail (info, index) {
      try {
        this.detailInfo = info;
        this.detailIndex = index;
        this.detailShow = false;
        if(info.readed == 0) {
          let params = {
            type: 'system',
            id: info.id
          }
          let result = await NotificationApi.haveRead(params);
          if(result.status == 0) {
            info.readed = 1;
            this.$emit('clearNum', 'system', 1)
          }
        }
      } catch (error) {
        console.error(error);
      }
    },
    back () {
      this.detailShow = true;
    },
    getSource (value) {
      this.systemOption = value;
      this.params.source = value;
      this.getInfo();
    },

    /** 格式化选择的时间 */
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
    },

    /** 将系统通知全部设为已读 */
    async setReaded () {
      try {
        if(this.info.systemMsg == 0) {
          this.btnShow = false;
          this.btnStyle = {
            'border': '5px solid #eaeaea'
          }
          return;
        }
        let params = {
          type: 'system'
        };
        this.btnShow = !this.btnShow;
        if(this.btnShow) {
          if(await platform.confirm('确定要将所有信息标记为已读？')) {
            let res = await NotificationApi.haveRead(params);
            if(res.status == 0) {
              this.getInfo();
              this.btnStyle = {
                'border': '5px solid #55B7B4'
              };
              this.$emit('clearNum', 'system');
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

    /** 分页操作 */
    async getMore () {
      try {
        this.params.pageNum++;
        this.loading = true;
        let systemPage = await NotificationApi.getSystemList(this.params);
        if(systemPage.status == 0) {
          this.systemPage.merge(Page.as(systemPage.data));
        }
        this.loading = false;
      } catch(error) {
        console.error(error);
      }
    }
  },
  computed: {
    /** ture：显示加载更多按钮
     *  false：不显示
     */
    moreShow () {
      return this.systemPage.hasNextPage;
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
  padding: 20px 12px;
  background: #fff;
  height: 70px;
  font-size: 0;
  box-shadow: 0 3px 5px #E5E5E5;
  z-index: 99;
}
.system-notification-select {
  display: inline-block;
  width: 100px;
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
.system-notification-select-left {
  border-right: 1px solid #fff;
  input {
    border-radius: 4px 0 0 4px;
  }
}
.system-notification-select-right {
  input {
    border-radius: 0 4px 4px 0;
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
  margin: 0;
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
  margin-top: 10px;
  height: 30px;
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