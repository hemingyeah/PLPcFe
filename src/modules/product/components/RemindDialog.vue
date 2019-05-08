<template>
  <base-modal :title="modalTitle" :show.sync="remindCustomerDialog" width="500px" class="batch-remind-customer-dialog" @closed="reset">
    <el-form ref="form" :model="form" label-width="80px" v-if="init" :rules="rules">

      <el-form-item label="选择提醒" prop="remindId">
        <el-select v-model="form.remindId" placeholder="请选择短信模板" @change="updateFormUser">
          <el-option v-for="item in remindTemplate" :label="item.name" :value="item.id" :key="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="提醒内容" class="content-item">
        {{selectedRemind.content}}
      </el-form-item>
      <el-form-item label="提醒规则">
        {{remindRule}}
      </el-form-item>
      <el-form-item label="通知人">
        <base-select
          v-model="form.users"
          :remote-method="searchManager"
          @input="validateUser"
          multiple
          clearable
          :error="error"
        >
        </base-select>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-popover
        placement="bottom"
        popper-class="remind-popover"
        width="410"
        trigger="hover">
        <div>
          提示：提醒规则在系统设置-客户设置-自动提醒设置中添加
        </div>
        <i class="iconfont icon-question" slot="reference"></i>
      </el-popover>

      <el-button @click="remindCustomerDialog = false">取 消</el-button>
      <el-button type="primary" @click="onSubmit" :disabled="pending">确 定</el-button>
    </div>
  </base-modal>
</template>

<script>
import _ from 'lodash';
import Page from '@model/Page';
import { getProductRemindTemplate } from '@src/api/ProductApi';
import * as CustomerApi from '@src/api/CustomerApi';
import { createScheduler, editScheduler} from '@src/api/CommonApi'

export default {
  name: 'remind-dialog',
  data: () => {
    return {
      linkmanListOfCustomer: [],
      remindTemplate: [],
      form: {
        remindId: null,
        users: [],
      },
      remindCustomerDialog: false,
      pending: false,
      error: false,
      init: false,
      editedRemind: {},
      rules: {
        remindId: [{ required: true, message: '请选择短信模板', trigger: 'change' }]
      }
    }
  },
  props: {
    product: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    action() {
      return this.editedRemind.id ? 'edit' : 'create';
    },
    modalTitle() {
      return this.editedRemind.id ? '编辑提醒' : '添加提醒';
    },
    selectedRemind() {
      return this.remindTemplate.filter(rt => rt.id === this.form.remindId)[0] || {};
    },
    remindRule() {
      const {isRepeat, period, fieldDisplayName, isAhead, hours, periodUnit, } = this.selectedRemind;
      let unit = periodUnit === 'day' ? '天' : (periodUnit === 'week' ? '周' : '月');
      let isahead = isAhead ? '前' : '后';

      if (!isRepeat){
        if(fieldDisplayName){
          return `单次通知：根据${fieldDisplayName + (isahead + hours)}小时提醒`;
        }
        return '无'
        
      }
      if(period){
        return `重复通知：根据${fieldDisplayName + (isahead + hours)}小时，每${period + unit}发出提醒`;
      }
      return '无'

    },
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    reset() {
      this.init = false;
      this.editedRemind = {};
      this.form = {
        remindId: null,
        users: [],
      };
      this.$emit('success-callback');
    },
    validateUser() {
      if (!this.form.users || !this.form.users.length) {
        // 内部提醒
        return this.error = true;
      }
      return this.error = false;
    },
    updateFormUser() {
      if(this.remindTemplate.length <= 0) return this.form.users = [];

      let users = [];
      if (this.selectedRemind.isDdResponse) {
        // 内部提醒
        users = this.selectedRemind.users.map(({id, name}) => ({label: name, value: id}))
      } else {
        // 外部提醒（默认联系人或者全部联系人）
        if (this.selectedRemind.isDefaultLinkman) {
          users = this.linkmanListOfCustomer.filter(user => user.isMain);
        } else {
          users = this.linkmanListOfCustomer;
        }
      }

      this.form.users = _.cloneDeep(users);
    },
    async onSubmit() {
      this.$refs.form.validate(valid => {
        if(!valid) return false
      })
      if (this.validateUser()) return;

      const params = this.buildParams();
      this.pending = true;
      let actionName = '';
      let fn = null;
      if (this.action === 'edit') {
        actionName = '编辑提醒';
        fn = editScheduler;
      } else {
        fn = createScheduler;
        actionName = '添加提醒';
      }
      fn(params)
        .then(res => {
          if (!res.status) {
            this.$platform.notification({
              title: '成功',
              type: 'success',
              message: `${actionName}成功`,
            });
          }
          if (res.status === 1 && res.data) {
            this.$platform.notification({
              title: '失败',
              type: 'error',
              message:`${actionName}失败，以下客户已存在该提醒：${res.data.join(',')}`,
            });
          }
          if (res.status === 1 && !res.data) {
            this.$platform.notification({
              title: '失败',
              type: 'error',
              message: `${actionName}失败${(res.data || res.message) && (`，${ res.data || res.message}`)}`,
            });
          }
          this.remindCustomerDialog = false;
          this.pending = false;

          this.editedRemind = {};
          this.$eventBus.$emit('product_view_remind_update');
          this.$eventBus.$emit('product_remind_table.update_remind_list');
          this.$eventBus.$emit('product_info_record.update_record_list');
          // if (this.action === 'create') {
          //   this.$eventBus.$emit('customer_detail_view.select_tab', 'customer-remind-table');
          // }

        })
        .catch(err => {
          this.$platform.notification({
            title: '失败',
            type: 'error',
            message: '添加提醒失败',
          });
          this.pending = false;
          console.error('post to /scheduler/buildBatch err', err)
        });
    },
    buildParams() {
      return {
        id: this.action === 'edit' ? this.editedRemind.id : '',
        modalId: this.product.id,
        modalName: this.product.name,
        modal: 'product',
        remind: {
          id: this.form.remindId,
        },
        users: (this.form.users || []).map(user => ({
          id: user.value,
          name: user.label,
          phone: user.phone,
        }))
      };
    },
    openDialog(remind) {
      this.remindCustomerDialog = true;
      this.editedRemind = remind || {};

      this.changeRemindId();

      this.fetchLinkman();
      this.init = true;
    },
    changeRemindId() {
      if (this.action === 'edit') {
        this.form.remindId = this.editedRemind.remind.id;
      } else {
        this.form.remindId = (this.remindTemplate[0] || {}).id;
      }
    },
    fetchData() {
      getProductRemindTemplate()
        .then(res => {
          this.remindTemplate = (res || [])
            .map(r => {
              r.name += r.isDdResponse ? '（内部提醒）' : '（外部提醒）';
              return Object.freeze(r);
            });
          this.changeRemindId();
        })
        .catch(err => console.error('err', err));
    },
    searchManager(params) {
      if (!this.selectedRemind.isDdResponse) {
        return Promise.resolve({
          ...new Page(),
          list: this.linkmanListOfCustomer,
          pageSize: this.linkmanListOfCustomer.length,
          pageNum: 1,
          total: this.linkmanListOfCustomer.length,
          hasNextPage: false,
        });
      }

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
        .catch(e => console.log(e));
    },
    fetchLinkman() {
      const params = {
        customerId: this.product.customer.id,
        pageNum: 1,
        pageSize: 100000,
      };

      CustomerApi.getLinkmanOfCustomer(params)
        .then(res => {
          this.linkmanListOfCustomer = res.list
            .map(contact => {

              return Object.freeze({
                ...contact,
                label: contact.name,
                value: contact.id,
              });
            });

          if (this.action === 'create') {
            this.updateFormUser();
          } else {
            this.form.users = _.cloneDeep(this.editedRemind.users).map(({id, name}) => ({label: name, value: id}))
          }
        })
        .catch(err => console.error('err', err));
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
        word-break: break-all;
      }
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;

      span:focus {
        outline: none;
      }

      .iconfont {
        line-height: 32px;
        margin-right: 10px;
        color: $color-primary;
      }
    }
  }

  .remind-popover {
    background: rgba(0,0,0,0.60);
    color: #fff;
    a.link {
      color: $color-primary;
      padding: 0 5px;
    }

    .popper__arrow:after {
     border-bottom-color: rgba(0,0,0,0.60)!important;
    }
  }

</style>
