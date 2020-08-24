/* model */
import TaskStateEnum from '@model/enum/TaskStateEnum';

export default {
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
  /* 编辑功夫id */
  editId() {
    return this.workTask?.id || '';
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
}