<template>
    <el-card class="task-card" :body-style="{padding: '0px', height: '100%'}" shadow="hover">
        <el-row class="task-card-main" type="flex" justify="space-between">
            <el-row type="flex">
                <el-row class="task-card-content" type="flex">
                    <h2 class="task-card-name">
                        {{taskCard.name}}
                    </h2>
                    <el-row class="task-card-others">
                        <p>
                            使用规则： 
                            <span class="pointer" v-if="taskCard.notNullFlow || (taskCard.stateCanEdit && taskCard.stateCanEdit.length>0)">已设置 </span>
                            <span class="pointer" v-else>未设置 </span>
                            <i class="iconfont icon-bianji1 pointer" @click="onSetRules"></i>
                        </p>
                        <p @click="onSetRules">
                            使用权限：
                            <span class="pointer see-role">查看角色权限 </span>
                            <i class="iconfont icon-bianji1 pointer"></i>
                        </p>
                        <p>
                            添加次数: <span v-if="taskCard.inputType == 'single'">单次</span> <span v-if="taskCard.inputType == 'multiple'">多次</span>
                        </p>
                    </el-row>
                </el-row >
            </el-row>
            <i class="iconfont icon-tuozhuaipaixu drag-icon"></i>
        </el-row>
        <el-row class="task-card-opearte" type="flex">
            <div class="task-card-opearte-del" @click="delTaskCard">
                <i class="iconfont icon-shanchu-copy"> 删除</i>
            </div>
        </el-row>
        <!-- start 设置使用规则 -->
        <use-rules-dialog
            :id="taskCard.id"
            :visiable.sync="isShowRulesModal"
            @update="updateTeamList"/>
        <!-- end 设置使用规则 -->
    </el-card>
</template>

<script>
import _ from "lodash";
/** api */
import * as SettingTaskApi from "@src/api/SettingTaskApi";

/** component */
import UseRulesDialog from '../components/TaskCard/UseRulesDialog.vue';

export default {
    name: 'task-card-item',
    props: {
        taskCard: {
            type: Object,
            default: () => {}
        },
        taskTypeId: {
            type: String,
        }
    },
    data() {
        return {
            isShowRulesModal: false  // 选择可用团队弹窗
        }
    },
    methods: {
        //删除组件
        delTaskCard() {
            this.$confirm('确认删除该组件？删除后将无法恢复', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }).then(() => {
                const params = {
                    typeId: this.taskTypeId,
                    cardId: this.taskCard.id
                }
                SettingTaskApi.deleteTaskCard(params).then(res=>{
                    const { status, message, data } = res;
                    if(status == 0){
                        this.$message.success('删除成功');
                        this.$emit('deleteCard')
                        
                    }else{
                        this.$message.error(message);
                    }
                }).catch(error=>{
                    console.log(error)
                })
            });
        },
        //设置使用规则
        onSetRules() {
            this.isShowRulesModal = true;
        },
        /**
         * 更新taskCard
         */
        updatetaskCard(obj) {
            this.$emit('updateAttr', obj);
        },
        /**
         * 更新可用团队
         */
        updateTeamList(teamList){
            this.updatetaskCard({
                tags: teamList
            });
        }
    },
    components: {
        [UseRulesDialog.name]: UseRulesDialog,
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
        .drag-icon{
            font-size: 12px;
            display: none;
        }

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
                i{
                    font-size: 12px;
                    &:hover{
                        color: $color-primary;
                    }
                }
                p{
                    margin-bottom: 4px;
                    font-size: 12px;
                    color: #666666;
                    &:last-child{
                        margin-bottom: 0;
                        margin-top: 4px;
                    }
                    .see-role{
                        color: $color-primary;
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
        }
        .task-card-opearte-del{
           border-right: 1px solid#F5F5F5; 
            &:hover{
                color: $color-danger;
            }
        }
        .task-card-opearte-modify{
            &:hover{
                color: $color-primary;
            }
        }
    }
    &:hover{
        .drag-icon{
            display: block;
        }
    }
}

.pointer{
    cursor: pointer;
}
</style>