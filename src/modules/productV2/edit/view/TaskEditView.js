/* api */
import * as TaskApi from '@src/api/TaskApi.ts'
/* component */
import TaskEditForm from '@src/modules/task/edit/components/TaskEditForm/TaskEditForm.vue'
import PlanTaskEditForm from '@src/modules/task/edit/components/PlanTaskEditForm/PlanTaskEditForm.vue'
/* utils */
import {parse} from '@src/util/querystring';
import * as FormUtil from '@src/component/form/util'
import * as util from '@src/modules/task/util/task'
import _ from 'lodash'
import platform from '@src/platform'
import {
  customerAddressSelectConversion,
  customerSelectConversion,
  linkmanSelectConversion
} from '@src/util/conversionFunctionUtil.ts'
/* vue */
import data from './data'
import computed from './computed'
import methods from './methods'
/* enum */
import { TaskFieldNameMappingEnum } from '@model/enum/FieldMappingEnum.ts'
/* constant */
import { PLATN_TASK_PLAN_TIME_REQUIRES_MESSAGE } from '@src/model/const/Alert.ts'

let taskTemplate = {};

export default {
  name: 'task-edit-view',
  inject: ['initData'],
  data() {
    return data
  },
  computed,
  async mounted() {
    try {
      this.initialize();

      // 初始化默认值
      let form = this.workTask;

      this.fields = await TaskApi.getTaskTemplateFields({ templateId: this.genTemplateId(), tableName: 'task' });

      form = util.packToForm(this.fields, form);
      this.form = FormUtil.initialize(this.fields, form);

      // 呼叫中心需求处理
      this.callCenterWithTaskDataHandler();

      this.init = true;
      
      this.$nextTick(() => {
        // 从客户新建工单处理
        this.customerCreateTaskHandler();
        // 从产品新建工单处理
        this.productCreateTaskHandler();
      })
      // 关联项查询处理
      this.relationFieldHandler();

      // 是否打开派单设置弹窗
      this.$nextTick(async () => {
        let query = parse(window.location.search) || {}
        if(query.openAllotSetting) {
          await this.planTaskEditDialogOpen();
        }
      });
    } catch (error) {
      console.warn('error ', error)
    }
  },
  methods: {
    ...methods,
    /** 
     * 关闭并打开新的Tab
    */
    closeAndOpenTab(url, newTabId) {
      location.href = url;
      // let id = window.frameElement.dataset.id;
      // this.$platform.closeTab(id)
      
      // let fromId = window.frameElement.getAttribute('id')
      
      // this.$platform.openTab({
      //   id: newTabId,
      //   title: '',
      //   url,
      //   reload: true,
      //   close: true,
      //   fromId
      // });
    },
    /** 
     * @description 呼叫中心与工单数据的处理 linkman/address/customer
    */
    callCenterWithTaskDataHandler() {
      let callCenterMap = this.initData?.callCenterMap || {};
      let { callRecordId } = callCenterMap;
      if(!callRecordId) {
        return console.warn(`Caused: current is not have callRecordId, The value is ${callRecordId}`);
      }

      // 联系人 地址
      let { linkman, address } = callCenterMap;
      // 更新联系人/客户数据
      if (linkman) {
        let { customer } = linkman;
        this.$set(this.form, TaskFieldNameMappingEnum.Customer, [customerSelectConversion(customer)]);
        this.$set(this.form, TaskFieldNameMappingEnum.Linkman, [linkmanSelectConversion(linkman)]);
      }
      // 更新地址数据
      if(address) {
        this.$set(this.form, TaskFieldNameMappingEnum.Address, [customerAddressSelectConversion(address)]);
      }
    },
    /** 
     * @description 创建工单方法
    */
    createTaskMethod(params, isAllot) {
      TaskApi.createTask(params)
        .then(res => {
          let isSucc = res.success;

          platform.notification({
            type: isSucc ? 'success' : 'error',
            title: `创建工单${isSucc ? '成功' : '失败'}`,
            message: !isSucc && res.message
          })

          if (!isSucc) {
            return this.togglePending();
          }
          
          // 根据是否派单决定跳转地址
          let taskId = res.result;
          let taskDetailPath = `/task/view/${taskId}`;
          let taskAllotPath = `/task/allotTask?id=${taskId}`;
          let url = isAllot ? taskAllotPath : taskDetailPath;
          let id = isAllot ? `task_allot_${taskId}` : `task_view${taskId}`

          this.closeAndOpenTab(url, id)
          this.togglePending()

        })
        .catch(err => {
          this.togglePending();
          console.error('err', err)
        })
    },
    /** 
     * @description 从客户新建工单处理
    */
    customerCreateTaskHandler() {
      if(!this.isFromCustomer && !this.isFromPlan) return

      let form = this.$refs.form;
      if(!form) return;

      form.updateCustomer(this.form.customer, { isForceUpdateCustomer: true });
      form.relationFieldSelectHandler(TaskFieldNameMappingEnum.Product);
    },
    /** 
     * @description 获取工单类型id
     * 1. 优先取 defaultType 的 id
     * 2. task 数据里的 templateId
     * 3. 工单类型列表中的第一个
     */
    genTemplateId() {
      let defaultType = this.initData?.defaultType || {};
      let workTask = this.workTask || {};
      let firstType = this.types?.[0] || {};
      
      return defaultType.id || workTask.templateId || firstType.id;
    },
    /** 
     * @description 返回
    */
    goBack() {
      // 复制工单
      if(this.isCopyTask) {
        let { taskId = '' } = this.urlParams;
        this.pending = true;
        return this.closeAndOpenTab(`/task/view/${taskId}`, `task_view${taskId}`)
      }
      // 事件转工单
      else if(this.isFromEvent) {
        let { eventId = '' } = this.urlParams;
        this.pending = true;
        return this.closeAndOpenTab(`/event/view/${eventId}`, `event_view${eventId}`);
      }
      // 工单新建
      else if (this.isTaskCreate) {
        let id = window.frameElement.dataset.id;
        
        return this.$platform.closeTab(id)
      }

      parent.frameHistoryBack(window)

    },
    /** 
     * @description 查询工单配置
     */
    fetchTaskConfig() {
      return TaskApi.getTaskConfig().catch(err => console.warn(err));
    },
    /** 
     * @description 初始化
    */
    initialize() {
      this.initUrl();
      this.initTitle();
    },
    /** 
     * @description 初始化url
    */
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
    /** 
     * @description 初始化标题
    */
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
    jumpWithPlanTask() {
      try {
        let isFromId = window?.frameElement?.getAttribute('fromid');

        if(isFromId) {
          let closeId = window.frameElement.dataset.id;
          this.$platform.refreshTab(isFromId);
          this.$platform.closeTab(closeId);
        } else {
          this.closeAndOpenTab('/task/planTask/list', 'task_plan_list')
        }
        
      } catch (error) {
        console.warn('jumpWithPlanTask -> error', error)
      }
    },
    /** 
     * @description 新建计划任务弹窗
    */
    async planTaskCreateDialogOpen() {
      let planTime = this.form?.[TaskFieldNameMappingEnum.PlanTime]
      if(!planTime) return this.$platform.alert(PLATN_TASK_PLAN_TIME_REQUIRES_MESSAGE)

      this.submitting = true;

      this.$refs.form
        .validate()
        .then(async (valid) => {
          this.submitting = false;
          
          if (!valid) return Promise.reject('validate fail.');

          // 获取工单配置
          let result = await this.fetchTaskConfig();
          let taskConfig = result?.taskConfig || {};
          this.$set(this, 'taskConfig', taskConfig);
          
          // 显示计划任务弹窗
          let planTaskEditFormEl = this.planTaskEditFormEl;
          if(planTaskEditFormEl) {
            planTaskEditFormEl.toggle();
            planTaskEditFormEl.fetchExeinsyn(this.form?.customer?.[0]?.id);
          }

          this.submitting = false;
        })
    },
    /** 
     * @description 编辑计划任务弹窗
    */
    async planTaskEditDialogOpen() {
      let planTime = this.form?.[TaskFieldNameMappingEnum.PlanTime]
      if(!planTime) return this.$platform.alert(PLATN_TASK_PLAN_TIME_REQUIRES_MESSAGE)

      this.submitting = true;

      this.$refs.form
        .validate()
        .then(async (valid) => {
          this.submitting = false;
          
          if (!valid) return Promise.reject('validate fail.');

          // 获取工单配置
          let result = await this.fetchTaskConfig();
          let taskConfig = result?.taskConfig || {};
          this.$set(this, 'taskConfig', taskConfig);
          
          // 显示计划任务弹窗
          let planTaskEditFormEl = this.planTaskEditFormEl;
          let planTask = this.initData?.planTask || {};
          planTaskEditFormEl && planTaskEditFormEl.toggle(true, planTask);

          this.submitting = false;
        })
    },
    /** 
     * @description 新建计划任务提交
    */
    planTaskCreateSubmit(params = {}) {
      TaskApi.createPlanTask(params)
        .then(res => {
          let isSucc = res.success;

          platform.notification({
            type: isSucc ? 'success' : 'error',
            title: `创建计划任务${isSucc ? '成功' : '失败'}`,
            message: !isSucc && res.message
          })

          if (!isSucc) {
            return this.togglePending();
          }
          
          this.jumpWithPlanTask();
          this.togglePending();

        })
        .catch(err => console.error('err', err))
        .finally(() => {
          // 计划任务元素
          let planTaskEditFormEl = this.planTaskEditFormEl;
          planTaskEditFormEl && planTaskEditFormEl.togglePending();

          this.togglePending();
        })
    },
    /** 
     * @description 编辑计划任务提交
    */
    planTaskEditSubmit(params = {}) {
      TaskApi.editPlanTask(params)
        .then(res => {
          let isSucc = res.success;

          platform.notification({
            type: isSucc ? 'success' : 'error',
            title: `编辑计划任务${isSucc ? '成功' : '失败'}`,
            message: !isSucc && res.message
          })

          if (!isSucc) {
            return this.togglePending();
          }
          
          this.jumpWithPlanTask();
          this.togglePending();

        })
        .catch(err => console.error('err', err))
        .finally(() => {
          // 计划任务元素
          let planTaskEditFormEl = this.planTaskEditFormEl;
          planTaskEditFormEl && planTaskEditFormEl.togglePending();
          this.togglePending();
        })
    },
    /** 
     * @description 从产品新建工单处理
    */
    productCreateTaskHandler() {
      if(!this.isFromProduct && !this.isFromPlan) return

      let form = this.$refs.form;
      if(!form) return;

      // 更新产品数据
      form.updateProduct(
        this.form.product,
        { isForceUpdateCustomer: true, isUpdateCustomerProduct: false, isSilentUpdateLinkmanAndAddress: true }
      );
    },
    /** 
     * @description 刷新tab
    */
    reloadTab() {
      let fromId = window.frameElement.getAttribute('fromid');

      this.$platform.refreshTab(fromId);
    },
    /** 
     * @description 关联显示项
    */
    relationFieldHandler() {
      // 事件转工单/拷贝工单
      if(!this.isFromEvent && !this.isCopyTask) return
      // 从客户新建工单
      if(this.isFromCustomer) return;

      // 子组件form
      this.$nextTick(() => {
        let form = this.$refs.form;
        if(!form) return;
        
        // 关联显示项选择
        form.relationFieldSelectHandler(TaskFieldNameMappingEnum.Customer);
        form.relationFieldSelectHandler(TaskFieldNameMappingEnum.Product);
      })

    },
    /** 
     * @description 提交
     * @param {Boolean} isAllot 是否派单
    */
    submit: _.debounce(function (isAllot = false) {
      if(this.submitting) return

      this.submitting = true;

      this.$refs.form
        .validate()
        .then(valid => {
          this.submitting = false;

          if (!valid) return Promise.reject('validate fail.');
        
          const task = util.packToTask(this.fields, this.form);
          task.templateId = taskTemplate.value;
          task.templateName = taskTemplate.text;
          
          const { address, customer, tick, linkman } = task;
          const params = {
            address,
            customer,
            eventId: this.isFromEvent ? this.eventId : '',
            flow: this.isFromEvent ? this.urlParams.flow : '',
            linkman,
            task,
            tick,
          };
        
          this.togglePending(true);

          if (this.isTaskEdit) {
            return this.updateTaskMethod(params, isAllot);
          }
          if (this.isTaskCreate) {
            return this.createTaskMethod(params, isAllot);
          }

        })
        .catch(err => {
          this.togglePending();
          console.error(err);
        })
    }, 250),
    /** 
     * @description 计划任务提交
    */
    submitWithPlanTask: _.debounce(function (planTaskParams = {}) {
      if (this.pending) {
        return console.warn('Caused: can not submitWithPlanTask action, because this.pending is true');
      }

      this.togglePending(true);
      // 计划任务元素
      let planTaskEditFormEl = this.$refs.planTaskEditForm;
      planTaskEditFormEl && planTaskEditFormEl.togglePending(true);
      
      const task = util.packToTask(this.fields, this.form);
      task.templateId = taskTemplate.value;
      task.templateName = taskTemplate.text;
      
      const params = {
        ...planTaskParams,
        task
      };
      
      if (this.isFromPlan) {
        return this.planTaskCreateSubmit(params);
      }
      if (this.isPlanTaskEdit) {
        return this.planTaskEditSubmit(params);
      }

    }, 250),
    togglePending(pending = false) {
      this.pending = pending;
      this.loadingPage = pending;
    },
    /** 
     * @description 编辑工单方法
    */
    updateTaskMethod(params, isAllot = false) {
      TaskApi.editTask(params)
        .then(res => {
          let isSucc = res.success;

          platform.notification({
            type: isSucc ? 'success' : 'error',
            title: `更新工单${isSucc ? '成功' : '失败'}`,
            message: !isSucc && res.message
          })

          if (!isSucc) {
            return this.togglePending();
          }
          // 根据是否派单决定跳转地址
          let taskId = this.editId;
          let taskDetailPath = `/task/view/${taskId}`;
          let taskAllotPath = `/task/allotTask?id=${taskId}`;
          let url = isAllot ? taskAllotPath : taskDetailPath;
          let id = isAllot ? `task_allot_${taskId}` : `task_view${taskId}`

          this.closeAndOpenTab(url, id)
          this.togglePending()

        })
        .catch(err => {
          this.togglePending();
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
  components: {
    [TaskEditForm.name]: TaskEditForm,
    [PlanTaskEditForm.name]: PlanTaskEditForm
  }
}