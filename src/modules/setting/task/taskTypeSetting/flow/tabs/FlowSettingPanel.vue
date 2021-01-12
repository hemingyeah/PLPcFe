<template>
    <el-row type="flex" class="setting-flow-container">
        <!--S 工单流程轴 -->
        <div class="setting-flow-axis">
        <el-row
            class="flow-axis-step"
            :class="[currFlow === key && 'active', (!taskFlowData.taskTypeConfig.flowSetting[key].state && !flowMap[key].isSystem) && 'disabled']"
            v-for="key in Object.keys(flowMap)"
            :key="key"
            @click.native="clickFlow(key)">
            <el-row type="flex" justify="space-between">
                <div>
                    <i :class="['iconfont', flowMap[key].icon]" :style="{color: key === 'close' && '#F56C6C'}"></i>
                    {{flowMap[key].name}}
                </div>
                <div v-if="taskFlowData.taskTypeConfig.flowSetting[key].state || flowMap[key].isSystem" class="open-tag">已开启</div>
                <div class="open-btn" @click.stop>
                    <el-switch v-model="taskFlowData.taskTypeConfig.flowSetting[key].state" v-if="!flowMap[key].isSystem"/>
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
                <flow-setting
                    :taskTypeId="taskTypeId"
                    :type="currFlow"
                    :flowSetting="taskFlowData.taskTypeConfig.flowSetting[currFlow]"
                    :taskTypeConfig="taskFlowData.taskTypeConfig"
                    style="height: 100%"/>
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
    inject: ['taskFlowData'],
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

            flowMap,
        }
    },
    methods: {
        clickFlow(type) {
            this.currFlow = type;
        },
        /**
         * 审批设置转化成参数
         */
        formatApproveSetting(setting) {
            if(setting === undefined) return {};
            let approveSetting = _.cloneDeep(setting);
            if(approveSetting.level < 2) {
                delete approveSetting.multiApproverSetting;
            }
            if(approveSetting.level === 0) {
                approveSetting.leader = 'none';
            }

            // 发起人选择
            if(approveSetting.leader === 'promoter') {
                approveSetting.approvers = [];
                approveSetting.displayName = '';
                approveSetting.taskTemplateId = '';
            }

            // leader审批类型为表单人员
            if(approveSetting.leader && !approveSetting.leader.indexOf('formUser') > -1){
                approveSetting.approvers = [];
            }else{
                approveSetting.taskTemplateId = '';
            }

            // 递归:格式化多级审批
            if(Array.isArray(approveSetting.multiApproverSetting)) {
                approveSetting.multiApproverSetting = approveSetting.multiApproverSetting.map(item => this.formatApproveSetting(item));
            }

            if(typeof approveSetting.leader === 'undefined') approveSetting.leader = '';

            return approveSetting;
        },
        /** 将数据转化成保存需要的数据结构 */
        convertDataToParams() {
            let taskTypeConfig = _.cloneDeep(this.taskFlowData.taskTypeConfig);
            let {id,flowSetting, delayBack, delayBackMin, allowPause, pauseApproveSetting,
                planRemindSetting,noticeLeader, noticeUsers,cancelApproveSetting,
                 autoReviewState, taskOverTimeModels } = taskTypeConfig;
            Object.keys(flowSetting).map(key => {
                let {state, overTime, approveSetting, reallotAppr} = flowSetting[key];
                flowSetting[key] = {
                    state,
                    overTime,
                    ...this.formatApproveSetting(approveSetting)
                }

                if(key === 'allot') {
                    flowSetting[key].reallotAppr =  reallotAppr !== 'none';
                }

                if(key === 'off') {
                    flowSetting[key] = {
                        ...flowSetting[key],
                        ...this.formatApproveSetting(cancelApproveSetting),
                        state: taskTypeConfig.allowCancel
                    }
                }
            });
            flowSetting.pause = {
                state: allowPause,
                ...this.formatApproveSetting(pauseApproveSetting)
            }
            delete flowSetting.autoReview;
            let params = {
                typeId: id,
                flowSetting,
                delayBack,
                delayBackMin,
                state: planRemindSetting.state,
                minutes: Number(planRemindSetting.minutes),
                minutesType: planRemindSetting.minutesType,
                planningTimeState: 'notice',
                planningTimeMes: noticeLeader ? ['none','leader','users'][Number(noticeLeader)] : 'none',
                usersIds: noticeUsers.map(item => item.userId).join(','),
                taskOverTimeModels: taskOverTimeModels.map(item => {
                    item.reminders = item.reminders || [];
                    item.ids = item.reminders.map(item => item.userId).join(',');
                    return item;
                }),
                autoReviewState
            };
            return params;
        },
        /** 保存流程设置 */
        async submit() {
            try {
                let params = this.convertDataToParams();
                let res = await SettingApi.saveProcess(params);
                if(res.status == 1) {
                    return this.$notify.error(res.message);
                }else {
                    this.$notify.success('保存成功');
                }
            } catch (error) {
                console.error('sumbit saveProcess => error', error);
            }
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