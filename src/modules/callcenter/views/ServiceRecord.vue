<template>
  <div class="call-center-service-record">
    <el-card class="session-card" shadow="hover">
      <div slot="header" @click="expand('session')">
        <span><i class="iconfont icon-nav-down toggle-up" :class="sessionToggle ? 'is-reverse': ''"></i>历史通话</span>
      </div>
      <div v-show="showSession" v-for="item in sessionList" :key="item.id" class="list-item">
        <img src="../../../assets/img/avatar.png">
        <div class="list-content">
          <div class="list-header">
            <p>{{item.agentName}}</p>
            <p>{{item.ring}}</p>
          </div>
          <el-tag v-if="item.sortName">{{item.sortName}}</el-tag>
          <el-tag :type="item.status ? 'info' : 'danger'">{{item.status ? '已解决' : '未解决'}}</el-tag>
          <div class="remark">
            <p>{{item.remark}}</p>
          </div>
        </div>
      </div>
    </el-card>
    <el-card class="task-card" shadow="hover">
      <div slot="header" @click="expand('task')">
        <span><i class="iconfont icon-nav-down toggle-up" :class="taskToggle ? 'is-reverse': ''"></i>历史工单</span>
      </div>
      <div v-show="showTask" v-for="item in taskList" :key="item.id" class="list-item">
        <div class="list-content">
          <div class="list-header">
            <p>{{item.templateName}} <el-tag class="task-type-tag" effect="dark">{{item.state | fmt_state}}</el-tag>
            </p>
            <p>{{item.createTime | fmt_datehour}}</p>
          </div>
          <p v-if="item.products && item.products.length">产品：
            <el-tag v-for="tag in item.products" :key="tag.id" type="info">
              {{ tag.type }}
            </el-tag>
          </p>
          <p>负责人：{{item.customer && item.customer.customerManagerName}}</p>
          <p v-if="item.synergies && item.synergies.length">协同人：{{fmt_synergies(item.synergies)}}</p>
        </div>
      </div>
    </el-card>
    <el-card class="event-card" shadow="hover">
      <div slot="header" @click="expand('event')">
        <span><i class="iconfont icon-nav-down toggle-up" :class="eventToggle ? 'is-reverse': ''"></i>历史事件</span>
      </div>
      <div v-show="showEvent" v-for="item in eventList" :key="item.id" class="list-item">
        <div class="list-content">
          <div class="list-header">
            <p>{{item.templateName}} <el-tag class="task-type-tag" effect="dark">{{item.state | fmt_state}}</el-tag>
            </p>
            <p>{{item.createTime | fmt_datehour}}</p>
          </div>
          <p v-if="item.products && item.products.length">产品：
            <el-tag v-for="tag in item.products" :key="tag.id" type="info">
              {{ tag.type }}
            </el-tag>
          </p>
          <p>负责人：{{item.executorName}}</p>
          <p v-if="item.synergies && item.synergies.length">协同人：{{fmt_synergies(item.synergies)}}</p>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import * as CallCenterApi from '@src/api/CallCenterApi'
export default {
  name: 'service-record',
  props: {
    item: {
      type: Object,
      default: () => ({})
    },
  },
  data() {
    return {
      sessionToggle: false,
      taskToggle: false,
      eventToggle: false,
      showSession: false,
      showTask: false,
      showEvent: false,
      // linkmanPhone: '18397952974',
      sessionList: [],
      taskList: [],
      eventList: []
    }
  },
  watch: {
    item: {
      immediate: true,
      deep: true,
      handler(newValue, oldValue) {
        this.getSessionList();
        this.getTaskList()
        this.getEventList()
      }
    }
  },
  computed: {
    linkmanPhone(){
      return this.item.dialPhone || this.item.dialPhone
    }
  },
  methods: {
    getSessionList() {
      CallCenterApi.getHistoryCallRecordList().then(({ code, result }) => {
        if(code !== 0) return
        this.sessionList = result || []
      }).catch((err) => {
        console.error(err)
      })
    },
    getTaskList() {
      if(!this.linkmanPhone) return
      CallCenterApi.getTaskHistoryList({linkmanPhone: this.linkmanPhone}).then(({ status, message, data }) => {
        if(status !== 0) return
        console.info('', status, message, data)
        this.taskList = data.list || []
      }).catch((err) => {
        console.error(err)
      })
    },
    getEventList() {
      if(!this.linkmanPhone) return
      CallCenterApi.getEventHistoryList({linkmanPhone: this.linkmanPhone}).then(({ status, message, data }) => {
        if(status !== 0) return
        console.info('', status, message, data)
        this.eventList = data.list || []
      }).catch((err) => {
        console.error(err)
      })
    },
    expand(type) {
      switch (type) {
      case 'session':
        this.showSession = !this.showSession
        this.sessionToggle = !this.sessionToggle
        break
      case 'task':
        this.showTask = !this.showTask
        this.taskToggle = !this.taskToggle
        break
      case 'event':
        this.showEvent = !this.showEvent
        this.eventToggle = !this.eventToggle
        break
      default:
        break
      }
    },
    fmt_synergies(value = []) {
      const arr = []
      value.length &&
        value.forEach(item => {
          arr.push(item.displayName)
        })
      return arr.length < 4
        ? arr.join('，')
        : `${arr.join('，')}等${arr.count}人`
    }
  }
}
</script>

<style lang="scss">
.call-center-service-record {
  padding: 0 20px;
  .el-card {
    margin-top: 15px;
  }
  .el-card__header {
    padding: 12px 20px;
  }
  .el-card__body {
    padding: 0 !important;
  }
}
.session-card,
.task-card,
.event-card {
  .list-item {
    display: flex;
    padding: 12px 12px 0;
    border-bottom: 1px solid #eee;
    img {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      margin: 0 10px;
    }
    .list-content {
      flex: 1;
      .list-header {
        display: flex;
        justify-content: space-between;
      }
      .el-tag {
        margin-right: 5px;
      }
      .task-type-tag {
        margin-left: 10px;
        background: #1e92ed;
        color: #fff;
      }
      .remark {
        margin-top: 10px;
        background: #f5f5f5;
        color: #999;
        padding: 10px;
        margin-bottom: 12px;
        p {
          margin-bottom: 0;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          overflow: hidden;
          word-break: break-all;
        }
      }
    }
  }

  .icon-nav-down {
    margin-right: 10px;
  }

  .toggle-up {
    display: inline-block;
    transition: transform 0.3s;
    transform: rotate(-90deg);
  }

  .is-reverse {
    transform: rotate(0deg) !important;
  }
}
</style>