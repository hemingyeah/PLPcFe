<template>
  <base-modal title="调整计划时间" :show.sync="visible" width="500px" class="task-plantime-dialog">
    <div class="base-modal-content">
      <form-item :label="field.displayName" v-if="field.id">
        <form-plantime :field="field" :value="planTime" @update="update"></form-plantime>
      </form-item>
      <el-checkbox class="task-planTime-notice" v-model="sendSMS" v-if="action == 'modifyPlanTime'">发送短信预约通知</el-checkbox>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取 消</el-button>
      <el-button type="primary" @click="submit" :disabled="pending">{{ action === 'acceptFromPool' ? '接 单' : '确 定' }}</el-button>
    </div>
  </base-modal>
</template>

<script>
/* api */
import * as TaskApi from '@src/api/TaskApi';

export default {
  name: 'plantime-dialog',
  props: {
    task: {
      type: Object,
      default: () => ({})
    },
    initData: {
      type: Object,
      default: () => ({})
    },
    field: {
      type: Object,
      default: () => ({})
    }
  },
  data: () => {
    return {
      visible: false,
      pending: false,
      action: '',
      planTime: '',
      sendSMS: false
    }
  },
  computed: {
    dateType() {
      return this.field.setting.dateType;
    }
  },
  methods: {
    update({ field, newValue, oldValue }) {
      this.$set(this, 'planTime', newValue);
    },
    async openDialog(action) {
      let planTime = this.task.planTime || '';

      // 计划时间格式为日期时需格式化
      if (this.dateType == 'date' && planTime) {
        planTime = planTime.slice(0, 10);
      }
      this.planTime = planTime;

      // 工单设置禁用了修改计划时间并且有计划时间
      if (!this.initData.taskConfig.taskPlanTime && planTime) {

        // 上边已经对格式为日期时格式化了，现禁止修改计划时间，所以初始化为原始值
        if (this.dateType == 'date') this.planTime = this.task.planTime;

        this.submit(false);
        return;
      }
      
      this.action = action;
      this.sendSMS = false;

      this.visible = true;
    },
    submit(modifiable = true) {
      if (modifiable && !this.planTime) return this.$platform.alert('请填写计划时间');

      let newPlanTime = this.planTime;
      if(this.dateType == 'date') newPlanTime += ' 00:00:00';

      let params = { taskId: this.task.id, newPlanTime };

      // 修改计划时间时参数
      if (this.action == 'modifyPlanTime') {
        params.planTime = newPlanTime;
        params.sendSMS = this.sendSMS;
        delete params.newPlanTime;
      }

      this.pending = true;

      TaskApi[this.action](params).then(res => {
        if (res.success) {
          let fromId = window.frameElement.getAttribute('fromid');
          this.$platform.refreshTab(fromId);

          window.location.reload();
        } else {
          this.$platform.alert(res.message);
          this.pending = false;
        }
      }).catch(err => {
        this.pending = false;
      })
    }
  }
}
</script>

<style lang="scss">
.task-plantime-dialog {
  .form-item {
    margin-bottom: 6px;

    & > label {
      width: auto !important;
      padding-left: 0;
      margin-right: 20px;
    }
  }

  .task-planTime-notice {
    margin-bottom: 0;
  }
}
</style>
