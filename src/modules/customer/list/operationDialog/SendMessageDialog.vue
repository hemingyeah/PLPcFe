<template>
  <!--<el-dialog title="发送短信" :visible.sync="sendMessageDialog" width="700px" custom-class="send-message-to-customer-dialog">-->
    <!--<el-form ref="form" :model="form" label-width="100px">-->
      <!--<el-form-item label="接收人">-->
        <!--<el-radio-group v-model="form.resource">-->
          <!--<el-radio label="默认联系人"></el-radio>-->
          <!--<el-radio label="全部联系人"></el-radio>-->
        <!--</el-radio-group>-->
      <!--</el-form-item>-->
      <!--<el-form-item label="选择短信模板">-->
        <!--<el-select v-model="form.region" placeholder="请选择短信模板">-->
          <!--<el-option v-for="item in messageTemplate" :label="item.label" :value="item.value" :key="item.value"></el-option>-->
        <!--</el-select>-->
      <!--</el-form-item>-->
      <!--<el-form-item label="模板内容">-->
        <!--<el-input type="textarea" v-model="form.desc"></el-input>-->
      <!--</el-form-item>-->
      <!--<el-form-item label="发送时间">-->
        <!--<el-col :span="11">-->
          <!--<el-date-picker type="date" placeholder="选择日期" v-model="form.date1" style="width: 100%;"></el-date-picker>-->
        <!--</el-col>-->
        <!--<el-col class="line" :span="2">-</el-col>-->
        <!--<el-col :span="11">-->
          <!--<el-time-picker type="fixed-time" placeholder="选择时间" v-model="form.date2" style="width: 100%;"></el-time-picker>-->
        <!--</el-col>-->
      <!--</el-form-item>-->
      <!--<el-form-item>-->
        <!--<p>本次发送：合计共{{selectedCustomer.length}}个</p>-->
        <!--<p>当前短信余额：6759条</p>-->
        <!--<p>如需查看发送记录请到系统管理-短信设置-发送记录查询</p>-->
        <!--<p>一次性发送100条以上时将会因审核略有延迟，100条以下则无需审核</p>-->
      <!--</el-form-item>-->
    <!--</el-form>-->
    <!--<div slot="footer" class="dialog-footer">-->
      <!--<el-button @click="sendMessageDialog = false">取 消</el-button>-->
      <!--<el-button type="primary" @click="onSubmit" :disabled="pending">确 定</el-button>-->
    <!--</div>-->
  <!--</el-dialog>-->
 <!---->
  <base-modal title="发送短信" :visible.sync="sendMessageDialog" width="700px" custom-class="send-message-to-customer-dialog">
    <el-form ref="form" :model="form" label-width="100px">
      <el-form-item label="接收人">
        <el-radio-group v-model="form.resource">
          <el-radio label="默认联系人"></el-radio>
          <el-radio label="全部联系人"></el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="选择短信模板">
        <el-select v-model="form.region" placeholder="请选择短信模板">
          <el-option v-for="item in messageTemplate" :label="item.label" :value="item.value" :key="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="模板内容">
        <el-input type="textarea" v-model="form.desc"></el-input>
      </el-form-item>
      <el-form-item label="发送时间">
        <el-col :span="11">
          <el-date-picker type="date" placeholder="选择日期" v-model="form.date1" style="width: 100%;"></el-date-picker>
        </el-col>
        <el-col class="line" :span="2">-</el-col>
        <el-col :span="11">
          <el-time-picker type="fixed-time" placeholder="选择时间" v-model="form.date2" style="width: 100%;"></el-time-picker>
        </el-col>
      </el-form-item>
      <el-form-item>
        <p>本次发送：合计共{{selectedCustomer.length}}个</p>
        <p>当前短信余额：6759条</p>
        <p>如需查看发送记录请到系统管理-短信设置-发送记录查询</p>
        <p>一次性发送100条以上时将会因审核略有延迟，100条以下则无需审核</p>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="sendMessageDialog = false">取 消</el-button>
      <el-button type="primary" @click="onSubmit" :disabled="pending">确 定</el-button>
    </div>

  </base-modal>
</template>

<script>
  import BaseModal from '../../../../component/common/BaseModal';

  export default {
    name: "send-message-dialog",
    data: () => {
      return {
        form: {
          name: '',
          region: '',
          date1: '',
          date2: '',
          delivery: false,
          type: [],
          resource: '',
          desc: ''
        },
        sendMessageDialog: false,
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
      openSendMessageDialog() {
        if (!this.selectedCustomer.length) {
          return this.$platform.alert('请选择需要批量发送短信的客户');
        }
        this.sendMessageDialog = true;
      },
      onSubmit() {
        console.log('submit!');
      }
    },
    components: {
      [BaseModal.name]: BaseModal,
    }
  }
</script>

<style lang="scss">
  .send-message-to-customer-dialog {

    .el-dialog__body {
      padding-top: 0;
      padding-bottom: 0;
      .el-form-item {
        /*line-height: 40px;*/
        margin-bottom: 10px;

      }
      .el-radio {
        line-height: 32px;
      }
      .line {
        text-align: center;
      }
      p {
        margin: 0;
        line-height: 24px;
      }
    }

  }

</style>