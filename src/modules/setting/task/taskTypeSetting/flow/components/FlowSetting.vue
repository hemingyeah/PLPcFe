<template>
  <el-form class="flow-setting">
    <!--S 预览组件 -->
    <div v-if="showFormBuilder" class="flow-setting-left">
      <form-preview :fields="fields" class="flow-setting-form-preview">
        <div class="form-preview-box">
          <el-button
            type="primary"
            class="form-preview-btn"
            @click="openFormDesign"
          >
            {{ type === "create" ? "新建" : "回执" }}表单设置
          </el-button>
        </div>
      </form-preview>
    </div>
    <!--E 预览组件 -->

    <!--S 设置项 -->
    <div class="flow-setting-right">
      <div class="setting-specific">
        <!--S 工单表单设置 -->
        <div v-if="showFormBuilder" class="setting-specific-form">
          <h2 class="mt-12">工单表单设置</h2>
          <p style="color: #13C2C2" @click="openFormDesign">
            工单{{ type === "create" ? "新建" : "回执" }}表单设置
          </p>
        </div>
        <!--E 工单表单设置 -->

        <!--S 审批设置 -->
        <div
          v-if="!['create', 'accept'].includes(type)"
          :class="['setting-specific-approve',showFormBuilder && 'mt-12']"
        >
          <h2>
            审批设置
          </h2>
          <approve-setting
            :options="options.flow"
            :approve-setting="flowSetting.approveSetting"
            @change="changeApproveSetting"
          />
        </div>
        <!--E 审批设置 -->

        <!--S 转派时也审批-->
        <div v-if="type === 'allot'" class="mt-8">
          <el-checkbox v-model="flowSetting.reallotAppr" true-label="" false-label="none"
          >转派时也审批</el-checkbox
          >
        </div>
        <!--E 转派时也审批-->

        <!--S 超时提醒 -->
        <div v-if="showOvertime" class="setting-specific-overtime">
          <h2 class="mb-0">
            超时提醒
            <el-switch
              class="ml-12"
              v-model="taskOverTimeModel.overTimeStatus"
              @change="updateOvertimeSetting"
            />
          </h2>
          <div>
            {{ preFlowName }}后超过
            <el-input
              class="w-87"
              onkeyup="if(isNaN(value))execCommand('undo')"
              v-model="flowSetting.overTime"
            />
            小时后，标记为超时
          </div>
          <div>
            <span>工单超时后提醒干系人（负责人、协同人、创建人）及</span>
            <el-select
              v-model="taskOverTimeModel.remindType"
              @change="updateOvertimeSetting"
            >
              <el-option
                v-for="item in overTimeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
            <el-input
              v-if="taskOverTimeModel.remindType === null"
              class="w-187"
              placeholder="请选择审批人"
              readonly
              :value="getApproverNames(taskOverTimeModel.reminders)"
              @click.native="selectApproveUser('overTime')"
              @change="updateOvertimeSetting"
            />
            超时
            <el-select
              class="w-87"
              v-model="taskOverTimeModel.isAhead"
              @change="updateOvertimeSetting"
            >
              <el-option label="前" :value="1"> </el-option>
              <el-option label="后" :value="0"> </el-option>
            </el-select>
            <el-input
              class="w-87"
              onkeyup="this.value=this.value.replace(/\D/g,'')"
              v-model="taskOverTimeModel.minutes"
              @change="updateOvertimeSetting"
            >
            </el-input>
            分钟发出提醒
          </div>
        </div>
        <!--E 超时提醒 -->

        <!--S 自动回访 -->
        <div v-if="showReview" class="setting-specific-auto-review">
          <h2>
            自动回访
            <el-switch v-model="taskTypeConfig.autoReviewState" />
          </h2>
          <p>
            允许自动回访后，工单负责人完成工单后，系统自动向客户发送评价短信，获取客户评价信息
          </p>
        </div>
        <!--E 自动回访 -->

        <!--S 自动回访短信延迟发送设置 -->
        <div v-if="showReview" class="setting-specific-msg-delay">
          <h2>
            自动回访短信延迟发送设置
            <el-switch v-model="taskTypeConfig.delayBack" />
          </h2>
          <div>
            工单负责人在完成工单后，自动回访短信延迟
            <el-input
              class="w-87"
              onkeyup="this.value=this.value.replace(/\D/g,'')"
              v-model="taskTypeConfig.delayBackMin"
            ></el-input>
            分钟后发出
          </div>
        </div>
        <!--E 自动回访短信延迟发送设置 -->

        <!--S 工单自动关闭 -->
        <div v-if="showTaskClose" class="setting-specific-task-close">
          <h2>
            工单自动关闭设置
            <el-switch v-model="flowSetting.autoClose" />
          </h2>
          <p>开启后，当工单所有的流程都结束时，将自动关闭工单。</p>
        </div>
        <!--E 工单自动关闭 -->

        <!--S 关闭工单查看权限 -->
        <div v-if="showTaskClose" class="setting-specific-task-view-auth">
          <h2>
            工单关闭后限制查看权限
            <el-switch v-model="flowSetting.closeView" />
          </h2>
          <div>
            工单关闭后不允许
            <el-select v-model="flowSetting.closeNoViewAuth"></el-select>
            <el-button type="text">查看</el-button>
          </div>
        </div>
        <!--E 关闭工单查看权限 -->
      </div>

      <!-- 公共设置 -->
      <div class="setting-common">
        <div class="setting-specific-form">
          <h2 class="mt-12">
            计划时间提醒
            <el-switch
              class="ml-12"
              v-model="taskTypeConfig.planRemindSetting.state"
            />
          </h2>
          <div class="mb-8">
            在计划时间
            <el-select
              class="w-87"
              v-model="taskTypeConfig.planRemindSetting.minutesType"
              placeholder="请选择"
            >
              <el-option label="前" :value="0"> </el-option>
              <el-option label="后" :value="1"> </el-option>
            </el-select>
            <el-input
              class="w-87"
              onkeyup="this.value=this.value.replace(/\D/g,'')"
              v-model="taskTypeConfig.planRemindSetting.minutes"
            />
            分钟提醒工单负责人、协同人及
            <el-select v-model="taskTypeConfig.noticeLeader" placeholder="请选择">
              <el-option
                v-for="item in planOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
            <el-input
              v-if="taskTypeConfig.noticeLeader == 2"
              class="w-187"
              placeholder="请选择审批人"
              readonly
              :value="getApproverNames(taskTypeConfig.noticeUsers)"
              @click.native="selectApproveUser('planRemind')"
            />
          </div>
        </div>
        <div class="setting-specific-form">
          <h2>
            允许工单负责人将工单状态设为暂停
            <el-switch class="ml-12" v-model="taskTypeConfig.allowPause" />
          </h2>
          <approve-setting
            :options="options.pause"
            :approve-setting="taskTypeConfig.pauseApproveSetting"
            @change="(setting) => changeApproveSetting(setting, 'pause')"
          />
        </div>
        <div class="setting-specific-form">
          <h2>
            允许工单在完成前被取消
            <el-switch class="ml-12" v-model="taskTypeConfig.allowCancel" />
          </h2>
          <approve-setting
            :options="options.cancel"
            :approve-setting="taskTypeConfig.cancelApproveSetting"
            @change="(setting) => changeApproveSetting(setting, 'cancel')"
          />
        </div>
      </div>
    </div>
    <!--E 设置项 -->

    <!-- 表单设置弹窗 -->
    <task-fields-setting
      ref="taskFormSetting"
      :mode="mode"
      :template-id="taskTypeId"
      @success="refreshFields"
    ></task-fields-setting>
  </el-form>
</template>

<script>
// api
import * as TaskApi from '@src/api/TaskApi.ts';
import * as SettingApi from '@src/api/SettingApi.js';
// model
import TaskConfig from '@model/types/setting/task/TaskConfig';
import TaskOverTimeSetting from '@model/types/setting/task/TaskOverTimeSetting';
// components
import ApproveSetting from './ApproveSetting.vue';
import TaskFieldsSetting from '@src/modules/setting/task/taskFieldsSetting/TaskFieldsSetting.vue';
/* enum */
import TableNameEnum from '@model/enum/TableNameEnum.ts';

import flowMap from '../flowMap';

export default {
  name: 'flow-setting',
  props: {
    taskTypeId: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: 'create',
    },
    flowSetting: {
      type: Object,
      default: () => ({}),
    },
    taskTypeConfig: {
      type: Object,
      default: () => new TaskConfig(),
    },
  },
  data() {
    return {
      taskTypeName: '', // 接口返回的工单类型名称

      fields: [],
      flowMap,

      options: {
        pause: [],
        cancel: [],
        flow: []
      },

      overTimeOptions: [
        {
          value: 0,
          label: '无需通知其他人',
        },
        {
          value: 1,
          label: '通知负责人团队主管',
        },
        {
          value: null,
          label: '指定人员',
        },
      ],

      planOptions: [
        {
          value: '0',
          label: '无需通知其他人',
        },
        {
          value: '1',
          label: '通知负责人团队主管',
        },
        {
          value: '2',
          label: '指定人员',
        },
      ],

      taskOverTimeModel: new TaskOverTimeSetting(),

      formList: [], // 表单人员
      receiptList: [], // 回执表单人员
    };
  },
  computed: {
    showFormBuilder() {
      // 展示表单组件
      return ['create', 'finish'].includes(this.type);
    },
    showApporeve() {
      // 展示审批
      return true;
    },
    showOvertime() {
      // 展示超时提醒
      return !['create', 'cost', 'review', 'close'].includes(this.type);
    },
    showReview() {
      // 展示自动回访
      return ['review'].includes(this.type);
    },
    showTaskClose() {
      // 展示工单关闭 (mark_zr: 暂时不做)
      return false && ['close'].includes(this.type);
    },
    mode() {
      return this.type == 'finish'
        ? TableNameEnum.TaskReceipt
        : TableNameEnum.Task;
    },
    preFlowName() {
      // 上一个启用流程的节点
      let name = '';

      for (const key in this.flowMap) {
        debugger;
        if(!!this.taskTypeConfig.flowSetting[key].state) {
          if(this.type !== 'create' && this.type === key) {
            return name;
          }

          name = this.flowMap[key].name;
        }
      }
    }
  },
  watch: {
    type(val) {
      if (val) {
        this.getTaskFields(val);
        // 获取当前流程超时提醒设置
        this.taskOverTimeModel = this.taskTypeConfig.taskOverTimeModels.find(
          (item) => item.overTimeState === val
        ) || {};
        this.options.flow = this.approveOptions(this.type);
      }
    },
    taskTypeId(id) {
      if (id) {
        this.getTaskFields(this.type);
        this.fetchFromUser(this.taskTypeId);
      }
    },
  },
  methods: {
    buildApproveOptions() {
      this.options.flow = this.approveOptions(this.type);
      this.options.pause = this.approveOptions('pause');
      this.options.cancel = this.approveOptions('cancel');
    },
    /** 审批类型选项 */
    approveOptions(type) {
      let options = [
        {
          value: 'leader',
          label: '发起人主管',
        },
        {
          value: 'users',
          label: '指定人员',
        },
        {
          value: 'createUser',
          label: '工单创建人',
        },
        {
          value: 'userAdmin',
          label: '客户负责人',
        },
        {
          value: 'promoter',
          label: '由发起人选择',
        },
      ];

      options = [
        ...options,
        ...this.formList.map((item) => {
          return {
            label: `表单人员:${ item.showName}`,
            value: item.stateTemplateId,
          };
        }),
      ];

      if (type !== 'allot') {
        options.splice(3, 0, {
          value: 'allotUser',
          label: '工单派单人',
        });
      }

      if (!['allot', 'accept', 'start', 'pause'].includes(type)) {
        options = [
          ...options,
          ...this.receiptList.map((item) => {
            return {
              label: `回执表单人员:${ item.showName}`,
              value: item.stateTemplateId,
            };
          }),
        ];
      }

      return options;
    },
    /** 获取工单表单、回执表单中必填的人员字段 */
    async fetchFromUser(id) {
      try {
        let res = await SettingApi.getFromUser(id);
        this.formList = res.data.list;
        this.receiptList = res.data.receiptList;

        this.buildApproveOptions();
      } catch (error) {
        console.error('fetch getFromUser => error', error);
      }
    },
    /**
     * 获取工单表单/回执表单自定义字段
     */
    async getTaskFields(type) {
      if (['create', 'finish'].includes(type)) {
        try {
          let fields = await TaskApi.getAllFields({
            tableName: this.mode,
            typeId: this.taskTypeId,
            isFromSetting: false,
          });
          this.fields = fields || [];
        } catch (error) {
          console.error('fetch task getAllFields => err', error);
        }
      }
    },
    /**
     * 打开表单编辑器
     */
    openFormDesign() {
      this.$refs.taskFormSetting.open();
    },
    /** 更新审批设置 */
    changeApproveSetting(setting, key) {
      switch (key) {
      case 'pause':
        this.taskTypeConfig.pauseApproveSetting = setting;
        break;
      case 'cancel':
        this.taskTypeConfig.cancelApproveSetting = setting;
        break;
      default:
        this.$set(this.flowSetting, 'approveSetting', setting);
        break;
      }
    },
    /** 更新流程超时提醒设置 */
    updateOvertimeSetting() {
      let index = this.taskTypeConfig.taskOverTimeModels.findIndex(
        (item) => item.overTimeState === this.type
      );
      if (index > -1) {
        this.$set(
          this.taskTypeConfig.taskOverTimeModels,
          index,
          this.taskOverTimeModel
        );
      }
    },
    /** 格式化审批人员名称 */
    getApproverNames(approvers) {
      return approvers.map((item) => item.displayName).join(',');
    },
    /** 选择指定审批人员 */
    selectApproveUser(type) {
      let selected = [];

      if (type === 'overTime') selected = this.taskOverTimeModel.reminders;
      if (type === 'planRemind') selected = this.taskTypeConfig.noticeUsers;

      let options = {
        title: '选择审批人', // [选填] 默认值为 '请选择人员'
        max: 14, // [选填]最大人数：当值小于等于0或者不填时，不对选择人数做限制，max值为1时单选，大于1时多选
        selected, // [选填] 已选人员 每个人员必须包括userId,displayName,staffId,head这四个属性，只有带max大于1时生效
      };

      this.$fast.contact
        .choose('dept', options)
        .then((res) => {
          if (res.status != 0) return;
          switch (type) {
          case 'overTime': // 超时审批指定人员
            this.taskOverTimeModel.reminders = res.data.users;
            this.updateOvertimeSetting();
            break;
          case 'planRemind': // 计划提醒指定人员
            this.taskTypeConfig.noticeUsers = res.data.users;
            break;
          default:
            break;
          }
        })
        .catch((err) => {
          console.warn(err);
        });
    },
    /** 刷新字段和表单必填人员 */
    refreshFields() {
      this.getTaskFields(this.type);
      this.fetchFromUser(this.taskTypeId);
    },
  },
  mounted() {
    this.$eventBus.$on('setting_task_type_name', (taskTypeName) => {
      this.taskTypeName = taskTypeName;
    });
  },
  beforeDestroy() {
    this.$eventBus.$off('setting_task_type_name');
  },
  components: {
    [ApproveSetting.name]: ApproveSetting,
    [TaskFieldsSetting.name]: TaskFieldsSetting,
  },
};
</script>

<style lang="scss" scoped>
.flow-setting {
  display: flex;
  .flow-setting-left {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #ffffff;
    margin-right: 12px;
    border-radius: 0 0 4px 4px;
    .flow-setting-form-preview {
      padding-top: 20px;
    }
    .form-preview-box{
      position: absolute;
      bottom: 40px;
      left: 16px;
      text-align: center;
      width: calc(100% - 32px);
      height: 50px;
      line-height: 40px;
      background: #ffffff;
      .form-preview-btn {
        width: calc(100% - 20px);
      }
    }
  }
  .flow-setting-right {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: auto;
    .setting-specific {
      font-size: 14px;
      padding: 8px 20px 20px 20px;
      background: #ffffff;
      color: #999999;
      border-radius: 0 0 4px 4px;
      h2 {
        color: #333333;
        font-size: 14px;
        margin: 20px 0 8px 0;
      }
      p {
        margin-bottom: 0;
      }
      &-form {
        p {
          cursor: pointer;
          color: #666666;
          &:hover {
            color: $color-primary;
          }
        }
      }
    }

    .setting-common {
      flex: 1;
      margin-top: 12px;
      font-size: 14px;
      background: #ffffff;
      padding: 8px 20px 20px 20px;
      border-radius: 4px;
      color: #999999;
      h2 {
        color: #333333;
        font-size: 14px;
        margin: 20px 0 8px 0;
      }
    }
  }
}

.form-design-main .form-design-center{
  height: 90%;
}

.w-87 {
  width: 87px;
}

.w-187 {
  width: 187px;
}

.ml-12 {
  margin-left: 12px;
}

.mb-0{
  margin-bottom: 0 !important;
}

.mt-8 {
  margin-top: 8px;
}

.mt-12{
  margin-top: 12px !important;
}

.mb-8 {
  margin-bottom: 8px;
}

/** element style */
/deep/.el-input{
    margin-top: 8px;
}
/deep/.el-checkbox{
  margin-bottom: 0;
}
</style>
