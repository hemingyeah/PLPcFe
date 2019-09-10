<template>
  <base-modal title="发起审批" :show.sync="visible" width="600px" class="request-approve-performance-modal" @closed="reset" @cancel="cancel">

    <el-form ref="form" :rules="rules" :model="form" v-if="init">
      <el-form-item prop="remark">
        <el-input type="textarea" v-model="form.remark" resize="none" :maxlength="500" rows="3" placeholder="请输入审批说明[必填 最多500字]"></el-input>
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="visible = false;cancel()">取 消</el-button>
      <el-button type="primary" @click="onSubmit" :disabled="pending" >确 定</el-button>
    </div>
  </base-modal>
</template>

<script>
export default {
  name: 'request-approve',
  props: {
    shareData: {
      type: Object,
      default: () => ({})
    },
    callBack: {
      type: Function,
      default: () => ({}),
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
      this.pending = false;
      this.init = true;
      this.visible = true;
    },
    close () {
      this.visible = false;
    },
    onSubmit() {

      this.$refs.form.validate(res => {

        if (!res) return;

        this.pending = true;
        this.$emit('createApprove', this.form.remark)
      })
    },
    reset() {
      this.form.remark = '';
      this.init = false;
      
    },
    cancel () {
      this.$emit('reset');
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
      padding: 15px 30px;
    }

    .dialog-footer {
      text-align: right;
    }

    .el-form-item {
      margin-bottom: 0;
    }
  }
</style>