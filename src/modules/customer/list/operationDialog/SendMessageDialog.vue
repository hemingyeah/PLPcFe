<template>
  <base-modal title="发送短信" :show.sync="sendMessageDialog" width="600px" class="send-message-to-customer-dialog">
    <el-form ref="form" :model="form" label-width="100px">
      <el-form-item label="接收人">
        <el-radio-group v-model="form.isAllLm" @change="fetchCount">
          <el-radio label="0" :style="{ width: '120px'}">默认联系人</el-radio>
          <el-radio label="1" :style="{ width: '120px'}">全部联系人</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="选择短信模板">
        <el-select v-model="form.smsTemplateId" placeholder="请选择短信模板">
          <el-option v-for="item in messageTemplate" :label="item.name" :value="item.id" :key="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="模板内容">
        <el-input type="textarea" v-model="template"></el-input>
      </el-form-item>
      <el-form-item label="发送时间">
        <el-col :span="11">
          <el-date-picker type="date" placeholder="选择日期" v-model="form.sendDate" style="width: 100%;"></el-date-picker>
        </el-col>
        <el-col class="line" :span="2">-</el-col>
        <el-col :span="11">
          <el-time-picker type="fixed-time" placeholder="选择时间" v-model="form.sendTime" style="width: 100%;"></el-time-picker>
        </el-col>
      </el-form-item>
      <el-form-item>
        <p>本次发送：合计共{{selectedCustomer.length}}个</p>
        <p>当前短信余额：{{displayCount}}条</p>
        <p>如需查看发送记录请到系统管理-短信设置-发送记录查询</p>
        <p>一次性发送100条以上时将会因审核略有延迟，100条以下则无需审核</p>
      </el-form-item>
    </el-form>
    <div class="dialog-footer">
      <el-button @click="sendMessageDialog = false">取 消</el-button>
      <el-button type="primary" @click="onSubmit" :disabled="pending">确 定</el-button>
    </div>

  </base-modal>
</template>

<script>
  import BaseModal from '../../../../component/common/BaseModal';
  import { formatDate, } from '../../../../util/lang';

  export default {
    name: "send-message-dialog",
    data: () => {
      return {
        form: {
          smsTemplateId: '',
          isAllLm: '0',
          sendDate: new Date(),
          sendTime: new Date(),
        },
        count: {
          default: {
            value: 0,
            loaded: false,
          },
          all: {
            value: 0,
            loaded: false,
          },
        },
        sendMessageDialog: false,
        pending: false,
        messageTemplate: []
      }
    },
    props: {
      selectedCustomer: {
        type: Array,
        default: () => ([]),
      },
    },
    computed: {
      template() {
        return this.messageTemplate.filter(t => t.id === this.form.smsTemplateId)
          .map(t => t.allowContent).join('');
      },
      selectedIds() {
        return this.selectedCustomer.map(c => c.id);
      },
      needFetchCount() {
        if (this.form.isAllLm === '0' && this.count.default.loaded) {
          return false;
        }
        if (this.form.isAllLm === '1' && this.count.all.loaded) {
          return false;
        }
        return true;
      },
      displayCount() {
        if (this.form.isAllLm === '0') {
          return this.count.default.value;
        } else {
          return this.count.all.value;
        }
      }
    },
    mounted() {
      this.fetchTemplate();
      this.buildParams();
    },
    methods: {
      onSubmit() {
        const params = this.buildParams();
        this.pending = true;

        console.log('params', params);
        this.$http.post('/customer/sendSmsBatch', params)
          .then(res => {
            console.log('res', res);
            this.pending = false;
            this.sendMessageDialog = false;
            this.$platform.alert('批量发送短信成功');
          })
          .catch(err => {
            this.pending = false;
            console.error('sendSmsBatch err', err);
          })
      },
      openSendMessageDialog() {
        console.log('openSendMessageDialog');
        if (!this.selectedCustomer.length) {
          return this.$platform.alert('请选择需要批量发送短信的客户');
        }
        this.sendMessageDialog = true;
        this.fetchCount();
      },
      fetchCount() {
        if (!this.needFetchCount) return;
        const params = {
          ids: this.selectedIds,
          isAllLm: this.form.isAllLm,
        };
        this.$http.get('/customer/computeSendNum', params)
          .then(res => {
            if (this.form.isAllLm === '0') {
              this.count.default.value = res.data;
              this.count.default.loaded = true;
            } else {
              this.count.all.value = res.data;
              this.count.all.loaded = true;
            }
          })
          .catch(err => {
            console.error('fetchCount err', err);
          })
      },
      fetchTemplate() {
        this.$http.get('/vipsms/getTemplates', { pageSize:'100', pageNum:'1', })
          .then(res => {
            console.log('res', res);
            if (res.status !== 0) return;
            this.messageTemplate = res.data.list;
            if (this.messageTemplate.length) {
              this.form.smsTemplateId = this.messageTemplate[0].id;
            }

          })
          .catch(err => {
            console.error('fetchTemplate', err);
          })
      },
      buildParams() {
        const { smsTemplateId, isAllLm, sendDate, sendTime, } = this.form;
        const formData = new FormData();
        const date = formatDate(sendDate, 'YYYY-MM-DD');
        const time = formatDate(sendTime, 'HH:mm:ss');

        formData.set('smsTemplateId', smsTemplateId);
        formData.set('isAllLm', isAllLm);
        formData.set('sendTime', `${date} ${time}`);
        formData.set('ids', this.selectedIds);

        return formData;
      }
    },
    components: {
      [BaseModal.name]: BaseModal,
    }
  }
</script>

<style lang="scss">
  .send-message-to-customer-dialog {

    .base-modal-body {
      padding: 0 15px 20px;
    }

    .el-form {
      .el-form-item {
        margin: 10px 0;
        width: 94%;
      }

      label {
        margin: 0;
        font-weight: normal;
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

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      padding-right: 50px;
    }
  }

</style>