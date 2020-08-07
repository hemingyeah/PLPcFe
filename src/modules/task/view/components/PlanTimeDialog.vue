<template>
  <base-modal title="调整计划时间" :show.sync="visible" width="500px" class="task-plantime-dialog">
    <div class="base-modal-content">
      <form-item :label="field.displayName">
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
      return this.initData.planTimeType;
    },
    field() {
      return {
        displayName: '计划时间',
        fieldName: 'planTime',
        formType: 'planTime',
        isNull: 1,
        isSystem: 1,
        placeHolder: this.initData.planTimePlaceholder,
        setting: {
          dateType: this.dateType
        }
      }
    }
  },
  methods: {
    update({ field, newValue, oldValue }) {
      this.$set(this, 'planTime', newValue);
    },
    async openDialog(action) {
      try {
        this.action = action;

        let planTime = this.task.planTime || '';

        // 修改计划时间时直接显示弹窗
        if (action === 'modifyPlanTime') {
          this.planTime = planTime;
          this.sendSMS = false;
          this.visible = true;
          return;
        }

        // 从工单池接单或者接受工单前需要判断附加组件
        let result = await TaskApi.checkNotNullForCard({id: this.task.id, flow: 'accept'});
        if (result.status != 0) return this.$platform.alert(result.message);

        // 计划时间格式为日期时需格式化
        if (this.dateType == 'date' && planTime) {
          planTime = planTime.slice(0, 10) + ' 00:00:00';
        }
        this.planTime = planTime;

        // 工单设置禁用了修改计划时间并且有计划时间
        if (!this.initData.taskConfig.taskPlanTime && planTime) return this.submit(false);
        
        this.visible = true;
      } catch (e) {
        console.error("taskpool or accept openDialog error", e);
      }
    },
    submit(change = true) {
      if (change && !this.planTime) return this.$platform.alert('请填写计划时间');

      let params = {id: this.task.id, planTime: this.planTime};
      if (this.action == 'modifyPlanTime') {
        params.taskId = this.task.id;
        params.sendSMS = this.sendSMS;
        delete params.id;
      }

      this.pending = true;

      TaskApi[this.action](params).then(res => {
        if (res.status == 0) {
          let fromId = window.frameElement.getAttribute('fromid');
          this.$platform.refreshTab(fromId);

          window.location.reload();
        } else {
          this.$platform.alert(res.message);
          this.pending = false;
        }
      }).catch(err => {
        this.pending = false;
        console.log(err)
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
