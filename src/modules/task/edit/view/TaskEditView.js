/* api */
import * as TaskApi from '@src/api/TaskApi'
/* component */
import TaskEditForm from '@src/modules/task/edit/components/TaskEditForm/TaskEditForm.vue'
/* model */
import TaskStateEnum from '@model/enum/TaskStateEnum';
/* utils */
import * as FormUtil from '@src/component/form/util'
import * as util from '@src/modules/task/util/task'
import platform from '@src/platform'

let taskTemplate = {};

export default {
  name: 'task-edit-view',
  inject: ['initData'],
  data() {
    return {
      form: {},
      init: false,
      loadingPage: false,
      pending: false,
      submitting: false,
      submitModel: {
        url: ''
      }
    }
  },
  computed: {
    action() {
      // TODO: 因为initData无数据 暂时通过url区分新建、编辑
      let action = location.pathname.indexOf('/task/create') > -1 ? 'create' : 'edit';
      return this.initData.action || action;
    },
    /* 权限 */
    auth() {
      let auth = null;
      try {
        auth = JSON.parse(this.initData?.auth);
      } catch (error) {
        auth = {};
        console.warn('taskEdit json.parse auth -> error', error);
      }
      
      return auth;
    },
    /* 禁用状态 */
    disabled() {
      return this.submitting || this.pending;
    },
    editId() {
      // TODO: 因为initData无数据 编辑时暂时取form.id
      return this.initData?.id || this.form?.id || '';
    },
    eventId() {
      return this.initData?.eventId || '';
    },
    /**
     * @description 是否显示 [返回] 按钮 
     * 1. 工单编辑有工单id
     * 2. 
     * 3. 复制工单
     * 4. 事件转工单
    */
    isShowBackButton() {
      let path = this.path;
      return (
        (path.startsWith('/task/edit/') && path != '/task/edit')
        || path.startsWith('/task/noFilterEdit/')
        || path.startsWith('/task/copyTask')
        || path.startsWith('/event/convent2Task/jump')
      )
    },
    /** 
     * @description 是否显示 [保存] 按钮
     * 1. 当前工单状态不为空
     * 2. 且 当前工单状态 不等于 创建
    */
    isShowSaveButton() {
      return this.workTask.state && this.workTask.state != TaskStateEnum.CREATED.value;
    },
    /** 
     * @description 是否显示 [只保存] 按钮
     * 1. 当前工单状态 为空
     * 2. 且 当前工单状态 等于 创建
    */
    isShowOnlySaveButton() {
      return !this.workTask.state || this.workTask.state == TaskStateEnum.CREATED.value;
    },
    /** 
     * @description 是否显示 [保存并派单] 按钮
     * 1. 当前工单状态 为空
     * 2. 且 当前工单状态 等于 创建
     * 3. 有工单派单权限
    */
    isShowSaveAndAllotButton() {
      return this.isShowOnlySaveButton && this.auth.indexOf('TASK_DISPATCH') > -1;
    },
    /** 
     * @description 是否显示工单按钮组
     * 1. 不是新建计划任务
     * 2. 不是编辑计划任务
     */
    isShowTaskButtonGroup() {
      return !this.isFromPlan && !this.isPlanTaskEdit;
    },
    /* 是否为 来自计划任务 */
    isFromPlan() {
      return this.initData?.fromPlan === true;
    },
    /* 是否为 来自事件转工单 */
    isFromEvent() {
      return this.initData?.fromEve === true;
    },
    /* 是否为 编辑计划任务 */
    isPlanTaskEdit() {
      return this.initData?.editPlanTask === true;
    },
    /* 是否为 工单创建 */
    isTaskCreate() {
      return Boolean(this.workTask.id) === false;
    },
    /* 是否为 工单编辑 */
    isTaskEdit() {
      return Boolean(this.workTask.id) === true;
    },
    path() {
      return this.initData?.path || '';
    },
    task() {
      let task = null;
      try {
        task = JSON.parse(this.initData?.task);
      } catch (error) {
        task = {};
        console.warn('taskEdit json.parse task -> error', error);
      }
      
      return task;
    },
    types() {
      return this.initData?.taskTypeList || [];
    },
    workTask() {
      return this.initData?.workTask || {};
    },
  },
  methods: {
    /** 
     * @description 创建工单方法
    */
    createTaskMethod(params) {
      this.$http
        .post('/task/create', params)
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

          // this.reloadTab();
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
    submit(isAllot) {
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
            return this.createTaskMethod(params);
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
      let form = {};

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