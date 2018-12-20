<template>
  <base-modal :title="modalTitle" :show.sync="remindCustomerDialog" width="500px" class="batch-remind-customer-dialog" @closed="reset">
    <el-form ref="form" :model="form" label-width="80px" v-if="init">

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
      <el-popover
        placement="bottom"
        popper-class="remind-popover"
        width="410"
        trigger="hover">
        <div>
          提示：提醒规则在系统设置-客户设置-自动提醒设置中<a href="/setting/customer/remind" class="link">添加</a>
        </div>
        <i class="iconfont icon-question" slot="reference"></i>
      </el-popover>

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
      linkmanListOfCustomer: [],
      remindTemplate: [],
      resultOfSearch: [],
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
      init: false,
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
        let oldArr = sessionStorage.getItem('customer_view_remind_manager_storage') || '{}';
        oldArr = JSON.parse(oldArr).manager || [];

        const users = this.action === 'create' ? this.selectedRemind.users : this.editedRemind.users;
        let newArr = this.concatArrayAndItemUnique(users, this.resultOfSearch);

        return this.concatArrayAndItemUnique(oldArr, newArr);
      }
      return [...this.linkmanListOfCustomer];
    },
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    reset() {
      this.init = false;
      this.form = {
        remindId: null,
        users: [],
      };
      this.$emit('success-callback');
    },
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
        // 内部提醒
        users = this.selectedRemind.users;
      } else {
        // 外部提醒（默认联系人或者全部联系人）
        if (this.selectedRemind.isDefaultLinkman) {
          users = this.linkmanListOfCustomer.filter(user => user.isMain);
        } else {
          users = this.linkmanListOfCustomer;
        }
      }

      this.form.users = users.map(c => c.id);
      this.remoteSearchCM.options = this.allUsers;
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
            this.$platform.alert(`${actionName}失败${(res.data || res.message) && ('，' + (res.data || res.message))}`);
          }
          this.remindCustomerDialog = false;
          this.pending = false;

          this.$emit('success-callback');
          this.$eventBus.$emit('customer_remind_table.update_remind_list');
          this.$eventBus.$emit('customer_info_record.update_record_list');
          this.$eventBus.$emit('customer_detail_view.update_statistical_data');
          if (this.action === 'create') {
            this.$eventBus.$emit('customer_detail_view.select_tab', 'customer-remind-table');
          }

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

      this.searchCustomerManager();
      this.fetchLinkman();
      this.init = true;
    },
    fetchData() {
      this.$http.get('/customer/getReminds', {pageSize: 0, })
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
        return this.remoteSearchCM.options = this.allUsers;
      }
      this.remoteSearchCM.loading = true;
      this.$http.get('/customer/userTag/list', {keyword: keyword, pageNum: 1,})
        .then(res => {
          this.resultOfSearch = res.list
            .map(c => Object.freeze({
              id: c.staffId,
              name: c.displayName,
            })) || [];
          const oldList = this.allUsers.filter(rc => this.form.users.includes(rc.id));
          this.remoteSearchCM.options = this.concatArrayAndItemUnique(oldList, this.resultOfSearch);
          this.remoteSearchCM.loading = false;
          this.saveManager(this.resultOfSearch);
        })
        .catch(err => console.error('searchCustomerManager function catch err', err));
    },
    saveManager(manager) {
      let oldArr = sessionStorage.getItem('customer_view_remind_manager_storage') || '{}';
      oldArr = JSON.parse(oldArr).manager || [];

      manager.forEach(m => {
        if (oldArr.every(ou => ou.id !== m.id)) {
          oldArr.push(m);
        }
      });

      sessionStorage.setItem('customer_view_remind_manager_storage', JSON.stringify({
        manager: oldArr,
      }));
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
    fetchLinkman() {
      const params = {
        customerId: this.customer.id,
        pageNum: 1,
        pageSize: 100000,
      };

      this.$http.get('/customer/linkman/list', params)
        .then(res => {
          this.linkmanListOfCustomer = res.list
            .map(contact => {
              return Object.freeze(contact);
            });

          const users = this.action === 'create' ? this.selectedRemind.users : this.editedRemind.users;
          if (this.action === 'create') {
            this.updateFormUser();
          } else {
            this.form.users = users.map(c => c.id);
            this.remoteSearchCM.options = this.allUsers;
          }
        })
    },
  },
}
</script>

<style lang="scss">

  .el-tag {
    /*width: 100%;*/
    overflow: hidden;
    position: relative;
    padding-right: 20px;
    .el-tag__close {
      position: absolute;
      right: 3px!important;
      top: 3px!important;
    }
  }

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



