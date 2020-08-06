<template>
  <div class="page-container task-detail-container">
    <!-- start 顶部操作区 -->
    <div class="task-tool-bar" v-if="!isDelete">
      <div class="task-toolbar-left">
        <button type="button" class="btn btn-text" @click="jump" v-if="allowEditTask">
          <i class="iconfont icon-edit"></i> 编辑
        </button>
        <button type="button" class="btn btn-text" @click="deleteTask" v-if="allowDeleteTask">
          <i class="iconfont icon-yemianshanchu"></i> 删除
        </button>
      </div>

      <div class="task-toolbar-right action-btn">
        <base-button type="plain" @event="backTask" v-if="allowBackTask">回退工单</base-button>
        <base-button type="plain" @event="openDialog('cancel')" v-if="allowCancelTask">取消工单</base-button>
        <!-- <base-button type="plain" @event="" v-if="allowPoolTask">接单</base-button> -->
        <base-button type="plain" @event="pauseDialog.visible = true" v-if="allowPauseTask">暂停</base-button>
        <base-button type="plain" @event="unpause" v-if="allowGoOnTask" :disabled="pending">继续</base-button>
        <!-- <base-button type="plain" @event="" v-if="allowAcceptTask">接受</base-button> -->
        <base-button type="plain" @event="refuseTask" v-if="allowRefuseTask" :disabled="pending">拒绝</base-button>
        <base-button type="plain" @event="startTask" v-if="allowStartTask" :disabled="pending">开始</base-button>
        <base-button type="plain" @event="finishTask" v-if="allowFinishTask" :disabled="pending">回执完成</base-button>
        <base-button type="plain" @event="allot" v-if="allowAllotTask" :disabled="pending">指派</base-button>
        <base-button type="plain" @event="redeploy" v-if="allowRedeployTask" :disabled="pending">转派</base-button>
        <base-button type="plain" @event="printTask" v-if="allowPrintTask" :disabled="pending">打印工单</base-button>

        <!-- start 服务报告 -->
        <template v-if="allowServiceReport">
          <base-button type="plain" @event="printTask" v-if="srSysTemplate || srSysTemplate == null" :disabled="pending">服务报告</base-button>

          <el-dropdown trigger="click" v-if="!srSysTemplate && srSysTemplate != null">
            <span class="el-dropdown-link el-dropdown-btn">服务报告</span>

            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>
                <el-tooltip class="item" effect="dark" content="如果图片过多导致文件过大，将会返回Excel格式，需要您自行另存为PDF格式" placement="left-start">
                  <a class="link-of-dropdown" href="javascript:;" @click.prevent="createReport(true)">PDF格式</a>
                </el-tooltip>
              </el-dropdown-item>
              <el-dropdown-item>
                <a class="link-of-dropdown" href="javascript:;" @click.prevent="createReport(false)">Excel格式</a>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
        <!-- end 服务报告 -->

        <base-button type="plain" @event="offApprove" v-if="allowoffApprove" :disabled="pending">撤回审批</base-button>
      </div>
    </div>
    <!-- end 顶部操作区 -->
    <div class="main-content" v-loading="loading">
      <div class="task-detail">
        <form-view :fields="fields" :value="task">
          <template slot="taskNo" slot-scope="{ field, value }">
            <!-- 工单编号 -->
            <div class="form-view-row">
              <label>{{field.displayName}}</label>
              <div class="form-view-row-content">{{value}}</div>
            </div>
            <!-- 工单类型 -->
            <div class="form-view-row">
              <label>工单类型</label>
              <div class="form-view-row-content">{{task.templateName}}</div>
            </div>
          </template>

          <!-- start 客户字段 -->
          <template slot="customer" slot-scope="{ field }">
            <div class="form-view-row">
              <label>{{field.displayName}}</label>
              <div class="form-view-row-content">{{task.customer.name}}</div>
            </div>
            <div class="form-view-row" v-if="customerOption.linkman">
              <label>联系人</label>
              <div class="form-view-row-content">{{task.tlmName}} {{task.tlmPhone}}</div>
            </div>
            <div class="form-view-row" v-if="customerOption.address">
              <label>地址</label>
              <div class="form-view-row-content">{{prettyAddress(task.taddress)}}</div>
            </div>
            <div class="form-view-row" v-if="customerOption.product">
              <label>产品</label>
              <div class="form-view-row-content">
                <span class="row-item-margin" v-for="product in task.products" :key="product.id">{{product.name}}</span>
              </div>
            </div>
          </template>
          <!-- end 客户字段 -->

          <!-- 完成时间 -->
          <template slot="completeTime" slot-scope="{ field, value }" v-if="task.state == 'finished' || task.state == 'costed' || task.state == 'closed'">
            <div class="form-view-row">
              <label>{{field.displayName}}</label>
              <div class="form-view-row-content">{{value}}</div>
            </div>
          </template>

          <!-- 协同人 -->
          <template slot="synergies" slot-scope="{ field, value }">
            <div class="form-view-row">
              <label>{{field.displayName}}</label>
              <div class="form-view-row-content">
                <span class="row-item-margin" v-for="item in value" :key="item.userId">{{item.displayName}}</span>
              </div>
            </div>
          </template>

          <!-- 工单状态 -->
          <template slot="state" slot-scope="{ field, value }">
            <div class="form-view-row">
              <label>{{field.displayName}}</label>
              <div class="form-view-row-content">{{stateText[value]}}</div>
            </div>
          </template>

        </form-view>
      </div>
    </div>

    <!-- start 回退工单弹窗 -->
    <base-modal title="回退工单" :show.sync="backDialog.visible" width="500px" class="task-back-dialog">
      <div class="base-modal-content">
        <p>回退工单将工单退回工单负责人，可以重新提交回执信息，原有回执信息将不再保存</p>
        <textarea v-model="backDialog.content" placeholder="[最多500字][必填]" rows="3" maxlength="500" />
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="backDialog.visible = false">取 消</el-button>
        <el-button type="primary" @click="back" :disabled="pending">确 定</el-button>
      </div>
    </base-modal>
    <!-- end 回退工单弹窗 -->

    <!-- start 取消工单弹窗 -->
    <cancel-task-dialog
      ref="cancelTaskDialog"
      :task-id="task.id"
      :unFinished="unFinishedState"
    />
    <!-- end 取消工单弹窗 -->

    <!-- start 暂停工单弹窗 -->
    <base-modal title="暂停工单" :show.sync="pauseDialog.visible" width="500px">
      <div class="base-modal-content">
        <textarea v-model="pauseDialog.reason" placeholder="请输入暂停原因[最多500字]" rows="3" maxlength="500" />
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="pauseDialog.visible = false">取 消</el-button>
        <el-button type="primary" @click="pause" :disabled="pending">确 定</el-button>
      </div>
    </base-modal>
    <!-- end 暂停工单弹窗 -->

    <!-- start 拒绝工单弹窗 -->
    <base-modal title="拒绝工单" :show.sync="refuseDialog.visible" width="500px">
      <div class="base-modal-content">
        <textarea v-model="refuseDialog.remark" placeholder="请输入拒绝说明[最多500字][必填]" rows="3" maxlength="500" />
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="refuseDialog.visible = false">取 消</el-button>
        <el-button type="primary" @click="refuse" :disabled="pending">确 定</el-button>
      </div>
    </base-modal>
    <!-- end 拒绝工单弹窗 -->
  </div>
</template>

<script>
/* api */
import * as TaskApi from '@src/api/TaskApi';

/* component */
import CancelTaskDialog from './components/CancelTaskDialog.vue';

export default {
  name: 'task-detail-view',
  inject: ['initData'],
  data() {
    return {
      loading: false,
      pending: false,
      task: {},
      fields: [],
      // TODO: 工单状态从移动端拷贝的数据 后面要修改
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
        content: ''
      },
      // 暂停工单弹窗
      pauseDialog: {
        visible: false,
        reason: ''
      },
      // 拒绝工单弹窗
      refuseDialog: {
        visible: false,
        remark: ''
      },
    }
  },
  computed: {
    /* 客户字段 */
    customerField() {
      return this.fields.filter(f => f.fieldName === 'customer')[0];
    },
    /* 客户字段配置 */
    customerOption() {
      return (this.customerField.setting && this.customerField.setting.customerOption) || {} ;
    },
    /** 当前登录用户 */
    loginUser() {
      return this.initData.loginUser || {};
    },
    /* 该登录账户是否是工单创建人 */
    isCreator(){
      let createUser = this.task.createUser || {};
      return createUser.userId == this.loginUser.userId;
    },
    /* 该登录账户是否是工单负责人 */
    isExecutor() {
      let executor = this.task.executor || {};          
      return executor.userId == this.loginUser.userId;
    },
    /** 当前用户的权限 */
    permission() {
      // TODO: 暂时使用假数据
      return {"TASK_ADD":3,"PRODUCT_CREATE":3,"CUSTOMER_CREATE":3,"VIP_PAYMENT_ONLINE":3,"TASK_BATCH_DISPATCH":3,"CASE_ADD":3,"SERVICE_CREATE":3,"CASE_VIEW":3,"TASK_EDIT":3,"TASK_FEEDBACK":3,"VIP_INFO_NOTICE_SELECT":3,"LOGIN_PC":3,"SMS_CONFIG":3,"VIP_INFO_NOTICE_CREATE":3,"SERVICE_EDIT":3,"PRODUCT_EDIT":3,"TASK_DISPATCH":3,"TASK_POOL":3,"VIP_REPORT_VIEW":3,"TASK_VIEW":3,"AUTH_STAFF":3,"AUTH_ROLE":3,"TASK_CLOSE":3,"TASK_BATCH_CLOSE":3,"VIP_SPAREPART_PERSION":3,"INFO_EDIT":3,"VIP_SPAREPART_INOUT":3,"TASK_AUDIT":3,"PRODUCT_VIEW":3,"CUSTOMER_DELETE":3,"CASE_DELETE":3,"INFO_VIEW":3,"EXPORT_IN":3,"VIP_APPROVE":3,"PART_EDIT":3,"SERVICE_VIEW":3,"CUSTOMER_VIEW":3,"VIP_SPAREPART_CREATE":3,"VIP_SPAREPART_VIEW":3,"CUSTOMER_PQRCODE":3,"TASK_DELETE":3,"VIP_TASK_PLAN":3,"PRODUCT_DELETE":3,"CASE_EDIT":3,"VIP_INFO_CREATE":3,"SYSTEM_SEETING":3,"LOGIN_YD":3,"VIP_SPAREPART_EDIT":3,"PART_VIEW":3,"AUTH_TAG":3,"VIP_SPAREPART_STOCK":3,"TASK_BATCH_AUDIT":3,"CUSTOMER_EDIT":3};
    },
    /* 工单编辑权限 */
    editAuth() {
      return this.permission.TASK_EDIT;
    },
    /* 工单删除权限 */
    deleteAuth() {
      return this.permission.TASK_DELETE;
    },
    /** 
    * @description 工单是否被删除
    * 在工单删除时不允许做任何操作，只能查询 
    * 所有操作的权限应该以此为基础
    */
    isDelete(){
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
    /** 
    * @description 是否显示编辑按钮
    * 1. 不是审批状态
    * 2. 且 不是暂停状态
    * 3. 且 工单允许编辑 canEditTask
    * 4. 且 工单允许编辑isAllowUpdate
    * 5. 满足以上条件就会显示编辑按钮 无论是否有工单编辑权限TASK_EDIT
    */
    allowEditTask() {
      return !this.isApproving && !this.isPaused && this.canEditTask && this.isAllowUpdate;
    },
    /** 
    * @description 工单允许编辑
    * 1. 工单编辑设置修改工单开关开启 且 登录账户是工单负责人
    * 2. 或 角色编辑权限是全部权限this.editAuth == 3
    * 3. 或 角色编辑权限是团队权限this.editAuth == 2时 且 登录用户是工单的创建人
    * 4. 或 角色编辑权限是团队权限this.editAuth == 2时 且 工单有负责人且登录用户是工单的负责人任意所在团队的主管(生产环境疑问：若该工单类*    型设置可用团队，则该团队应在可用团队范围内)
    * 5. 或 角色编辑权限是个人权限this.editAuth == 1时 且 登录用户是工单的创建人
    */
    canEditTask() {
      return this.initData.canEditTask;
    },
    /** 
    * @description 工单允许编辑 canEditTask
    * 默认是true，当工单编辑设置“当工单处于以下状态之后，不允许对工单再进行编辑”，限制了工单状态
    * 1. 当前工单的状态刚好被限制编辑
    * 2. 或 限制的工单状态包含‘已完成‘则已完成以及以后的节点都不可编辑
    * 3. 或 限制的工单状态包含‘已结算‘则已结算以及以后的节点都不可编辑
    * 4. 或 限制的工单状态包含‘已回访‘则已回访以及以后的节点都不可编辑
    */
    isAllowUpdate() {
      return this.initData.isAllowUpdate;
    },
    /** 
    * @description 是否显示删除按钮
    * 1. 不是审批状态
    * 2. 且 不是暂停状态
    * 3. 且 有工单删除权限TASK_DELETE
    * 4. 且 工单允许删除 canDeleteTask
    */
    allowDeleteTask() {
      return !this.isApproving && !this.isPaused && this.deleteAuth && this.canDeleteTask;
    },
    /** 
    * @description 工单允许删除
    * 1. 满足工单允许编辑canEditTask
    * 2. 且 当前登录用户有工单删除权限TASK_DELETE
    */
    canDeleteTask() {
      return this.initData.canDeleteTask;
    },
    /** 
    * @description 是否显示回退工单按钮
    * 1. 不是审批状态
    * 2. 且 工单是已完成状态finished
    * 3. 且 工单编辑设置开启了允许退回工单回执taskConfig.taskRollBack
    * 4. 且 允许回退工单 canRollBack
    */
    allowBackTask() {
      return !this.isApproving && this.task.state === 'finished' && this.taskConfig.taskRollBack && this.canRollBack;
    },
    /** 
    * @description 允许回退工单
    * 1. 满足工单允许编辑canEditTask
    * 2. 或 当前登录用户有工单审核结算权限TASK_AUDIT
    */
    canRollBack() {
      return this.initData.canRollBack;
    },
    /** 工单设置 */
    taskConfig(){
      return this.initData.taskConfig;
    },
    /** 工单类型设置 */
    taskType() {
      return this.initData.taskType;
    },
    /** 
    * @description 是否显示取消工单按钮
    * 1. 当前登录用户有工单编辑权限TASK_EDIT
    * 2. 不是审批状态
    * 3. 且 不是暂停状态
    * 4. 且 工单状态是created/allocated/refused/taskPool/accepted/processing其中一种
    * 5. 且 允许取消工单 canOffTask
    */
    allowCancelTask() {
      let cancelState = ['created', 'allocated', 'refused', 'taskPool', 'accepted', 'processing'];
      return this.editAuth && !this.isApproving && !this.isPaused && this.canOffTask && cancelState.indexOf(this.task.state) >= 0;
    },
    /** 
    * @description 可以取消工单
    * 满足工单允许编辑canEditTask
    */
    canOffTask() {
      return this.initData.canOffTask;
    },
    /** 
    * @description 是否显示接单按钮
    * 1. 不是审批状态
    * 2. 且 工单状态是工单池taskPool
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
      return !this.isApproving && !this.isPaused && this.canPause && stateArr.indexOf(this.task.state) >= 0;
    },
    /** 
    * @description 是否显示继续按钮
    * 1. 不是审批状态
    * 2. 且 是暂停状态
    * 3. 且 允许暂停工单 canPause
    */
    allowGoOnTask() {
      return !this.isApproving && this.isPaused && this.canPause;
    },
    /** 
    * @description 可以暂停工单
    * 1. 满足工单允许编辑canEditTask
    * 2. 工单类型设置中开启了允许工单负责人将工单设置为暂停状态 且 当前登录用户是工单负责人
    */
    canPause() {
      return this.initData.canPause;
    },
    /** 
    * @description 是否显示接受按钮
    * 1. 当前登录用户是工单负责人
    * 2. 不是审批状态
    * 3. 且 不是暂停状态
    * 4. 且 工单状态是allocated
    */
    allowAcceptTask() {
      return this.isExecutor && !this.isApproving && !this.isPaused && this.task.state === 'allocated';
    },
    /** 
    * @description 是否显示拒绝按钮
    * 1. 当前登录用户是工单负责人
    * 2. 不是审批状态
    * 3. 且 不是暂停状态
    * 4. 且 工单状态是allocated
    * 5. 且 工单设置中开启了允许工单负责人拒绝工单taskConfig.taskRefuse
    */
    allowRefuseTask() {
      return this.isExecutor && !this.isApproving && !this.isPaused && this.task.state === 'allocated' && this.taskConfig.taskRefuse;
    },
    /** 
    * @description 是否显示开始按钮
    * 1. 当前登录用户是工单负责人
    * 2. 不是审批状态
    * 3. 且 不是暂停状态
    * 4. 且 工单状态是accepted
    * 5. 且 工单类型设置中流程设置开启了开始流程节点taskType.flowSetting.start.state
    */
    allowStartTask() {
      return this.isExecutor && !this.isApproving && !this.isPaused && this.task.state === 'accepted' && this.taskType.flowSetting.start.state;
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
      return this.permission.TASK_DISPATCH && !this.isApproving && !this.isPaused && stateArr.indexOf(this.task.state) >= 0;
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
      return !this.isApproving && !this.isPaused && this.canRedeploy && stateArr.indexOf(this.task.state) >= 0;
    },
    /** 
    * @description 可以转派
    * 1. 满足工单允许编辑canEditTask且登录账户有TASK_DISPATCH权限
    * 2. 或 当前登录用户是工单负责人且工单设置中派单设置开启允许工单负责人转派工单taskConfig.taskReallot
    */
    canRedeploy() {
      return this.initData.canRedeploy;
    },
    /** 
    * @description 是否显示打印工单按钮
    * 1. 工单类型设置开启了启用打印功能taskType.options.printTask
    * 2. 满足以上条件即会显示打印工单 
      (1)曾打印 task.oncePrinted == 1 样式有区别
    */
    allowPrintTask() {
      return this.taskType.options.printTask || this.taskType.options.printTask == null;
    },
    /** 
    * @description 是否显示服务报告按钮
    * 1. 工单类型设置开启了发送服务报告taskType.options.serviceReport
    * 2. 且 工单状态是finished/closed/costed其中一种
    * 3. 且 是否使用系统模板taskType.options.srSysTemplate
      (1)使用系统模板taskType.options.srSysTemplate == null || taskType.options.srSysTemplate
      (2)或 上传自己的模板taskType.options.srSysTemplate != null || !taskType.options.srSysTemplate
    */
    allowServiceReport() {
      let { serviceReport } = this.taskType.options;
      let stateArr = ['finished', 'closed', 'costed'];
      return (serviceReport || serviceReport == null) && stateArr.indexOf(this.task.state) >= 0;
    },
    /** 使用系统模板 */
    srSysTemplate() {
      return this.taskType.options.srSysTemplate;
    },
    /** 
    * @description 是否显示撤回审批按钮
    * 1. 是审批状态
    * 2. 且 当前工单是否存在审批unFinishedAppr.id
    * 3. 允许撤回审批 canOffAppr
    */
    allowoffApprove() {
      return this.isApproving && this.unFinishedAppr.id && this.canOffAppr;
    },
    /** 工单审批数据 */
    unFinishedAppr() {
      return this.initData.unFinishedAppr || {};
    },
    /** 
    * @description 可以撤回审批
    * 当前登录用户是审批发起人
    */
    canOffAppr() {
      return this.initData.canOffAppr;
    },
    /** 
    * @description 是否显示回执完成按钮
    * 1. 当前登录用户是工单负责人
    * 2. 不是审批状态
    * 3. 且 不是暂停状态
    * 4. 且 (如果工单状态是accepted且工单流程设置禁用了开始流程 或 如果工单状态是processing且工单流程设置开启了开始流程)
    */
    allowFinishTask() {
      let startFlow = this.taskType.flowSetting.start.state;
      let { state } = this.task;

      return this.isExecutor && !this.isApproving && !this.isPaused && (state === 'accepted' && !startFlow || state === 'processing' && startFlow);
    }
  },
  methods: {
    jump() {
      const id = this.task.id || this.initData.id;
      window.location.href = this.editAuth ? `/task/edit/${id}` : `/task/noFilterEdit/${id}`;
    },
    prettyAddress(address) {
      if(!address || Object.keys(address).length === 0) return '';

      let province = address.province || '';
      let city = address.city || '';
      let dist = address.dist || '';
      let adr = address.address || '';

      return [province, city, dist, adr].filter(a => a).join('-');
    },
    // 打开弹窗
    openDialog(action) {
      if (action === 'cancel') {
        this.$refs.cancelTaskDialog.openDialog();
      }
    },
    // 删除工单
    async deleteTask() {
      try {
        let warningMsg = '确定要删除吗？';

        /** 
        * 如果工单为未完成状态，则需要判断工单是否曾回退，而且在最后一次完成时是否使用了备件
        * 如果使用了备件，需要提示
        */
        if (this.unFinishedState) {
          const res = await TaskApi.taskFilterWithPart({ taskIds: this.task.id });
          if (res.status == 1) {
            warningMsg = `${res.message}，确定要删除所选工单吗？`;
          } else if (res.status == 0 && res.data.length > 0) {
            warningMsg = '工单已添加备件，确定要删除吗？';
          }
        }

        const result = await this.$platform.confirm(warningMsg);
        if (!result) return;

        const params = [this.task.id];
        TaskApi.deleteTask(params).then(res => {
          if (res.status == 0) {
            let fromId = window.frameElement.getAttribute('fromid');
            this.$platform.refreshTab(fromId);

            location.href = '/task';
          } else {
            this.$platform.alert(res.message);
          }
        }).catch(err => console.log(err))

      } catch (e) {
        console.error("deleteTask error", e);
      }
    },
    // 回退工单
    async backTask() {
      try {
        if (this.initData.isRepertoryDiff == 'true') {
          const result = await this.$platform.confirm('回执备件来源与当前备件库配置不同，回退工单将会把已使用的备件退回到原仓库，是否继续？');
          if (!result) return;

          this.backDialog.visible = true;
        } else {
          this.backDialog.visible = true;
        }
      } catch (e) {
        console.error("backTask error", e);
      }
    },
    // 回退工单
    async back() {
      let content = this.backDialog.content.trim();
      if (!content) {
        this.$platform.alert('请填写回退说明');
        return;
      }

      this.pending = true;

      const params = {taskId: this.task.id, content};
      TaskApi.rollBackTask(params).then(res => {
        if (res.status == 0) {
          let fromId = window.frameElement.getAttribute('fromid');
          this.$platform.refreshTab(fromId);

          window.location.reload();
        } else {
          this.$platform.alert(res.message);
          this.pending = false;
        }
      }).catch(err => {
        this.pending = false;
        console.log(err);
      })
    },
    // 暂停工单
    pause() {
      this.pending = true;

      const params = {id: this.task.id, reason: this.pauseDialog.reason};
      TaskApi.pauseTask(params).then(res => {
        if (res.status == 0) {
          window.location.reload();
        } else {
          if (res.message == '需要审批') {
            // TODO：需要审批
            this.pauseDialog.visible = false;
          } else {
            this.$platform.alert(res.message);
          }
          
          this.pending = false;
        }
      }).catch(err => {
        this.pending = false;
      })
    },
    // 继续
    unpause() {
      this.pending = true;

      TaskApi.unpauseTask({id: this.task.id}).then(res => {
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
    // 拒绝工单
    refuseTask() {
      this.pending = true;

      TaskApi.refuseCheckTask({id: this.task.id}).then(res => {
        if (res.status == 0) {
          this.refuseDialog.remark = '';
          this.refuseDialog.visible = true;
        } else {
          this.$platform.alert(res.message);
        }
      })
        .catch(err => console.log(err))
        .finally(() => {
          this.pending = false;
        })
    },
    // 拒绝工单
    async refuse() {
      let { remark } = this.refuseDialog;
      if (!remark) return this.$platform.alert('请填写拒绝原因');

      const result = await this.$platform.confirm('确认拒绝此工单吗？');
      if (!result) return;

      this.pending = true;

      const params = {id: this.task.id, remark};
      TaskApi.refuseTask(params).then(res => {
        if (res.status == 0) {
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
    async startTask() {
      try {
        this.pending = true;

        let result = await TaskApi.checkNotNullForCard({id: this.task.id, flow: 'start'});

        if (result.status == 0) {
          this.start();
        } else {
          this.$platform.alert(result.message);
          this.pending = false;
        }

      } catch (e) {
        console.error("startTask error", e);
      }
    },
    // 开始
    start() {
      TaskApi.startTask({id: this.task.id}).then(res => {
        if (res.status == 0) {
          let fromId = window.frameElement.getAttribute('fromid');
          this.$platform.refreshTab(fromId);

          window.location.reload();
        } else {
          if (res.message == '需要审批') {
            // TODO：需要审批
          } else {
            this.$platform.alert(res.message);
          }
          
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
      TaskApi.printTask({id: this.task.id}).then(res => {
        if (res.status == 0) {
          let url = `${window.location.origin}/print/printTaskDispatcher?token=${res.data}`;
          parent.openHelp(url);
        }
      }).catch(err => console.log(err));
    },
    // 生产服务报告
    createReport(isPdf) {
      location.href = `/task/createServiceReport?taskId=${this.task.id}&isPdf=${isPdf}`;
    },
    // 撤回审批
    async offApprove() {
      const result = await this.$platform.confirm('确定要撤回审批吗？');
      if (!result) return;

      TaskApi.offApprove({apprId: this.unFinishedAppr.id}).then(res => {
        if (res.status == 0) {
          window.location.reload();
        } else {
          this.$platform.alert(res.message);
        }
      }).catch(err => console.log(err));
    },
    // 完成回执
    async finishTask() {
      try {
        this.pending = true;

        let result = await TaskApi.checkNotNullForCard({id: this.task.id, flow: 'finish'});

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
        console.error("startTask error", e);
      }
    }
  },
  async mounted() {
    try{
      this.loading = true;

      // TODO: 暂时用假数据
      this.task = this.initData.task;

      const fields = await TaskApi.getTaskTemplateFields({ templateId: this.task.templateId, tableName: 'task' });
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

      this.loading = false;

    } catch (e) {
      console.error('error ', e)
    }
  },
  components: {
    [CancelTaskDialog.name]: CancelTaskDialog,
  }
}
</script>

<style lang="scss">
$color-primary-light-9: mix(#fff, $color-primary, 90%) !default;

html, body, .page-container {
  height: 100%;
}

body {
  padding: 10px;
  min-width: 1100px;
  overflow-x: auto;
}

.page-container {
  background: #fff;
  border-radius: 3px;
  box-shadow: 0 1px 4px rgba(216,216,216, .65);
  display: flex;
  flex-flow: column nowrap;
}

.task-tool-bar {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: $text-color-regular;
  border-bottom: 1px solid #f2f2f2;

  .task-toolbar-left{
    padding: 10px 5px 10px 10px;
  }

  .task-toolbar-right {
    padding: 10px 10px 10px 5px;
  }

  .btn-text {
    padding: 5px 12px;
    .iconfont{
      font-size: 14px;
    }
  }
}

.main-content {
  display: flex;
  flex-flow: row nowrap;
  flex: 1;
  position: relative;

  .task-detail {
    flex: 3;
    min-width: 420px;
    height: 100%;
    display: flex;
    flex-flow: column nowrap;

    .form-view{
      flex: 1;
      padding-top: 5px;
      overflow-y: auto;
      border-right: 1px solid #f2f2f2;

      .form-view-row {
        .row-item-margin {
          margin-right: 10px;
        }
      }
    }

  }
}

.task-detail-container {
  .base-modal-body {
    padding: 15px 30px;

    .base-modal-content {
      textarea {
        width: 100%;
      }
      
      p {
        margin-bottom: 8px;

        &.tips {
          color: #999;
          font-size: 12px;
        }
      }
    }
  }

  .base-modal-footer {
    text-align: right;
  }

  .task-back-dialog {
    p {
      font-size: 12px;
      
    }
  }

  .action-btn {
    .el-dropdown-btn {
      padding: 0 15px;
      line-height: 34px;
      display: inline-block;
      background: $color-primary-light-9;
      color: $text-color-primary;
      margin-left: 10px;
      border-radius: 2px;
      .iconfont {
        line-height: 12px;
        margin-right: 3px;
        font-size: 12px;
      }

      &:hover {
        cursor: pointer;
        color: #fff;
        background: $color-primary;
      }
    }

    .base-button {
      margin-left: 10px;
    }
  }
}

.link-of-dropdown {
  color: $text-color-primary;
  display: block;

  &:hover {
    text-decoration: none;
  }
}
</style>
