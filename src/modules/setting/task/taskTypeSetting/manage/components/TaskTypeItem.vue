<template>
  <div class="task-type">
    <el-row class="task-type-main" type="flex" justify="space-between">
      <el-row type="flex">
        <i class="task-type-color" :style="{'background-color': taskType.config.color}"></i>
        <el-row class="task-type-content" type="flex">
          <h2 class="task-type-name">
            {{taskType.name}}
          </h2>
          <el-row class="task-type-others">
            <el-row type="flex">
              <p @click="chooseTeam" class="pointer"> 
                <span style="color: #666666;">可用团队: </span>
                <el-tooltip v-if="formatTeamName.length>28" trigger="hover">
                  <div slot="content" style="width: 300px">{{formatTeamName}}</div>
                  <span>{{formatTeamName.substring(0, 28)}}...等{{tagIds.length}}个</span>
                </el-tooltip>
                <span v-else>{{formatTeamName}}</span>
              </p>
              <i class="iconfont icon-edit-square pointer" @click="chooseTeam"></i>
            </el-row>
            <p>
              最近更新: {{taskType.modifyUserName}}  {{(taskType.modifyTime || taskType.createTime) | fmt_datetime}}
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
      <div v-if="!isSysTaskType" class="task-type-opearte-del" @click="delTaskType">
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
  </div>
</template>

<script>
import _ from 'lodash';
/** api */
import * as SettingApi from '@src/api/SettingApi';

/** component */
import ChooseTeamDialog from './ChooseTeamDialog.vue';

export default {
  name: 'task-type-item',
  props: {
    taskType: { // 工单类型对象
      type: Object,
      default: () => ({})
    },
    typeNum: { // 已经开启的数量
      type: Number,
      default: 0
    },
    maxTypeNum: { // 最大可开启的工单类型
      type: Number,
      default: 0
    },
    teamList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      isShowChooseTeamModal: false // 选择可用团队弹窗
    }
  },
  computed: {
    // 是否系统默认工单类型
    isSysTaskType() {
      return this.taskType.id == '1';
    },
    tagIds() {
      return this.taskType.tags || [];
    },
    // 可用团队名称显示
    formatTeamName() {
      let tagIds = this.tagIds;
      return tagIds.length === 0 ? '全部团队' : tagIds.map(tagId => {
        return this.teamList.find(team => team.id === tagId).tagName;
      }).join('，');
    },
  },
  methods: {
    /** 启用/禁用 */
    switchEnabled: _.debounce(function(value) {
      if(value === 1 && this.typeNum >= this.maxTypeNum) {
        return this.$message.warning(`最多只能同时存在${this.maxTypeNum}种工单类型`);
      }

      if(value === 0 && this.typeNum <= 1) {
        return this.$message.warning('无法禁用全部工单类型');
      }

      let params = {
        id: this.taskType.id,
        enabled: value
      }
      SettingApi.taskTypeEnable(params).then(res => {
        this.taskType.enabled = value;
      }).catch(err => {
        console.log('taskType enabled => err', err);
      });
    }, 100),
    /** 打开可用团队弹窗 */
    chooseTeam() {
      this.isShowChooseTeamModal = true;
    },
    /** 删除工单类型 */
    delTaskType() {
      if(this.isSysTaskType) {
        return this.$message.warning('默认工单模版，不允许删除');
      }
      this.$confirm(`确定要删除【${this.taskType.name}】该工单类型吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        let params = {
          typeId: this.taskType.id
        }

        SettingApi.delTaskType(params).then(res => {
          this.$platform.notification({
            title: '删除成功',
            type: 'success',
          });
          this.$emit('update');
        }).catch(err => {
          console.log('delete taskType => err', err);
        });
      });
    },
    /** 进入修改工单类型设置页面 */
    modifyTaskType() {
      let fromId = window.frameElement.getAttribute('id');

      let taskTypeId = this.taskType.id;
      this.$platform.openTab({
        id: 'task_form_setting',
        title: '工单类型设置',
        url: `/setting/task/taskFormSet?taskTypeId=${ taskTypeId}`,
        reload: true,
        fromId
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
    updateTeamList(tags){
      this.updateTaskType({
        tags
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
        padding: 16px 20px;
        .task-type-color{
            display: block;
            width: 14px;
            min-width: 14px;
            height: 14px;
            line-height: 22px;
            margin: 3px 5px 0 0;
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
                line-height: 20px;
            }
            .task-type-others{
                i{
                    font-size: 12px;
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
                & > div:hover{
                    p, i {
                        color: $color-primary;
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

@media screen and (max-width: 1920px) {
  .task-type {
    width: calc(25% - 12px);
  }
}
@media screen and (max-width: 1680px) {
  .task-type {
    width: calc(33.3% - 12px);
  }
}
@media screen and (max-width: 1440px) {
  .task-type {
    width: 326px;
  }
}

</style>