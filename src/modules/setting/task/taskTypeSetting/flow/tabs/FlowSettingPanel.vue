<template>
    <el-row type="flex" class="setting-flow-container">
        <!--S 工单流程轴 -->
        <div class="setting-flow-axis">
        <el-row
            class="flow-axis-step"
            :class="[currFlow === key && 'active', (!flowMap[key].isOpen && !flowMap[key].isSystem) && 'disabled']"
            v-for="key in Object.keys(flowMap)"
            :key="key"
            @click.native="clickFlow(key)">
            <el-row type="flex" justify="space-between">
                <div>
                    <i :class="['iconfont', flowMap[key].icon]" :style="{color: key === 'close' && '#F56C6C'}"></i>
                    {{flowMap[key].name}}
                </div>
                <div v-if="flowMap[key].isOpen || flowMap[key].isSystem" class="open-tag">已开启</div>
                <div class="open-btn" @click.stop>
                    <el-switch :value="flowMap[key].isOpen" v-if="!flowMap[key].isSystem" @change="(status) => flowSwitchTaskType(key, status)"/>
                </div>
            </el-row>
        </el-row>
        </div>
        <!--E 工单流程轴 -->
        <!--S 流程设置 -->
        <div class="setting-flow-main">
            <div class="setting-flow-main-title">
                {{flowMap[currFlow].desc}}
            </div>
            <div class="setting-flow-main-content">
                <flow-setting :taskTypeId="taskTypeId"  :type="currFlow" :setting="flowMap[currFlow]" :commonSetting="commonSetting" style="height: 100%"/>
            </div>
        </div>
        <!--E 流程设置 -->
    </el-row>
</template>

<script>
import _ from "lodash";
/** api */
import * as SettingApi from "@src/api/SettingApi";
/** components */
import FlowSetting from '../components/FlowSetting.vue';

import flowMap from "../flowMap";
export default {
    name: 'flow-setting-panel',
    props: {
        taskTypeId: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            currFlow: 'create',  //当前设置的流程
            open: false,

            flowSetting: {},
            flowMap,
            commonSetting: { // 流程公共设置
                planRemindSetting:{ //计划时间提醒设置
                    state: false,
                    isAhead: 1,
                    minutes: '',
                },
                notice: '', // 超时提醒类型
                noticeUsers: '', // 超时提醒指定人员

                allowPause: false, // 允许暂停工单开关
                pauseApprovers: {
                    leader: '',
                    approvers: [],
                    level: 0,
                    multiApproverSetting: [{
                        leader: '',
                        approvers: []
                    }]
                },
                allowCancel: false, // 允许取消工单开关
                cancelApprovers: {
                    leader: '',
                    approvers: [],
                    level: 0,
                    multiApproverSetting: [{
                        leader: '',
                        approvers: []
                    }]
                },
            }
        }
    },
    methods: {
        fetchFlowSetting() {
            // 获取流程设置
            let res = {
                "create":{
                    "state":true,
                    "overTime":0,
                    "approvers":[

                    ]
                },
                "allot":{
                    "state":true,
                    "overTime":0,
                    "approvers":[

                    ],
                    "leader":"promoter"
                }
            }
            this.flowSetting = res;
        },
        /**
         * 启用或禁用工单类型
         */
        flowSwitchTaskType: _.debounce(async function(flowName, status) {
            console.log(flowName, status);
            let params = {
                id: this.taskTypeId,
                flowName,
                status
            }
            try {
                await SettingApi.flowSwitchTaskType(params);
                this.flowMap[flowName].isOpen = status;
            } catch (error) {
                console.error(error);
            }
        }, 300),
        clickFlow(type) {
            this.currFlow = type;
        },
        submit() {
            console.log('flow-setting submit');
        }
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
    padding: 16px 12px 24px 12px;
    background: #F5F5F5;
    .setting-flow-axis{
        width: 298px;
        min-height: 100%;
        padding: 20px;
        background: #FFFFFF;
        border-radius: 4px;
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
            .open-btn{
                position: absolute;
                top: 50%;
                right: -90px;
                transform: translateY(-50%);
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
            &:not(:last-child){
                &::after{
                    content: "";
                    position: absolute;
                    left: 50%;
                    bottom: -30px;
                    display: block;
                    transform: translateX(-50%);
                    width: 1px;
                    height: 30px;
                    background: #E6E6E6;
                }
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