<template>
    <el-card class="task-card" :body-style="{padding: '0px', height: '100%'}" shadow="hover">
        <el-row class="task-card-main" type="flex" justify="space-between">
            <el-row type="flex">
                <el-row class="task-card-content" type="flex">
                    <h2 class="task-card-name">{{value.typeName}}</h2>
                    <p class="">发货记录的说明文案发货记录的说明文案发货记</p>
                    <el-row class="task-card-others">
                        <p>已应用范围：<span class="pointer" @click="chooseTeam">{{value.teams}} </span></p>
                        <div>
                            最近更新: {{value.updateName}}  {{value.updateDate}}
                        </div>
                    </el-row>
                </el-row >
            </el-row>
            <el-switch v-model="value.open" />
        </el-row>
        <el-row class="task-card-opearte" type="flex">
            <div class="task-card-opearte-del" @click="delTaskType">
                <i class="icon-ziyuan iconfont">更多操作</i>
            </div>
            <div class="task-card-opearte-modify" @click="modifyTaskType">
                <i class="icon-ziyuan iconfont">编辑</i>
            </div>
        </el-row>
    </el-card>
</template>

<script>
export default {
    name: 'task-card-item',
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
    }
}
</script>

<style lang="scss" scoped>
.task-card{
    cursor: move;
    width: 358px;
    height: 159px;
    background: #FFFFFF;
    border-radius: 4px;
    .task-card-main{
        display: flex;
        height: calc(100% - 32px);
        padding: 20px;
        .task-card-content{
            flex-direction: column;
            justify-content: space-between;
            height: 100%;
            .task-card-name{
                margin-bottom: 0;
                @include text-ellipsis-2;
                word-break: break-all;
                padding-right: 32px;
                font-size: 16px;
                color: #333333;
                line-height: 22px;
            }
            .task-card-others{
                p{
                    margin-bottom: 6px;
                    font-size: 12px;
                    color: #666666;
                    span{
                        color: $color-primary;
                    }
                    &:last-child{
                        margin-bottom: 0;
                    }
                }
            }
        }
    }
    .task-card-opearte{
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
        .task-card-opearte-del{
           border-right: 1px solid#F5F5F5; 
        }
    }
}

.pointer{
    cursor: pointer;
}
</style>