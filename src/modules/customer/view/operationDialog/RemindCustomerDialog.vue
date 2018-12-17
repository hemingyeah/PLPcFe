<template>
  <base-modal @closed="$emit('success-callback')" :title="modalTitle" :show.sync="remindCustomerDialog" width="500px" class="batch-remind-customer-dialog">
    <el-form ref="form" :model="form" label-width="80px">

      <el-form-item label="选择提醒">
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
      <el-form-item label="通知人" prop="users" :error="error">
        <el-select
          v-model="form.users"
          @change="validateUser"
          filterable
          remote
          multiple
          reserve-keyword
          placeholder="请输入关键词"
          :loading="remoteSearchCM.loading"
          :remote-method="searchCustomerManager">
          <el-option
            v-for="item in remoteSearchCM.options"
            :key="item.id"
            :label="item.name"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="remindCustomerDialog = false">取 消</el-button>
      <el-button type="primary" @click="onSubmit" :disabled="pending">确 定</el-button>
    </div>
  </base-modal>
</template>

<script>
export default {
  name: "remind-customer-dialog",
  data: () => {
    return {
      remindTemplate: [],
      remoteSearchCM: {
        loading: false,
        options: [],
      },
      form: {
        remindId: null,
        users: [],
      },
      remindCustomerDialog: false,
      pending: false,
      error: '',
      submitted: false,
    }
  },
  props: {
    customer: {
      type: Object,
      default: () => ({}),
    },
    // editedRemind
    editedRemind: {
      type: Object,
      default: () => ({}),
    }
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
    allUsers() {
      if (this.selectedRemind.isDdResponse) {
        // 内部提醒
        const arr = this.concatArrayAndItemUnique(this.editedRemind.users, this.selectedRemind.users);
        return this.concatArrayAndItemUnique(this.remoteSearchCM.options, arr)
      }
      return [{
        id: this.customer.id,
        name: this.customer.name,
        phone: this.customer.phone,
      }];
    },
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    validateUser() {
      if (!this.submitted) return;
      if (!this.form.users || !this.form.users.length) {
        // 内部提醒
        return this.error = '      ';
      }
      this.error = '';
    },
    updateFormUser() {
      let users = [];
      if (this.selectedRemind.isDdResponse) {
        users = this.selectedRemind.users;
      } else {
        users = [{
          id: this.customer.id,
          name: this.customer.name,
          phone: this.customer.phone,
        }]
      }

      this.remoteSearchCM.options = users;
      this.form.users = users
        // .filter(c => {
        //   if (c.id && (c.id.indexOf('-') >= 0) && Number(c.name)) return false;
        //   return true;
        // })
        .map(c => c.id);
    },
    defaultUserOfDifferentSelectedRemind() {
      let users = [];
      if (this.action === 'edit') {
        users = this.editedRemind.users || [];
      } else {
        if (this.selectedRemind.isDdResponse) {
          users = this.selectedRemind.users || [];
        } else {
          users = [{
            id: this.customer.id,
            name: this.customer.name,
            phone: this.customer.phone,
          }];
        }
      }

      this.remoteSearchCM.options = users;
      this.form.users = users
        // .filter(c => {
        //   if (c.id && (c.id.indexOf('-') >= 0) && Number(c.name)) return false;
        //   return true;
        // })
        .map(c => c.id);
    },
    async onSubmit() {
      this.submitted = true;
      this.validateUser();

      if (!!this.error) return;

      const params = this.buildParams();
      this.pending = true;
      let reqUrl = '';
      let actionName = '';
      if (this.action === 'edit') {
        reqUrl = '/scheduler/editByJson';
        actionName = '编辑提醒';
      } else {
        reqUrl = '/scheduler/buildByJson';
        actionName = '添加提醒';
      }
      this.$http.post(reqUrl, params)
        .then(res => {
          if (res.status === 0) {
            this.$platform.alert(`${actionName}成功`);
          }
          if (res.status === 1 && res.data) {
            this.$platform.alert(`${actionName}失败，以下客户已存在该提醒：${res.data.join(',')}`);
          }
          if (res.status === 1 && !res.data) {
            this.$platform.alert(`${actionName}失败${res.data ? '，' + res.data : res.message}`);
          }
          this.remindCustomerDialog = false;
          this.pending = false;

          this.$emit('success-callback');
          this.$eventBus.$emit('customer_remind_table.update_remind_list');
          this.$eventBus.$emit('customer_info_record.update_record_list');
          this.$eventBus.$emit('customer_detail_view.update_statistical_data');
        })
        .catch(err => {
          this.$platform.alert('批量添加提醒失败');
          this.pending = false;
          console.error('post to /scheduler/buildBatch err', err)
        });
    },
    buildParams() {
      return {
        id: this.action === 'edit' ? this.editedRemind.id : '',
        modalId: this.customer.id,
        modalName: this.customer.name,
        modal: 'customer',
        remind: {
          id: this.form.remindId,
        },
        users: this.allUsers.filter(rc => this.form.users.includes(rc.id))
      };
    },
    openDialog() {
      this.remindCustomerDialog = true;

      if (this.action === 'edit') {
        this.form.remindId = this.editedRemind.remind.id;
      } else {
        this.form.remindId = (this.remindTemplate[0] || {}).id;
      }

      this.defaultUserOfDifferentSelectedRemind();
    },
    fetchData() {
      this.$http.get('/v2/customer/getReminds', {pageSize: 0, })
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
    searchCustomerManager(keyword) {
      if (!this.selectedRemind.isDdResponse) {
        return this.remoteSearchCM.options = [];
      }
      this.remoteSearchCM.loading = true;
      this.$http.get('/customer/userTag/list', {keyword: keyword, pageNum: 1,})
        .then(res => {
          this.remoteSearchCM.options = res.list
            .map(c => Object.freeze({
              id: c.staffId,
              name: c.displayName,
            })) || [];
          this.remoteSearchCM.loading = false;
        })
        .catch(err => console.error('searchCustomerManager function catch err', err));
    },
    concatArrayAndItemUnique(arr1, arr2) {
      // 数组中的对象根据id去重
      let obj = {};
      if (!arr1 || !arr1.length) return arr2 || [];
      if (!arr2 || !arr2.length) return arr1 || [];

      return [...arr1, ...arr2].reduce((cur,next) => {
        obj[next.id] ? "" : obj[next.id] = true && cur.push(next);
        return cur;
      },[]);
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



