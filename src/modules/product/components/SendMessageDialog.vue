<template>
  <base-modal title="发送短信" :show.sync="sendMessageDialog" width="600px"
              class="send-message-to-customer-dialog">
    <el-form ref="form" :model="form" label-width="100px">
      <el-form-item label="接收人">
        <el-radio-group v-model="form.isAllLm" @change="fetchCount" :disabled="pending">
          <el-radio label="0" :style="{ width: '120px'}">默认联系人</el-radio>
          <!-- <el-radio label="1" :style="{ width: '120px'}">全部联系人</el-radio> -->
        </el-radio-group>
      </el-form-item>
      <el-form-item label="选择短信模板">
        <el-select v-model="form.smsTemplateId" placeholder="请选择短信模板" style="width: 220px">
          <el-option v-for="item in messageTemplate" :label="item.name" :value="item.id" :key="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="模板内容">
        <el-input type="textarea" v-model="template" rows="5" resize="none"></el-input>
      </el-form-item>
      <el-form-item label="发送时间" :error="error">
        <el-date-picker
          v-model="form.sendTime"
          type="datetime"
          placeholder="选择日期时间"
          :picker-options="datePickerOption"
          default-time="12:00:00">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <p>本次发送：合计共{{count}}个</p>
        <p>当前短信余额：{{smsRest}}条</p>
        <p>如需查看发送记录请到系统管理-短信设置-发送记录查询</p>
        <p>一次性发送100条以上时将会因审核略有延迟，100条以下则无需审核</p>
        <p>发送结果请到系统管理-短信消息设置中查看</p>
      </el-form-item>
    </el-form>
    <div class="dialog-footer">
      <el-button @click="sendMessageDialog = false">取 消</el-button>
      <el-button type="primary" @click="onSubmit" :disabled="pending">确 定</el-button>
    </div>

  </base-modal>
</template>

<script>
import { formatDate, } from '@src/util/lang';
import {
  sendSmsBatch,
  computeSendNumForProduct,
} from '@src/api/ProductApi';
import {
  getSmsTemplate,
} from '@src/api/CommonApi';

export default {
  name: 'send-message-dialog',
  data: () => {
    return {
      form: {
        smsTemplateId: '',
        type: '',
        isAllLm: '0',
        sendTime: new Date(),
      },
      count: 0,
      sendMessageDialog: false,
      pending: false,
      messageTemplate: [],
      datePickerOption: {
        disabledDate(time) {
          return time.getTime() < Date.now();
        },
      },
      error: '',
    }
  },
  props: {
    selectedIds: {
      type: Array,
      default: () => ([]),
    },
    smsRest: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    template() {
      return this.messageTemplate.filter(t => t.id === this.form.smsTemplateId)
        .map(t => t.allowContent).join('');
    },
  },
  mounted() {
    this.buildParams();
  },
  methods: {
    onSubmit() {
      if (!this.form.sendTime) {
        return this.error = '请选择有效的发送时间';
      } 
      this.error = '';

      const params = this.buildParams();
      const maxCount = 100;

      if(params.type == '1' && this.count < maxCount) {
        return this.$platform.alert(`营销类型模板单次短信达${maxCount}条才可以发送`);
      }

      this.pending = true;

      sendSmsBatch(params)
        .then(res => {
          this.pending = false;
          if (res.status) return this.$platform.notification({
            title: '失败',
            type: 'error',
            message: res.message || '批量发送短信失败',
          });

          this.sendMessageDialog = false;

          this.$platform.notification({
            title: '成功',
            type: 'success',
            message: '批量发送短信成功',
          });
        })
        .catch(err => {
          this.pending = false;
          console.error('sendSmsBatch err', err);
        })
    },
    openSendMessageDialog() {
      if (!this.selectedIds.length) {
        return this.$platform.alert('请选择需要批量发送短信的产品');
      }
      this.sendMessageDialog = true;
      this.form.sendTime = new Date();
      this.fetchCount();
      this.fetchTemplate();
    },
    fetchCount() {
      this.pending = true;
      computeSendNumForProduct({
        ids: this.selectedIds,
        isAllLm: this.form.isAllLm,
      })
        .then(res => {
          this.count = res.data || 0;
          this.pending = false;
        })
        .catch(err => {
          this.pending = false;
          console.error('fetchCount err', err);
        })
    },
    fetchTemplate() {
      if (this.messageTemplate.length) return;
      getSmsTemplate()
        .then(res => {
          if (res.status) {
            return this.$platform.notification({
              title: '获取短信模板失败',
              type: 'error',
            });
          }
          this.messageTemplate = (res.data.list || [])
            .filter(t => (t.notice === '自定义通知' || t.type == 1) && t.status === 'pass_approval');
          if (this.messageTemplate.length) {
            this.form.smsTemplateId = this.messageTemplate[0].id;
          }

        })
        .catch(err => {
          console.error('fetchTemplate', err);
          this.$platform.notification({
            title: '获取短信模板发生错误',
            type: 'error',
          });
        })
    },
    buildParams() {
      const {smsTemplateId, isAllLm, sendTime, } = this.form;

      const chooseTemplate = this.messageTemplate.filter(template => template.id == smsTemplateId);

      const type = chooseTemplate.length ? (chooseTemplate[0].type || '') : '';

      return {
        smsTemplateId,
        isAllLm,
        type,
        sendTime: formatDate(sendTime, 'YYYY-MM-DD HH:mm:ss'),
        ids: this.selectedIds.join(','),
      }
    },
  },
}
</script>

<style lang="scss">
  .send-message-to-customer-dialog {

    .base-modal-body {
      padding: 0 0 20px;
    }

    .el-form {
      padding: 0 30px;
      .el-form-item {
        margin: 10px 0;
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
      padding: 10px 30px 0;
    }
  }

</style>
