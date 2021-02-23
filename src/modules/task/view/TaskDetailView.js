/* api */
import * as TaskApi from '@src/api/TaskApi.ts';

/* util */
import AuthUtil from '@src/util/auth';
import { getRootWindow } from '@src/util/dom';
import TaskStateEnum from '@model/enum/TaskStateEnum.ts';
import Filter from '@src/filter/filter.js';
import { parse } from '@src/util/querystring';
import { randomString } from '@src/util/lang';
import { isShowReport } from '@src/util/version.ts'
import {
  storageGet,
  storageSet
} from '@src/util/storage';

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
import TaskView from './components/TaskView.vue';
import TaskTimeDialog from './components/TaskTimeDialog.vue';
import TaskAllotModal from '@src/modules/task/components/TaskAllotModal/TaskAllotModal.tsx'

/* enum */
import { TaskEventNameMappingEnum } from '@model/enum/EventNameMappingEnum.ts';
/* mixin */
import tourGuide from '@src/mixins/tourGuide'

const ENCRYPT_FIELD_VALUE = '***';

const { TASK_GUIDE_DETAIL } = require('@src/component/guide/taskV2Store');


export default {
  name: 'task-detail-view',
  inject: ['initData'],
  mixins: [tourGuide],
  data() {
    return {
      loading: false,
      pending: false,
      collapse: true,
      task: this.initData?.task || {},
      taskState: { value: this.initData?.task?.state || '' },
      fields: [], // 工单表单字段
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
      // 时间轴弹窗
      timeDialog: {
        visible: false
      },
      backList: [], //异常原因
      systemAdmin: '', //是否 是系统管理员 判断是否可以跳转到系统页面配置
      receiptFields: [], // 自定义回执字段
      customerRelationTaskCountData: {}, // 客户关联工单数量
      hasCallCenterModule: localStorage.getItem('call_center_module') == 1,
      stateButtonData: [], // 工单当前状态下主操作按钮
      leftActiveTab: 'task-view',
      rightActiveTab: 'record',
      collapseDirection: '',
      popperOptions: {
        boundariesElement: 'viewport',
        removeOnDestroy: true
      },
      nowGuideStep: 5,
      guideSearchModelSave: false,
      guideDropdownMenu: false,
      isGuide: false,
      // 显示详情向导
      showTaskDetailGuide: false,
      // 是否显示指派弹窗
      showAllotModal: false,
      checkBack: ''
    }
  },
  computed: {
    /** 
    * @description 客户字段 
    */
    customerField() {
      return this.fields.filter(f => f.fieldName === 'customer')[0];
    },
    /** 
    * @description 客户字段配置 
    */
    customerOption() {
      return this.customerField?.setting?.customerOption || {};
    },
    /* 是否可以查看客户详情 */
    canSeeCustomer() {
      return this.initData.canSeeCus;
    },
    /* 计划时间字段 */
    planTimeField() {
      return this.fields.filter(f => f.fieldName === 'planTime')[0];
    },
    /* 计划时间 */
    planTime() {
      let { dateType } = this.planTimeField?.setting || {};
      let { isEncryptPlanTime, planTime } = this.task;

      if (planTime) {
        if (isEncryptPlanTime) return ENCRYPT_FIELD_VALUE;

        // 计划时间格式为日期时需格式化
        if (dateType == 'date') return planTime.slice(0, 10);

        return planTime;
      }

      return '';
    },
    /* 服务内容字段 */
    serviceContentField() {
      return this.fields.filter(f => f.fieldName === 'serviceContent')[0];
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
    /* 该登录账户是否是工单创建人 */
    isCreator(){
      let createUser = this.task.createUser || {};
      return createUser.userId == this.loginUser.userId;
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
      return !this.isApproving && !this.isPaused && this.initData.canEditTask && this.initData.isAllowUpdate && !this.isDelete;
    },
    /** 
    * @description 是否显示删除按钮
    * 1. 不是审批状态
    * 2. 且 不是暂停状态
    * 3. 且 有工单删除权限TASK_DELETE
    * 4. 且 工单允许删除 canDeleteTask
    */
    allowDeleteTask() {
      return !this.isApproving && !this.isPaused && this.hasAuth('TASK_DELETE') && this.initData.canDeleteTask && !this.isDelete;
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
      return this.finishedState || this.approvingForComplete;
    },
    /** 
    * @description 是否显示 [回执信息]tab
    * 满足显示回执条件后，回执表单自定义字段length=0且时隐藏tab(不包含默认工单且未开启自定义回执)
    */
    viewReceiptTab() {
      // 回执表单是否包含字段
      let hasField = this.receiptFields.length > 0;
      return this.showReceipt && hasField;
    },
    // 处理完成审批
    approvingForComplete() {
      let { canEditTask } = this.initData;
      let canLookCompleteReceipt = canEditTask || this.permission.VIP_APPROVE == 3;

      return this.isApproving && this.unFinishedAppr && this.unFinishedAppr.action == '完成' && (this.isExecutor || this.initData.canApprove || canLookCompleteReceipt);
    },
    /** 
    * @description 允许修改协同人
    * 1. 工单状态
    * 2. PC端开启允许修改协同人，并且是负责人
    * 3. 工单创建人或者允许编辑工单
    */
    allowEditSynergy() {
      let state = ['allocated', 'accepted', 'processing', 'taskPool'];
      let allowModify = this.taskConfig.taskSynergy;

      return state.indexOf(this.task.state) >= 0 && ((allowModify && this.isExecutor) || this.isCreator || this.editAuth);
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
    /** 
    * @description 是否显示复制工单按钮
    * 1. 当前登录用户有新建工单权限TASK_ADD
    * 2. 允许复制工单 canCopyTask
    */
    allowCopyTask() {
      return this.hasAuth('TASK_EDIT') && this.initData.canCopyTask;
    },
    /** 
    * @description 是否显示回访按钮
    * 1. 当前登录账户有工单回访权限TASK_FEEDBACK
    * 2. 且 不是审批状态
    * 3. 且 未回访过
    */
    allowReviewTask() {
      let { inApprove, isReviewed, isReview } = this.task;
      let feedbackAuth = this.hasAuth('TASK_FEEDBACK');

      return feedbackAuth && inApprove != 1 && isReviewed == 0 && isReview == 0;
    },
    /** 
    * @description 是否显示结算按钮
    * 1. 工单状态是已完成finished
    * 2. 且 不是审批状态
    * 3. 且 未结算过
    * 4. 且 允许回退工单 canRollBack
    */
    allowBalanceTask() {
      let { state, inApprove, isSettled } = this.task;

      return state === 'finished' && inApprove != 1 && isSettled == 0 && this.initData.canRollBack;
    },
    /** 
    * @description 是否显示附加组件tab
    */
    viewTaskCardTab() {
      return this.initData?.cardInfo?.length > 0;
    },
    /** 子组件所需的数据 */
    propsForSubComponents() {
      return {
        task: this.task,
        auth: this.permission,
        receiptFields: this.receiptFields,
        isFinishApproving: this.approvingForComplete,
        linkman: {
          lmName: this.lmName,
          lmPhone: this.lmPhone
        },
        address: this.address
      }
    },
    /** 
    * @description 客户
    */
    customer() {
      return this.task?.customer || {};
    },
    /** 
    * @description 允许打开客户详情
    */
    allowOpenCustomerView() {
      return !this.isEncryptField(this.customer.name) && this.canSeeCustomer;
    },
    /** 
    * @description 联系人
    */
    lmName() {
      let lmName = this.task.tlmName || this.customer.lmName;

      if (lmName) return this.isEncryptField(lmName) ? ENCRYPT_FIELD_VALUE : lmName;

      return '';
    },
    /** 
    * @description 联系电话
    */
    lmPhone() {
      let lmPhone = this.task.tlmPhone || this.customer.lmPhone;

      if (this.lmName) return this.isEncryptField(this.lmName) ? ENCRYPT_FIELD_VALUE : lmPhone;

      return '';
    },
    /** 
    * @description 显示拨打电话
    * 1. 开通呼叫中心
    * 2. 且联系人未加密
    */
    showCallPhone() {
      let notEncrypt = !this.isEncryptField(this.lmName);
      return this.lmPhone && this.hasCallCenterModule && notEncrypt;
    },
    /** 
    * @description 地址
    */
    address() {
      let { validAddress, taddress, isEncryptTaddress } = this.task;

      if (validAddress) return isEncryptTaddress ? ENCRYPT_FIELD_VALUE : Filter.prettyAddress(taddress);

      return '';
    },
    /** 
    * @description 显示查看地图icon
    * 1. 地址未加密
    * 2. 经纬度
    */
    showMap() {
      let { taddress, isEncryptTaddress } = this.task;
      let { longitude, latitude } = taddress;
      return longitude && latitude && !isEncryptTaddress;
    },
    /** 
    * @description 是否显示客户关联的工单数量
    * 1. 客户存在
    * 2. 且全部数量>0
    * 3. 客户未加密
    */
    showCustomerRelationTaskCount() {
      let { all } = this.customerRelationTaskCountData;
      return this.customer?.id && Number(all) > 0 && !this.isEncryptField(this.customer.name);
    },
    /** 
    * @description 工单状态
    */
    stateText() {
      return TaskStateEnum.getNameForTask(this.task);
    },
    /** 
    * @description 工单状态颜色
    */
    stateColor() {
      return TaskStateEnum.getColorForTask(this.task);
    },
    messageConfig() {
      return this.initData?.messageConfig || {};
    },
    showTaskRecordTemplate() {
      return this.messageConfig.taskRemark === true
    },
    /* 是否显示服务报告 根据版本控制的 */
    isShowReport() {
      return isShowReport()
    },
    /* 是否开始新工单的新指派 */
    isRestructAllot() {
      return this.initData?.restructAllot === true
    }
  },
  methods: {
    nextStep() {
      this.nowGuideStep++;
    },
    stopStep() {
      this.nowGuideStep = this.detailSteps.length + 1;
    },
    /**
     * 折叠
     */
    collapseBtn() {
      this.$refs.container.scrollTop = 0; 
      this.collapse = !this.collapse;
    },
    /**
     * 滚动的距离
     */
    getScroll() {
      this.collapse = false
    },
    // 是否含有某一指定权限
    hasAuth(keys) {
      return AuthUtil.hasAuth(this.permission, keys);
    },
    jump() {
      window.location.href = '/setting/task/taskSet'
    },
    // 编辑跳转
    goEdit() {
      const id = this.task.id;
      window.location.href = this.editAuth ? `/task/edit/${id}` : `/task/noFilterEdit/${id}`;
    },
    // 复制工单
    goCopyTask() {
      window.location.href = `/task/copyTask?taskId=${this.task.id}`;
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
          const res = await TaskApi.finishedWithPart({ taskId: this.task.id });
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
            // this.$platform.refreshTab(fromId);

            this.closeAndOpenTab('/task');
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

      const {checkBack} = this
      if (!checkBack) {
        this.$platform.alert('请选择回退工单原因');
        return
      }

      let reason = this.backDialog.reason.trim();
      if (!reason) return this.$platform.alert('请填写回退说明');

      this.pending = true;

      // 判断是完成回退还是结算回退
      const API = this.task.state == 'finished' ? 'rollBackTask' : 'rollBackBalance';
      
      const params = { taskId: this.task.id, reason, customReason: checkBack };
      TaskApi[API](params).then(res => {
        if (res.success) {
          let fromId = window.frameElement.getAttribute('fromid');
          // this.$platform.refreshTab(fromId);

          window.location.href = `/task/view/${this.task.id}`;
        } else {
          this.$platform.alert(res.message);
          this.pending = false;
        }
      }).catch(err => {
        this.pending = false;
      })
    },
    // 取消
    cancelModel(item) {
      const {data, customReason} = item
      this.proposeApprove(data, {customReason});
    },
    // 暂停工单
    async pause() {
      if (this.pending) return;

      const {checkBack} = this
      if (!checkBack) {
        this.$platform.alert('请选择暂停工单原因');
        return
      }

      this.pending = true;
      let { reason } = this.pauseDialog;
      let taskId = this.task.id;

      // 暂停是否需要审批
      const result = await TaskApi.pauseApproveCheck({ id: taskId, reason });
      if (!result.succ && result.message == '需要审批') {
        this.pauseDialog.visible = false;
        this.proposeApprove(result.data, {customReason: checkBack});
        this.pending = false;
        return;
      }

      TaskApi.pauseTask({ taskId, reason, customReason: checkBack }).then(res => {
        if (res.success) {
          window.location.href = `/task/view/${this.task.id}`;
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
          window.location.href = `/task/view/${this.task.id}`;
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

      const {checkBack} = this
      if (!checkBack) {
        this.$platform.alert('请选择拒绝工单原因');
        return
      }

      let reason = this.refuseDialog.reason.trim();
      if (!reason) return this.$platform.alert('请填写拒绝原因');

      if (!await this.$platform.confirm('确认拒绝此工单吗？')) return;

      this.pending = true;

      const params = { taskId: this.task.id, reason, customReason: checkBack };
      TaskApi.refuseTask(params).then(res => {
        if (res.success) {
          let fromId = window.frameElement.getAttribute('fromid');
          // this.$platform.refreshTab(fromId);

          this.closeAndOpenTab('/task?viewId=12fcb144-1ea3-11e7-8d4e-00163e304a25&mySearch=execute');
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
        this.proposeApprove(result.data);
        this.pending = false;
        return;
      }

      TaskApi.startTask({ taskId: this.task.id }).then(res => {
        if (res.success) {
          let fromId = window.frameElement.getAttribute('fromid');
          // this.$platform.refreshTab(fromId);

          window.location.href = `/task/view/${this.task.id}`;
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
      // 新工单新指派
      if (this.isRestructAllot) {
        this.$refs.TaskAllotModal.outsideShow()
      } else {
        this.pending = true;
        location.href = `/task/allotTask?id=${this.task.id}`;
      }
    },
    // 转派工单
    redeploy() {
      // 新工单新转派
      if (this.isRestructAllot) {
        this.obtainReasonByTaskStatus(0)
        this.$refs.TaskAllotModal.outsideShow()
      } else {
        this.pending = true;
        location.href = `/task/redeploy?id=${this.task.id}`;
      }
    },
    // 打印工单
    printTask() {
      this.pending = true;
      TaskApi.printTask({ taskId: this.task.id }).then(res => {
        if (res.status == 0) {
          let url = `${window.location.origin}/print/printTaskDispatcher?token=${res.data}`;
          parent.openHelp(url);

          this.$eventBus.$emit(TaskEventNameMappingEnum.UpdateRecord);
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
          window.location.href = `/task/view/${this.task.id}`;
        } else {
          this.$platform.alert(res.message);
          this.pending = false;
        }
      }).catch(err => {
        this.pending = false;
      })
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
      this.checkBack = '' //清除拒绝原因

      if (action === 'cancel') {
        this.$refs.cancelTaskDialog.openDialog();
        this.obtainReasonByTaskStatus(1)
      } else if (action === "acceptFromPool" || action === "accept" || action === "modifyPlanTime") {
        this.$refs.planTimeDialog.openDialog(action);
      } else if (action === 'approve') {
        this.$refs.approveTaskDialog.openDialog();
      } else if (action === 'pause') {
        this.pauseDialog.reason = '';
        this.pauseDialog.visible = true;
        this.obtainReasonByTaskStatus(3)
      } else if (action === "refuse") {
        this.refuseDialog.reason = "";
        this.refuseDialog.visible = true;
        this.obtainReasonByTaskStatus(2)
      } else if (action === "back") {
        this.backDialog.reason = "";
        this.backDialog.visible = true;
        this.obtainReasonByTaskStatus(4)
      } else if (action === "finish") {
        this.$refs.taskReceiptEdit.openDialog();
      } else if (action === 'balance') {
        this.rightActiveTab = 'balance-tab';
        this.$refs.taskAccount.openDialog('create');
      } else if (action === 'feedback') {
        this.rightActiveTab = 'feedback-tab';
        this.$refs.taskFeedback.feedback();
      } else if (action === 'timeAxis') {
        this.$refs.timeAxis.openDialog();
      }
    },

    /**
     * 
     * @description 获取工单异常原因
     */
    async obtainReasonByTaskStatus(taskType) {
      const {success, result} = await TaskApi.obtainReasonByTaskStatus(taskType)
      if (success) {
        const {systemAdmin, reason} = result
        this.systemAdmin = systemAdmin
        this.backList = reason
      }
    },
    // 发起审批
    proposeApprove(data, customReason = '') {
      this.$refs.proposeApprove.openDialog(data, customReason);
    },
    changeTaskProcessState(state) {
      this.taskState = state;
    },
    /** 
    * @description 获取客户关联的工单数量
    */
    getCountForCreate() {
      const params = { module: 'customer', id: this.customer.id };
      TaskApi.getCountForCreate(params).then((result = {}) => {
        this.customerRelationTaskCountData = result;
      })
    },
    /** 
    * @description 打开客户详情
    */
    openCustomerView(openTaskTab) {
      if (!this.allowOpenCustomerView) return;
      
      let fromId = window.frameElement.getAttribute('id');
      const customerId = this.customer.id;

      if(!customerId) return;

      let url = `/customer/view/${customerId}?noHistory=1`;

      if (openTaskTab) url += '&active=task';

      this.$platform.openTab({
        id: `customer_view_${customerId}`,
        title: '客户详情',
        close: true,
        url,
        fromId
      })
    },
    /**
    * @description 拨打电话
    */
    async makePhoneCall() {
      // 未开通呼叫中心
      if (!this.hasCallCenterModule) return;

      let phone = this.task.tlmPhone || this.customer.lmPhone;

      if (!phone) return;

      const result = await TaskApi.dialout({ taskType:'task', phone });
      if (result.code != 0) {
        return this.$platform.notification({
          title: '呼出失败',
          message: result.message || '',
          type: 'error',
        })
      }
    },
    /** 
    * @description 打开地图
    */
    openMap() {
      let address = this.task.taddress;
      let longitude = address.longitude;
      let latitude = address.latitude;

      if(!longitude || !latitude) return;

      let markerDom = this.buildMapMarkerContent();
      let infoDom = this.buildMapInfoContent();
      
      this.$fast.map
        .display({ ...address }, {}, markerDom, infoDom)
        .catch(err => console.error('openMap catch an err: ', err));
    },
    buildMapMarkerContent() {
      return '<i class="bm-location-dot"></i><div class="map-address-title">客户地址</div>';
    },
    buildMapInfoContent() {
      return `
        <div class="map-info-window-content">
          <div class="customer-name">${ this.customer.name }</div>
          <p><label>联系人：</label>${ this.lmName }</p>
          <p><label>电话：</label>${ this.lmPhone }</p>
          <p><label>地址：</label>${ this.address }</p>
          <div class="info-window-arrow"></div>
        </div>
      `;
    },
    /**
    * @description 是否加密字段
    */
    isEncryptField(value) {
      return value === ENCRYPT_FIELD_VALUE;
    },
    buildButtonData() {
      let buttonData = [
        { name: '指派', type: 'primary', show: this.allowAllotTask, event: this.allot },
        { name: '接单', type: 'primary', show: this.allowPoolTask, event: () => { this.openDialog('acceptFromPool') } },
        { name: '接受', type: 'primary', show: this.allowAcceptTask, event: () => { this.openDialog('accept') } },
        { name: '开始', type: 'primary', show: this.allowStartTask, event: this.start },
        { name: '完成回执', type: 'primary', show: this.allowFinishTask, event: () => { this.openDialog('finish') } },
        { name: '回退', type: 'primary', show: this.allowBackTask, event: this.backTask },
        { name: '结算', type: 'primary', show: this.viewBalanceTab && this.allowBalanceTask, event: () => { this.openDialog('balance') } },
        { name: '回访', type: 'primary', show: this.viewFeedbackTab && this.allowReviewTask, event: () => { this.openDialog('feedback') } },
        { name: '拒绝', type: 'danger', show: this.allowRefuseTask, event: () => { this.openDialog('refuse') } },
        { name: '暂停', type: 'default', show: this.allowPauseTask, event: () => { this.openDialog('pause') } },
        { name: '继续', type: 'primary', show: this.allowGoOnTask, event: this.unpause },
        { name: '审批', type: 'primary', show: this.allowApprove, event: () => { this.openDialog('approve') } },
        { name: '撤回审批', type: 'default', show: this.allowoffApprove, event: this.offApprove }
      ]

      return buttonData.reverse();
    },
    /** 
     * 关闭并打开新的Tab
    */
    closeAndOpenTab(url) {
      let id = window.frameElement.dataset.id;
      this.$platform.closeTab(id);

      // 生成工单列表随机id
      let taskListTabId = `M_TASK_ALL_${randomString(16)}`;

      let rootWindow = getRootWindow(window);
      rootWindow.pushTaskListIds(taskListTabId);

      let fromId = window.frameElement.getAttribute('id');
    
      this.$platform.openTab({
        id: taskListTabId,
        title: '',
        url,
        reload: true,
        close: true,
        fromId
      });
    },
    outsideUpdateTask(task = {}) {
      this.task = task
    },
    outsideUpdateRecords() {
      this.$eventBus.$emit(TaskEventNameMappingEnum.UpdateRecord);
    }
  },
  created() {
    // 折叠面板缓存
    let collapse = sessionStorage.getItem(`task_customer_collapse_${this.task.id}`);
    let collapseDirection = sessionStorage.getItem(`task_collapseDirection_${this.task.id}`);

    this.collapse = JSON.parse(collapse || 'true');
    this.collapseDirection = collapseDirection || '';

  },
  async mounted() {
    console.log(this.initData, 'initData')
    try {
      this.loading = true;

      // 查询客户关联工单数量
      if (this.canSeeCustomer) this.getCountForCreate();

      let { templateId } = this.task;

      let subtask = [
        TaskApi.getTaskTemplateFields({ templateId, tableName: 'task' })
      ];

      // 显示回执时获取回执字段信息
      if (this.allowFinishTask || this.showReceipt) subtask.push(TaskApi.getTaskTemplateFields({ templateId, tableName: 'task_receipt' }));

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
        fieldName: 'state'
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
      }, {
        displayName: '派单人',
        fieldName: 'allotUser',
        formType: 'user',
        isSystem: 1,
      }, {
        displayName: '创建方式',
        fieldName: 'source',
        formType: 'user',
        isSystem: 1,
      }];

      this.fields.forEach(field => {
        if (field.fieldName == 'attachment') {
          let { isEncryptAttachment, attachment } = this.task
          
          // 系统附件加密
          if (isEncryptAttachment) {
            this.task.attachment = ENCRYPT_FIELD_VALUE;
          } else {
            this.task.attachment = attachment.filter(item => !item.receipt);
          }
        }
      })

      this.receiptFields = result[1] || [];
      this.stateButtonData = this.buildButtonData();
      
      let query = parse(window.location.search) || {};
      
      // 来自审核结算列表的结算操作
      if (query.active == 'balance' && this.viewBalanceTab && this.allowBalanceTask) {
        this.openDialog('balance');
      } else {
        // this.rightActiveTab = this.viewBalanceTab ? 'balance-tab' : this.viewFeedbackTab ? 'feedback-tab' : 'record';
      }
      
      // 是否显示详情向导
      this.showTaskDetailGuide = !storageGet(TASK_GUIDE_DETAIL)
      // 来自指派列表的指派操作
      this.showAllotModal = query.allot && this.allowAllotTask
      if (this.showAllotModal && !this.showTaskDetailGuide) {
        this.allot()
      }
      
      this.loading = false;
      
      this.$nextTick(() => {
        setTimeout(() => {
          if (this.showTaskDetailGuide) {
            this.$tours['myTour'].start();
            this.nowGuideStep = 1;
            storageSet(TASK_GUIDE_DETAIL, '4');
          }
        }, 1000)
      })

    } catch (e) {
      console.error('error ', e)
    }
  },
  watch: {
    collapse(newValue) {
      sessionStorage.setItem(`task_customer_collapse_${this.task.id}`, newValue);
    },
    collapseDirection(newValue) {
      sessionStorage.setItem(`task_collapseDirection_${this.task.id}`, newValue);
    },
    nowGuideStep(newValue) {
      if (newValue == 5 && this.showTaskDetailGuide && this.showAllotModal) {
        this.allot()
      }
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
    [TaskView.name]: TaskView,
    [TaskTimeDialog.name]: TaskTimeDialog,
    TaskAllotModal
  }
}