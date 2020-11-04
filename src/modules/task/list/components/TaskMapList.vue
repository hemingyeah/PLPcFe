<template>
  <div
    class="task-map-body-workSide-body task-span1"
    :style="`height: ${mapHeight - 170}px`"
  >
    <div v-if="mapList.length">
      <div
        class="task-flex task-map-body-workSide-body-item"
        v-for="(item, index) in mapList"
        :key="index"
        @click="chooseListItem(index, item)"
      >
        <div
          class="task-map-body-workSide-body-item-index"
          :class="{ active: item.selected }"
        >
          {{ item.i }}
        </div>
        <div class="task-span1">
          <p>
            工单编号: <span @click.stop="openTaskTab(item.id)">{{ item.taskNo }}</span>
          </p>
          <p>工单类型: {{ item.templateName }}</p>
          <p>客户姓名: {{ item.customerEntity.name }}</p>
          <p>电话: {{ item.linkMan.phone }} <i class="icon-ziyuan iconfont" @click.stop="makePhoneCall(item.linkMan.phone)" v-if="has_call_center_module"></i></p>
          <p>
            地址:
            {{
              item.address
                ? `${item.address.province}${item.address.city}${item.address.dist}${item.address.address}`
                : ""
            }}
          </p>
          <p>创建时间: {{ item.createTime }}</p>
        </div>
        <div
          class="task-map-body-workSide-body-item-info"
          v-if="!allowReallot(item)"
        >
          <el-tooltip :content="getErrorNotice(item)" placement="top">
            <i class="iconfont icon-question task-icon"></i>
          </el-tooltip>
        </div>
      </div>
    </div>
    <div v-else class="unlist">暂无选择工单</div>
    <div
      class="side_list_loadmore"
      @click="$emit('next')"
      v-show="mapList.length && type"
    >
      加载更多
    </div>
  </div>
</template>
<script>
/* Api */
import * as TaskApi from '@src/api/TaskApi.ts';
export default {
  name: 'task-map-list',
  inject: ['initData'],
  props: {
    mapHeight: {
      type: Number,
      default: 0,
    },
    mapList: {
      type: Array,
      default: () => {
        return [];
      },
    },
    type: {
      type: Number,
      default: 0,
    },
    has_call_center_module: {
      type: Boolean
    }
  },
  data() {
    return {
      taskReallotConfig: false,
    };
  },
  mounted() {
    this.fetchTaskConfig();
  },
  methods: {
    async fetchTaskConfig() {
      const { taskConfig } = await TaskApi.getTaskConfig();
      if (taskConfig) {
        this.taskReallotConfig = taskConfig.taskReallot;
      }
    },
    /**
     * @description 拨打电话
     */
    async makePhoneCall(phone) {
      const params = {
        phone,
        taskType:'task'
      }
      const {code, message} = await TaskApi.dialout(params)
      if (code) {
        this.$platform.alert(message);
      }
    },
    /**
     * @description 打开工单详情tab
     * @param {String} taskId 工单id
     */
    openTaskTab(taskId) {
      if (!taskId) return;

      let fromId = window.frameElement.getAttribute('id');

      this.$platform.openTab({
        id: `task_view_${taskId}`,
        title: '工单详情',
        close: true,
        url: `/task/view/${taskId}?noHistory=1`,
        fromId,
      });
    },
    /**
     * 获取提示..信息 内容
     */
    getErrorNotice({ inApprove, isPaused, state, executorUser }) {
      let hasAuth = this.hasAllotPermission(executorUser),
        taskSuffixStr = '不支持转派',
        taskPrefixStr = '';
      // 当前工单是没有权限
      if (inApprove) taskPrefixStr = '审批中工单';
      if (isPaused) taskPrefixStr = '已暂停工单';
      if (state === 'taskPool') taskPrefixStr = '工单池工单';
      if (state === 'created') taskPrefixStr = '待指派工单';
      if (state === 'finished') taskPrefixStr = '已完成工单';
      if (state === 'refused') taskPrefixStr = '已拒绝工单';
      if (state === 'costed') taskPrefixStr = '已结算工单';
      if (state === 'closed') taskPrefixStr = '已关闭工单';
      if (state === 'offed') taskPrefixStr = '已取消工单';
      // 如果没有权限
      if (!hasAuth) {
        return '无指派权限';
      }
      return taskPrefixStr + taskSuffixStr;
    },
    /**
     * 判断是否允许转交
     */
    allowReallot({ executorUser, inApprove, isPaused, state }) {
      let hasAuth = this.hasAllotPermission(executorUser);
      if (!hasAuth) return false;
      // 审批中或者暂停中的不允许转派
      if (inApprove || isPaused) return false;
      // 未指派状态不允许转派

      if (!state) return false;
      if (state === 'taskPool') return false;
      if (state === 'created') return false;
      if (state === 'finished') return false;
      if (state === 'refused') return false;
      if (state === 'costed') return false;
      if (state === 'closed') return false;
      if (state === 'offed') return false;

      return true;
    },
    /**
     * 是否有指派权限
     * 有指派权限或开启了允许工单负责人转派工单
     */
    hasAllotPermission(executorUser) {
      // 有指派权限
      if (this.initData.auth && this.initData.auth.TASK_DISPATCH) return true;
      // 没转派权限, 判断是否开启允许负责人转派工单
      // 没开启开关没有权限
      if (!this.taskReallotConfig) return false;
      let executorId = executorUser && executorUser.userId;
      if (!executorId) return false;
      // 判断当前用户是不是负责人
      return executorId === this.initData.currentUserId;
    },
    /**
     * 点击右侧普通面板条目
     */
    chooseListItem(index, item) {
      let currSelected = !item.selected,
        allowReallot = this.allowReallot(item);
      // 可以正常指派
      if (allowReallot) {
        this.$set(this.mapList[index], 'selected', currSelected);
      }

      this.$emit('openInfo', { allowReallot, item});
    },
  },
};
</script>
<style lang="scss" scoped>
.task-map {
  &-body {
    &-workSide {
      width: 282px;
      position: absolute;
      top: 0px;
      right: 0;
      border-left: 1px solid #e5e5e5;
      background-color: #fff;
      z-index: 9;
      &-header {
        height: 50px;
        padding: 0 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid rgb(204, 204, 204);
        font-size: 16px;
        font-weight: 700;
      }
      &-body {
        width: 100%;
        overflow: hidden;
        overflow-y: scroll;
        background-color: #fff;
        color: #a0a0a0;
        font-size: 13px;
        &-item {
          cursor: pointer;
          padding: 10px;
          border-bottom: 1px dotted #ccc;
          &-info {
            margin-top: -5px;
          }
          &-index {
            background: url("../../../../assets/img/task/16-16.png") no-repeat 0 -65px;
            width: 24px;
            height: 30px;
            margin-right: 10px;
            line-height: 24px;
            text-align: center;
            color: #fff;
            font-family: tahoma;
            font-size: 12px;
            font-weight: bold;
          }
          .active {
            background: url("../../../../assets/img/task/16-16.png") no-repeat 0 -34px;
          }
          p {
            margin-bottom: 5px;
            font-weight: normal;
          }
        }
        span {
          color: #3c8dbc;
        }
      }
      .fold_btn {
        position: absolute;
        top: 50%;
        left: -22px;
        margin-top: -22px;
        z-index: 10;
        background-color: #fff;
        width: 22px;
        height: 43px;
        line-height: 43px;
        padding-left: 5px;
        > i {
          font-size: 12px;
          color: #6666;
          font-weight: 600;
        }
      }
    }
  }
  .side_list_loadmore {
    padding: 10px 0;
    text-align: center;
    color: #3c8dbc;
    font-size: 12px;
    cursor: pointer;
  }
  .unlist {
    color: #333;
    text-align: center;
    padding-top: 10px;
  }
}
</style>
