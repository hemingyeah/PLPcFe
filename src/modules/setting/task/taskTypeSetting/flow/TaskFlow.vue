<template>
  <div class="setting-flow">
    <!--S 头部 -->
    <div class="setting-flow-header">
      <el-row class="setting-flow-header-left" type="flex">
        <p class="return-btn" @click="checkModified(goBack, true)">
          <i class="iconfont icon-arrow-left"></i> 返回
        </p>
        <div>
          <el-row type="flex" style="height: 30px;max-width: 185px;">
            <el-popover placement="bottom" width="224" trigger="click">
              <div class="choose-color-box">
                <div
                  v-for="color in taskTypeColor"
                  :key="color"
                  @click="taskTypeConfig.config.color = color"
                  :style="{ background: color }"
                >
                  <i class="el-icon-check" v-if="taskTypeConfig.config.color === color"></i>
                </div>
              </div>
              <el-tooltip
                slot="reference"
                effect="dark"
                content="修改工单类型颜色"
                placement="bottom"
              >
                <i class="type-color" :style="{ background: taskTypeConfig.config.color }"></i>
              </el-tooltip>
            </el-popover>
            <el-tooltip
              effect="dark"
              content="修改工单类型名称"
              placement="bottom"
            >
              <el-input
                class="type-name"
                :value="taskTypeName"
                @blur="taskTypeName = formatTaskTypeName(taskTypeName)"
                @focus="taskTypeName = taskTypeConfig.name"
                @input="changeTaskTypeName"
                placeholder="请输入工单类型名称"
              ></el-input>
            </el-tooltip>
          </el-row>
        </div>
      </el-row>
      <el-row class="setting-flow-header-step" type="flex">
        <div
          v-for="(step, idx) in settingStep"
          :key="step.stepName"
          @click="clickTab(idx)"
          :class="idx === currTab && 'active'"
        >
          <i>{{ idx + 1 }}</i>
          <div class="step-name">{{ step.stepName }}</div>
        </div>
      </el-row>
      <div class="setting-flow-header-right">
        <el-button
          class="header-save-btn"
          plain
          @click="submit(true)"
          :loading="pending"
        >保 存</el-button
        >
      </div>
    </div>
    <!--E 头部 -->

    <!-- 设置页  -->
    <keep-alive>
      <component
        ref="comp"
        :is="settingStep[currTab].compName"
        :task-type-id="taskTypeId"
      ></component>
    </keep-alive>
  </div>
</template>

<script>
// api
import * as TaskApi from '@src/api/TaskApi.ts';
import * as SettingApi from '@src/api/SettingApi';
// model
import TaskConfig from '@model/types/setting/task/TaskConfig';
import TaskApprover from '@model/types/setting/task/TaskApprover';
// utils
import { parse } from '@src/util/querystring';
// components
import FlowSettingPanel from './tabs/FlowSettingPanel';
import OtherSettingPanel from './tabs/OtherSettingPanel';
import CardSettingPanel from './tabs/CardSettingPanel';

const TASK_TYPE_COLOR = [
  'rgb(115,127,124)',
  'rgb(38,111,255)',
  'rgb(82,85,255)',
  'rgb(133,82,255)',
  'rgb(188,82,255)',
  'rgb(255,82,212)',
  'rgb(255,149,38)',
  'rgb(110,207,64)',
  'rgb(0,184,213)',
  'rgb(11,161,148)'
];

export default {
  name: 'setting-flow',
  provide() {
    return {
      taskFlowData: this.$data,
    };
  },
  data() {
    return {
      taskTypeId: '',
      taskTypeName: '',
      taskTypeConfig: new TaskConfig(),
      currTab: 0,

      initTaskTypeConfig: new TaskConfig(),
      pending: false,
    };
  },
  computed: {
    taskTypeColor() {
      return TASK_TYPE_COLOR;
    },
    settingStep() {
      return [
        {
          stepName: '流程设置',
          compName: 'flow-setting-panel',
        },
        {
          stepName: '高级设置',
          compName: 'other-setting-panel',
        },
        {
          stepName: '组件设置',
          compName: 'card-setting-panel',
        },
      ];
    },
  },
  methods: {
    goBack() {
      let fromId = window.frameElement.getAttribute('fromid');
      let id = window.frameElement.dataset.id;
      this.$platform.closeTab(id);

      this.$platform.openTab({
        id: 'M_SYSTEM',
        title: '工单类型设置',
        url: '/setting/taskType/manage',
        reload: true,
        close: true,
        fromId
      });
    },
    clickTab(idx) {
      if(this.currTab === idx) return;
      this.checkModified(() => {
        this.currTab = idx;
      });
    },
    /** 修改工单类型名称 */
    changeTaskTypeName(val) {
      this.taskTypeConfig.name = val;
      this.taskTypeName = val;
    },
    /** 格式化工单类型名称 */
    formatTaskTypeName(name) {
      if(name.length > 9) {
        return `${name.slice(0, 9) }...`;
      }

      return name;
    },
    /** 兼容旧审批结构 */
    compatibleOldApprove(setting) {
      let {leader, level, approvers} = setting;
      if(level === undefined) {
        switch(leader) {
        case undefined:
          if(approvers && approvers.length > 0) {
            leader = 'users';
            level = 1;
          }else {
            level = 0;
          }
          break;
        default: 
          level = 1;
          break
        }
      }

      if(leader === 'none'){
        level = 0;
        leader = '';
      }
      return {
        ...setting,
        leader,
        level
      };
    },
    /** 转化getOne接口返回的数据 */
    convertTaskTypeConfig(taskTypeConfig) {
      let { flowSetting, isLeader, pauseApprovers, planRemindSetting, delayBack, config, overTimeSetting } = taskTypeConfig;

      taskTypeConfig.planRemindSetting = {
        ...new TaskConfig().planRemindSetting,
        ...planRemindSetting
      };
      
      taskTypeConfig.delayBack = delayBack === 'true';
      taskTypeConfig.allowPause = Boolean(taskTypeConfig.allowPause);
      taskTypeConfig.allowCancel = Boolean(taskTypeConfig.allowCancel);

      if(isLeader == 1) {
        isLeader = 'leader';
      }else if(isLeader == 2) {
        isLeader = 'none';
      }else if(isLeader == 3) {
        isLeader = 'users';
      }else if(isLeader == 4) {
        isLeader = 'createUser';
      }else if(isLeader == 5) {
        isLeader = 'allotUser';
      }else if(isLeader == 6 && pauseApprovers[0]) {
        isLeader = `formUser_${pauseApprovers[0].taskTemplateId}`;
      }else if(isLeader == 7) {
        isLeader = 'userAdmin';
      }else if(isLeader == 8) {
        isLeader = 'promoter';
      }else {
        isLeader = 'users';
      }

      taskTypeConfig.pauseApproveSetting = this.compatibleOldApprove({leader: isLeader, approvers: pauseApprovers, multiApproverSetting: []});
      
      // 流程审批格式转化
      Object.keys(flowSetting).forEach(key => {
        let {state, ttid, overTime, leader, approvers, level, multiApproverSetting, reallotAppr} = flowSetting[key];

        // 兼容旧审批格式
        let approveSetting = this.compatibleOldApprove({
          leader,
          approvers,
          level,
          multiApproverSetting 
        });

        leader = leader === 'none' ? '' : leader;
        if(key === 'autoReview') {
          // 自动回访开关
          taskTypeConfig.autoReviewState = flowSetting[key].state;
        }else if(key === 'off') {
          // 取消工单设置
          taskTypeConfig.allowCancel = flowSetting[key].state;
          taskTypeConfig.cancelApproveSetting = approveSetting;
        }else {
          taskTypeConfig.flowSetting[key] = {
            state,
            ttid,
            overTime,
            approveSetting,
          }

          // 转派需要审批开关
          if(key === 'allot') {
            this.$set(taskTypeConfig.flowSetting[key], 'reallotAppr', reallotAppr !== 'none');
          }

          if(key === 'pause') {
            taskTypeConfig.pauseApproveSetting = approveSetting;
          }
        }
      })

      // 兼容旧超时提醒设置
      if(config.newOverTimeSetting === undefined || (config.newOverTimeSetting && config.newOverTimeSetting.length === 0)) {
        taskTypeConfig.taskOverTimeModels = taskTypeConfig.taskOverTimeModels.map(item => {
          return {
            ...item,
            ...overTimeSetting,
            overTimeStatus: true,
            remindType: overTimeSetting.remindType ? overTimeSetting.remindType : null,
            reminders: overTimeSetting.reminders || []
          }
        })
      }else {
        taskTypeConfig.taskOverTimeModels = config.newOverTimeSetting.map(item => {
          return {
            ...item,
            remindType: item.remindType ? item.remindType : null,
            overTimeStatus: !!item.overTimeStatus,
            reminders: item.reminders || []
          }
        })
      }

      delete taskTypeConfig.isLeader;
      delete taskTypeConfig.pauseApprovers;

      return taskTypeConfig;
    },
    /**
     * 获取工单设置的除组件外的其他信息
     */
    async fetchTasktype(id) {
      try {
        let params = {
          id: this.taskTypeId,
        };

        let res = await TaskApi.getTaskType(params);

        // 转化获取到的结果
        this.taskTypeConfig = this.convertTaskTypeConfig(Object.assign(this.taskTypeConfig, res.data));
        this.initTaskTypeConfig = _.cloneDeep(this.taskTypeConfig);
        this.taskTypeName = this.formatTaskTypeName(this.taskTypeConfig.name);

        // 传递给FlowSetting组件工单类型名称
        this.$eventBus.$emit('setting_task_type_name', this.taskTypeConfig.name);
        // 判断是否有设置服务报告模板
        if (JSON.stringify(res.data.reportSetting) == '{}') {
          let reportSetting = {
            tenantFields: ['name', 'phone', 'email', 'address', 'portal'],
            customerFields: ['name', 'product', 'address', 'linkman'],
            taskFields: ['taskNo', 'planTime', 'executor'],
            receiptFields: ['sparepart', 'service', 'autograph'],
          };
          let reportForm = {};
          reportForm.id = this.taskTypeId;
          reportForm.reportSetting = reportSetting;

          try {
            let res = await TaskApi.saveSystemReport(reportForm);
            if (res.status == 0) {
              console.log('默认回执报告设置已保存');
            }
          } catch (err) {
            console.error('设置默认回执报告出错 => err', err);
          }
        }
      } catch (err) {
        console.error('fetch Tasktype => err', err);
      }
    },
    /** 更新工单类型颜色和名称 */
    // async updateTaskTypeNameAndColor() {
    //   try {
    //     let params =  {
    //       id: this.taskTypeId,
    //       name: this.taskTypeConfig.name,
    //       color: this.taskTypeConfig.config.color
    //     }
    //     await TaskApi.updateTaskTypeNameAndColor(params);
    //   } catch (error) {
    //     console.error(error);
    //   }
    // },
    /** 右上角保存按钮 */
    async submit(flag = false) {
      if (!this.$refs.comp.submit) return;

      let name = this.taskTypeConfig.name;
      if (name === '') {
        return this.$platform.notification({
          title: '工单类型名称为空',
          type: 'error'
        });
      }
      if(name.length > 20) {
        return this.$platform.notification({
          title: '工单类型名称超过20个字',
          type: 'error'
        });
      }
      if(!/^[a-zA-Z0-9\u4e00-\u9fa5]+$/.test(name)) {
        return this.$platform.notification({
          title: '工单类型名称只能输入中文、字母、数字',
          type: 'error'
        });
      }

      let nameAndColor = {
        name: this.taskTypeConfig.name,
        color: this.taskTypeConfig.config.color
      };
      this.pending = true;
      try {
        await this.$refs.comp.submit(nameAndColor, flag);
        // await this.updateTaskTypeNameAndColor();
        this.fetchTasktype();
      } catch (error) {
        console.error(error);
      }finally {
        this.pending = false;
      }
    },
    /**
     * @description 检查当前tab页是否有修改
     * @param {function} bc 回调函数
     * @param {boolean} isisReturn 是否是返回操作
     */
    async checkModified(bc, isReturn = false) {
      let isModified = false;
      
      if(this.$refs.comp.checkModified) {
        isModified = this.$refs.comp.checkModified();
      }

      let confirmObj = {
        content: isReturn ? '有修改的内容未保存，确认离开吗？' : '有修改的内容未保存，是否要保存？',
        confirmText: isReturn ? '离开' : '保存',
        cancelText: isReturn ? '取消' : '暂不保存'
      }

      if(isModified) {
        this.$confirm(confirmObj.content, '', {
          confirmButtonText: confirmObj.confirmText,
          cancelButtonText: confirmObj.cancelText,
          type: 'warning',
          showClose: false,
          closeOnClickModal: false
        }).then(async () => {
          // 保存
          if(!isReturn) await this.submit();
          bc();
        }).catch(() => {
          // 取消
          if(isReturn) return;
          // 暂不保存
          if(!isReturn && this.$refs.comp.resetInit) {
            this.$refs.comp.resetInit();
          }
          bc();
        });
      }else {
        bc();
      }
    }
  },
  mounted() {
    let query = parse(window.location.search) || {};
    this.taskTypeId = query.taskTypeId;

    if (this.taskTypeId) this.fetchTasktype();
  },
  components: {
    [FlowSettingPanel.name]: FlowSettingPanel,
    [OtherSettingPanel.name]: OtherSettingPanel,
    [CardSettingPanel.name]: CardSettingPanel,
  },
};
</script>
<style lang="scss" src="./taskFlow.scss" scoped></style>
