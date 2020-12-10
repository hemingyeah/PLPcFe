<template>
    <el-row class="flow-setting" type="flex" >
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
                        超时提醒<el-switch class="ml-12"/>
                    </h2>
                    <div>
                        创建工单后超过
                        <el-input class="w-87"/>
                        小时后，标记为超时
                    </div>
                    <div>
                        工单超时后提醒干系人（负责人、协同人、创建人）及
                        <el-select></el-select>
                        超时
                        <el-select class="w-87">
                            <el-option
                                label="前"
                                value="before">
                            </el-option>
                            <el-option
                                label="后"
                                value="after">
                            </el-option>
                        </el-select>
                        <el-input class="w-87">
                            分钟发出提醒
                        </el-input>
                    </div>
                </div>
                <!--E 超时提醒 -->

                <!--S 自动回访 -->
                <div v-if="showReview" class="setting-specific-auto-review">
                    <h2>
                        自动回访
                        <el-switch />
                    </h2>
                    <p>允许自动回访后，工单负责人完成工单后，系统自动向客户发送评价短信，获取客户评价信息</p>
                </div>
                <!--E 自动回访 -->

                <!--S 自动回访短信延迟发送设置 -->
                <div v-if="showReview" class="setting-specific-msg-delay">
                    <h2>自动回访短信延迟发送设置</h2>
                    <div>
                        工单负责人在完成工单后，自动回访短信延迟
                        <el-input class="w-87"></el-input>
                        分钟后发出
                    </div>
                </div>
                <!--E 自动回访短信延迟发送设置 -->

                <!--S 工单自动关闭 -->
                <div v-if="showTaskClose" class="setting-specific-task-close">
                    <h2>
                        工单关闭后限制查看权限
                        <el-switch />
                    </h2>
                    <p>开启后，当工单所有的流程都结束时，将自动关闭工单。</p>
                </div>
                <!--E 工单自动关闭 -->

                <!--S 关闭工单查看权限 -->
                <div v-if="showTaskClose" class="setting-specific-task-view-auth">
                    <h2>
                        工单关闭后限制查看权限
                        <el-switch />
                    </h2>
                    <div>
                        工单关闭后不允许
                        <el-select></el-select>
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
                        <el-switch class="ml-12"/>
                    </h2>
                    <div>
                        在计划时间
                        <el-select class="w-87" v-model="value" placeholder="请选择">
                            <el-option
                            v-for="item in options"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                            </el-option>
                        </el-select>
                        <el-input class="w-87"/>
                        分钟提醒
                    </div>
                    <div>
                        工单负责人、协同人及
                        <el-select v-model="value" placeholder="请选择">
                            <el-option
                            v-for="item in options"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                            </el-option>
                        </el-select>
                    </div>
                </div>
                <div class="setting-specific-form">
                    <h2>
                        允许工单负责人将工单状态设为暂停
                        <el-switch />
                    </h2>
                    <approve-setting />
                </div>
            </div>
        </div>
        <!--E 设置项 -->
    </el-row>
</template>

<script>
import ApproveSetting from './ApproveSetting.vue';
export default {
    name: 'flow-setting',
    props: {
        type: {
            type: String,
            default: 'create'
        }
    },
    data() {
        return {
            radio: '',
            value: '',
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
</style>