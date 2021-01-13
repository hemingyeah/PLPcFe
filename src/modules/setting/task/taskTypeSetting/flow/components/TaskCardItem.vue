<template>
  <div class="task-card" :body-style="{padding: '0px', height: '100%'}" shadow="hover">
    <el-row class="task-card-main" type="flex" justify="space-between">
      <el-row type="flex">
        <el-row class="task-card-content" type="flex">
          <h2 class="task-card-title">
            <el-tooltip class="item" effect="dark" :content="taskCard.name" :disabled="disabledState" placement="top">
              <span :class="['task-card-name',taskCard.enabled == 0 && 'task-card-enabled']">{{taskCard.name}}</span>
            </el-tooltip>    
            <el-tooltip class="item" effect="dark" content="可在附加组件设置中开启" placement="top">
              <span class="task-card-disable" v-if="taskCard.enabled == 0">已禁用</span>
            </el-tooltip>
          </h2>
          <el-row class="task-card-others">
            <p>
              使用规则： 
              <span class="pointer" v-if="taskCard.notNullFlow || (taskCard.stateCanEdit && taskCard.stateCanEdit.length>0)">已设置 </span>
              <span class="pointer" v-else>未设置 </span>
              <i class="iconfont icon-bianji1 pointer" @click="onSetRules"></i>
            </p>
            <p @click="onSetEditpermiss">
              使用权限：
              <span class="pointer see-role">查看角色权限 </span>
              <i class="iconfont icon-bianji1 pointer"></i>
            </p>
            <p>
              添加次数: 
              <span v-if="taskCard.inputType == 'single'">单次</span> <span v-if="taskCard.inputType == 'multiple'">多次</span>
            </p>
          </el-row>
        </el-row >
      </el-row>
      <i class="iconfont icon-tuozhuaipaixu drag-icon"></i>
    </el-row>
    <el-row class="task-card-opearte" type="flex">
      <div class="task-card-opearte-del" @click="delTaskCard">
        <i class="iconfont icon-delete">删除</i>
      </div>
      <div class="task-card-opearte-modify" @click="previewCard(taskCard)">
        <i class="iconfont icon-eye-fill">预览</i>
      </div>
    </el-row>

    <!-- start 设置使用规则 -->
    <use-rules-dialog
      :task-card="taskCard"
      :task-type-id="taskTypeId"
      :visiable.sync="isShowRulesModal"
      @onClose="onCloseRules"
      @update="updateRulesList"/>
    <!-- end 设置使用规则 -->

    <!-- start 设置使用权限 -->
    <card-editpermiss-dialog
      :task-card="taskCard"
      :task-type-id="taskTypeId"
      :visiable.sync="isShowEditpermissModal"
      @onClose="onCloseEditpermiss"
      @update="updateRolesList"/>
    <!-- end 设置使用权限 -->

    <!--start 预览组件 -->
    <preview-card-dialog ref="previewDialog" :fields="fields"></preview-card-dialog>
    <!--end 预览组件 -->
  </div>
</template>

<script>
import _ from 'lodash';
/** api */
import * as SettingTaskApi from '@src/api/SettingTaskApi';

/** component */
import UseRulesDialog from '../components/TaskCard/UseRulesDialog';
import CardEditpermissDialog from '../components/TaskCard/CardEditpermissDialog';
// components
import PreviewCardDialog from '../../../components/PreviewCardDialog';
export default {
  name: 'task-card-item',
  props: {
    taskCard: {
      type: Object,
      default: () => ({})
    },
    index: {
      type: Number   
    },
    taskTypeId: {
      type: String,
    }
  },
  computed: {
    disabledState(){
      return this.taskCard.name.length < 19 && (this.taskCard.enabled != 0 || (this.taskCard.name.length < 15 && this.taskCard.enabled == 0))
    }
  },
  data() {
    return {
      fields:[],
      isShowEditpermissModal: false,
      isShowRulesModal: false // 选择可用团队弹窗
    }
  },
  methods: {
    // 删除组件
    delTaskCard() {
      this.$confirm(`确定要删除【${this.taskCard.name}】吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        console.log(this.taskCard)
        this.$emit('deleteCard', this.index)

      });
    },
    // 设置使用规则
    onSetRules() {
      this.isShowRulesModal = true;
    },
    onCloseRules() {
      this.isShowRulesModal = false;
    },
    // 编辑权限
    onSetEditpermiss() {
      this.isShowEditpermissModal = true;
    },
    onCloseEditpermiss() {
      this.isShowEditpermissModal = false;
    },
    // 更新taskCard
    updatetaskCard(obj) {
      this.$emit('updateAttr', obj);
    },

    // 更新使用规则
    updateRulesList(flow, stateCanEdit){
      this.updatetaskCard({
        notNullFlow: flow,
        stateCanEdit
      });
      this.onCloseRules();
    },

    // 更新使用权限
    updateRolesList(authInfo){
      this.updatetaskCard({
        authInfo
      });
      this.onCloseEditpermiss();
    },
    // 预览组件
    previewCard(card) {
      // this.fields = card.fieldsModule;
      this.$refs.previewDialog.openDialog();
    }
  },
  components: {
    [UseRulesDialog.name]: UseRulesDialog,
    [CardEditpermissDialog.name]: CardEditpermissDialog,   
    [PreviewCardDialog.name]: PreviewCardDialog,   
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
    box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.04); 
    &:hover{
        box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.12);
    }
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
            .task-card-title{
                display: flex;
                justify-content: flex-start;
                .task-card-name{
                    display: inline-block;
                    max-width: 300px;
                    margin-bottom: 0;
                    @include text-ellipsis;
                    word-break: break-all;
                    padding-right: 12px;
                    font-size: 16px;
                    color: #333333;
                    line-height: 22px;
                    cursor: pointer;
                }
                .task-card-enabled{        
                    max-width: 230px;
                    padding-right: 0px;
                    margin-right: 12px;          
                }
                .task-card-disable{
                    width: 54px;
                    height: 22px;
                    line-height: 22px;
                    font-size: 12px;
                    font-weight: 500;
                    text-align: center;
                    color: #999999;
                    background: rgba(153, 153, 153, 0.2);
                    border-radius: 12px;
                    border: 1px solid rgba(191, 191, 191, 0.2);
                    cursor: pointer;
                }
            }

            .task-card-others{
                i{
                    font-size: 12px;
                    color: #666;
                    &:hover{
                        color: $color-primary;
                    }
                }
                p{
                    margin-bottom: 4px;
                    font-size: 12px;
                    color: #666666;
                    span{
                        color: #333333;
                        margin-right: 8px;
                    }
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
              &::before{
                margin-right: 8px;
              }
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