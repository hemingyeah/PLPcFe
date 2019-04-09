<template>
  <div class="system-notification">
    <div class="system-notification-header">
      <el-select class="system-notification-select" v-model="jobOption" placeholder="消息来源">
        <el-option
          v-for="(item, index) in jobOptions"
          :key="index"
          :label="item.label"
          :value="item.value"></el-option>
      </el-select>
      <el-select class="system-notification-select" v-model="dataOption" placeholder="日期">
        <el-option
          v-for="(item, index) in dataOptions"
          :key="index"
          :label="item.label"
          :value="item.value"></el-option>
      </el-select>
    </div>
    <div class="system-notification-item" @click="systemNotificationDetail">
      <!-- <span class="system-notification-item-new"></span> -->
      <div class="system-notification-item-header">{{title}}</div>
      <button type="button" @click="close" class="system-notification-item-btn">
        <i class="iconfont icon-fe-close"></i>
      </button>
      <img class="system-notification-item-img" src="http://pic29.nipic.com/20130601/12122227_123051482000_2.jpg">
      <div class="system-notification-item-footer">
        <p class="system-notification-item-info">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p> 
        <p class="system-notification-item-time">2018-10-18 13:59:04</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'system-notification',
  data () {
    return {
      title: '售后宝双十一活动大促销',
      jobOption: '',
      jobOptions: [{
        value: 1,
        label: '全部'
      }, {
        value: 2,
        label: '工单'
      }, {
        value: 3,
        label: '服务台'
      }, {
        value: 4,
        label: '备件'
      }, {
        value: 5,
        label: '审批'
      }, {
        value: 6,
        label: '日报'
      }, {
        value: 7,
        label: '定时提醒'
      }, {
        value: 8,
        label: '权限变更'
      }, {
        value: 9,
        label: '通知公告'
      }, {
        value: 10,
        label: '关注'
      }],
      dataOption: '',
      dataOptions: [{
        value: 1,
        label: '全部'
      }, {
        value: 2,
        label: '今日'
      }, {
        value: 3,
        label: '昨日'
      }, {
        value: 4,
        label: '近七天'
      }, {
        value: 5,
        label: '近30天'
      }, {
        value: 6,
        label: '30天以前'
      }, ]
    }
  },
  methods: {
    close () {

    },
    systemNotificationDetail () {
      this.$emit('details', 'system-notification-details');
    }
  }
}
</script>

<style lang="scss">
.system-notification {
  margin: 20px;
}
.system-notification-header {
  margin: 0 10px;
  text-align: center;
}
.system-notification-select {
  display: inline-block;
  width: 125px;
  margin: 0 10px;
}
.system-notification-item {
  position: relative;
  margin-top: 20px;
  padding: 10px 20px;
  background: #fff;
  font-size: 12px;
  box-shadow: 6px 7px 7px #999;
}
.system-notification-item-new {
  position: absolute;
  top: 17px;
  left: 15px;
  width: 9px;
  height: 9px;
  background: #f44552;
  border: 1px solid #fff;
  border-radius: 50%;
}
.system-notification-item-header {
  height: 24px;
  line-height: 24px;
  margin-bottom: 10px;
  font-size: 14px;
  text-align: center;
}
.system-notification-item-img {
  width: 100%;
  margin-bottom: 10px;
}
.system-notification-item-btn {
  position: absolute;
  right: 10px;
  top: 10px;
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
.system-notification-item-info {
  font-size: 13px;
}
.system-notification-item-detail {
  display: block;
  margin-bottom: 5px;
  color: #55B7B4;
}
.system-notification-item-time {
  margin: 0;
  color: #999;
}
</style>