<template>
    <el-card class="task-type" :body-style="{padding: '0px', height: '100%'}" shadow="hover">
        <el-row class="task-type-main" type="flex" justify="space-between">
            <el-row type="flex">
                <i class="task-type-color"></i>
                <el-row class="task-type-content" type="flex">
                    <h2 class="task-type-name">
                        {{value.typeName}}
                    </h2>
                    <el-row class="task-type-others">
                        <p>
                            可用团队: 
                            <span class="pointer" @click="chooseTeam">{{value.teams}} </span>
                            <i class="icon-ziyuan iconfont pointer" @click="chooseTeam"></i>
                        </p>
                        <p>
                            最近更新: {{value.updateName}}  {{value.updateDate}}
                        </p>
                    </el-row>
                </el-row >
            </el-row>
            <el-switch v-model="value.open" />
        </el-row>
        <el-row class="task-type-opearte" type="flex">
            <div class="task-type-opearte-del" @click="delTaskType">
                <i class="icon-ziyuan iconfont">删除</i>
            </div>
            <div class="task-type-opearte-modify" @click="modifyTaskType">
                <i class="icon-ziyuan iconfont">编辑</i>
            </div>
        </el-row>
        <!-- 选择团队弹窗 -->
        <choose-team-dialog
            :visable.sync="isShowChooseTeamModal"
            :value="value.teamList"
            @update="updateTeamList"/>
    </el-card>
</template>

<script>
import ChooseTeamDialog from '../components/ChooseTeamDialog.vue';

export default {
    name: 'task-type-item',
    props: {
        value: Object,
        default: () => {}
    },
    data() {
        return {
            isShowChooseTeamModal: false  // 选择可用团队弹窗
        }
    },
    methods: {
        chooseTeam() {
            this.isShowChooseTeamModal = true;
        },
        delTaskType() {
            this.$confirm('确认删除该工单类型？删除后将无法恢复', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'error',
            }).then(() => {
                // todo_zr
                this.$platform.notification({
                    title: "删除成功",
                    type: "success",
                });
            });
        },
        modifyTaskType() {
            // 修改工单类型
            let taskTypeId = this.value.id;
            this.$platform.openTab({
                id: "task_flow_setting",
                title: "工单流程设置",
                url: `/setting/task/taskFormSet?taskTypeId=${taskTypeId}`,
                reload: true,
            });
        },
        updateTeamList(teamList){
            console.log(teamList);
            this.$emit('update:value', {
                ...this.value,
                teamList
            })
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
            background: #FFAE00;
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
                p{
                    margin-bottom: 6px;
                    font-size: 12px;
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
            }
            &:hover{
                background-color: #F5F5F5;
            }
        }
        .task-type-opearte-del{
           border-right: 1px solid#F5F5F5; 
        }
    }
}

.pointer{
    cursor: pointer;
}
</style>