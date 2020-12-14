<template>
    <el-card class="task-card" :body-style="{padding: '0px', height: '100%'}" shadow="hover">
        <el-row class="task-card-main" type="flex" justify="space-between">
            <el-row type="flex">
                <el-row class="task-card-content" type="flex">
                    <div class="task-card-inforn"> 
                        <h2 class="task-card-name"><el-tooltip class="item" effect="dark" :content="cardData.name" :disabled="cardData.name.length<13" placement="top-start"><span>{{cardData.name}}</span></el-tooltip></h2>                                       
                        <p class="task-card-des">{{cardData.description}}</p>
                    </div>
                    
                    <el-row class="task-card-others">
                        <div class="task-card-scope">
                            <p>已应用范围：</p>
                             <template v-if="cardData.range.length>1">
                                <el-dropdown placement="top" @command="modifyTaskType">
                                    <span class="pointer">{{cardData.range[0].name}}等{{cardData.range.length}}个</span>         
                                    <el-dropdown-menu slot="dropdown">
                                        <el-dropdown-item v-for="(item,index) in cardData.range" :key="index"   :command="item.id">{{item.name}}</el-dropdown-item>       
                                    </el-dropdown-menu>
                                </el-dropdown>
                            </template>
                            <template v-else>
                                <span class="pointer" @click="modifyTaskType(cardData.range[0].id)">{{cardData.range[0].name}}</span>
                            </template>
                        </div>
                        <div class="task-card-li">
                            <p>类型：<span class="task_type">{{cardData.inputType=='single'?'单次':'多次'}}</span></p>
                            <p>使用统计：<span class="task_see" @click="onSee">查看</span></p>
                        </div>
                    </el-row>
                </el-row >
            </el-row>
            <el-switch v-model="cardData.enabled"  :active-value="1" :inactive-value="0" @change="statusChange(cardData.enabled)"/>
        </el-row>

        <!-- start 操作 -->
        <el-row class="task-card-opearte" type="flex">
            <div class="task-card-opearte-more" >
                <el-dropdown placement="top">
                   <i class="icon-ziyuan iconfont">更多操作</i>
                   <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item>
                            <div class="opearte_btn" @click="editRename"><i class="iconfont icon-bianji1"></i>重命名</div>
                        </el-dropdown-item>
                        <el-dropdown-item>
                            <div class="opearte_btn" @click="delTaskCard"><i class="iconfont icon-shanchu-copy"></i>删除</div>
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </div>
            <div class="task-card-opearte-modify" @click="modifyTaskType">
                <i class="icon-ziyuan iconfont">编辑</i>
            </div>
        </el-row>
        <!-- end 操作 -->

        <!-- 添加编辑附加组件 -->
        <edit-cardname-dialog  :id="cardData.id" ref="batchCardnameDialog"></edit-cardname-dialog>

        <!-- 统计 -->
        <statistical-dialog :id="cardData.id" :specialfrom="cardData.specialfrom" ref="statisteDialog" ></statistical-dialog>
    </el-card>
</template>

<script>
import * as SettingTaskApi from "@src/api/SettingTaskApi";

import EditCardnameDialog from "../components/EditCardnameDialog";
import statisticalDialog from "../components/statisticalDialog";
export default {
    name: 'task-card-item',
    props: {
        cardData: Object,
        default: () => {}
    },
    data() {
        return {
        }
    },
    mounted() {
    },
    methods: {
        //删除组件
        delTaskCard() {
            this.$confirm('组件删除后，所有使用该组件的信息将被删除，且不能恢复，确认是否删除？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }).then(() => {
                SettingTaskApi.onDeleteCard({id:this.cardData.id}).then(res=>{
                    const { status, message, data } = res;
                    if(status == 0){
                        this.$message.success('删除成功');
                        location.reload()
                    }else{
                        this.$message.error(message);
                    }
                }).catch(error=>{
                    console.log(error)
                })
            });
        },

        // 禁用/开启附加组件
        statusChange(state) {
            let enabled = state ? 1 : 0;
            SettingTaskApi.onCardChange({id:this.cardData.id,enabled:enabled}).then(res=>{
                const { status, message, data } = res;
                if(status == 0){
                    this.$message.success('操作成功');
                }else{
                    this.$message.error(message);
                }
            }).catch(error=>{
                console.log(error)
            })
        },
        //重命名
        editRename() {
            this.$refs.batchCardnameDialog.openDialog();
        },
        //TODO:进入工单详情
        modifyTaskType(id) {
            let taskTypeId = id;
            this.$platform.openTab({
                id: "task_flow_setting",
                title: "工单流程设置",
                url: `/setting/task/taskFormSet?taskTypeId=${taskTypeId}`,
                reload: true,
            });
        },
        //查看统计
        onSee() {
            this.$refs.statisteDialog.openDialog();
        },
        updateTeamList(teamList){
            console.log(teamList);
            this.$emit('update:cardData', {
                ...this.cardData,
                teamList
            })
        }
    },
    components: {
        [EditCardnameDialog.name]: EditCardnameDialog,
        [statisticalDialog.name]: statisticalDialog    
    }
}
</script>

<style lang="scss">
.task-card{
    width: 358px;
    height: 180px;
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
            .task-card-inforn{
                width: 257px;
                .task-card-name{  
                    margin-bottom: 0;
                    @include text-ellipsis;
                    padding-right: 32px;
                    font-size: 16px;
                    color: #333333;
                    line-height: 22px;
                }
                .task-card-des{
                    font-size: 12px; 
                    color: #666666;
                    line-height: 17px;
                    margin-top: 8px;
                    height: 34px;
                    @include text-ellipsis-2; 
                    cursor: pointer;
                    margin-block-end: 0em;

                }
            }

            .task-card-others{
                p{
                    margin-bottom: 4px;
                    font-size: 12px;
                    color: #666666;
                    span{
                        color: $color-primary;
                    }
                    &:last-child{
                        margin-bottom: 0;
                    }
                }
                .task-card-scope{
                    display: flex;
                    justify-content: flex-start;
                    span{
                       color: $color-primary;
                       font-size: 12px; 
                    }
                }
                .task-card-li{
                    display: flex;
                    justify-content: flex-start;
                    p{
                        width: 86px;
                        .task_type{
                            color: #333333;
                        }
                        .task_see{
                            color: $color-primary;
                            cursor: pointer;
                        }

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
            i{
                font-size: 12px;
                color: #999999;
                &:hover{
                    color: $color-primary; 
                }
            }
           
        }
        .task-card-opearte-more{
           border-right: 1px solid#F5F5F5;
           font-size: 14px;  
           &:hover{
               .el-dropdown{
                   color: $color-primary; 
               }
            }

        }
    }
}

.pointer{
    cursor: pointer;
}
.el-dropdown-menu{
    .opearte_btn{  
      font-size: 13px; 
      .iconfont{
          font-size: 14px;
          margin-right: 10px;
      } 
        .el-dropdown-menu__item{
            line-height: 30px;
        }  
    }

}
</style>