<template>
  <div class="task-tab-container task-account-tab">
    <!-- start 审核结算字段 -->
    <div class="task-account-main-content">

      <!-- start 审批中 -->
      <template v-if="isApproving">
        <no-data-view-new v-if="!openUserDefinedBalance" notice-msg="未配置任何审核结算字段"></no-data-view-new>
        <form-view :fields="balanceAvailableFields" :value="balanceJson" v-else></form-view>
        <div class="approving-img"><img :src="getApprovingImg()" /></div>
      </template>
      <!-- end 审批中 -->

      <!-- start 未结算 -->
      <no-data-view-new
        v-else-if="!task.balanceConfirm"
        :notice-msg="!openUserDefinedBalance?'未配置任何审核结算字段':'暂无审核结算数据'"
      ></no-data-view-new>
      <!-- start 未结算 -->

      <!-- start 已结算 -->
      <template v-else>
        <form-view :fields="balanceAvailableFields" :value="balanceJson" v-if="openUserDefinedBalance"></form-view>

        <template v-if="task.balanceUser">
          <div class="form-view-row">
            <label>操作人</label>
            <div class="form-view-row-content">{{task.balanceUser.displayName}}</div>
          </div>
          <div class="form-view-row">
            <label>操作时间</label>
            <div class="form-view-row-content">{{task.balanceTime | fmt_datetime}}</div>
          </div>
        </template>
      </template>
      <!-- start 已结算 -->

    </div>
    <!-- end 审核结算字段 -->

    <div class="btn-group">
      <el-button type="primary" size="mini" plain @click="openDialog('create')" :disabled="pending" v-if="allowBalanceTask">结算</el-button>
      <el-button size="mini" @click="openDialog('edit')" :disabled="pending" v-if="allowEditBalance">编辑</el-button>
      <el-button size="mini" @click="openDialog('back')" :disabled="pending" v-if="allowRollBack">回退</el-button>
    </div>

    <!-- start 结算弹窗 -->
    <base-modal title="审核结算" :show.sync="balanceDialog.visible" width="700px">
      <div class="base-modal-content" v-if="Object.keys(balanceForm).length">
        <form-builder ref="form" :fields="balanceAvailableFields" :value="balanceForm" @update="update"></form-builder>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="balanceDialog.visible = false">取 消</el-button>
        <el-button type="primary" @click="submit" :disabled="pending">{{!task.balanceConfirm ? '结 算' : '保 存'}}</el-button>
      </div>
    </base-modal>
    <!-- end 结算弹窗 -->
  </div>
</template>

<script>
/* api */
import * as TaskApi from '@src/api/TaskApi.ts';

/* components */
import NoDataViewNew from '@src/component/common/NoDataViewNew';

/* util */
import * as Utils from '@src/component/form/util';

/* image */
import APPROVING_IMG from '@src/assets/img/task/approving.png';

export default {
  name: 'task-account',
  inject: ['initData'],
  props: {
    shareData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      pending: false,
      balanceForm: {},
      // 审核结算弹窗参数
      balanceDialog: {
        visible: false,
        action: ''
      }
    }
  },
  computed: {
    // 工单详情信息
    task() {
      return this.shareData.task || {};
    },
    // 工单设置
    taskConfig() {
      return this.initData.taskConfig || {};
    },
    // 审批数据
    approve() {
      return this.initData.unFinishedAppr || {};
    },
    // 是否在结算审批中
    isApproving() {
      return this.task.inApprove == 1 && this.approve.action == '结算';
    },
    // 审核结算开启的可用字段
    balanceAvailableFields() {
      let balanceFields = this.initData.balanceFieldInfos || [];
      return balanceFields.filter(field => field.setting.isOpen);
    },
    // 是否配置审核结算字段
    openUserDefinedBalance() {
      let openUserDefinedBalance = this.taskConfig.taskBalanceConfig?.openUserDefinedBalance;
      return openUserDefinedBalance && this.balanceAvailableFields.length > 0;
    },
    // 审核结算数据
    balanceJson() {
      let balanceAttribute = this.task.balanceAttribute;
      let taskBalanceJson = this.approve.otherInfo?.params.taskBalanceJson || {};

      let attribute = this.isApproving ? JSON.parse(taskBalanceJson) : balanceAttribute;

      return { 
        attribute
      }
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
     * @description 是否显示编辑按钮
     * 1. 工单状态是已结算costed
     * 2. 且 不是审批状态
     * 3. 且 结算过
     * 4. 且 未回访过
     * 5. 且 允许回退工单 canRollBack
    */
    allowEditBalance() {
      let { state, inApprove, isSettled, isReview } = this.task;

      return state === 'costed' && inApprove != 1 && isSettled == 1 && isReview == 0 && this.initData.canRollBack;
    },
    /** 
     * @description 是否显示回退按钮
     * 1. 满足现实编辑按钮权限
     * 5. 且 工单设置开启了允许退回工单回执
    */
    allowRollBack() {
      return this.allowEditBalance && this.taskConfig.taskRollBack;
    }
  },
  methods: {
    getApprovingImg() {
      return APPROVING_IMG;
    },
    // 打开弹窗
    async openDialog(action) {
      if (action === 'create' || action === 'edit') {
        // 是否开启自定义结算
        if (this.openUserDefinedBalance) {
          this.unpack();

          this.balanceDialog.action = action;
          this.balanceDialog.visible = true;
        } else {
          if (action === 'create') {
            if (!await this.$platform.confirm('是否确定结算？')) return;
            
            const params = this.pack(this.balanceForm);
            this.create(params);
          } else {
            this.$platform.alert('未配置任何审核结算字段,无法编辑结算');
          }
        }
        
      } else if (action === 'back') {
        this.$emit('back');
      }
    },
    update({ field, newValue, oldValue }) {
      let { fieldName, displayName } = field;

      if (this.$appConfig.debug) {
        console.info(`[FormBuilder] ${displayName}(${fieldName}) : ${JSON.stringify(newValue)}`)
      }

      this.$set(this.balanceForm, fieldName, newValue);
    },
    // 将数据拆解成自定义表单可接收的数据
    unpack() {
      let attribute = this.task.balanceAttribute;
      let result = Utils.initialize(this.balanceAvailableFields, { attribute });
      this.balanceForm = result;
    },
    // 将数据打包成服务器可接收的数据
    pack(form) {
      let { id, taskNo } = this.task;

      let data = { taskId: id };
      let attribute = {
        taskId: id,
        taskNo,
      }
      
      this.balanceAvailableFields.forEach(field => {
        if(field.formType == 'attachment') {
          data.balanceAttachments = form[field.fieldName];
        } else {
          attribute[field.fieldName] = form[field.fieldName];
        } 
      })
      
      data.balanceAttributes = attribute;
      return data;
    },
    submit() {
      this.$refs.form
        .validate()
        .then(async valid => {
          if (!valid) return Promise.reject('validate fail.');
        
          this.pending = true;

          const params = this.pack(this.balanceForm);
          this.balanceDialog.action == 'create' ? this.create(params) : this.edit(params);
        })
        .catch(err => {
          this.pending = false;
        })
    },
    async create(params) {
      // 审核结算是否需要审批
      const result = await TaskApi.balanceApproveCheck(params);
      if (!result.succ && result.message == '需要审批') {
        this.$emit('proposeApprove', result.data);
        this.balanceDialog.visible = false;
        this.pending = false;
        return;
      }

      TaskApi.balanceTask(params).then(res => {
        if (res.success) {
          this.$platform.notification({
            type: 'success',
            title: '审核结算成功'
          })

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
    edit(params) {
      TaskApi.editBalance(params).then(res => {
        if (res.success) {
          this.$platform.notification({
            type: 'success',
            title: '编辑成功'
          })

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
    }
  },
  components: {
    [NoDataViewNew.name]: NoDataViewNew
  }
}
</script>
