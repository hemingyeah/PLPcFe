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
                            <span class="pointer" @click="chooseTeam">已设置 </span>
                            <i class="iconfont icon-bianji1 pointer" @click="chooseTeam"></i>
                        </p>
                        <p @click="chooseTeam">
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
            <div class="task-card-opearte-del" @click="deltaskCard">
                <i class="iconfont icon-shanchu-copy"> 删除</i>
            </div>
        </el-row>
        <!-- 选择团队弹窗 -->
        <choose-team-dialog
            :id="taskCard.id"
            :visiable.sync="isShowChooseTeamModal"
            :value="taskCard.tags"
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
    name: 'task-card-item',
    props: {
        taskCard: {
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
            // return tagIds.length === 0 ? '全部团队' : tagIds[0];
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
                id: this.taskCard.id,
                enabled: value
            }
            SettingApi.taskCardEnable(params).then(res => {
                this.taskCard.enabled = value;
            }).catch(err => {
                console.log("taskCard enabled => err", err);
            });
        }, 300),
        chooseTeam() {
            this.isShowChooseTeamModal = true;
        },
        deltaskCard() {
            if(this.typeNum <= 1) {
                return this.$message.warning(`无法删除全部工单类型`);
            }
            this.$confirm('确认删除该工单类型？删除后将无法恢复', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'error',
            }).then(() => {
                let params = {
                    typeId: this.taskCard.id
                }

                SettingApi.deltaskCard(params).then(res => {
                    this.$platform.notification({
                        title: "删除成功",
                        type: "success",
                    });
                    this.$emit("update");
                }).catch(err => {
                    console.log("delete taskCard => err", err);
                });
            });
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
        [ChooseTeamDialog.name]: ChooseTeamDialog,
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