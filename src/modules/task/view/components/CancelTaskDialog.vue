<template>
  <base-modal title="取消说明" :show.sync="visible" width="700px" class="task-cancel-dialog">
    <div class="base-modal-content">
      <template v-if="showWithPart">
        <div class="form-item">
          <label :class="{'form-item-required': goBackError}">
            <span class="form-item-required">*</span>
            工单中有已经使用的备件或服务项目，是否做退回处理？
          </label>
          <div class="form-item-control">
            <el-radio-group v-model="isGoBack" @change="change">
              <el-radio label="1">是</el-radio>
              <el-radio label="0">否</el-radio>
            </el-radio-group>
            <span class="form-item-required" v-if="goBackError">必选</span>
          </div>
        </div>
        <p class="tips">如果选择“是”则退回原备件或服务项目使用记录；如果选择“否”则保持原有使用记录的状态</p>
      </template>
      <template v-else-if="errorWithPart">
        <p>获取工单的结算单失败，无法判断工单是否添加了备件，确定取消工单？</p>
      </template>

      <textarea v-model="remark" placeholder="请输入取消说明[最多500字][必填]" rows="3" maxlength="500" />
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取 消</el-button>
      <el-button type="primary" @click="submit" :disabled="pending">确 定</el-button>
    </div>
  </base-modal>
</template>

<script>
/* api */
import * as TaskApi from '@src/api/TaskApi';

export default {
  name: 'cancel-task-dialog',
  props: {
    taskId: {
      type: String,
      default: '',
    },
    unFinished: {
      type: Boolean
    }
  },
  data: () => {
    return {
      visible: false,
      pending: false,
      showWithPart: false,
      errorWithPart: false,
      goBackError: false,
      remark: '',
      isGoBack: ''
    }
  },
  methods: {
    change(val) {
      if (val) this.goBackError = false;
    },
    buildParams() {
      let content = {updateType: 'tRecord', updateContent: this.remark};
      let task = {id: this.taskId};

      if (this.showWithPart) content.isGoBack = this.isGoBack;

      return {
        content,
        task
      }
    },
    reset() {
      this.showWithPart = false;
      this.errorWithPart = false;
      this.goBackError = false;
      this.remark = '';
      this.isGoBack = '';
    },
    async openDialog() {
      if (this.pending) return;
      this.pending = true;

      // 重置
      this.reset();

      try {
        /** 
        * 如果工单为未完成状态，则需要判断工单是否曾回退，而且在最后一次完成时是否使用了备件
        * 如果使用了备件，需要提示
        */
        if (this.unFinished) {
          const res = await TaskApi.taskFilterWithPart({ taskIds: this.taskId });
          if (res.status == 1) {
            this.errorWithPart = true;
          } else if (res.status == 0 && res.data.length > 0) {
            this.showWithPart = true;
          }
        }

        this.pending = false;
        this.visible = true;

      } catch (e) {
        console.error('cancelTask error', e);
      }
    },
    submit() {
      // 工单如果使用了备件，则"是否做退回处理"必选
      if (this.showWithPart && !this.isGoBack) return this.goBackError = true;

      if (!this.remark) return this.$platform.alert('请填写取消说明');

      this.pending = true;

      const params = this.buildParams();
      TaskApi.cancelTask(params).then(res => {
        if (res.status == 0) {
          let fromId = window.frameElement.getAttribute('fromid');
          this.$platform.refreshTab(fromId);

          window.location.reload();
        } else {
          if (res.message == '需要审批') {
            // TODO：需要审批
            this.visible = false;
            this.$parent.$refs.proposeApprove.openDialog(res.data);
          } else {
            this.$platform.alert(res.message);
          }
          
          this.pending = false;
        }
      }).catch(err => {
        this.pending = false;
        console.log(err)
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
