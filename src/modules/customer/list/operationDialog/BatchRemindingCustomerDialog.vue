<template>
  <base-modal title="添加提醒" :show.sync="batchRemindingCustomerDialog" width="500px" class="batch-remind-customer-dialog">
    <el-form ref="form" :model="form" label-width="80px">

      <el-form-item label="选择提醒">
        <el-select v-model="form.remindId" placeholder="请选择短信模板">
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
        <template v-if="selectedRemind.isDdResponse">
          <el-select
            v-model="form.users"
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
        </template>
        <template v-else>
          <el-radio-group v-model="form.isAllLm">
            <el-radio :label="0" :style="{ width: '120px'}">默认联系人</el-radio>
            <el-radio :label="1" :style="{ width: '120px'}">所有联系人</el-radio>
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
      }
    },
    mounted() {
      this.fetchData();
    },
    methods: {
      onSubmit() {
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
            }
            this.batchRemindingCustomerDialog = false;
            this.pending = false;

            console.log('res', res);

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
          params.users = this.selectedRemind.users;
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
        this.batchRemindingCustomerDialog = true;
      },
      fetchData() {
        this.$http.get('/v2/customer/getReminds', {pageSize: 0,})
          .then(res => {
            let tv = null;
            if (res) {
              this.remindTemplate = (res.list || [])
              .map(r => {
                if (r.isDdResponse) {
                  r.name = r.name + '（内部提醒）';
                } else {
                  r.name = r.name + '（外部提醒）';
                }
                return r;
              });
              tv = this.remindTemplate[0];
              if (tv) {
                this.form.remindId = tv.id;
                this.form.isAllLm = tv.isdefaultLinkman === 1 ? 0 : 1;
                this.form.users = (tv.users || []).map(c => c.id);
                this.remoteSearchCM.options = tv.users;
              }
            }
          })
          .catch(err => console.error('err', err));
      },
      searchCustomerManager(keyword) {
        this.remoteSearchCM.loading = true;
        this.$http.get('/customer/userTag/list', {keyword: keyword, pageNum: 1,})
          .then(res => {
            this.remoteSearchCM.options = res.list
              .map(c => ({
                id: c.staffId,
                name: c.displayName,
              }));
            this.remoteSearchCM.loading = false;
          })
          .catch(err => console.error('searchCustomerManager function catch err', err));
      },
    },
  }
</script>

<style lang="scss">

  .batch-remind-customer-dialog {
    .base-modal-body {
      padding: 10px;
    }

    .el-form-item {
      margin: 0;
    }
    .el-radio {
      line-height: 32px;
    }

    .el-select {
      width: 90%;
    }

    .content-item {
      width: 93%;
      .el-form-item__content {
        max-height: 200px;
        overflow-y: auto;
      }
    }

    .dialog-footer {
      padding: 10px 50px;
      display: flex;
      justify-content: flex-end;
    }
  }

</style>