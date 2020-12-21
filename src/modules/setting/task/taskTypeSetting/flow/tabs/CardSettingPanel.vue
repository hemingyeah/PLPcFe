<template>
  <div class="card-setting-container" v-loading="loading">
    <!--start 新建附加组件 -->
    <div class="card-setting-heard">
      <div class="card-setting-title">
        <p>附加组件设置</p>
        <el-button
          type="primary"
          icon="el-icon-plus"
          :loading="false"
          @click="addTaskCard"
          >新建</el-button
        >
      </div>
      <p class="card-setting-msg">
        附加组件是管理工单的辅助工具，您可以分类记录更新工单的信息，如需更多附加组件请在工单组件管理中添加
        <el-tooltip placement="top" popper-class="card-display-tooltip" >
          <div slot="content">
            <template>
              <div class="card-displaymode--item">● 使用规则：可以控制每个附加组件在什么节点前必填，以及在什么状态时可以被编辑；可以通过【配置使用规则】功能查看配置详情或修改</div>
              <div class="card-displaymode-item">● 使用权限：可以控制哪些角色能查看及修改附加组件；默认能看到工单的用户都可以使用附加组件，可以通过【配置使用权限】功能查看详情或修改</div>
              <div class="card-displaymode-item">类型：可以添加多次还是只能添加一次，由附加组件属性决定</div>
            </template>
          </div>
          <i class="iconfont icon-question"></i>
        </el-tooltip>
      </p>
    </div>
    <!--end 新建附加组件 -->

    <!--start 附加组件列表 -->
    <div class="card-setting-list" v-if="taskCardList.length > 0">
      <draggable
        v-model="taskCardList"
        v-bind="dragOptions"
        tag="div"
        @change="updateTaskCardOrder"
      >
        <transition-group
          class="task-card-list"
          type="transition"
          name="flip-list">
          <task-card-item
            class="task-card-item"
            v-for="(item, idx) in taskCardList"
            :key="item.id"
            :taskCard="taskCardList[idx]"
            :taskTypeId="taskTypeId"
            @udateCard="udateCard"
            @updateAttr="obj => {
              updateTaskCard(item, obj)
            }">
          </task-card-item>
        </transition-group>
      </draggable>
    </div>
    <!--end 附加组件列表 -->

      <!-- start 无数据 -->
    <no-data-view-new
      v-else
      notice-msg="暂无附加组件"
    ></no-data-view-new>
    <!-- end 无数据 -->
  </div>
</template>
<script>
import draggable from 'vuedraggable';
// utils
import { parse } from '@src/util/querystring';
/**  api */
import * as TaskApi from '@src/api/TaskApi.ts';
import * as SettingTaskApi from "@src/api/SettingTaskApi";
/** component */
import TaskCardItem from '../../components/TaskCardItem';
import NoDataViewNew from '@src/component/common/NoDataViewNew';

export default {
  name: "card-setting-panel",
  data() {
    return {
      loading: true,
      taskTypeId: "",
      taskCardList: [],
    };
  },
  computed: {
    dragOptions() {
      return {
        animation: 0,
        group: "description",
        disabled: false,
        ghostClass: "ghost"
      };
    }
  },
  mounted() {
    let query = parse(window.location.search) || {};
    this.taskTypeId = query.taskTypeId;
    this.fetchTasktype();

  },
  methods: {
    addTaskCard() {

    },
    updateTaskCard(taskType, updateObj) {
      for (const key in updateObj) {
        if (updateObj.hasOwnProperty(key)) {
          taskType[key] = updateObj[key];
        }
      }
    },
    //更新列表数据
    udateCard() {
      this.fetchTasktype();
    },

    //工单类型附加组件排序 order重新排序
    updateTaskCardOrder(data){
      this.taskCardList.forEach((item, idx) => {
        item.order = idx +1;
      })
      let cardSetting = {};
      cardSetting.cardInfo = this.taskCardList
      this.sortCard(cardSetting)
    },
    
    //排序 
    sortCard(cardSetting) {
      let params = {
          id: this.taskTypeId,
          cardSetting: cardSetting
      }
      SettingTaskApi.saveTaskCardOrder(params).then(res=>{
        const { status, message, result } = res;
        if(status == 0){
        }else{
          this.$message.error(message);
        }
      }).catch(error=>{
        console.log(error)
      })
    },
    /**
     * 获取工单设置的除组件外的其他信息
     */
    async fetchTasktype() {
        try {
            const { status, message, data } = await TaskApi.getTaskType({ id: this.taskTypeId});
            this.loading = false;
            if( status == 0 ){
              if(JSON.stringify(data.cardSetting) !=='{}' && data.cardSetting.cardInfo){
                this.taskCardList = data.cardSetting.cardInfo;
              }
            }     
        } catch (err) {
            console.error('fetch Tasktype => err', err);
            this.loading = false;
        }
    },
  },
  components: {
    [TaskCardItem.name]: TaskCardItem,
    [NoDataViewNew.name]: NoDataViewNew,
    draggable
  }
};
</script>
<style lang="scss" scoped>
.card-setting-container {
  .card-setting-heard {
    font-weight: 500;
    color: #333333;
    font-size: 16px;
    background: #fff;
    padding: 16px 33px 20px 33px;
    .card-setting-title {
      display: flex;
      justify-content: space-between;
      line-height: 32px;
      p {
        margin-right: 16px;
        margin-bottom: 0;
      }
      button {
        width: 88px;
        height: 32px;
      }
    }
    .card-setting-msg {
      font-size: 12px;
      color: #666666;
      line-height: 20px;
      .el-tooltip{
        font-size: 12px;
        color: #999;
      }
    }
  }
  .card-setting-list{
    margin: 12px;
    .task-card-list{
      display: flex;
      flex-flow: wrap;
      min-height: 300px;
      .task-card-item{
        margin: 0 12px 12px 0;
      }
    }
  }
}
.card-display-tooltip{
  span{
    width: 8px;
    height: 8px;
  }
}

// transtion
.flip-list-move {
  transition: transform 0.5s;
}
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
</style>
