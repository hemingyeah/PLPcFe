<template>
  <div class="setting-flow">
    <!--S 头部 -->
    <div class="setting-flow-header">
      <el-row class="setting-flow-header-left" type="flex">
        <p class="return-btn" @click="goBack">返回</p>
        <div>
          <el-row type="flex">
            <el-popover
              placement="bottom"
              width="224"
              trigger="click">
              <div class="choose-color-box">
                <div
                  v-for="color in taskTypeColor"
                  :key="color"
                  @click="typeColor = color"
                  :style="{background: color}">
                  <i class="el-icon-check" v-if="typeColor === color"></i>
                </div>
              </div>
              <el-tooltip slot="reference"  effect="dark" content="修改工单类型颜色" placement="bottom">
                <i class="type-color" :style="{background: typeColor}"></i>
              </el-tooltip>
            </el-popover>
            <el-tooltip effect="dark" content="修改工单类型名称" placement="bottom">
              <el-input class="type-name" v-model="typeName" placeholder="请输入工单类型名称"></el-input>
            </el-tooltip>
          </el-row>
        </div>
      </el-row>
      <el-row class="setting-flow-header-step" type="flex">
        <div
          v-for="(step, idx) in settingStep"
          :key="step.stepName"
          @click="currTab = idx"
          :class="idx === currTab && 'active'">
          <i>{{idx + 1}}</i>
          <div class="step-name">{{step.stepName}}</div>
        </div>
      </el-row>
      <div class="setting-flow-header-right">
        <el-button plain @click="submit" :disabled="pending">保存</el-button>
      </div>
    </div>
    <!--E 头部 -->

    <!-- 设置页  --> 
    <component :is="settingStep[currTab].compName" :taskTypeId="taskTypeId"></component>
  </div>
</template>

<script>
// utils
import { parse } from '@src/util/querystring';
// components
import FlowSettingPanel from './tabs/FlowSettingPanel';
import OtherSettingPanel from './tabs/OtherSettingPanel';
import CardSettingPanel from './tabs/CardSettingPanel';

const TASK_TYPE_COLOR = ['#737F7C','#266FFF','#5255FF','#8552FF','#BC52FF','#FF52D4','#FF9526','#6ECF40','#00B8D5','#0BA194']

export default {
  name: 'setting-flow',
  data() {
    return {
      type: 'add', // 创建类型: add 新建工单类型; edit 编辑工单类型; template 模板创建;
      taskTypeId: '',

      typeColor: '#737F7C',
      typeName: '修改工单类型设置',
      pending: false,

      flowSetting: {

      },

      advancedSetting: {

      },


      currTab: 0
    }
  },
  computed: {
    taskTypeColor() {
      return TASK_TYPE_COLOR;
    },
    settingStep() {
      return [
        {
          stepName: '流程设置',
          compName: 'flow-setting-panel'
        },
        {
          stepName: '高级设置',
          compName: 'other-setting-panel'
        },
        {
          stepName: '组件设置',
          compName: 'card-setting-panel'
        },
      ]
    }
  },
  methods: {
    goBack() {
      window.history.go(-1);
    },
    submit() {

    }
  },
  mounted() {
    let query = parse(window.location.search) || {};
    this.type = query.type;
    this.taskTypeId = query.taskTypeId;
  },
  components: {
    [FlowSettingPanel.name]: FlowSettingPanel,
    [OtherSettingPanel.name]: OtherSettingPanel,
    [CardSettingPanel.name]: CardSettingPanel,
  },
}
</script>

<style lang="scss" src="./taskFlow.scss" scoped></style>