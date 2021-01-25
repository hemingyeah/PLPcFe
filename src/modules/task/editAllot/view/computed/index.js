/* enum */
import AuthEnum from '@model/enum/AuthEnum.ts'
/* util */
import qs from '@src/util/querystring'
/* model */
import TaskStateEnum from '@model/enum/TaskStateEnum.ts'
/* util */
import { isArray } from '@src/util/type'

export default {
  /* 权限 */
  auth() {
    return this.initData?.auth || [];
  },
  /* 当前工单状态 */
  currentTaskState() {
    return this.isTaskCreate ? this.allotTask.state : this.task.state
  },
  /* 当前工单类型id */
  currentTaskTemplateId() {
    return this.isTaskCreate ? this.template.value : this.task.templateId
  },
  /* 禁用状态 */
  disabled() {
    return this.submitting || this.pending;
  },
  /* 编辑工单id */
  editId() {
    return this.workTask?.id || '';
  },
  /* 事件id 事件转工单用 */
  eventId() {
    return this.initData?.eventId || this.urlParams.eventId || '';
  },
  /** 
   * @description 是否是 复制工单
  */
  isCopyTask() {
    return this.initData?.fromCopy || window.location.href.indexOf('copyTask') > -1;
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
    // 是否显示
    let show = false
    // 权限数据是否为数组
    let isAuthArray = isArray(this.auth)
    try {
      // 是否有权限
      let isHaveAuth = isAuthArray ? this.auth.indexOf(AuthEnum.TASK_DISPATCH) > -1 : Boolean(this.auth?.[AuthEnum.TASK_DISPATCH])
      show = this.isShowOnlySaveButton && isHaveAuth
    } catch (error) {
      show = false
      console.error('isShowSaveAndAllotButton ~ error', error)
    }
    
    return show
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
  /* 是否为 来自客户新建 */
  isFromCustomer() {
    return this.initData?.fromCus === true;
  },
  /* 是否为 来自事件转工单 */
  isFromEvent() {
    return this.initData?.fromEve === true;
  },
  /* 是否为 来自产品新建 */
  isFromProduct() {
    return this.initData?.fromPro === true;
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
  planTaskEditFormEl() {
    return this.$refs.planTaskEditForm;
  },
  urlParams() {
    return qs.parse(window.location.search);
  },
  state() {
    return {
      isCopyTask: this.isCopyTask,
      isFromPlan: this.isFromPlan,
      isFromEvent: this.isFromEvent,
      isTaskCreate: this.isTaskCreate,
      isTaskEdit: this.isTaskEdit,
      isPlanTaskEdit: this.isPlanTaskEdit,
      isFromCustomer: this.isFromCustomer,
      isFromProduct: this.isFromProduct,
      isDisabledTaskType: Object.keys(this.allotTask).length > 0
    }
  },
  task() {
    let task = null;
    let isTaskJson = typeof this.initData.task === 'string';
    
    try {
      task = (isTaskJson ? JSON.parse(this.initData?.task) : this.initData?.task) || {};
    } catch (error) {
      task = {};
      console.warn('taskEdit json.parse task -> error', error);
    }
    
    return task;
  },
  types() {
    return this.initData?.taskTypeList || this.initData?.typeList || [];
  },
  workTask() {
    return this.initData?.workTask || this.initData?.task || {};
  },
}