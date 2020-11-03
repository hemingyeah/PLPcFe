<template>
  <base-modal title="调整计划时间" :show.sync="visible" width="500px" class="task-plantime-dialog">
    <div class="base-modal-content">
      <form-item :label="field.displayName" v-if="field.id">
        <form-plantime :picker-options="planTimeDatePickeroptions" :field="field" :value="planTime" @update="update"></form-plantime>
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
import * as TaskApi from "@src/api/TaskApi.ts";

/* util */
import DateUtil from "@src/util/date";

export default {
  name: "plantime-dialog",
  props: {
    task: {
      type: Object,
      default: () => ({})
    },
    field: {
      type: Object,
      default: () => ({})
    },
    modifiable: { // 工单设置修改计划时间开关
      type: Boolean,
      default: true
    }
  },
  data: () => {
    return {
      visible: false,
      pending: false,
      action: "",
      planTime: "",
      sendSMS: false,
      planTimeDatePickeroptions: {
        disabledDate(time) {
          return time.getTime() < new Date(new Date().toLocaleDateString()).getTime()
        }
      }
    }
  },
  computed: {
    dateType() {
      return this.field.setting.dateType;
    }
  },
  methods: {
    /**
    * @description 更新计划时间
    */
    update({ field, newValue, oldValue }) {
      this.$set(this, "planTime", newValue);
    },
    /**
    * @description 打开计划时间弹窗
    */
    async openDialog(action) {
      this.action = action;

      let planTime = this.task.planTime || "";

      // 计划时间格式为日期时需格式化
      if (this.dateType == "date" && planTime) {
        planTime = planTime.slice(0, 10);
      }
      this.planTime = planTime;

      // 工单设置禁用了修改计划时间并且有计划时间
      if (!this.modifiable && planTime) {

        // 上边已经对格式为日期时格式化了，现禁止修改计划时间，所以初始化为原始值
        if (this.dateType == "date") this.planTime = this.task.planTime;

        this.submit();
        return;
      }

      this.sendSMS = false;
      this.visible = true;
    },
    submit() {
      if (!this.planTime) return this.$platform.alert("请填写计划时间");

      // 校验计划时间是否早于当前时间
      if (this.dateType == "dateTime") {
        let planTime = DateUtil.parseDateTime(this.planTime).getTime();
        let nowTime = new Date().getTime();
        
        if (planTime < nowTime) return this.$platform.alert("计划时间不能早于现在");
      }

      let newPlanTime = this.planTime;
      if(this.dateType == "date") newPlanTime += " 00:00:00";

      let params = { taskId: this.task.id, newPlanTime };

      // 修改计划时间时参数
      if (this.action == "modifyPlanTime") {
        params.planTime = newPlanTime;
        params.sendSMS = this.sendSMS;
        delete params.newPlanTime;
      }

      if (this.pending) return;
      this.pending = true;

      TaskApi[this.action](params).then(res => {
        if (res.success) {
          let fromId = window.frameElement.getAttribute("fromid");
          // this.$platform.refreshTab(fromId);

          window.location.href = `/task/view/${this.task.id}`;
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
