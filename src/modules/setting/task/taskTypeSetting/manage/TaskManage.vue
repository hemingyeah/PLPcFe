<template>
  <div class="task-manage">
    <task-nav-bar current="taskType"/>
    <div class="task-manage-main">
      <div class="task-manage-header">
        <div>
          <h2>工单类型</h2>
          <p>工单支持多种工单类型，可以添加或配置不同类型的工单来分类处理服务台业务一个工单类型中可以定义表单、流程及附加组件</p>
        </div>
        <div class="lh-52">
          <el-button type="primary" icon="el-icon-plus"  :loading="false" @click="addTaskType"> 新建</el-button>
        </div>
      </div>
      <draggable
        v-loading="pendding"
        v-model="taskTypeList"
        v-bind="dragOptions"
        class="task-type-list"
        tag="div"
        @change="updateTaskTypeOrder"
      >
        <task-type-item
          class="task-type-item"
          v-for="(item, idx) in taskTypeList"
          :key="item.id"
          :task-type="taskTypeList[idx]"
          :team-list="teamList"
          :type-num="enableTypeNum"
          :max-type-num="maxTypeNum"
          @update="fetchTaskTypeList"
          @updateAttr="obj => {
            updateTaskType(item, obj)
          }">
        </task-type-item>
      </draggable>
    </div>

    <!-- 新建工单类型弹窗 -->
    <add-task-type-dialog :visiable.sync="isAddTaskTypeModal" :taskTypeList="taskTypeList"/>
  </div>
</template>

<script>
import draggable from 'vuedraggable';

/** api */
import * as SettingApi from "@src/api/SettingApi";
import * as TeamApi from '@src/api/TeamApi';

/** component */
import TaskNavBar from '../../components/TaskNavBar.vue';
import TaskTypeItem from './components/TaskTypeItem.vue';
import AddTaskTypeDialog from './components/AddTaskTypeDialog';

export default {
  name: 'task-manage',
  data() {
    return {
      taskTypeList: [],
      teamList: [],
      maxTypeNum: 10,

      isAddTaskTypeModal: false,
      pendding: false,
    }
  },
  computed: {
    dragOptions() {
      return {
        animation: 380,
        ghostClass: "ghost"
      };
    },
    enableTypeNum() {
      return this.taskTypeList.filter(item => item.enabled === 1).length;
    }
  },
  methods: {
    updateTaskType(taskType, updateObj) {
      for (const key in updateObj) {
        if (updateObj.hasOwnProperty(key)) {
          taskType[key] = updateObj[key];
        }
      }
    },
    /** 添加工单类型 */
    addTaskType() {
      this.isAddTaskTypeModal = true;
    },
    /** 工单类型排序 */
    updateTaskTypeOrder(data) {
      let params = {};
      this.taskTypeList.forEach((item, idx) => {
        params[item.id] = idx +1;
      })

      SettingApi.taskTypeOrder(params).then(() => {
        console.log('updateTaskTypeOrder success');
      }).catch(err => {
        console.log('updateTaskTypeOrder => err', err);
      });
    },
    /** 获取工单类型列表 */
    fetchTaskTypeList() {
      this.pendding = true;
      SettingApi.getTaskTypeManage().then((res) => {
        this.pendding = false;
        let {tagListJson,taskTypeListJson,maxTypeNum} = res;

        this.maxTypeNum = maxTypeNum;
        this.teamList = tagListJson || [];
        taskTypeListJson = taskTypeListJson || [];

        // 排序
        this.taskTypeList = taskTypeListJson.sort(
            (a, b) => (a.orderId > b.orderId && a.enabled > b.enabled));
      }).catch(err => {
        console.error("fetch taskTypeList => error", err);
      }).finally(() => {
        this.pendding = false;
      })
    },
  },
  mounted() {
    this.fetchTaskTypeList();
  },
  components: {
    [TaskNavBar.name]: TaskNavBar,
    [TaskTypeItem.name]: TaskTypeItem,
    [AddTaskTypeDialog.name]: AddTaskTypeDialog,
    draggable
  }
}
</script>
<style lang="scss" scoped>
.task-manage{
  display: flex;
  overflow: auto;
  height: 100vh;
  padding: 16px;
  background: #F5F5F5;
  .task-manage-main{
    flex: 1;
    min-width: 730px;
    margin-left: 13px;
    .task-manage-header{
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      padding: 18px 12px;
      width: 100%;
      height: 88px;
      background: #FFFFFF;
      border-radius: 4px;
      h2{
        margin-bottom: 10px;
        font-size: 16px;
        color: #333333;
        line-height: 22px;
      }
      p{
        font-size: 12px;
        color: #666666;
        line-height: 20px;
      }
      .lh-52{
        line-height: 52px;
      }
    }
    .task-type-list{
      display: flex;
      flex-wrap: wrap;
      align-content: flex-start;
      width: calc(100% + 12px);
      height: calc(100% - 100px);
      overflow: auto;
      .task-type-item{
        margin: 0 12px 12px 0;
      }
    }
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