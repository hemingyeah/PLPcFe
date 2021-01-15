<template>
  <el-card class="task-card" :style="{padding: '0px', height: '100%'}" shadow="hover">
    <el-row class="task-card-main" type="flex" justify="space-between">
      <el-row type="flex">
        <el-row class="task-card-content" type="flex">
          <div class="task-card-inforn"> 
            <h2 class="task-card-name"><el-tooltip class="item" effect="dark" :content="card.name" :disabled="card.name.length<13" placement="top-start"><span>{{card.name}}</span></el-tooltip></h2>                                    
            <p class="task-card-des" ref="parentHeight"><el-tooltip class="item" effect="dark" :content="htmlUnEscape(card.description)" :disabled="!isOverflow" placement="top"><span ref="childHeight">{{htmlUnEscape(card.description)}}</span></el-tooltip></p>
          </div>
                    
          <el-row class="task-card-others">
            <div class="task-card-scope">
              <p>  
                <span class="task-card-tit">已应用范围：</span>
                <el-dropdown placement="top" @command="modifyTaskType">
                  <span v-if="rangeName.length>30">{{rangeName.substring(0, 30)}}...等{{card.range.length}}个</span>
                  <span v-else>{{rangeName}}</span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item v-for="(item,index) in card.range" :key="index" :command="item.id">{{item.name}}</el-dropdown-item>       
                  </el-dropdown-menu>
                </el-dropdown>
              </p>
            </div>
            <div class="task-card-li">
              <p>类型：<span class="task_type">{{card.inputType=='single'?'单次':'多次'}}</span></p>
              <p>使用统计：<span class="task_see" @click="onSee">查看</span></p>
            </div>
          </el-row>
        </el-row >
      </el-row>
      <el-switch v-model="card.enabled" :active-value="1" :inactive-value="0" @change="statusChange(card.enabled)"/>
    </el-row>

    <!-- start 操作 -->
    <el-row class="task-card-opearte" type="flex">
      <div class="task-card-opearte-more" >
        <el-dropdown placement="top">
          <i class="icon-diandiandian iconfont">更多操作</i>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>
              <div class="opearte_btn" @click="editRename"><i class="iconfont icon-edit-square"></i>重命名</div>
            </el-dropdown-item>
            <el-dropdown-item>
              <div class="opearte_btn" @click="delTaskCard"><i class="iconfont icon-delete"></i>删除</div>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      <div class="task-card-opearte-modify" @click="modifyTaskForm">
        <i class="icon-edit-square iconfont">编辑</i>
      </div>
    </el-row>
    <!-- end 操作 -->

    <!-- 添加编辑附加组件 -->
    <edit-cardname-dialog :id="card.id" ref="batchCardnameDialog" @editCardSubmit="editCardSubmit"></edit-cardname-dialog>

    <!-- 统计 -->
    <statistical-dialog :card="card" ref="statisteDialog" ></statistical-dialog>
  </el-card>
</template>

<script>
import * as SettingTaskApi from '@src/api/SettingTaskApi';

import EditCardnameDialog from '../components/EditCardnameDialog';
import statisticalDialog from '../components/statisticalDialog';
export default {
  name: 'task-card-item',
  props: {
    card:{
      type: Object,
      default: () => ({})
    }
  },
  computed:{
    rangeName() {   
      let range = this.card.range.map((item)=> {
        return item.name     
      }).join('，')
      return range
    }
  },
  data() {
    return {
      isOverflow: false
    }
  },
  mounted() {
    this.$nextTick(()=> {
      this.isOverflow = this.$refs?.parentHeight?.offsetHeight < this.$refs?.childHeight?.offsetHeight
    })
  },
  methods: {
    editCardSubmit() {
      this.$emit('update');
    },
    // 删除组件
    delTaskCard() {
      this.$confirm(`确定要删除【${this.card.name}】吗？删除后，工单类型中该组件中的数据不可恢复!`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        SettingTaskApi.onDeleteCard({id:this.card.id}).then(res=>{
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
      SettingTaskApi.onCardChange({id:this.card.id, enabled}).then(res=>{
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
    // 重命名
    editRename() {
      this.$refs.batchCardnameDialog.openDialog();
    },
    // TODO:进入工单详情
    modifyTaskType(id) {
      let taskTypeId = id;
      this.$platform.openTab({
        id: 'task_flow_setting',
        title: '工单流程设置',
        url: `/setting/task/taskFormSet?taskTypeId=${taskTypeId}`,
        reload: true,
      });
    },

    // TODO:编辑表单
    modifyTaskForm() {
      let cardId = this.card.id;
      let fromId = window.frameElement.getAttribute('id');
      if(this.card.specialfrom !== '工时记录'){
        this.$platform.openTab({
          id: 'task_card_setting',
          title: '附加组件表单设置',
          close: true,
          reload: true,
          url: `/setting/task/cardFormfields?cardId=${cardId}`,
          fromId
        });
      }else{
        this.$platform.openTab({
          id: 'task_cardhours_setting',
          title: '附加组件设置',
          url: `/setting/task/cardHoursRecord?cardId=${cardId}`,
          reload: true,
          close: true,
          fromId
        });
      }
    
    },
    // 查看统计
    onSee() {
      this.$refs.statisteDialog.openDialog();
    },
    updateTeamList(teamList){
      this.$emit('update:card', {
        ...this.card,
        teamList
      })
    },
    htmlUnEscape(value){
      if(!value) return '';
      return value.replace( /&lt;/g, '<').replace(/&gt;/g, '>');
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
    // width: 358px;
    height: 180px;
    background: #FFFFFF;
    border-radius: 4px;
    box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.04); 
    &:hover{
        box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.12);
    }
    .task-card-main{
        display: flex;
        height: calc(100% - 32px);
        padding: 20px;
        .task-card-content{
            flex-direction: column;
            justify-content: space-between;
            height: 100%;
            .task-card-inforn{
                width: 220px;
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
                    p{
                      color: $color-primary;
                      word-break: break-all;
                      text-overflow: ellipsis;
                      overflow: hidden;
                      display: -webkit-box;
                      -webkit-line-clamp: 2;
                      -webkit-box-orient: vertical;
                      .task-card-tit{
                        color: #666666;
                      }
                    }
                    .el-dropdown{
                      line-height: 15px;
                      display: inline;
                      cursor: pointer;
                      
                    }
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
                &::before{
                    margin-right: 8px;
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
@media screen and (max-width: 1920px) {
  .task-card {
    width: calc(25% - 12px);
  }
}
@media screen and (max-width: 1680px) {
  .task-card {
    width: calc(33.3% - 12px);
  }
}
@media screen and (max-width: 1440px) {
  .task-card {
    width: 328px;
  }
}
</style>