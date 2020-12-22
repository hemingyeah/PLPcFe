<template>
    <el-form class="flow-setting">
        <!--S 预览组件 -->
        <div v-if="showFormBuilder" class="flow-setting-left">
            <form-preview :fields="fields">
                <el-button type="primary" class="form-preview-btn" @click="openFormDesign">
                    表单设置
                </el-button>
            </form-preview>
        </div>
        <!--E 预览组件 -->

        <!--S 设置项 -->
        <div class="flow-setting-right">
            <div class="setting-specific">
                <!--S 工单表单设置 -->
                <div v-if="showFormBuilder" class="setting-specific-form">
                    <h2>工单表单设置</h2>
                    <p @click="openFormDesign">工单{{type === 'create' ? '新建' : '回执'}}表单设置</p>
                </div>
                <!--E 工单表单设置 -->

                <!--S 审批设置 -->
                <div class="setting-specific-approve">
                    <h2>
                        审批设置
                        <el-switch class="ml-12"/>
                    </h2>
                    <approve-setting :options="approveOptions" :approveSetting="approveSetting" @update="updateApproveUser"/>
                </div>
                <!--E 审批设置 -->

                <!--S 转派时也审批-->
                <h2 v-if="type === 'allot'">
                    转派时也审批
                    <el-switch />
                </h2>
                <!--E 转派时也审批-->

                <!--S 超时提醒 -->
                <div v-if="showOvertime" class="setting-specific-overtime">
                    <h2>
                        超时提醒<el-switch class="ml-12" v-model="setting.overTimeSetting.state"/>
                    </h2>
                    <div>
                        {{setting.name}}后超过
                        <el-input class="w-87" onkeyup="if(isNaN(value))execCommand('undo')" v-model="setting.overTimeSetting.hours"/>
                        小时后，标记为超时
                    </div>
                    <div>
                        <span>工单超时后提醒干系人（负责人、协同人、创建人）及</span>
                        <el-select v-model="setting.overTimeSetting.overTimeRemindType">
                            <el-option
                                v-for="item in options"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value">
                            </el-option>
                        </el-select>
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
                        <el-input class="w-87" onkeyup="this.value=this.value.replace(/\D/g,'')" v-model="setting.overTimeSetting.minutes">
                        </el-input>
                        分钟发出提醒
                    </div>
                </div>
                <!--E 超时提醒 -->

                <!--S 自动回访 -->
                <div v-if="showReview" class="setting-specific-auto-review">
                    <h2>
                        自动回访
                        <el-switch v-model="setting.autoReview"/>
                    </h2>
                    <p>允许自动回访后，工单负责人完成工单后，系统自动向客户发送评价短信，获取客户评价信息</p>
                </div>
                <!--E 自动回访 -->

                <!--S 自动回访短信延迟发送设置 -->
                <div v-if="showReview" class="setting-specific-msg-delay">
                    <h2>
                        自动回访短信延迟发送设置
                        <el-switch v-model="setting.delayBack"/>
                    </h2>
                    <div>
                        工单负责人在完成工单后，自动回访短信延迟
                        <el-input class="w-87" onkeyup="this.value=this.value.replace(/\D/g,'')" v-model="setting.delayBackMin"></el-input>
                        分钟后发出
                    </div>
                </div>
                <!--E 自动回访短信延迟发送设置 -->

                <!--S 工单自动关闭 -->
                <div v-if="showTaskClose" class="setting-specific-task-close">
                    <h2>
                        工单自动关闭设置
                        <el-switch v-model="setting.autoClose"/>
                    </h2>
                    <p>开启后，当工单所有的流程都结束时，将自动关闭工单。</p>
                </div>
                <!--E 工单自动关闭 -->

                <!--S 关闭工单查看权限 -->
                <div v-if="showTaskClose" class="setting-specific-task-view-auth">
                    <h2>
                        工单关闭后限制查看权限
                        <el-switch v-model="setting.closeView"/>
                    </h2>
                    <div>
                        工单关闭后不允许
                        <el-select v-model="setting.closeNoViewAuth"></el-select>
                        <el-button type="text">查看</el-button>
                    </div>
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
                        <el-input class="w-87" onkeyup="this.value=this.value.replace(/\D/g,'')" v-model="commonSetting.planRemindSetting.minutes"/>
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
                        <el-input v-if="commonSetting.notice === null" placeholder="请选择审批人" readonly @click.native="selectApproveUser"/>
                    </div>
                </div>
                <div class="setting-specific-form">
                    <h2>
                        允许工单负责人将工单状态设为暂停
                        <el-switch v-model="commonSetting.allowPause"/>
                    </h2>
                    <approve-setting :options="stableOptions" />
                </div>
                <div class="setting-specific-form">
                    <h2>
                        允许工单在完成前被取消
                        <el-switch v-model="commonSetting.allowCancel"/>
                    </h2>
                    <approve-setting :options="stableOptions"/>
                </div>
            </div>
        </div>
        <!--E 设置项 -->

        <!-- 表单设置弹窗 -->
        <task-form-setting-view ref="taskFormSetting" :template-id="taskTypeId" @success="refreshFields"></task-form-setting-view>
        
    </el-form>
</template>

<script>
import {
  getProductFields
} from '@src/api/ProductApi'

// components
import ApproveSetting from './ApproveSetting.vue';
import TaskFormView from '@src/modules/setting/task/taskFormSetting/taskFormView/TaskFormView.vue';

export default {
    name: 'flow-setting',
    props: {
        taskTypeId: {
            type: String,
            default: ''
        },
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
            fields: [],

            options: [{
                value: 0,
                label: '无需通知其他人'
            }, {
                value: 1,
                label: '通知负责人团队主管'
            }, {
                value: null,
                label: '指定人员'
            }],

            approveSetting: {}, // 流程审批设置

            formList: [], // 表单人员
            receiptList: [] // 回执表单人员
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
        showTaskClose() { // 展示工单关闭 (mark_zr: 这次不做)
            return false && ['close'].includes(this.type);
        },
        approveOptions() { // 审批选项
            let type = this.type;
            let options = [{
                value: 'none',
                label: '无需审批'
            }, {
                value: 'leader',
                label: '发起人主管'
            }, {
                value: 'users',
                label: '指定人员'
            }, {
                value: 'createUser',
                label: '工单创建人'
            }, {
                value: 'userAdmin',
                label: '客户负责人'
            }, {
                value: 'promoter',
                label: '由发起人选择'
            }];

            switch(type) {
                case 'create':
                case 'start':
                case 'finish':
                case 'allot':
                    break;
                default:
                    options.splice(3, 0, {
                        value: 'allotUser',
                        label: '工单派单人'
                    });
                    options = [
                        ...options,
                        ...this.formList.map(item => {
                            return {
                                label: item.showName,
                                value: item.stateTemplateId
                            }
                        }),
                        ...this.receiptList.map(item => {
                            return {
                                label: item.showName,
                                value: item.stateTemplateId
                            }
                        })
                    ];
                    break;
            }

            return options;
        },
        stableOptions() { // 暂停/取消工单的审批选项
            return [{
                value: 'none',
                label: '无需审批'
            }, {
                value: 'leader',
                label: '发起人主管'
            }, {
                value: 'users',
                label: '指定人员'
            }, {
                value: 'createUser',
                label: '工单创建人'
            }, {
                value: 'allotUser',
                label: '工单派单人'
            }, {
                value: 'userAdmin',
                label: '客户负责人'
            }, {
                value: 'promoter',
                label: '由发起人选择'
            }];
        }
    },
    methods: {
        /**
         * 更新审批设置
         */
        updateApproveUser(users) {
            this.$set(this.approveSetting, 'users', users);
        },
        /**
         * 打开表单编辑器
         */
        openFormDesign() {
            this.$refs.taskFormSetting.open();
        },
        selectApproveUser() {
            let options = {
                title: '选择审批人',//[选填] 默认值为 '请选择人员'
                max:14, //[选填]最大人数：当值小于等于0或者不填时，不对选择人数做限制，max值为1时单选，大于1时多选
                selected: this.commonSetting.noticeUsers //[选填] 已选人员 每个人员必须包括userId,displayName,staffId,head这四个属性，只有带max大于1时生效
            };

            this.$fast.contact.choose('dept', options)
                .then(res => {
                    if(res.status != 0) return;
                    console.log(res);
                    // this.$emit('update',res.data.users);
                })
                .catch(err => {
                    console.warn(err)
                })
        },
        refreshFields(mode) {
            console.log(mode)
        }
    },
    async mounted() {
        try {
            // 获取产品自定义字段
            let res = await getProductFields({isFromSetting: false});
            this.fields = res.data || [];
        } catch (error) {
            console.error('customer-product-table fetch product fields error',error);
        }
    },
    components: {
        [ApproveSetting.name]: ApproveSetting,
        [TaskFormView.name]: TaskFormView
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
        .form-preview-btn{
            position: absolute;
            bottom: 50px;
            left: 22px;
            width: calc(100% - 50px);
        }
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
            p{
                margin-bottom: 0;
            }
            &-form{
                p{
                    cursor: pointer;
                    color: #666666;
                    &:hover{
                        color: $color-primary;
                    }
                }
            }
            &-overtime{
                line-height: 32px;
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
.div{
    margin-bottom: 8px;
}
</style>