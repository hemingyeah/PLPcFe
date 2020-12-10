<template>
  <div class="setting-flow">
    <!--S 头部 -->
    <div class="setting-flow-header">
      <el-row class="setting-flow-header-left" type="flex">
        <p class="return-btn">返回</p>
        <div>
          <el-row type="flex">
            <i class="type-color"></i>
            <el-input class="type-name" v-model="typeName" placeholder="请输入工单类型名称"></el-input>
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
    <component :is="settingStep[currTab].compName"></component>
  </div>
</template>

<script>
import FlowSettingPanel from './tabs/FlowSettingPanel.vue'
import OtherSettingPanel from './tabs/OtherSettingPanel.vue'

export default {
  name: 'setting-flow',
  data() {
    return {
      typeName: '修改工单类型设置',
      pending: false,

      currTab: 0
    }
  },
  computed: {
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
          compName: ''
        },
      ]
    }
  },
  methods: {
    submit() {

    }
  },
  components: {
    [FlowSettingPanel.name]: FlowSettingPanel,
    [OtherSettingPanel.name]: OtherSettingPanel
  },
}
</script>

<style lang="scss" src="./taskFlow.scss" scoped></style>