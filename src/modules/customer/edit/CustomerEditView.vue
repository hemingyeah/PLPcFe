<template>
  <div class="customer-container" v-loading.fullscreen.lock="loadingPage">
    <form @submit.prevent="submit" class="base-form" v-if="init" novalidate>
      <div class="page-title">
        <div class="title">
          <button type="button" class="btn-text btn-back" @click="goBack">
            <i class="iconfont icon-arrow-left"></i> 返回
          </button>
          <span class="text">|</span>
          <button
            type="submit"
            :disabled="submitting || pending"
            class="btn btn-primary"
          >
            提交
          </button>
        </div>
      </div>
      
      <customer-edit-form :fields="fields" v-model="form" ref="form" />
    </form>
  </div>
</template>

<script>
/* api */
import * as CustomerApi from '@src/api/CustomerApi.ts'
/* component */
import CustomerEditForm from '@src/modules/customer/components/CustomerEditForm.vue'
/* enum */
import TenantDataLimitSourceEnum from '@model/enum/TenantDataLimitSourceEnum'
import TenantDataLimitTypeEnum from '@model/enum/TenantDataLimitTypeEnum'
/* util */
import platform from '@src/platform'
import * as FormUtil from '@src/component/form/util'
import * as util from '@src/modules/customer/util/customer'
/* mixin */
import VersionMixin from '@src/mixins/versionMixin/index.ts'

export default {
  name: 'customer-edit-view',
  inject: ['initData'],
  mixins: [VersionMixin],
  data() {
    return {
      submitting: false,
      pending: false,
      loadingPage: false,
      form: {},
      init: false,
      auth: {},
      fieldInfo: []
    }
  },
  computed: {
    action() {
      return this.initData.action
    },
    editId() {
      return this.initData.id || ''
    },
    eventId() {
      return this.initData.eventId || ''
    },
    fields() {
      let originFields = this.fieldInfo || []
      let sortedFields = originFields
        .sort((a, b) => a.orderId - b.orderId)
        .map(f => {
          if (f.formType === 'address' && f.isSystem) {
            f.isNull = this.initData.isAddressAllowNull ? 1 : 0
          }
          // 客户名称长度单独处理
          if (f.fieldName === 'name') {
            f.maxlength = 50
          }
          return f
        })
        .filter(f => {
          return (
            f.fieldName !== 'tags' ||
            (f.fieldName === 'tags' && this.initData.isDivideByTag)
          )
        })
      return FormUtil.migration(sortedFields)
    }
  },
  methods: {
    goBack() {
      if (this.action == 'create') {
        let id = window.frameElement.dataset.id
        return this.$platform.closeTab(id)
      }
      parent.frameHistoryBack(window)
    },
    submit() {
      this.submitting = true
      this.$refs.form
        .validate()
        .then(valid => {
          this.submitting = false
          if (!valid) return Promise.reject('validate fail.')
          const params = util.packToCustomer(
            this.fields,
            this.form,
            this.initData.tags
          )
          
          this.toggleLoading()
          
          if (this.action === 'edit') {
            return this.updateMethod(params)
          }
          if (this.action === 'createFromEvent') {
            return this.createCustomerForEvent(params)
          }
          
          this.createMethod(params)
        })
        .catch(err => {
          console.error(err)
          this.toggleLoading(false)
        })
    },
    createCustomerForEvent(params) {
      this.$http.post('/event/customer/create', params)
        .then(res => {
          let isSucc = res.succ
          
          platform.notification({
            type: isSucc ? 'success' : 'error',
            title: `创建客户${isSucc ? '成功' : '失败'}`,
            message: !isSucc && res.message
          })
          
          if (!isSucc) return
          
          const params = {
            ...res.data,
            eventId: this.eventId
          }
          
          delete params.latitude
          delete params.longitude
          
          this.$http.post('/event/update4CusInfo', params, false).then(res => {
            if (this.initData.goto === 'eventView') {
              return (window.location.href = `/event/view/${this.initData.eventId}`)
            }
            if (this.initData.goto === 'createTask') {
              return (window.location.href = `/event/convent2Task/jump?eventId=${this.initData.eventId}&flow=${this.initData.flow}`)
            }
          })
          
        })
        .catch(error =>
          console.error('edit CustomerEditView createCustomerForEvent error', error)
        )
        .finally(() => {
          this.toggleLoading(false)
        })
    },
    createMethod(params) {
      const CreateCustomerPromise = this.$http.post('/customer/create', params)
      
      this.checkNumExceedLimitAfterHandler(CreateCustomerPromise)
        .then(res =>{
          let isSuccess = Boolean(res.succ)
          
          platform.notification({
            type: isSuccess ? 'success' : 'error',
            title: `创建客户${isSuccess ? '成功' : '失败'}`,
            message: !isSuccess && res.message
          })
          
          if (!isSuccess) return
          
          this.reloadTab()
          window.location.href = `/customer/view/${res.data.customerId}`
          
        })
        .catch(err => {
          console.error('err', err)
        })
        .finally(() => {
          this.toggleLoading(false)
        })
    },
    updateMethod(params) {
      const remindCount=localStorage.getItem('customer_remind_count');
      params.attribute.remindCount=remindCount || 0;
      
      const UpdateCustomerPromise = this.$http.post(`/customer/update?id=${this.editId}`, params)
      
      this.checkNumExceedLimitAfterHandler(UpdateCustomerPromise)
        .then(res => {
          if (!res.succ) {
            return platform.notification({
              type: 'error',
              title: '更新客户失败',
              message: res.message
            })
          }
          
          let fromId = window.frameElement.getAttribute('fromid')
          this.$platform.refreshTab(fromId)
          
          window.location.href = `/customer/view/${res.data || this.editId}`
        })
        .catch(err => {
          console.error('CustomerEditView ~ updateMethod ~ error', err)
        })
        .finally(() => {
          this.toggleLoading(false)
        })
    },
    reloadTab() {
      let fromId = window.frameElement.getAttribute('fromid')
      this.$platform.refreshTab(fromId)
    },
    toggleLoading(loading = true) {
      this.pending = loading
      this.loadingPage = loading
    }
  },
  async mounted() {
    try {
      // 获取客户表单字段列表
      let result = await CustomerApi.getCustomerFields({isFromSetting: true});
      if (result.succ) {
        this.fieldInfo = result.data;
      }
      // 权限数据
      this.auth = this.initData.auth || {}
      
      // 初始化默认值
      let form = {}
      if (this.initData.action === 'edit' && this.initData.id) {
        // 处理编辑时数据
        this.loadingPage = true
        let cusRes = await CustomerApi.getForEdit(this.initData.id)
        this.loadingPage = false
        if (cusRes.status === 0) form = cusRes.data
      } else {
        // 检查版本数量限制
        this.checkNumExceedLimitBeforeHandler 
        && this.checkNumExceedLimitBeforeHandler(
          TenantDataLimitSourceEnum.Customer,
          TenantDataLimitTypeEnum.Customer
        )
      }
      // 从事件新建客户
      if (this.initData.action === 'createFromEvent') {
        form = this.initData.eventCustomer
      }
      // 初始化解析表单数据
      form = util.packToForm(this.fields, form, this.initData.customerAddress)
      this.form = FormUtil.initialize(this.fields, form)
      
      this.init = true
      
    } catch (error) {
      this.toggleLoading(false)
      console.error('CustomerEditView mounted error ', error)
    }
  },
  components: {
    [CustomerEditForm.name]: CustomerEditForm
  }
}
</script>

<style lang="scss">
body {
  padding: 10px;
}

.customer-container {
  height: 100%;
  width: 100%;
  overflow: auto;
  background-color: #fff;

  .page-title {
    border-bottom: 1px solid #f4f7f5;
    padding: 12px 10px;
    display: flex;
    justify-content: space-between;

    .iconfont {
      font-size: 12px;
    }

    .title {
      display: flex;
      justify-content: space-between;
      span.text {
        line-height: 34px;
        margin-right: 12px;
      }
    }
  }

  .form-builder{
    width: 700px;
    padding: 10px 0 0 10px;

    .input-and-btn{
      display: flex !important;
      flex-flow: row nowrap;

      .form-item, .form-text, .form-select, .biz-team-select {
        flex: 1;
      }

      .base-dist-picker{
        padding-right: 0;
      }

      button{
        margin-left: 10px;
      }
    }
  }
}
</style>
