/* api */
import * as TaskApi from '@src/api/TaskApi.ts';

/* util */
import AuthUtil from '@src/util/auth';
import { getRootWindow } from '@src/util/dom';

/* component */
import CancelTaskDialog from './components/CancelTaskDialog.vue';
import PlanTimeDialog from './components/PlanTimeDialog.vue';
import ApproveTaskDialog from './components/ApproveTaskDialog.vue';
import ProposeApproveDialog from './components/ProposeApproveDialog.vue';

import TaskInfoRecord from './components/TaskInfoRecord.vue';
import TaskReceiptView from './components/TaskReceipt/View/TaskReceiptView.vue';
import TaskReceiptEditView from './components/TaskReceipt/Edit/TaskReceiptEditView.vue';
import TaskAccount from './components/TaskAccount.vue';
import TaskFeedback from './components/TaskFeedback';
import TaskCard from './components/TaskCard';

export default {
  name: 'task-detail-view',
  inject: ['initData'],
  data() {
    return {
      loading: false,
      pending: false,
      task: this.initData?.task || {},
      fields: [], // 工单表单字段
      tabs: [], // 工单关联数据tab
      currTab: 'task-info-record', // 当前选中的tab
      // TODO: 工单状态从移动端拷贝的数据
      stateText: {
        created: '待分配',
        allocated: '已指派',
        processing: '进行中',
        finished: '已完成',
        offed: '已取消',
      },
      // 回退工单弹窗
      backDialog: {
        visible: false,
        reason: ''
      },
      // 暂停工单弹窗
      pauseDialog: {
        visible: false,
        reason: ''
      },
      // 拒绝工单弹窗
      refuseDialog: {
        visible: false,
        reason: ''
      },
      receiptFields: [] // 自定义回执字段
    }
  },
  computed: {
    /* 客户字段 */
    customerField() {
      return this.fields.filter(f => f.fieldName === 'customer')[0];
    },
    /* 客户字段配置 */
    customerOption() {
      return (this.customerField.setting && this.customerField.setting.customerOption) || {};
    },
    /* 计划时间字段 */
    planTimeField() {
      return this.fields.filter(f => f.fieldName === 'planTime')[0];
    },
    /** 工单设置 */
    taskConfig() {
      return this.initData?.taskConfig || {};
    },
    /** 工单类型设置 */
    taskType() {
      return this.initData?.taskType || {};
    },
    /** 当前登录用户 */
    loginUser() {
      return this.initData.loginUser || {};
    },
    /* 该登录账户是否是工单负责人 */
    isExecutor() {
      let executor = this.task.executor || {};
      return executor.userId == this.loginUser.userId;
    },
    /** 当前用户的权限 */
    permission() {
      return this.loginUser.authorities || {};
    },
    /* 工单编辑权限 */
    editAuth() {
      return this.hasAuth('TASK_EDIT');
    },
    /** 
    * @description 工单是否被删除
    * 在工单删除时不允许做任何操作，只能查询 
    * 所有操作的权限应该以此为基础
    */
    isDelete() {
      return this.task.isDelete === 1;
    },
    /* 工单是否在审批状态 */
    isApproving() {
      return this.task.inApprove == 1;
    },
    /* 工单是否在暂停状态 */
    isPaused() {
      return this.task.isPaused == 1;
    },
    /* 工单是否是未完成状态 */
    unFinishedState() {
      let unfinishedStateArr = ['created', 'allocated', 'taskPool', 'accepted', 'refused', 'processing'];
      return unfinishedStateArr.indexOf(this.task.state) >= 0;
    },
    /* 工单是否是完成状态 */
    finishedState() {
      let finishedStateArr = ['finished', 'costed', 'closed'];
      return finishedStateArr.indexOf(this.task.state) >= 0;
    },
    /** 
    * @description 是否显示编辑按钮
    * 1. 不是审批状态
    * 2. 且 不是暂停状态
    * 3. 且 工单允许编辑 canEditTask
    * 4. 且 工单允许修改 isAllowUpdate
    * 5. 满足以上条件就会显示编辑按钮 无论是否有工单编辑权限TASK_EDIT
    */
    allowEditTask() {
      return !this.isApproving && !this.isPaused && this.initData.canEditTask && this.initData.isAllowUpdate;
    },
    /** 
    * @description 是否显示删除按钮
    * 1. 不是审批状态
    * 2. 且 不是暂停状态
    * 3. 且 有工单删除权限TASK_DELETE
    * 4. 且 工单允许删除 canDeleteTask
    */
    allowDeleteTask() {
      return !this.isApproving && !this.isPaused && this.hasAuth('TASK_DELETE') && this.initData.canDeleteTask;
    },
    /** 
    * @description 是否显示回退工单按钮
    * 1. 不是审批状态
    * 2. 且 工单是已完成状态
    * 3. 且 工单编辑设置开启了允许退回工单回执taskConfig.taskRollBack
    * 4. 且 允许回退工单 canRollBack
    */
    allowBackTask() {
      return !this.isApproving && this.task.state === 'finished' && this.taskConfig.taskRollBack && this.initData.canRollBack;
    },
    /** 
    * @description 是否显示取消工单按钮
    * 1. 当前登录用户有工单编辑权限TASK_EDIT
    * 2. 不是审批状态
    * 3. 且 不是暂停状态
    * 4. 且 工单是未完成状态
    * 5. 且 允许取消工单 canOffTask
    */
    allowCancelTask() {
      return this.editAuth && !this.isApproving && !this.isPaused && this.initData.canOffTask && this.unFinishedState;
    },
    /** 
    * @description 是否显示接单按钮
    * 1. 不是审批状态
    * 2. 且 工单状态是工单池
    */
    allowPoolTask() {
      return !this.isApproving && this.task.state === 'taskPool';
    },
    /** 
    * @description 是否显示暂停按钮
    * 1. 不是审批状态
    * 2. 且 不是暂停状态
    * 3. 且 工单状态是created/allocated/accepted/processing其中一种
    * 4. 且 允许暂停工单 canPause
    */
    allowPauseTask() {
      let stateArr = ['created', 'allocated', 'accepted', 'processing'];
      return !this.isApproving && !this.isPaused && this.initData.canPause && stateArr.indexOf(this.task.state) >= 0;
    },
    /** 
    * @description 是否显示继续按钮
    * 1. 不是审批状态
    * 2. 且 是暂停状态
    * 3. 且 允许暂停工单 canPause
    */
    allowGoOnTask() {
      return !this.isApproving && this.isPaused && this.initData.canPause;
    },
    /** 
    * @description 是否显示接受按钮
    * 1. 当前登录用户是工单负责人
    * 2. 不是审批状态
    * 3. 且 不是暂停状态
    * 4. 且 工单是已指派状态
    */
    allowAcceptTask() {
      return this.isExecutor && !this.isApproving && !this.isPaused && this.task.state === 'allocated';
    },
    /** 
    * @description 是否显示拒绝按钮
    * 1. 满足显示接受按钮判断逻辑
    * 2. 且 工单设置中开启了允许工单负责人拒绝工单
    */
    allowRefuseTask() {
      return this.allowAcceptTask && this.taskConfig.taskRefuse;
    },
    /** 
    * @description 是否显示开始按钮
    * 1. 当前登录用户是工单负责人
    * 2. 不是审批状态
    * 3. 且 不是暂停状态
    * 4. 且 工单状态是accepted
    * 5. 且 工单类型设置中流程设置开启了开始流程节点
    */
    allowStartTask() {
      return this.isExecutor && !this.isApproving && !this.isPaused && this.task.state === 'accepted' && this.taskType?.flowSetting?.start?.state;
    },
    /** 
    * @description 是否显示指派按钮
    * 1. 当前登录用户有指派工单权限TASK_DISPATCH
    * 2. 不是审批状态
    * 3. 且 不是暂停状态
    * 4. 且 工单状态是created/refused/taskPool其中一种
    */
    allowAllotTask() {
      let stateArr = ['created', 'refused', 'taskPool'];
      return this.hasAuth('TASK_DISPATCH') && !this.isApproving && !this.isPaused && stateArr.indexOf(this.task.state) >= 0;
    },
    /** 
    * @description 是否显示转派按钮
    * 1. 不是审批状态
    * 2. 且 不是暂停状态
    * 3. 且 工单状态是allocated/accepted/processing其中一种
    * 4. 允许转派 canRedeploy
    */
    allowRedeployTask() {
      let stateArr = ['allocated', 'accepted', 'processing'];
      return !this.isApproving && !this.isPaused && this.initData.canRedeploy && stateArr.indexOf(this.task.state) >= 0;
    },
    /** 
    * @description 是否显示打印工单按钮
    * 1. 工单类型设置开启了启用打印功能
    * 2. 满足以上条件即会显示打印工单 
      (1)曾打印 task.oncePrinted == 1 样式有区别
    */
    allowPrintTask() {
      let { printTask } = this.taskType?.options || {};
      return printTask || printTask == null;
    },
    /** 
    * @description 是否显示服务报告按钮
    * 1. 工单类型设置开启了发送服务报告
    * 2. 且 工单是已完成状态
    */
    allowServiceReport() {
      let { serviceReport } = this.taskType.options || {};
      return (serviceReport || serviceReport == null) && this.finishedState;
    },
    /** 服务报告是否使用系统模板 */
    srSysTemplate() {
      return this.taskType?.options?.srSysTemplate;
    },
    /** 
    * @description 是否显示审批按钮
    * 1. 是审批状态
    * 2. 且 当前工单是否存在审批unFinishedAppr.id
    * 3. 允许审批 canApprove
    */
    allowApprove() {
      return this.isApproving && this.unFinishedAppr.id && this.initData.canApprove;
    },
    /** 
    * @description 是否显示撤回审批按钮
    * 1. 是审批状态
    * 2. 且 当前工单是否存在审批unFinishedAppr.id
    * 3. 允许撤回审批 canOffAppr
    */
    allowoffApprove() {
      return this.isApproving && this.unFinishedAppr.id && this.initData.canOffAppr;
    },
    /** 工单审批数据 */
    unFinishedAppr() {
      return this.initData.unFinishedAppr || {};
    },
    /** 
    * @description 是否显示回执完成按钮
    * 1. 当前登录用户是工单负责人
    * 2. 不是审批状态
    * 3. 且 不是暂停状态
    * 4. 且 (如果工单状态是accepted且工单流程设置禁用了开始流程 或 如果工单状态是processing且工单流程设置开启了开始流程)
    */
    allowFinishTask() {
      let startFlow = this.taskType?.flowSetting?.start?.state;
      let { state } = this.task;

      return this.isExecutor && !this.isApproving && !this.isPaused && ((state === 'accepted' && !startFlow) || (state === 'processing' && startFlow));
    },
    /* 是否显示添加备注按钮 */
    allowRemark() {
      return this.initData.canViewTask;
    },
    /** 
     * @description 是否显示 [审核结算]tab
     * 1. 工单是已完成状态
     * 2. 且 工单是否结算过
     * 3. 且 根据工单结算设置结算信息查看权限
      (1)仅有审核结算权限可见“onlyHasBalanceAuthiroty”且登录账户有工单审核结算权限TASK_AUDIT
      (2)或 有工单查看权限即可见“hasTaskViewAuthiroty”且(登录账户有工单审核结算权限TASK_AUDIT或有工单查看权限TASK_VIEW)
      (3)或 有工单编辑权限即可见“hasTaskEditAuthiroty”且(登录账户有工单审核结算权限TASK_AUDIT或有工单编辑权限TASK_EDIT)
    */
    viewBalanceTab() {
      let { isSettled } = this.task;
      let balanceViewAuthiroty = this.taskConfig?.taskBalanceConfig?.balanceViewAuthiroty;
      
      return (
        this.finishedState
        && (isSettled == 0 || isSettled == 1)
        && ((balanceViewAuthiroty === 'onlyHasBalanceAuthiroty' && this.hasAuth('TASK_AUDIT'))
          || (balanceViewAuthiroty === 'hasTaskViewAuthiroty' && this.hasAuth(['TASK_AUDIT', 'TASK_VIEW']))
          || (balanceViewAuthiroty === 'hasTaskEditAuthiroty' && this.hasAuth(['TASK_AUDIT', 'TASK_EDIT'])))
      );
    },
    /** 
     * @description 是否显示 [客户评价]tab
     * 1. 评价时间不为null 或 未回访过
     * 2. 且 根据客户满意度设置中客户评价信息查看权限
      (1)仅有回访权限可见“onlyHasReviewAuthiroty”且登录账户有工单回访权限TASK_FEEDBACK
      (2)或 有工单查看权限即可见“hasTaskViewAuthiroty”且(登录账户有工单审核结算权限TASK_FEEDBACK或有工单查看权限TASK_VIEW)
      (3)或 有工单编辑权限即可见“hasTaskEditAuthiroty”且(登录账户有工单审核结算权限TASK_FEEDBACK或有工单编辑权限TASK_EDIT)
    */
    viewFeedbackTab() {
      let { reviewTime, isEvaluated, isReviewed } = this.task;
      let reviewViewAuthiroty = this.initData?.evaluateConfig?.reviewViewAuthiroty;
      
      return (
        (reviewTime != null || isEvaluated == 0 || isReviewed == 0)
        && ((reviewViewAuthiroty === 'onlyHasReviewAuthiroty' && this.hasAuth('TASK_FEEDBACK'))
          || (reviewViewAuthiroty === 'hasTaskViewAuthiroty' && this.hasAuth(['TASK_FEEDBACK', 'TASK_VIEW']))
          || (reviewViewAuthiroty === 'hasTaskEditAuthiroty' && this.hasAuth(['TASK_FEEDBACK', 'TASK_EDIT'])))
      );
    },
    /** 
    * @description 非自定义回执
    * 默认工单且未开启自定义回执(老功能)
    */
    notCustom() {
      let receiptConfig = this.initData.receiptConfig || {};
      return !receiptConfig?.customReceipt && this.task.templateId == '1';
    },
    /** 
    * @description 显示回执
    * 1. 工单状态是finished/costed/closed其中一种
    * 2. 或 满足显示回执按钮条件
    * 3. 或 工单处于完成审批中
    */
    showReceipt() {
      return this.finishedState || this.allowFinishTask || this.approvingForComplete;
    },
    /** 
    * @description 是否显示 [回执信息]tab
    * 满足显示回执条件后，回执表单自定义字段length=0且时隐藏tab(不包含默认工单且未开启自定义回执)
    */
    viewReceiptTab() {
      // 回执表单是否包含字段
      let hasField = this.receiptFields.length > 0;
      return this.showReceipt && hasField && !this.notCustom;
    },
    // 处理完成审批
    approvingForComplete() {
      let { canEditTask } = this.initData;
      let canLookCompleteReceipt = canEditTask || this.permission.VIP_APPROVE == 3;

      return this.isApproving && this.unFinishedAppr && this.unFinishedAppr.action == '完成' && (this.isExecutor || this.initData.canApprove || canLookCompleteReceipt);
    },
    /** 
    * @description 工单信息中计划时间是否可以修改
    * 1. 工单状态是accepted/processing其中一种
    * 2. 当前登录账户是工单负责人
    * 3. 工单设置允许修改计划时间
    */
    allowModifyPlanTime() {
      let stateArr = ['accepted', 'processing'];
      let { state } = this.task;

      return this.isExecutor && this.taskConfig.taskPlanTime && stateArr.indexOf(state) >= 0;
    },
    /** 
    * @description 是否显示DING按钮
    * 1. 有工单查看权限 canViewTask
    * 2. 且 在钉钉pc端
    * 3. 且 有工单负责人
    * 4. 且 工单不是关闭状态closed
    */
    allowDing() {
      // 是否有负责人
      let { state, executor } = this.task;
      let hasExecutor = executor && executor.userId;
      let allowDing = false;

      try {
        let rootWindow = getRootWindow(window);
        allowDing = this.initData.canViewTask && rootWindow.inDingTalkPC() && state != 'closed' && hasExecutor;
      } catch (error) {
        console.warn('Caused: TaskView allowDing -> error', error) 
      }

      return allowDing;
    },
    /** 子组件所需的数据 */
    propsForSubComponents() {
      return {
        task: this.task,
        auth: this.permission,
        receiptFields: this.receiptFields,
        isFinishApproving: this.approvingForComplete
      }
    },
  },
  methods: {
    // 构建工单关联tabs
    buildTabs() {
      return [
        {
          displayName: '工单进度',
          component: TaskInfoRecord.name,
          show: true
        },
        {
          displayName: '回执信息',
          component: TaskReceiptView.name,
          show: this.viewReceiptTab
        },
        {
          displayName: '审核结算',
          component: TaskAccount.name,
          show: this.viewBalanceTab
        },
        {
          displayName: '客户评价',
          component: TaskFeedback.name,
          show: this.viewFeedbackTab
        },
        {
          displayName: '附加组件',
          component: TaskCard.name,
          show: this.initData?.cardInfo?.length
        }
      ].filter(tab => tab.show);
    },
    // 格式化地址显示
    prettyAddress(address) {
      if (!address || Object.keys(address).length === 0) return '';

      let province = address.province || '';
      let city = address.city || '';
      let dist = address.dist || '';
      let adr = address.address || '';

      return [province, city, dist, adr].filter(a => a).join('-');
    },
    // 是否含有某一指定权限
    hasAuth(keys) {
      return AuthUtil.hasAuth(this.permission, keys);
    },
    // 编辑跳转
    goEdit() {
      const id = this.task.id;
      window.location.href = this.editAuth ? `/task/edit/${id}` : `/task/noFilterEdit/${id}`;
    },
    // 删除工单
    async deleteTask() {
      this.pending = true;

      try {
        let warningMsg = '确定要删除吗？';

        /** 
        * 如果工单为未完成状态，则需要判断工单是否曾回退，而且在最后一次完成时是否使用了备件
        * 如果使用了备件，需要提示
        */
        if (this.unFinishedState) {
          const res = await TaskApi.finishedWithPart({ taskIds: this.task.id });
          if (!res.success) {
            warningMsg = '获取工单的结算单失败，无法判断工单是否添加了备件，确定要删除所选工单吗？';
          } else if (res.success && res.result) {
            warningMsg = '工单已添加备件，确定要删除吗？';
          }
        }

        const result = await this.$platform.confirm(warningMsg);
        if (!result) return this.pending = false;

        TaskApi.deleteTask([this.task.id]).then(res => {
          if (res.success) {
            let fromId = window.frameElement.getAttribute('fromid');
            this.$platform.refreshTab(fromId);

            location.href = '/task';
          } else {
            this.$platform.alert(res.message);
            this.pending = false;
          }
        }).catch(err => {
          this.pending = false;
        })

      } catch (e) {
        console.error('deleteTask error', e);
      }
    },
    // 回退工单
    async backTask() {
      try {
        // 工单上备件用的库和当前租户备件库配置不同
        if (this.initData.isRepertoryDiff) {
          if (!await this.$platform.confirm('回执备件来源与当前备件库配置不同，回退工单将会把已使用的备件退回到原仓库，是否继续？')) return;
        }
        
        this.openDialog('back');
      } catch (e) {
        console.error('backTask error', e);
      }
    },
    // 回退工单
    back() {
      let reason = this.backDialog.reason.trim();
      if (!reason) return this.$platform.alert('请填写回退说明');

      this.pending = true;

      // 判断是完成回退还是结算回退
      const API = this.task.state == 'finished' ? 'rollBackTask' : 'rollBackBalance';
      
      const params = { taskId: this.task.id, reason };
      TaskApi[API](params).then(res => {
        if (res.success) {
          let fromId = window.frameElement.getAttribute('fromid');
          this.$platform.refreshTab(fromId);

          window.location.reload();
        } else {
          this.$platform.alert(res.message);
          this.pending = false;
        }
      }).catch(err => {
        this.pending = false;
      })
    },
    // 暂停工单
    async pause() {
      if (this.pending) return;
      this.pending = true;

      let { reason } = this.pauseDialog;
      let taskId = this.task.id;

      // 暂停是否需要审批
      const result = await TaskApi.pauseApproveCheck({ id: taskId, reason });
      if (!result.succ && result.message == '需要审批') {
        this.pauseDialog.visible = false;
        this.$refs.proposeApprove.openDialog(result.data);
        this.pending = false;
        return;
      }

      TaskApi.pauseTask({ taskId, reason }).then(res => {
        if (res.success) {
          window.location.reload();
        } else {
          this.$platform.alert(res.message);
          this.pending = false;
        }
      }).catch(err => {
        this.pending = false;
      })
    },
    // 继续
    unpause() {
      this.pending = true;

      TaskApi.unpauseTask({ taskId: this.task.id }).then(res => {
        if (res.success) {
          window.location.reload();
        } else {
          this.$platform.alert(res.message);
          this.pending = false;
        }
      }).catch(err => {
        this.pending = false;
      })
    },
    // 拒绝工单
    async refuse() {
      let reason = this.refuseDialog.reason.trim();
      if (!reason) return this.$platform.alert('请填写拒绝原因');

      if (!await this.$platform.confirm('确认拒绝此工单吗？')) return;

      this.pending = true;

      const params = { taskId: this.task.id, reason };
      TaskApi.refuseTask(params).then(res => {
        if (res.success) {
          let fromId = window.frameElement.getAttribute('fromid');
          this.$platform.refreshTab(fromId);

          location.href = '/task?viewId=12fcb144-1ea3-11e7-8d4e-00163e304a25&mySearch=execute';
        } else {
          this.$platform.alert(res.message);
          this.pending = false;
        }
      }).catch(err => {
        this.pending = false;
      })
    },
    // 开始
    async start() {
      if (this.pending) return;
      this.pending = true;

      // 开始是否需要审批
      const result = await TaskApi.startApproveCheck({ id: this.task.id });
      if (!result.succ && result.message == '需要审批') {
        this.$refs.proposeApprove.openDialog(result.data);
        this.pending = false;
        return;
      }

      TaskApi.startTask({ taskId: this.task.id }).then(res => {
        if (res.success) {
          let fromId = window.frameElement.getAttribute('fromid');
          this.$platform.refreshTab(fromId);

          window.location.reload();
        } else {
          this.$platform.alert(res.message);
          this.pending = false;
        }
      }).catch(err => {
        this.pending = false;
      })
    },
    // 指派工单
    allot() {
      this.pending = true;
      location.href = `/task/allotTask?id=${this.task.id}`;
    },
    // 转派工单
    redeploy() {
      this.pending = true;
      location.href = `/task/redeploy?id=${this.task.id}`;
    },
    // 打印工单
    printTask() {
      this.pending = true;
      TaskApi.printTask({ id: this.task.id }).then(res => {
        if (res.status == 0) {
          let url = `${window.location.origin}/print/printTaskDispatcher?token=${res.data}`;
          parent.openHelp(url);
        }
      })
        .catch(err => console.error(err))
        .finally(() => {
          this.pending = false;
        })
    },
    // 生产服务报告
    createReport(isPdf) {
      location.href = `/task/createServiceReport?taskId=${this.task.id}&isPdf=${isPdf}`;
    },
    // 撤回审批
    async offApprove() {
      const result = await this.$platform.confirm('确定要撤回审批吗？');
      if (!result) return;
      
      this.pending = true;
      TaskApi.offApprove({ apprId: this.unFinishedAppr.id }).then(res => {
        if (res.status == 0) {
          window.location.reload();
        } else {
          this.$platform.alert(res.message);
          this.pending = false;
        }
      }).catch(err => {
        this.pending = false;
      })
    },
    // 完成回执
    async finishTask() {
      try {
        this.pending = true;

        let result = await TaskApi.checkNotNullForCard({ id: this.task.id, flow: 'finish' });

        if (result.status == 0) {
          let { showAttachment, showSparepart, showService } = this.taskType.options;
          if (this.taskType.id != '1' && !showAttachment && !showSparepart && !showService) {
            // TODO:判断回执表单自定义字段length等于0，直接完成
          } else {
            // TODO: 回执信息tab切换
          }
        } else {
          this.$platform.alert(result.message);
        }

        this.pending = false;

      } catch (e) {
        console.error('startTask error', e);
      }
    },
    // DING
    ding(all = true) {
      let { id, taskNo, executor, synergies } = this.task;

      let users = [];
      users.push(executor.staffId);
      
      // 所有人(工单负责人和协同人)
      if (all && synergies && synergies.length) {
        synergies.forEach(item => users.push(item.staffId));
      }

      window.parent.send_link_ding_message(users, taskNo, id);
    },
    // 打开弹窗
    openDialog(action) {
      if (action === 'cancel') {
        this.$refs.cancelTaskDialog.openDialog();
      } else if (action === 'acceptFromPool' || action === 'accept' || action === 'modifyPlanTime') {
        this.$refs.planTimeDialog.openDialog(action);
      } else if (action === 'approve') {
        this.$refs.approveTaskDialog.openDialog();
      } else if (action === 'pause') {
        this.pauseDialog.reason = '';
        this.pauseDialog.visible = true;
      } else if (action === 'refuse') {
        this.refuseDialog.reason = '';
        this.refuseDialog.visible = true;
      } else if (action === 'back') {
        this.backDialog.reason = '';
        this.backDialog.visible = true;
      } else if (action === 'finish') {
        this.$refs.taskReceiptEdit.openDialog();
      }
    },
    // 发起审批
    proposeApprove(data) {
      this.$refs.proposeApprove.openDialog(data);
    }
  },
  async mounted() {
    try {
      this.loading = true;

      let { templateId } = this.task;

      let subtask = [
        TaskApi.getTaskTemplateFields({ templateId, tableName: 'task' })
      ];

      // 显示回执时获取回执字段信息
      if (this.showReceipt) subtask.push(TaskApi.getTaskTemplateFields({ templateId, tableName: 'task_receipt' }));

      const result = await Promise.all(subtask);

      const fields = result[0] || [];
      this.fields = [...fields, {
        displayName: '负责人',
        fieldName: 'executor',
        formType: 'user',
        isSystem: 1,
      }, {
        displayName: '协同人',
        fieldName: 'synergies',
        isSystem: 1
      }, {
        displayName: '完成时间',
        fieldName: 'completeTime',
        formType: 'timestamp',
      }, {
        displayName: '满意度',
        fieldName: 'degree'
      }, {
        displayName: '工单状态',
        fieldName: 'state',
        isSystem: 1
      }, {
        displayName: '创建人',
        fieldName: 'createUser',
        formType: 'user',
        isSystem: 1,
      }, {
        displayName: '创建时间',
        fieldName: 'createTime',
        formType: 'timestamp',
        isSystem: 1,
      }];

      this.receiptFields = result[1] || [];
      this.tabs = this.buildTabs();

      this.loading = false;

    } catch (e) {
      console.error('error ', e)
    }
  },
  components: {
    [CancelTaskDialog.name]: CancelTaskDialog,
    [PlanTimeDialog.name]: PlanTimeDialog,
    [ApproveTaskDialog.name]: ApproveTaskDialog,
    [ProposeApproveDialog.name]: ProposeApproveDialog,
    [TaskInfoRecord.name]: TaskInfoRecord,
    [TaskReceiptView.name]: TaskReceiptView,
    [TaskReceiptEditView.name]: TaskReceiptEditView,
    [TaskAccount.name]: TaskAccount,
    [TaskFeedback.name]: TaskFeedback,
    [TaskCard.name]: TaskCard,
  }
}