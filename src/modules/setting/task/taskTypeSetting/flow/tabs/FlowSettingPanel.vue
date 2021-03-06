<template>
  <el-row type="flex" class="setting-flow-container">
    <div id="task-flow-guide"></div>
    <!--S 工单流程轴 -->
    <div class="setting-flow-axis" id="setting-flow-axis-guide">
      <el-row
        class="flow-axis-step-box"
        type="flex"
        justify="space-between"
        v-for="key in Object.keys(flowMap)"
        :key="key"
        @click.native="clickFlow(key)">
        <el-row
          class="flow-axis-step"
          :class="[currFlow === key && 'active', (!taskFlowData.taskTypeConfig.flowSetting[key].state && !flowMap[key].isSystem) && 'disabled']"
          type="flex" justify="space-between">
          <div>
            <i :class="['iconfont', flowMap[key].icon]" :style="{color: key === 'close' && '#F56C6C'}"></i>
            {{flowMap[key].name}}
          </div>
          <div v-if="taskFlowData.taskTypeConfig.flowSetting[key].state || flowMap[key].isSystem" class="open-tag">已开启</div>
        </el-row>
        <div class="open-btn" @click.stop>
          <el-switch v-model="taskFlowData.taskTypeConfig.flowSetting[key].state" v-if="!flowMap[key].isSystem"/>
        </div>
      </el-row>
    </div>
    <!--E 工单流程轴 -->
    <!--S 流程设置 -->
    <div class="setting-flow-main">
      <div class="setting-flow-main-title">
        {{flowMap[currFlow].desc}}
      </div>
      <div class="setting-flow-main-content" id="setting-flow-main-content-guide">
        <flow-setting
          ref="flowSettingRef"
          :task-type-id="taskTypeId"
          :type="currFlow"
          :flow-setting="taskFlowData.taskTypeConfig.flowSetting[currFlow]"
          :task-type-config="taskFlowData.taskTypeConfig"
          style="height: 100%"/>
      </div>
    </div>
    <!--E 流程设置 -->
  </el-row>
</template>

<script>
import _ from 'lodash';
/** api */
import * as SettingApi from '@src/api/SettingApi';
/** components */
import FlowSetting from '../components/FlowSetting.vue';

import { convertDataToParams } from '../util';
// 新存储工具方法
import { storageGet, storageSet } from '@src/util/storage.ts';
/* enum */
import StorageModuleEnum from '@model/enum/StorageModuleEnum';

const { TASK_FLOW_SETTING_GUIDE } = require('@src/component/guide/taskSettingStore');

import flowMap from '../flowMap';
export default {
  name: 'flow-setting-panel',
  inject: ['taskFlowData'],
  props: {
    taskTypeId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      currFlow: 'create', // 当前设置的流程
      open: false,

      flowMap,
    }
  },
  methods: {
    clickFlow(type) {
      this.currFlow = type;

    },
    /** 保存流程设置 (暴露的方法) */
    async submit(otherParams) {
      try {
        let params = convertDataToParams(this.taskFlowData.taskTypeConfig);
        params = {
          ...params,
          ...otherParams
        };
                
        let res = await SettingApi.saveProcess(params);
        if(res.status == 1) {
          return this.$platform.notification({
            title: res.message,
            type: 'error'
          });
        }

        this.$platform.notification({
          title: '保存成功',
          type: 'success'
        });
                
      } catch (error) {
        console.error('error', error);
      }
    },
    /** 检查内容是否有修改 (暴露的方法) */
    checkModified() {
      let {taskTypeConfig, initTaskTypeConfig} = this.taskFlowData;
      return JSON.stringify(taskTypeConfig) != JSON.stringify(initTaskTypeConfig);
    },
    /** 同步初始数据 (暴露的方法) */
    resetInit() {
      this.taskFlowData.taskTypeConfig = _.cloneDeep(this.taskFlowData.initTaskTypeConfig);
    }
  },
  mounted() {
    this.$nextTick(async() => {
      const guideStore = await storageGet(TASK_FLOW_SETTING_GUIDE, 0, StorageModuleEnum.Task);
      if (guideStore > 0) return this.$Guide().destroy('task-flow-guide');

      this.$Guide([{
        id: 'task-flow-guide',
        content: '流程节点可被选中，选中后可设置每个节点的业务规则',
        haveStep: true,
        needCover: true,
        direction: 'row',
        outsideParent: true,
        inside: true,
        nowStep: 1,
        domObj: () => {
          return document.getElementById('setting-flow-axis-guide')
        },
        insideDom: () => {
          return document.getElementById('setting-flow-axis-guide').getElementsByClassName('flow-axis-step')[0]
        },
        lastFinish: true
      }, {
        id: 'task-flow-guide',
        content: '可在新建工单节点设置工单表单，本次更新提升了表单控件的能力',
        haveStep: true,
        needCover: true,
        direction: 'row',
        outsideParent: true,
        inside: true,
        nowStep: 2,
        domObj: () => {
          return document.getElementById('setting-flow-main-content-guide').getElementsByClassName('form-design-center')[0]
        },
        lastFinish: true
      },
      //  {
      //   id: 'task-flow-guide',
      //   content: '流程中「通用规则」部分的设置，在所有节点均生效',
      //   haveStep: true,
      //   needCover: true,
      //   direction: 'row',
      //   outsideParent: true,
      //   inside: true,
      //   nowStep: 3,
      //   domObj: () => {
      //     return document.getElementById('setting-flow-main-content-guide').getElementsByClassName('setting-common')[0]
      //   },
      //   insideDom: () => {
      //     return document.getElementById('setting-flow-main-content-guide').getElementsByClassName('setting-common')[0].getElementsByClassName('setting-specific-form')[1]
      //   },
      //   lastFinish: true
      // }, 
      {
        id: 'task-flow-guide',
        content: '在「完成工单」节点设置回执表单',
        haveStep: true,
        needCover: true,
        direction: 'row',
        outsideParent: true,
        inside: true,
        nowStep: 3,
        domObj: () => {
          return document.getElementById('setting-flow-axis-guide')
        },
        insideDom: () => {
          return document.getElementById('setting-flow-axis-guide').getElementsByClassName('flow-axis-step')[4]
        },
        lastFinish: true
      }], 0, '', (e) => {
        return new Promise((resolve, reject) => {
          resolve()
        })
      }).create()
        .then(res_ => { 
          if(res_) storageSet(TASK_FLOW_SETTING_GUIDE, '4', StorageModuleEnum.Task);
        })
    })
  },
  components: {
    [FlowSetting.name]: FlowSetting
  }
}
</script>

<style lang="scss" scoped>
.setting-flow-container{
    width: 100%;
    min-height: calc(100vh - 48px);
    padding: 12px;
    .setting-flow-axis{
        width: 298px;
        min-height: 100%;
        padding: 20px;
        background: #FFFFFF;
        border-radius: 4px;
        .flow-axis-step-box{
          width: 100%;
          .open-btn{
            position: absolute;
            top: 40px;
            right: 0;
          }
          &:not(:last-child){
              .flow-axis-step::after{
                  content: "";
                  position: absolute;
                  left: 50%;
                  bottom: -31px;
                  display: block;
                  transform: translateX(-50%);
                  width: 1px;
                  height: 30px;
                  background: #E6E6E6;
              }
          }
        }
        .flow-axis-step{
            cursor: pointer;
            position: relative;
            width: 188px;
            height: 44px;
            margin-top: 30px;
            padding: 10px;
            line-height: 22px;
            font-size: 14px;
            background: #FFFFFF;
            border-radius: 4px;
            border: 1px solid #D9D9D9;
            i{
                margin-right: 3px;
                color: $color-primary;
            }
            .open-tag{
                width: 52px;
                height: 22px;
                text-align: center;
                color: #67C23A;
                background: #E1F3D8;
                border-radius: 11px;
                border: 1px solid #CFEDC0;
            }
            &.disabled{
                color: #999999;
                background: #F2F2F2;
                border: 1px solid #E6E6E6;
                i{
                    color: #999999;
                }
            }
            &.active{
                background: #E9F9F9;
                border: 1px solid $color-primary;
            }
        }
    }
    
    .setting-flow-main{
        flex: 1;
        width: 100%;
        min-height: 100%;
        padding-left: 12px;
        &-title{
            width: 100%;
            height: 40px;
            line-height: 40px;
            text-align: center;
            font-style: 14px;
            background: #E9F9F9;
        }
        &-content{
            height: calc(100% - 40px);
        }
    }
}
</style>