<template>
  <base-modal title="添加提醒" :show.sync="batchRemindingCustomerDialog" width="500px" class="batch-remind-customer-dialog" @closed="reset">
    <el-form ref="form" :model="form" label-width="80px">

      <el-form-item label="选择提醒">
        <el-select v-model="form.remindId" placeholder="请选择提醒模板" @change="defaultUserOfDifferentSelectedRemind">
          <el-option v-for="item in remindTemplate" :label="item.name" :value="item.id" :key="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="提醒内容" class="content-item">
        {{selectedRemind.content}}
      </el-form-item>
      <el-form-item label="提醒规则">
        {{remindRule}}
      </el-form-item>
      <el-form-item label="通知人" prop="users">
        <template v-if="selectedRemind.isDdResponse">
          <base-select
            v-model="form.users"
            :remote-method="searchManager"
            @input="validateUser"
            multiple
            :error="error"
            placeholder="请选择通知人"
          ></base-select>
          <span style="display: inline-block; margin-top: 10px;">按角色：</span>
          <el-checkbox-group :value="sendRoleSetting" @input="change" style="display:inline">
            <el-checkbox label="sendToCustomerExecutor">客户负责人</el-checkbox>
            <el-checkbox label="sendToCustomerTag">客户所属服务团队</el-checkbox>
          </el-checkbox-group>
        </template>
        <template v-else>
          <el-radio-group v-model="form.isAllLm">
            <el-radio :label="0" style="width: 120px">客户默认联系人</el-radio>
            <el-radio :label="1" style="width: 120px">所有联系人</el-radio>
          </el-radio-group>
        </template>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="batchRemindingCustomerDialog = false">取 消</el-button>
      <el-button type="primary" @click="onSubmit" :disabled="pending">确 定</el-button>
    </div>
  </base-modal>
</template>

<script>
import _ from 'lodash';
import { getProductRemindTemplate } from '@src/api/ProductApi';
import * as CustomerApi from '@src/api/CustomerApi.ts'
import {batchCreateScheduler} from '@src/api/CommonApi';

export default {
  name: 'batch-reminding-dialog',
  data: () => {
    return {
      sendRoleSetting: [],
      remindTemplate: [],
      remoteSearchCM: {
        loading: false,
        options: [],
      },
      form: {
        ids: '',
        isAllLm: 0,
        remindId: null,
        users: [],
      },
      batchRemindingCustomerDialog: false,
      pending: false,
      error: false,
    }
  },
  props: {
    selectedIds: {
      type: Array,
      default: () => ([]),
    },
  },
  computed: {
    selectedRemind() {
      let info = this.remindTemplate.filter(rt => rt.id === this.form.remindId)[0] || {};
      this.initSelect(info);
      return info;
    },
    remindRule() {
      const {isRepeat, period, fieldDisplayName, isAhead, hours, periodUnit, timeUnit, } = this.selectedRemind;
      let unit = periodUnit === 'day' ? '天' : (periodUnit === 'week' ? '周' : '月');
      let isahead = isAhead ? '前' : '后';
      let dorh = (timeUnit == 'hour' || !timeUnit) ? '小时' : '天';

      if (!isRepeat){
        if(fieldDisplayName){
          return `单次通知：根据${fieldDisplayName + (isahead + hours) + dorh}提醒`;
        }
        return '无'
        
      }
      if(period){
        return `重复通知：根据${fieldDisplayName + (isahead + hours) + dorh}，每${period + unit}发出提醒`;
      }
      return '无'
        
      
    },
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    change (val) {
      this.sendRoleSetting = val;
      this.validateUser();
    },
    initSelect (info) {
      this.sendRoleSetting = [];
      if (info && info.sendToCustomerExecutor) this.sendRoleSetting.push('sendToCustomerExecutor');
      if (info && info.sendToCustomerTag) {
        this.sendRoleSetting.push('sendToCustomerTag')
      }
    },
    reset() {
      this.form = {
        ids: '',
        isAllLm: 0,
        remindId: null,
        users: [],
      };
    },
    validateUser() {
      if (!this.selectedRemind.isDdResponse) return this.error = false;
      if ((!this.form.users || !this.form.users.length) && this.sendRoleSetting.length == 0) {
        // 内部提醒
        return this.error = true;
      }
      return this.error = false;
    },
    async onSubmit() {
      if (this.validateUser()) return;

      const params = this.buildParams();
      this.pending = true;
      batchCreateScheduler(params)
        .then(res => {
          if (!res.status) {
            this.$platform.notification({
              title: '成功',
              type: 'success',
              message: '批量添加提醒成功',
            });
            // 更新 产品列表的提醒数量
            this.$eventBus.$emit('product_list.update_product_list_remind_count');
          }
          if (res.status === 1 && res.data) {
            this.$platform.notification({
              title: '批量添加提醒失败',
              type: 'error',
              message: (() => (<dl>
                <dt>以下产品已存在该提醒：</dt>
                {res.data.map(c => (<dd style="margin: 0">{c}</dd>))}
              </dl>))(),

            });
          }
          this.batchRemindingCustomerDialog = false;
          this.pending = false;
        })
        .catch(err => {
          this.$platform.notification({
            title: '失败',
            type: 'error',
            message: '批量添加提醒失败',
          });

          this.pending = false;
          console.error('post to /scheduler/buildBatch err', err)
        });
    },
    buildParams() {
      let params = {
        ids: this.selectedIds.join(','),
        remindId: this.form.remindId,
        sendRoleSetting: {},
      };

      if (this.selectedRemind.isDdResponse) {
        params.isAllLm = 0;
        params.users = this.form.users.map(({label, value, phone}) => ({name: label, id: value, phone}))
      } else {
        params.isAllLm = this.form.isAllLm;
        params.users = [];
      }

      params.sendRoleSetting.sendToCustomerExecutor = this.sendRoleSetting.indexOf('sendToCustomerExecutor') != -1;
      params.sendRoleSetting.sendToCustomerTag = this.sendRoleSetting.indexOf('sendToCustomerTag') != -1;

      return params;
    },
    openBatchRemindingDialog() {
      if (!this.selectedIds.length) {
        return this.$platform.alert('请选择需要批量提醒的产品');
      }
      this.form.remindId = (this.remindTemplate[0] || {}).id;
      this.batchRemindingCustomerDialog = true;
      this.defaultUserOfDifferentSelectedRemind();
    },
    defaultUserOfDifferentSelectedRemind() {
      let users = [];
      if (this.selectedRemind.isDdResponse) {
        users = this.selectedRemind.users || [];
      }

      if (!this.selectedRemind.isDdResponse) {
        this.form.isAllLm = Number(!this.selectedRemind.isDefaultLinkman);
      }

      this.initSelect(this.selectedRemind.sendRoleSetting);
      this.form.users = _.cloneDeep(users).map(({id, name}) => ({label: name, value: id}))
    },
    fetchData() {
      getProductRemindTemplate()
        .then(res => {
          if (!res.length) return;
          this.remindTemplate = res
            .map(r => {
              r.name += r.isDdResponse ? '（内部提醒）' : '（外部提醒）';
              return Object.freeze(r);
            });
        })
        .catch(err => console.error('err', err));
    },
    searchManager(params) {
      // params has three properties include keyword、pageSize、pageNum.
      const pms = params || {};

      return CustomerApi.getUserTag(pms)
        .then(res => {
          if (!res || !res.list) return;
          if (res.list) {
            res.list = res.list.map(user => Object.freeze({
              label: user.displayName,
              value: user.staffId,
              phone: user.cellPhone,
            }))
          }

          return res;
        })
        .catch(e => console.error(e));
    },
  },
}
</script>

<style lang="scss">

  .batch-remind-customer-dialog {

    .el-select .el-select__tags>span {
      display: contents;
    }

    .base-modal-body {
      padding: 10px 30px 0;
    }

    .el-form-item {
      margin: 0;
    }
    .el-radio {
      line-height: 32px;
    }

    .el-select {
      width: 100%;
    }

    .content-item {
      .el-form-item__content {
        max-height: 200px;
        overflow-y: auto;
      }
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
    }
  }

</style>
