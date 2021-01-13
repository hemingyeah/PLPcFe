<template>
  <div class="card-setting-container" v-loading="loading">
    <!--start 新建附加组件 -->
    <div class="card-setting-heard">
      <div class="card-setting-title">
        <h2>附加组件设置</h2>
        <el-button
          type="primary"
          icon="el-icon-plus"
          :loading="false"
          @click="addTaskCard"
        >添加</el-button
        >
      </div>
      <div class="card-setting-msg">
        附加组件是管理工单的辅助工具，您可以分类记录更新工单的信息，如需更多附加组件请在工单组件管理中添加
        <el-tooltip placement="top" popper-class="card-display-tooltip" >
          <div slot="content">
            <template>
              <div class="card-displaymode--item">● 使用规则：可以控制每个附加组件在什么节点前必填，以及在什么状态时可以被编辑；可通过【配置使用规则】功能查看配置详情或修改</div>
              <div class="card-displaymode-item">● 使用权限：可以控制哪些角色能查看及修改附加组件；默认能看到工单的用户都可以使用附加组件，可通过【配置使用权限】功能查看详情或修改</div>
            </template>
          </div>
          <i class="iconfont icon-question"></i>
        </el-tooltip>
      </div>
    </div>
    <!--end 新建附加组件 -->

    <!--start 附加组件列表 -->
    <div class="card-setting-list" v-if="taskCardList.length > 0">
      <draggable
        v-bind="dragOptions"
        v-model="taskCardList"
        tag="div"
        @change="updateTaskCardOrder"
        class="task-card-group"
      >
        <task-card-item
          class="task-card-item"
          v-for="(item, idx) in taskCardList"
          :key="item.id"
          :index="idx"
          :task-card="taskCardList[idx]"
          :task-type-id="taskTypeId"
          @deleteCard="deleteCard"
          @updateAttr="obj => {
            updateTaskCard(item, obj)
        }">
        </task-card-item>
      </draggable>
    </div>
    <!--end 附加组件列表 -->

    <!-- start 无数据 -->
    <no-data-view-new
      v-else
      notice-msg="暂无附加组件"
    ></no-data-view-new>
    <!-- end 无数据 -->

    <!-- start 新建附加组件 -->
    <creat-card-dialog
      :visiable.sync="isShowCreatCardModal"
      @onClose="onCloseCreatCard"
      :task-card-list="taskCardList"
      @update="update"
      @updateImport="updateImport"
    ></creat-card-dialog>
    <!-- end 无数据 -->
  </div>
</template>
<script>
import draggable from 'vuedraggable';
// utils
import { parse } from '@src/util/querystring';
// api 
import * as TaskApi from '@src/api/TaskApi.ts';
import * as SettingTaskApi from '@src/api/SettingTaskApi';
// component 
import TaskCardItem from '../components/TaskCardItem';
import NoDataViewNew from '@src/component/common/NoDataViewNew';
import CreatCardDialog from '../components/TaskCard/CreatCardDialog';
import { cloneDeep } from 'lodash';

export default {
  name: 'card-setting-panel',
  data() {
    return {
      isShowCreatCardModal: false,
      loading: true,
      taskTypeId: '',
      taskCardList: [],
      authInfo:[],
      oldCardInfo:[]
    };
  },
  computed: {
    dragOptions() {
      return {
        animation: 380, 
        ghostClass: 'ghost'
      };
    }
  },
  mounted() {
    let query = parse(window.location.search) || {};
    this.taskTypeId = query.taskTypeId;
    this.fetchTasktype();
    this.getRoleListReq();

  },
  methods: {
    // 保存数据
    async submit() {
      try {
        const params = {
          taskTypeId: this.taskTypeId,
          cardInfo: this.taskCardList
        }
        let res = await SettingTaskApi.batchSaveTaskCard(params); 
        if(res.status === 0) {
          this.$notify.success('保存成功');
          setTimeout(()=>{
            this.$platform.openTab({
              id: 'task_flow_setting',
              title: '工单流程设置',
              url: '/setting/taskType/manage',
              reload: true,
            });
          }, 1000)
        }else {
          this.$notify.error(res.message);
        }
      } catch (error) {
        console.error(error);
      }
    },
    // 新建附件组件
    addTaskCard() {
      this.isShowCreatCardModal = true;
    },
    onCloseCreatCard() {
      this.isShowCreatCardModal = false;
    },
    deleteCard(index) {
      this.taskCardList.splice(index, 1);
      this.$message.success('删除成功')
    },
    updateTaskCard(cardList, updateObj) {
      for (const key in updateObj) {
        if (updateObj.hasOwnProperty(key)) {
          cardList[key] = updateObj[key];
        }
      }
    },
    // 获取角色列表
    getRoleListReq() {
      SettingTaskApi.getRoleList({pageSize:0})
        .then((res) => {
          const { status, message, list } = res;
          
          list.forEach(element => {
            let obj = {}
            obj.canRead = true;
            obj.canWrite = true;
            obj.canCreate = true;
            obj.canDelete = true;
            obj.id = element.id;
            obj.name = element.name;
            this.authInfo.push(obj)
            
          });  
        })
        .catch((error) => {
          console.log(error);
        });
    },
    // 从已添加的组件库选择
    update(newCard) {
      let list = [];
      const oldList = cloneDeep(this.taskCardList);
      const cardIdMap = new Map();
      newCard.forEach(item=>{
        cardIdMap.set(item.id, item)
      })
      oldList.forEach(item=>{ // 保留原数据
        if(cardIdMap.has(item.id)){
          list.push(item);
          cardIdMap.delete(item.id)
        } else if(item.enabled === 0){ // 保存已禁用列表
          list.push(item);
        }
      });
      let newList = [...cardIdMap.values()];
      newList = newList.map(item=>Object.assign(item, {notNullFlow: null, stateCanEdit: null, authInfo:this.authInfo}))
      list.push(...newList);
      this.taskCardList = list;
      this.onCloseCreatCard();
    },

    // 从模版库中选择更新数据
    updateImport(newCard){
      let newTaskCard = Object.assign(newCard, {notNullFlow: null, stateCanEdit: null, authInfo:this.authInfo});
      this.taskCardList.push(newTaskCard);
      this.onCloseCreatCard();
    },

    // 工单类型附加组件排序 order重新排序
    updateTaskCardOrder(data){
      this.taskCardList.forEach((item, idx) => {
        item.order = idx + 1;
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
          if(JSON.stringify(data.cardSetting) !== '{}' && data.cardSetting.cardInfo){
            this.taskCardList = data.cardSetting.cardInfo;
            this.oldCardInfo = cloneDeep(data.cardSetting.cardInfo)
          }
        }     
      } catch (err) {
        console.error('fetch Tasktype => err', err);
        this.loading = false;
      }
    },
    // 检查内容是否有修改 (暴露的方法)
    checkModified() {
      return JSON.stringify(this.taskCardList) != JSON.stringify(this.oldCardInfo)
    },
    // 同步初始数据 (暴露的方法) 
    resetInit() {
      this.taskCardList = cloneDeep(this.oldCardInfo);
    }
  },
  components: {
    [TaskCardItem.name]: TaskCardItem,
    [NoDataViewNew.name]: NoDataViewNew,
    [CreatCardDialog.name]: CreatCardDialog,
    draggable
  }
};
</script>
<style lang="scss" scoped>
.card-setting-container {
  min-height: calc(100vh - 48px);
  background: #F5F5F5;
  .card-setting-heard {
    font-weight: 500;
    color: #333333;
    font-size: 16px;
    background: #fff;
    padding: 16px 33px 16px 33px;
    .card-setting-title {
      display: flex;
      justify-content: space-between;
      position: relative;
      h2 {
        margin-right: 16px;
        margin-bottom: 0;
        color: #333333;
        font-size: 16px;
        margin-bottom: 8px;
      }
      button {
        width: 88px;
        height: 32px;
        position: absolute;
        right: 0;
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
    .task-card-group{
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
