<template>
  <base-modal title="发起审批" :show.sync="visible" width="600px" class="request-approve-performance-modal" @closed="reset">

    <p class="approver-list">
      <label>审批人：</label>
      {{shareData.reviewers}}
    </p>
    <el-form ref="form" :rules="rules" :model="form" v-if="init">
      <el-form-item prop="remark">
        <el-input type="textarea" v-model="form.remark" resize="none" :maxlength="500" rows="3" placeholder="请输入审批说明[必填 最多500字]"></el-input>
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取 消</el-button>
      <el-button type="primary" @click="onSubmit" :disabled="pending" >确 定</el-button>
    </div>
  </base-modal>
</template>

<script>
import {submitApprove} from '@src/api/PerformanceApi';

export default {
  name: 'request-approve',
  props: {
    shareData: {
      type: Object,
      default: () => ({})
    },
    callBack: {
      type: Function,
      default: () => {},
    }
  },
  data() {
    return {
      visible: false,
      pending: false,
      init: false,
      form: {
        remark: '',
      },
      rules: {
        remark: [
          { required: true, message: '请输入审批说明', trigger: 'blur' },
          { max: 500, message: '最多 500 个字符', trigger: 'blur' }
        ],
      }
    }
  },
  methods: {
    open() {
      this.init = true;
      this.visible = true;
    },
    onSubmit() {

      this.$refs.form.validate(res => {

        if (!res) return;

        this.pending = true;
        submitApprove({
          applyRemark: this.form.remark,
          reportId: this.shareData.reportId,
        })
          .then(res => {

            this.pending = false;

            if (res.status) return this.$platform.notification({
              title: '提交审批失败',
              message: res.message || '',
              type: 'error',
            });

            // this.callBack && this.callBack(1);
            this.visible = false;

            this.$platform.notification({
              title: '提交审批成功',
              type: 'success',
            });

            return window.location.reload()
          })
          .catch(e => console.error('e', e));
      })
    },
    reset() {
      this.form.remark = '';
      this.init = false;
    }
  },
}
</script>

<style lang="scss">
  .request-approve-performance-modal {

    .approver-list {
      margin: 0;
      line-height: 30px;
      margin-top: 15px;
      label {
        margin: 0;
      }
    }

    .base-modal-body {
      padding: 0 30px;
    }

    .dialog-footer {
      text-align: right;
    }
  }
</style>