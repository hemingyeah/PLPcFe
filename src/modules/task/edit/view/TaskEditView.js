/* api */
import * as TaskApi from '@src/api/TaskApi'
/* component */
import TaskEditForm from '@src/modules/task/edit/components/TaskEditForm/TaskEditForm.vue'
/* utils */
import * as FormUtil from '@src/component/form/util'
import * as util from '@src/modules/task/util/task'
import platform from '@src/platform';
/* vue */
import data from './data'
import computed from './computed'
import methods from './methods'

let taskTemplate = {};

export default {
  name: 'task-edit-view',
  inject: ['initData'],
  data() {
    return data
  },
  computed,
  methods: {
    ...methods,
    /** 
     * @description 创建工单方法
    */
    createTaskMethod(params, isAllot) {
      this.$http
        .post(`/task/create${isAllot ? '?allot=true' : ''}`, params)
        .then(res => {
          let isSucc = !res.status;
          platform.notification({
            type: isSucc ? 'success' : 'error',
            title: `创建工单${isSucc ? '成功' : '失败'}`,
            message: !isSucc && res.message
          })
          this.pending = false;
          this.loadingPage = false;

          if (!isSucc) return;

          window.location.href = `${res.data}`;
        })
        .catch(err => console.error('err', err))
    },
    goBack() {
      if (this.isTaskCreate) {
        let id = window.frameElement.dataset.id;
        return this.$platform.closeTab(id)
      }

      parent.frameHistoryBack(window)
    },
    initialize() {
      this.initUrl();
      this.initTitle();
    },
    initUrl() {
      let url = '';
      let createUrl = '/task/create';
      let updateAndEditUrl = '/task/update';

      if(this.isTaskEdit) {
        url = this.isFromEvent ? createUrl : updateAndEditUrl;
      } else {
        url = createUrl;
      }

      this.submitModel.url = url;
    },
    initTitle() {
      let title = '';

      if(this.isPlanTaskEdit) {
        title = '编辑计划任务';
      } else if(this.isFromPlan) {
        title = '新建计划任务';
      } else if(!this.isFromEvent && this.isTaskEdit) {
        title = '编辑工单';
      } else {
        title = '新建工单';
      }

      document.title = title;
    },
    /** 
   * @description 刷新tab
  */
    reloadTab() {
      let fromId = window.frameElement.getAttribute('fromid');

      this.$platform.refreshTab(fromId);
    },
    /** 
   * @description 提交
   * @param {Boolean} isAllot 是否派单
  */
    submit(isAllot = false) {
      this.submitting = true;

      this.$refs.form
        .validate()
        .then(valid => {
          this.submitting = false;

          if (!valid) return Promise.reject('validate fail.');
        
          const params = util.packToTask(this.fields, this.form);
          params.templateId = taskTemplate.value;
          params.templateName = taskTemplate.text;
        
          this.pending = true;
          this.loadingPage = true;

          if (this.isTaskEdit) {
            return this.updateTaskMethod(params);
          }
          if (this.isTaskCreate) {
            return this.createTaskMethod(params, isAllot);
          }

        })
        .catch(err => {
          this.pending = false;
          this.loadingPage = false;
          console.error(err);
        })
    },
    /** 
   * @description 编辑工单方法
  */
    updateTaskMethod(params) {
      this.$http
        .post(`/task/update?id=${this.editId}`, params)
        .then(res => {
          if (res.status == 1) {
            this.loadingPage = false;
            this.pending = false;
            return platform.notification({
              type: 'error',
              title: '更新工单失败',
              message: res.message
            })
          }
          window.location.href = `/task/view/${this.editId}`;
        })
        .catch(err => {
          this.pending = false;
          this.loadingPage = false;
          console.error('err', err);
        })
    },
    /** 
   * @description 更新工单类型
  */
    updateTaskTemplateId(template = {}) {
      taskTemplate = template || {};
    },
  },
  async mounted() {
    try {
      this.initialize();

      // 初始化默认值
      let form = this.workTask;

      this.fields = await TaskApi.getTaskTemplateFields({ templateId: form.templateId || this.types[0].id, tableName: 'task' });

      form = util.packToForm(this.fields, form);
      this.form = FormUtil.initialize(this.fields, form);

      this.init = true;

    } catch (e) {
      console.error('error ', e)
    }
  },
  components: {
    [TaskEditForm.name]: TaskEditForm
  }
}