<template>
  <base-modal title="取消说明" :show.sync="visible" width="700px" class="task-cancel-dialog">
    <div class="base-modal-content">
      <template v-if="cancelModal.showWithPart">
        <div class="form-item">
          <label :class="{'form-item-required': !cancelModal.isGoBack && cancelModal.isRequired}">
            <span class="form-item-required">*</span>
            工单中有已经使用的备件或服务项目，是否做退回处理？
          </label>
          <div class="form-item-control">
            <el-radio-group v-model="cancelModal.isGoBack">
              <el-radio label="1">是</el-radio>
              <el-radio label="0">否</el-radio>
            </el-radio-group>
            <span class="form-item-required" v-if="!cancelModal.isGoBack && cancelModal.isRequired">必选</span>
          </div>
        </div>
        <p class="tips">如果选择“是”则退回原备件或服务项目使用记录；如果选择“否”则保持原有使用记录的状态</p>
      </template>
      <template v-else-if="cancelModal.errorWithPart">
        <p>获取工单的结算单失败，无法判断工单是否添加了备件，确定取消工单？</p>
      </template>

      <textarea v-model="cancelModal.reason" placeholder="请输入取消说明[最多500字][必填]" rows="3" maxlength="500" />
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取 消</el-button>
      <el-button type="primary" @click="submit" :disabled="pending">确 定</el-button>
    </div>
  </base-modal>
</template>

<script>
/* api */
import * as TaskApi from '@src/api/TaskApi.ts';

export default {
  name: 'cancel-task-dialog',
  props: {
    taskId: {
      type: String,
      default: '',
    }
  },
  data() {
    return {
      visible: false,
      pending: false,
      cancelModal: this.buildModalParams()
    }
  },
  methods: {
    buildParams() {
      let { showWithPart, isGoBack, reason } = this.cancelModal;

      let content = {updateType: 'tRecord', updateContent: reason};
      let task = {id: this.taskId};

      if (showWithPart) content.isGoBack = isGoBack;

      return {
        content,
        task
      }
    },
    buildModalParams() {
      return {
        showWithPart: false,
        errorWithPart: false,
        isRequired: false,
        reason: '',
        isGoback: ''
      }
    },
    async openDialog() {
      if (this.pending) return;
      this.pending = true;

      // 重置
      this.cancelModal = this.buildModalParams();

      try {
        // 需要判断工单是否曾回退，而且在最后一次完成时是否使用了备件
        const res = await TaskApi.finishedWithPart({ taskId: this.taskId });
        if (res.success) {
          this.cancelModal.showWithPart = res.result;
        } else {
          this.cancelModal.errorWithPart = true;
        }

        this.pending = false;
        this.visible = true;

      } catch (e) {
        console.error('cancelTask error', e);
      }
    },
    async submit() {
      let { showWithPart, isGoBack, reason } = this.cancelModal;
      
      // 工单如果使用了备件，则"是否做退回处理"必选
      if (showWithPart && !isGoBack) return this.cancelModal.isRequired = true;

      if (!reason.trim()) return this.$platform.alert('请填写取消说明');

      this.pending = true;

      // 取消是否需要审批
      const result = await TaskApi.offApproveCheck(this.buildParams());
      if (!result.succ && result.message == '需要审批') {
        this.$emit('proposeApprove', result.data);
        this.visible = false;
        this.pending = false;
        return;
      }

      const params = { taskId: this.taskId, reason };
      if (showWithPart) params.isGoBack = isGoBack;

      TaskApi.cancelTask(params).then(res => {
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
    },

  }
}
</script>

<style lang="scss">
.task-cancel-dialog {
  .form-item {
    margin-bottom: 6px;

    & > label {
      width: auto !important;
      padding-left: 0;
    }

    .form-item-control {
      label {
        width: auto !important;
        display: inline-block;
      }

      .el-radio-group {
        vertical-align: baseline;
      }
    }
  }
}
</style>
