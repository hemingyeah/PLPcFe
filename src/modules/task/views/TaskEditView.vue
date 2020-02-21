<template>
  <div class="task-container">
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
      <task-edit-form :fields="fields" :types="types" :value="form" ref="form" @updatetemplateId="updatetemplateId">
      </task-edit-form>
    </form>
  </div>
</template>

<script>
import TaskEditForm from '../components/TaskEditForm.vue'
import * as TaskApi from '@src/api/TaskApi'
import * as FormUtil from '@src/component/form/util'
import * as util from '../util/task'
import platform from '@src/platform'
let taskTemplate = {};
export default {
  name: 'task-edit-view',
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
    types(){   
      return JSON.parse(`[{"name":"默认工单","id":"1","tags":[]},
      {"name":"测工单排序4","id":"31cdc36c-918d-4525-9ee8-73c89614a891","tags":[]},
      {"name":"测试导出12","id":"9ffbc9c2-c8cc-472a-98ff-873c3e50ea63","tags":[]},
      {"name":"全字段测试","id":"13de8ca3-2d80-46ae-852f-6e692132f0e9","tags":[]},
      {"name":"测试结算回访","id":"278a103a-5806-4e0c-b102-04e37484f675","tags":[]},
      {"name":"测试组件","id":"b84170e4-358e-4b4d-8c79-b0aca7074147","tags":[]},
      {"name":"移动之附加组","id":"1ddde36b-6305-44db-8f1b-958ed39e4ddc","tags":[]},
      {"name":"工时记录测试","id":"9a4067e8-8d18-45d8-984d-52aa500da2fc","tags":[]}]`);
    }
  },
  methods: {
    updatetemplateId(e){
      // console.log('e: ', e);
      taskTemplate = e;
    },
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
          const params = util.packToTask(
            this.fields,
            this.form
          )
          params.templateId = taskTemplate.value;
          params.templateName = taskTemplate.text;
          this.pending = true
          this.loadingPage = true
          // if (this.action === 'edit') {
          //   return this.updateMethod(params)
          // }
          // if (this.action === 'createFromEvent') {
          //   return this.createCustomerForEvent(params)
          // }
          console.log(params);
          
          this.createMethod(params)
        })
        .catch(err => {
          console.error(err)
          this.pending = false
          this.loadingPage = false
        })
    },
    createMethod(params) {
      this.$http
        .post('/task/create', params)
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
          //window.location.href = `/task/view/${res.data.customerId}`
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
  async mounted() {
    try {
      console.log('initData:', this.initData)

      this.auth = this.initData.auth || {}
      // 初始化默认值
      // 清空表单
      this.$emit('input', {})
      this.init = false
      
      // let tasktypes = (await TaskApi.taskType()) || []

      this.fields = await TaskApi.getTemplateFields(this.types[0].id)
      this.form = FormUtil.initialize(this.fields, this.form)
      console.log(this.fields, this.form)

      this.init = true
    } catch (e) {
      console.error('error ', e)
    }
  },
  components: {
    [TaskEditForm.name]: TaskEditForm
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
