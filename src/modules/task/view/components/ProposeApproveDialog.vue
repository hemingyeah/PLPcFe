<template>
  <base-modal title="该操作需要审批" :show.sync="visible" width="700px" class="task-need-approve-dialog">
    <div class="base-modal-content">
      <div class="form-item">
        <label><span class="form-item-required" v-if="chooseApprover">*</span>审批人：</label>
        <div class="form-item-control">
          <form-user
            v-if="chooseApprover"
            :field="{ displayName: '审批人' }"
            v-model="approver"
            :see-all-org="true"
            placeholder="请选择审批人"
          />
          <template v-else>{{approversName}}</template>
        </div>
      </div>
      <div class="form-item">
        <label><span class="form-item-required" v-if="remarkRequired">*</span>审批说明：</label>
        <div class="form-item-control">
          <textarea v-model="apprForm.applyRemark" :placeholder="remarkPlaceholder" rows="3" maxlength="500" />
        </div>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取 消</el-button>
      <el-button type="primary" @click="submit" :disabled="pending">提 交</el-button>
    </div>
  </base-modal>
</template>

<script>
/* api */
import * as TaskApi from '@src/api/TaskApi.ts';

export default {
  name: 'propose-approve-dialog',
  props: {
    approveId: {
      type: String,
      default: '',
    },
    remarkRequired: {
      type: Boolean,
      default: false
    },
    taskId: {
      type: String,
      default: '',
    }
  },
  data: () => {
    return {
      visible: false,
      pending: false,
      chooseApprover: false,
      apprForm: {},
      approver: {},
      approversName: ''
    }
  },
  computed: {
    remarkPlaceholder() {
      return `请输入审批说明[最多500字]${this.remarkRequired ? '[必填]' : '[选填]'}`;
    }
  },
  methods: {
    openDialog(data) {
      // 重置
      this.approver = {};
      this.apprForm = { source: 'task' };
      this.apprForm.params = data;
      this.apprForm.applyRemark = '';
      this.chooseApprover = false;

      if (data.isOpt == 1) {
        this.chooseApprover = true;
      } else {
        this.approversName = data.approversName;
      }

      this.visible = true;
    },
    submit() {
      // 审批人由发起人选择时
      if (this.chooseApprover && !this.approver.userId) return this.$platform.alert('请选择审批人');

      // 审批说明必填校验
      if (!this.apprForm.applyRemark && this.remarkRequired) return this.$platform.alert('请填写审批说明');

      if (this.chooseApprover) this.apprForm.params.approveId = this.approver.userId;

      this.pending = true;

      TaskApi.applyApprove(this.apprForm).then(res => {
        if (res.status == 0) {
          this.$platform.alert('已发起审批，请等待审批结果，结果会以钉钉消息的方式通知');
          this.$emit('success')
          window.location.href = `/task/view/${this.taskId}`;
        } else {
          this.$platform.alert(res.message);
          this.pending = false;
        }
      }).catch(err => {
        this.pending = false;
      })
    },

  }
}
</script>

<style lang="scss">
.task-need-approve-dialog {
  .form-item {
    margin-bottom: 10px;
    align-items: baseline;
  }
}
</style>
