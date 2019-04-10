<template>
  <div class="job-notification">
    <div class="job-notification-header">
      <el-select class="job-notification-select-left" v-model="jobOption" placeholder="消息来源">
        <el-option
          v-for="(item, index) in jobOptions"
          :key="index"
          :label="item.label"
          :value="item.value"></el-option>
      </el-select>
      <el-select class="job-notification-select-right" v-model="dataOption" placeholder="日期">
        <el-option
          v-for="(item, index) in dataOptions"
          :key="index"
          :label="item.label"
          :value="item.value"></el-option>
      </el-select>
    </div>
    <div class="job-notification-content">
      <job-notification-item
        title="工单池订阅通知"
        time="2018-10-18 13:59:04">
        <p slot="header">工单池有一个新工单，请查看</p>
        <p>客户：众联成业</p>
      </job-notification-item>
      <job-notification-item
        title="工单池订阅通知"
        time="2018-10-18 13:59:04">
        <p slot="header">您有一个新的待审批事项，请尽快处理</p>
        <p>客户：众联成业</p>
      </job-notification-item>
    </div>
  </div>
</template>

<script>
import JobNotificationItem from './JobNotificationItem.vue'

export default {
  name: 'job-notification',
  components: {
    [JobNotificationItem.name]: JobNotificationItem
  },
  data () {
    return {
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
      },  {
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
  }
}
</script>

<style lang="scss">
.job-notification {
  margin: 20px;
}
.job-notification-header {
  margin: 0 10px;
  text-align: center;
}
.job-notification-select-left {
  display: inline-block;
  width: 125px;
  margin: 0 10px;
  input {
    background: #EAEAEA;
    border: 0;
    border-radius: 4px 0 0 4px;
  }
}
.job-notification-select-right {
  display: inline-block;
  width: 125px;
  margin: 0 10px;
  input {
    background: #EAEAEA;
    border: 0;
    border-radius: 0 4px 4px 0;
  }
}
// .el-input__inner {
//   background: #ccc;
// }
</style>