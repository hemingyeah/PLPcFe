<template>
  <base-modal title="添加提醒" :show.sync="batchRemindingCustomerDialog" width="500px" class="batch-remind-customer-dialog" @closed="reset">
    <el-form ref="form" :model="form" label-width="80px">

      <el-form-item label="选择提醒">
        <el-select v-model="form.remindId" placeholder="请选择短信模板" @change="defaultUserOfDifferentSelectedRemind">
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
            :error="error"
          ></base-select>

        </template>
        <template v-else>
          <el-radio-group v-model="form.isAllLm">
            <el-radio :label="0" style="width: 120px">默认联系人</el-radio>
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

export default {
  name: "batch-reminding-customer-dialog",
  data: () => {
    return {
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
      return this.remindTemplate.filter(rt => rt.id === this.form.remindId)[0] || {};
    },
    remindRule() {
      const {isRepeat, period, fieldDisplayName, isAhead, hours, periodUnit,} = this.selectedRemind;
      let unit = periodUnit === "day" ? "天" : (periodUnit === "week" ? "周" : "月");
      let isahead = isAhead ? "前" : "后";

      if (!isRepeat){
        if(fieldDisplayName){
          return `单次通知：根据${fieldDisplayName + (isahead + hours)}小时提醒`;
        }else{
          return '无'
        }
      }else{
        if(period){
          return `重复通知：根据${fieldDisplayName + (isahead + hours)}小时，每${period + unit}发出提醒`;
        }else{
          return '无'
        }
      }
    },
  },
  mounted() {
    this.fetchData();
  },
  methods: {
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
      if (!this.form.users || !this.form.users.length) {
        // 内部提醒
        return this.error = true;
      }
      return this.error = false;
    },
    async onSubmit() {
      if (this.validateUser()) return;

      const params = this.buildParams();
      this.pending = true;
      this.$http.post('/scheduler/buildBatch', params)
        .then(res => {
          let ids = this.selectedIds;
          if (res.status === 0) {
            this.$platform.alert('批量添加提醒成功');
          }
          if (res.status === 1 && res.data) {
            this.$platform.alert(`批量添加提醒失败，以下客户已存在该提醒：${res.data.join(',')}`);
            ids = [];
          }
          this.batchRemindingCustomerDialog = false;
          this.pending = false;

          this.$emit('success-callback', ids);
        })
        .catch(err => {
          this.$platform.alert('批量添加提醒失败');
          this.pending = false;
          console.error('post to /scheduler/buildBatch err', err)
        });
    },
    buildParams() {
      let params = {
        ids: this.selectedIds.join(','),
        remindId: this.form.remindId,
      };

      if (this.selectedRemind.isDdResponse) {
        params.isAllLm = 0;
        params.users = this.form.users;
      } else {
        params.isAllLm = this.form.isAllLm;
        params.users = [];
      }
      return params;
    },
    openBatchRemindingCustomerDialog() {
      if (!this.selectedIds.length) {
        return this.$platform.alert('请选择需要批量提醒的客户');
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
      this.form.users = _.cloneDeep(users);
    },
    fetchData() {
      this.$http.get('/customer/getReminds', {pageSize: 0,})
        .then(res => {
          if (!res || res.status) return;
          this.remindTemplate = (res.list || [])
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

      return this.$http.get('/customer/userTag/list', pms)
        .then(res => {
          if (!res || !res.list) return;
          if (res.list) {
            res.list = res.list.map(user => Object.freeze({
              name: user.displayName,
              id: user.staffId,
              phone: user.cellPhone,
            }))
          }

          return res;
        })
        .catch(e => console.log(e));
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
