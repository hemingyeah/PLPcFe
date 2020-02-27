<template>
  <div class="task-container">
    <form @submit.prevent="submit" class="base-form" v-if="init" novalidate>
      <div class="page-title">
        <div class="title">
          <button type="button" class="btn-text btn-back" @click="goBack">
            <i class="iconfont icon-arrow-left"></i> 返回
          </button>
          <span class="text">|</span>
          <button type="submit" class="btn btn-primary">暂存</button>
        </div>
      </div>
      <task-receipt-form :fields="fields" :value="form" ref="form"></task-receipt-form>
    </form>
  </div>
</template>

<script>
import TaskReceiptForm from '../components/TaskReceiptForm.vue'
import * as TaskApi from '@src/api/TaskApi'
import * as FormUtil from '@src/component/form/util'
import * as util from '../util/task'
import platform from '@src/platform'

export default {
  name: 'task-receipt-view',
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
  async mounted() {
    try {
      console.log('initData:', this.initData)

      this.auth = this.initData.auth || {}
      // 初始化默认值
      // 清空表单
      this.$emit('input', {})
      this.init = false

      // let tasktypes = (await TaskApi.taskType()) || []

      this.fields = await TaskApi.getTemplateFields('1', 'task_receipt')
      this.form = FormUtil.initialize(this.fields, this.form)
      // console.log(this.fields, this.form)

      this.init = true
    } catch (e) {
      console.error('error ', e)
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
          const params = util.packToTask(this.fields, this.form)
          params.templateId = 1
          // params.templateName = taskTemplate.text;
          this.pending = true
          this.loadingPage = true
          // if (this.action === 'edit') {
          //   return this.updateMethod(params)
          // }
          // if (this.action === 'createFromEvent') {
          //   return this.createCustomerForEvent(params)
          // }
          console.log(params)

          // this.createMethod(params)
        })
        .catch(err => {
          console.error(err)
          this.pending = false
          this.loadingPage = false
        })
    },
    createMethod(params) {
      this.$http
        .post('/task/saveReceiptDraft', params)
        .then(res => {
          let isSucc = !res.status
          platform.notification({
            type: isSucc ? 'success' : 'error',
            title: `创建工单${isSucc ? '成功' : '失败'}`,
            message: !isSucc && res.message
          })
          this.pending = false
          this.loadingPage = false

          if (!isSucc) return

          this.reloadTab()
          // window.location.href = `/task/view/${res.data.customerId}`
        })
        .catch(err => console.error('err', err))
    },
    updateMethod(params) {
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
  components: {
    [TaskReceiptForm.name]: TaskReceiptForm
  }
}
</script>

<style lang="scss">
body {
  padding: 10px;
}

.task-container {
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
}

.form-builder {
  width: 655px;
  padding: 10px 0 0 10px;

  .input-and-btn {
    display: flex !important;
    flex-flow: row nowrap;

    .form-item,
    .form-text,
    .form-select,
    .biz-team-select {
      flex: 1;
    }

    .base-dist-picker {
      padding-right: 0;
    }

    button {
      margin-left: 10px;
    }
  }
}
</style>
