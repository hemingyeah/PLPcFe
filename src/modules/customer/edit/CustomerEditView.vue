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
import CustomerEditForm from '../components/CustomerEditForm.vue'

import * as CustomerApi from '@src/api/CustomerApi.ts'
import * as FormUtil from '@src/component/form/util'
import * as util from '../util/customer'

import platform from '@src/platform'

export default {
  name: 'customer-edit-view',
  inject: ['initData'],
  data() {
    return {
      submitting: false,
      pending: false,
      loadingPage: false,
      form: {},
      init: false,
      auth: {}
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
      let originFields = this.initData.fieldInfo || []
      let sortedFields = originFields
        .sort((a, b) => a.orderId - b.orderId)
        .map(f => {
          if (f.formType === 'address' && f.isSystem) {
            f.isNull = this.initData.isAddressAllowNull ? 1 : 0
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

          this.pending = true
          this.loadingPage = true
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
          this.pending = false
          this.loadingPage = false
        })
    },
    createCustomerForEvent(params) {
      this.$http
        .post('/event/customer/create', params)
        .then(res => {
          let isSucc = !res.status
          platform.notification({
            type: isSucc ? 'success' : 'error',
            title: `创建客户${isSucc ? '成功' : '失败'}`,
            message: !isSucc && res.message
          })

          this.pending = false
          this.loadingPage = false

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
        .catch(err =>
          console.error('createCustomerForEvent catch an error', err)
        )
    },
    createMethod(params) {
      this.$http
        .post('/customer/create', params)
        .then(res => {
          let isSucc = !res.status
          platform.notification({
            type: isSucc ? 'success' : 'error',
            title: `创建客户${isSucc ? '成功' : '失败'}`,
            message: !isSucc && res.message
          })
          this.pending = false
          this.loadingPage = false

          if (!isSucc) return

          this.reloadTab()
          window.location.href = `/customer/view/${res.data.customerId}`
        })
        .catch(err => console.error('err', err))
    },
    updateMethod(params) {
      const remindCount=localStorage.getItem('customer_remind_count');
      params.attribute.remindCount=remindCount || 0;
      this.$http
        .post(`/customer/update?id=${this.editId}`, params)
        .then(res => {
          if (res.status == 1) {
            this.loadingPage = false
            this.pending = false
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
          this.pending = false
          console.error('err', err)
          this.loadingPage = false
        })
    },
    reloadTab() {
      let fromId = window.frameElement.getAttribute('fromid')

      this.$platform.refreshTab(fromId)
    }
  },
  async mounted() {
    try {
      this.auth = this.initData.auth || {}
      // 初始化默认值
      let form = {}
      if (this.initData.action === 'edit' && this.initData.id) {
        // 处理编辑时数据
        this.loadingPage = true
        let cusRes = await CustomerApi.getForEdit(this.initData.id)
        this.loadingPage = false
        if (cusRes.status === 0) form = cusRes.data
      }

      if (this.initData.action === 'createFromEvent') {
        form = this.initData.eventCustomer
      }

      form = util.packToForm(this.fields, form, this.initData.customerAddress)
      this.form = FormUtil.initialize(this.fields, form)

      this.init = true
    } catch (e) {
      console.error('CustomerEditView caught an error ', e)
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
