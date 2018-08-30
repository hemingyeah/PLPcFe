<template>
  <el-dialog title="添加提醒" :visible.sync="batchRemindingCustomerDialog" width="600px" custom-class="batch-remind-customer-dialog">
    <el-form ref="form" :model="form" label-width="80px">

      <el-form-item label="选择提醒">
        <el-select v-model="form.region" placeholder="请选择短信模板">
          <el-option v-for="item in messageTemplate" :label="item.label" :value="item.value" :key="item.value"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="提醒内容">
        <!--<el-input v-model="form.name"></el-input>-->
        测试
      </el-form-item>
      <el-form-item label="提醒规则">
        重复通知：根据1次保养时间后1小时，每1天发出提醒
      </el-form-item>
      <el-form-item label="通知人">
        <!--重复通知：根据1次保养时间后1小时，每1天发出提醒-->
        <el-select
          v-model="value9"
          multiple
          filterable
          remote
          reserve-keyword
          placeholder="请输入关键词"
          :remote-method="remoteMethod"
          :loading="loading">
          <el-option
            v-for="item in options4"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>


    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="batchRemindingCustomerDialog = false">取 消</el-button>
      <el-button type="primary" @click="onSubmit" :disabled="pending">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  export default {
    name: "batch-reminding-customer-dialog",
    data: () => {
      return {
        form: {
          name: '',
          region: '',
        },
        batchRemindingCustomerDialog: false,
        pending: false,
        messageTemplate: [{
          label: '节日问候',
          value: '1',
        }, {
          label: '服务到期提醒',
          value: '2',
        }],
        options4: [],
        value9: [],
        list: [],
        loading: false,
        states: ["Alabama", "Alaska", "Arizona",
          "Arkansas", "California", "Colorado",
          "Connecticut", "Delaware", "Florida",
          "Georgia", "Hawaii", "Idaho", "Illinois",
          "Indiana", "Iowa", "Kansas", "Kentucky",
          "Louisiana", "Maine", "Maryland",
          "Massachusetts", "Michigan", "Minnesota",
          "Mississippi", "Missouri", "Montana",
          "Nebraska", "Nevada", "New Hampshire",
          "New Jersey", "New Mexico", "New York",
          "North Carolina", "North Dakota", "Ohio",
          "Oklahoma", "Oregon", "Pennsylvania",
          "Rhode Island", "South Carolina",
          "South Dakota", "Tennessee", "Texas",
          "Utah", "Vermont", "Virginia",
          "Washington", "West Virginia", "Wisconsin",
          "Wyoming"]
      }
    },
    props: {
      selectedCustomer: {
        type: Array,
        default: () => ([]),
      },
    },
    mounted() {
      this.list = this.states.map(item => {
        return { value: item, label: item };
      });
    },
    methods: {
      remoteMethod(query) {
        if (query !== '') {
          this.loading = true;
          setTimeout(() => {
            this.loading = false;
            this.options4 = this.list.filter(item => {
              return item.label.toLowerCase()
                .indexOf(query.toLowerCase()) > -1;
            });
          }, 200);
        } else {
          this.options4 = [];
        }
      },
      openBatchRemindingCustomerDialog() {
        if (!this.selectedCustomer.length) {
          return this.$platform.alert('请选择需要批量提醒的客户');
        }
        this.batchRemindingCustomerDialog = true;
      },
      onSubmit() {
        console.log('submit!');
      }
    }
  }
</script>

<style lang="scss">

  .batch-remind-customer-dialog {
    .el-dialog__body {
      padding-top: 0;
      padding-bottom: 0;
    }
  }

</style>