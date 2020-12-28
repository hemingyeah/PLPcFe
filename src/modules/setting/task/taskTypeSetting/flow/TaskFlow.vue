<template>
  <div class="setting-flow">
    <!--S 头部 -->
    <div class="setting-flow-header">
      <el-row class="setting-flow-header-left" type="flex">
        <p class="return-btn" @click="goBack">返回</p>
        <div>
          <el-row type="flex">
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
                v-model="taskTypeConfig.name"
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
          @click="currTab = idx"
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
          @click="submit"
          :loading="pending"
          >保存</el-button
        >
      </div>
    </div>
    <!--E 头部 -->

    <!-- 设置页  -->
    <keep-alive>
      <component
        ref="comp"
        :is="settingStep[currTab].compName"
        :taskTypeId="taskTypeId"
      ></component>
    </keep-alive>
  </div>
</template>

<script>
// api
import * as TaskApi from "@src/api/TaskApi.ts";
// model
import TaskConfig from "@model/types/setting/task/TaskConfig";
// utils
import { parse } from "@src/util/querystring";
// components
import FlowSettingPanel from "./tabs/FlowSettingPanel";
import OtherSettingPanel from "./tabs/OtherSettingPanel";
import CardSettingPanel from "./tabs/CardSettingPanel";

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
  name: "setting-flow",
  provide() {
    return {
      taskFlowData: this.$data,
    };
  },
  data() {
    return {
      taskTypeId: "",
	    taskTypeConfig: new TaskConfig(),
      currTab: 0,

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
          stepName: "流程设置",
          compName: "flow-setting-panel",
        },
        {
          stepName: "高级设置",
          compName: "other-setting-panel",
        },
        {
          stepName: "组件设置",
          compName: "card-setting-panel",
        },
      ];
    },
  },
  methods: {
    goBack() {
      window.history.go(-1);
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

        this.taskTypeConfig = Object.assign(this.taskTypeConfig, res.data);

        // 判断是否有设置服务报告模板
        if (JSON.stringify(res.data.reportSetting) == "{}") {
          let reportSetting = {
            tenantFields: ["name", "phone", "email", "address", "portal"],
            customerFields: ["name", "product", "address", "linkman"],
            taskFields: ["taskNo", "planTime", "executor"],
            receiptFields: ["sparepart", "service", "autograph"],
          };
          let reportForm = {};
          reportForm.id = this.taskTypeId;
          reportForm.reportSetting = reportSetting;

          try {
            let res = await TaskApi.saveSystemReport(reportForm);
            if (res.status == 0) {
              console.log("默认回执报告设置已保存");
            }
          } catch (err) {
            console.error("设置默认回执报告出错 => err", err);
          }
        }
      } catch (err) {
        console.error("fetch Tasktype => err", err);
      }
    },
    /** 右上角保存按钮 */
    async submit() {
      if (!this.$refs.comp.submit) return;

      this.pending = true;
        try {
        await this.$refs.comp.submit();
      } catch (error) {
        console.error(error);
      }finally {
        this.pending = false;
      }
    },
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
