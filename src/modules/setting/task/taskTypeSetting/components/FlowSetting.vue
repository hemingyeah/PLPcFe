<template>
    <el-form class="flow-setting">
        <!--S 预览组件 -->
        <div v-if="showFormBuilder" class="flow-setting-left"></div>
        <!--E 预览组件 -->

        <!--S 设置项 -->
        <div class="flow-setting-right">
            <div class="setting-specific">
                <!--S 工单表单设置 -->
                <div v-if="showFormBuilder" class="setting-specific-form">
                    <h2>工单表单设置</h2>
                    <p>工单新建表单设置</p>
                </div>
                <!--E 工单表单设置 -->

                <!--S 审批设置 -->
                <div class="setting-specific-approve">
                    <h2>
                        审批设置<el-switch class="ml-12"/>
                    </h2>
                    <approve-setting />
                </div>
                <!--E 审批设置 -->

                <!--S 超时提醒 -->
                <div v-if="showOvertime" class="setting-specific-overtime">
                    <h2>
                        超时提醒<el-switch class="ml-12" v-model="setting.overTimeSetting.state"/>
                    </h2>
                    <el-form-item prop="overTime">
                        创建工单后超过
                        <el-input class="w-87" v-model="setting.overTimeSetting.hours"/>
                        小时后，标记为超时
                    </el-form-item>
                    <div>
                        工单超时后提醒干系人（负责人、协同人、创建人）及
                        <el-form-item prop="overTimeRemindType" class="inline-block">
                            <el-select v-model="setting.overTimeSetting.overTimeRemindType"></el-select>
                        </el-form-item>
                        超时
                        <el-select class="w-87" v-model="setting.overTimeSetting.isAhead">
                            <el-option
                                label="前"
                                :value="1">
                            </el-option>
                            <el-option
                                label="后"
                                :value="0">
                            </el-option>
                        </el-select>
                        <el-form-item prop="minutes" class="inline-block">
                            <el-input class="w-87" v-model="setting.overTimeSetting.minutes">
                            </el-input>
                        </el-form-item>
                        分钟发出提醒
                    </div>
                </div>
                <!--E 超时提醒 -->

                <!--S 自动回访 -->
                <el-form-item v-if="showReview" class="setting-specific-auto-review">
                    <h2>
                        自动回访
                        <el-switch v-model="setting.autoReview"/>
                    </h2>
                    <p>允许自动回访后，工单负责人完成工单后，系统自动向客户发送评价短信，获取客户评价信息</p>
                </el-form-item>
                <!--E 自动回访 -->

                <!--S 自动回访短信延迟发送设置 -->
                <div v-if="showReview" class="setting-specific-msg-delay">
                    <h2>
                        自动回访短信延迟发送设置
                        <el-form-item prop="delayBack">
                            <el-switch v-model="setting.delayBack"/>
                        </el-form-item>
                    </h2>
                    <el-form-item prop="delayBackMin">
                        工单负责人在完成工单后，自动回访短信延迟
                        <el-input class="w-87" v-model="setting.delayBackMin"></el-input>
                        分钟后发出
                    </el-form-item>
                </div>
                <!--E 自动回访短信延迟发送设置 -->

                <!--S 工单自动关闭 -->
                <el-form-item v-if="showTaskClose" class="setting-specific-task-close" prop="autoClose">
                    <h2>
                        工单自动关闭设置
                        <el-form-item prop="autoClose">
                            <el-switch v-model="setting.autoClose"/>
                        </el-form-item>
                    </h2>
                    <p>开启后，当工单所有的流程都结束时，将自动关闭工单。</p>
                </el-form-item>
                <!--E 工单自动关闭 -->

                <!--S 关闭工单查看权限 -->
                <div v-if="showTaskClose" class="setting-specific-task-view-auth">
                    <h2>
                        工单关闭后限制查看权限
                        <el-form-item prop="closeView">
                            <el-switch v-model="setting.closeView"/>
                        </el-form-item>
                    </h2>
                    <el-form-item prop="closeViewAuth">
                        工单关闭后不允许
                        <el-select v-model="setting.closeNoViewAuth"></el-select>
                        <el-button type="text">查看</el-button>
                    </el-form-item>
                </div>
                <!--E 关闭工单查看权限 -->
            </div>

            <!-- 公共设置 -->
            <div class="setting-common">
                <div class="setting-specific-form">
                    <h2>
                        计划时间提醒
                        <el-switch class="ml-12" v-model="commonSetting.planRemindSetting.state" />
                    </h2>
                    <div class="mb-8">
                        在计划时间
                        <el-select class="w-87" v-model="commonSetting.planRemindSetting.isAhead" placeholder="请选择">
                            <el-option
                                label="前"
                                :value="1">
                            </el-option>
                            <el-option
                                label="后"
                                :value="0">
                            </el-option>
                        </el-select>
                        <el-input class="w-87" v-model="commonSetting.planRemindSetting.minutes"/>
                        分钟提醒
                    </div>
                    <div>
                        工单负责人、协同人及
                        <el-select v-model="commonSetting.notice" placeholder="请选择">
                            <el-option
                                v-for="item in options"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value">
                            </el-option>
                        </el-select>
                        <!-- todo_zr: 选择指定人员 -->
                    </div>
                </div>
                <div class="setting-specific-form">
                    <h2>
                        允许工单负责人将工单状态设为暂停
                        <el-switch v-model="commonSetting.allowPause"/>
                    </h2>
                    <approve-setting />
                </div>
                <div class="setting-specific-form">
                    <h2>
                        允许工单在完成前被取消
                        <el-switch v-model="commonSetting.allowCancel"/>
                    </h2>
                    <approve-setting />
                </div>
            </div>
        </div>
        <!--E 设置项 -->
    </el-form>
</template>

<script>
// components
import ApproveSetting from './ApproveSetting.vue';

export default {
    name: 'flow-setting',
    props: {
        type: {
            type: String,
            default: 'create'
        },
        setting: {
            type: Object,
            default: () => {}
        },
        commonSetting: {
            type: Object,
            default: () => {}
        }
    },
    watch: {
        value() {
        }
    },
    data() {
        return {
            options: [{
                value: '选项1',
                label: '黄金糕'
            }, {
                value: '选项2',
                label: '双皮奶'
            }]
        }
    },
    computed: {
        showFormBuilder() { // 展示表单组件
            return ['create','finish'].includes(this.type);
        },
        showApporeve() { // 展示审批
            return true;
        },
        showOvertime() { // 展示超时提醒
            return !['create','cost','review','close'].includes(this.type);
        },
        showReview() { // 展示自动回访
            return ['review'].includes(this.type);
        },
        showTaskClose() { // 展示工单关闭
            return ['close'].includes(this.type);
        },
    },
    components: {
        [ApproveSetting.name]: ApproveSetting
    }
}
</script>

<style lang="scss" scoped>
.flow-setting{
    display: flex;
    .flow-setting-left{
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        background: #FFFFFF;
        margin-right: 12px;
        border-radius: 4px;
    }
    .flow-setting-right{
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow: auto;
        .setting-specific{
            font-size: 14px;
            padding: 8px 20px 20px 20px;
            background: #FFFFFF;
            color: #999999;
            border-radius: 4px;
            h2{
                color: #333333;
                font-size: 16px;
                margin: 12px 0;
            }
        }

        .setting-common{
            flex: 1;
            margin-top: 12px;
            font-size: 14px;
            background: #FFFFFF;
            padding: 8px 20px 20px 20px;
            border-radius: 4px;
            color: #999999;
            h2{
                color: #333333;
                font-size: 16px;
                margin: 12px 0;
            }
        }
    }
}

.w-87{
    width: 87px;
}
.ml-12{
  margin-left: 12px;
}

.mb-8 {
    margin-bottom: 8px;
}

.inline-block{
    display: inline-block;
}

/** element style */
.el-form-item{
    margin-bottom: 8px;
}
</style>