<template>
  <el-dialog title="批量编辑" :visible.sync="batchEditingCustomerDialog" width="600px" custom-class="batch-editing-customer-dialog">
    <el-form ref="form" :rules="rules" :model="form" label-width="100px">
      <el-form-item label="修改字段">
        <el-select v-model="form.region" placeholder="请选择短信模板">
          <el-option v-for="item in messageTemplate" :label="item.label" :value="item.value" :key="item.value"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="修改为">
        <el-input v-model="form.name" placeholder="[最多50字]"></el-input>
      </el-form-item>

    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="batchEditingCustomerDialog = false">取 消</el-button>
      <el-button type="primary" @click="onSubmit" :disabled="pending">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  export default {
    name: "batch-editing-customer-dialog",
    data: () => {
      return {
        form: {
          name: '',
          region: '',
        },
        rules: {
          name: [
            {required: true, message: '请输入活动名称', trigger: 'blur'},
            {min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur'}
          ],
        },
        batchEditingCustomerDialog: false,
        pending: false,
        messageTemplate: [{
          label: '节日问候',
          value: '1',
        }, {
          label: '服务到期提醒',
          value: '2',
        }]
      }
    },
    props: {
      selectedCustomer: {
        type: Array,
        default: () => ([]),
      },
    },
    methods: {
      openBatchEditingCustomerDialog() {
        if (!this.selectedCustomer.length) {
          return this.$platform.alert('请选择需要批量编辑的客户');
        }
        this.batchEditingCustomerDialog = true;
      },
      onSubmit() {
        console.log('submit!');
      }
    }
  }
</script>

<style lang="scss">

  .batch-editing-customer-dialog {
    .el-dialog__body {
      padding-top: 0;
      padding-bottom: 0;
    }
  }

</style>