<template>
    <el-card class="task-type" :body-style="{padding: '0px', height: '100%'}" shadow="never">
        <el-row class="task-type-main" type="flex" justify="space-between">
            <el-row type="flex">
                <i class="task-type-color" :style="{'background-color': taskType.config.color}"></i>
                <el-row class="task-type-content" type="flex">
                    <h2 class="task-type-name">
                        {{taskType.name}}
                    </h2>
                    <el-row class="task-type-others">
                        <el-row type="flex">
                            <p>
                                可用团队: 
                                <span class="pointer" @click="chooseTeam">{{taskType.tags | formatTeamName}} </span>
                            </p>
                            <i class="iconfont icon-edit-square pointer" @click="chooseTeam"></i>
                        </el-row>
                        <p>
                            最近更新: {{taskType.updateName}}  {{taskType.createTime}}
                        </p>
                    </el-row>
                </el-row >
            </el-row>
            <el-switch
                :value="taskType.enabled"
                :active-value="1"
                :inactive-value="0"
                @change="switchEnabled"/>
        </el-row>
        <el-row class="task-type-opearte" type="flex">
            <div class="task-type-opearte-del" @click="delTaskType">
                <i class="iconfont icon-delete">删除</i>
            </div>
            <div class="task-type-opearte-modify" @click="modifyTaskType">
                <i class="iconfont icon-edit-square">编辑</i>
            </div>
        </el-row>
        <!-- 选择团队弹窗 -->
        <choose-team-dialog
            :id="taskType.id"
            :visiable.sync="isShowChooseTeamModal"
            :value="taskType.tags"
            @update="updateTeamList"/>
    </el-card>
</template>

<script>
import _ from "lodash";
/** api */
import * as SettingApi from "@src/api/SettingApi";

/** component */
import ChooseTeamDialog from '../components/ChooseTeamDialog.vue';

export default {
    name: 'task-type-item',
    props: {
        taskType: {
            type: Object,
            default: () => {}
        },
        typeNum: {   // 已经开启的数量
            type: Number,
            default: 0
        },
        maxTypeNum: {
            type: Number,
            default: 0
        },
    },
    data() {
        return {
            isShowChooseTeamModal: false  // 选择可用团队弹窗
        }
    },
    filters: {
        formatTeamName(tagIds) {
            return tagIds.length === 0 ? '全部团队' : tagIds.join(',');
        }
    },
    methods: {
        switchEnabled: _.throttle(function(value) {
            if(value === 1 && this.typeNum >= this.maxTypeNum) {
                return this.$message.warning(`最多只能同时存在${this.maxTypeNum}种工单类型`);
            }

            if(value === 0 && this.typeNum <= 1) {
                return this.$message.warning(`无法禁用全部工单类型`);
            }

            let params = {
                id: this.taskType.id,
                enabled: value
            }
            SettingApi.taskTypeEnable(params).then(res => {
                this.taskType.enabled = value;
            }).catch(err => {
                console.log("taskType enabled => err", err);
            });
        }, 300),
        chooseTeam() {
            this.isShowChooseTeamModal = true;
        },
        delTaskType() {
            if(this.typeNum <= 1) {
                return this.$message.warning(`无法删除全部工单类型`);
            }
            this.$confirm('确认删除该工单类型？删除后将无法恢复', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'error',
            }).then(() => {
                let params = {
                    typeId: this.taskType.id
                }

                SettingApi.delTaskType(params).then(res => {
                    this.$platform.notification({
                        title: "删除成功",
                        type: "success",
                    });
                    this.$emit("update");
                }).catch(err => {
                    console.log("delete taskType => err", err);
                });
            });
        },
        modifyTaskType() {
            // 修改工单类型
            let taskTypeId = this.taskType.id;
            this.$platform.openTab({
                id: "task_flow_setting",
                title: "工单流程设置",
                url: `/setting/task/taskFormSet?type=eidt&taskTypeId=${taskTypeId}`,
                reload: true,
            });
        },
        /**
         * 更新taskType
         */
        updateTaskType(obj) {
            this.$emit('updateAttr', obj);
        },
        /**
         * 更新可用团队
         */
        updateTeamList(teamList){
            this.updateTaskType({
                tags: teamList
            });
        }
    },
    components: {
        [ChooseTeamDialog.name]: ChooseTeamDialog,
    }
}
</script>

<style lang="scss" scoped>
.task-type{
    cursor: move;
    width: 358px;
    height: 159px;
    background: #FFFFFF;
    border-radius: 4px;
    box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.04);   
    &:hover{
        box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.12);
    }
    .task-type-main{
        display: flex;
        height: calc(100% - 32px);
        padding: 20px;
        .task-type-color{
            display: block;
            width: 14px;
            min-width: 14px;
            height: 14px;
            line-height: 22px;
            margin: 2px 5px 0 0;
            border-radius: 50%;
        }
        .task-type-content{
            flex-direction: column;
            justify-content: space-between;
            height: 100%;
            .task-type-name{
                margin-bottom: 0;
                @include text-ellipsis-2;
                word-break: break-all;
                padding-right: 32px;
                font-size: 16px;
                color: #333333;
                line-height: 22px;
            }
            .task-type-others{
                i{
                    font-size: 12px;
                    &:hover{
                        color: $color-primary;
                    }
                }
                p{
                    margin-bottom: 6px;
                    font-size: 12px;
                    @include text-ellipsis-2;
                    word-break: break-all;
                    color: #666666;
                    &:last-child{
                        margin-bottom: 0;
                    }
                }
            }
        }
    }
    .task-type-opearte{
        height: 32px;
        border-top: 1px solid#F5F5F5;
        & > div {
            cursor: pointer;
            flex: 1;
            text-align: center;
            line-height: 32px;
            color: #999999;
            i{
                font-size: 12px;
                &::before{
                    margin-right: 8px;
                }
            }
        }
        .task-type-opearte-del{
           border-right: 1px solid#F5F5F5; 
            &:hover{
                color: $color-danger;
            }
        }
        .task-type-opearte-modify{
            &:hover{
                color: $color-primary;
            }
        }
    }
}

.pointer{
    cursor: pointer;
}
</style>