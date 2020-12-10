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
        v-model="taskTypeList"
        v-bind="dragOptions"
        tag="div"
      >
        <transition-group class="task-type-list" type="transition" name="flip-list">
          <task-type-item class="task-type-item" v-for="(item, idx) in taskTypeList" :key="item.id" :value.sync="taskTypeList[idx]"></task-type-item>
        </transition-group>
      </draggable>
    </div>

    <!-- 新建工单类型弹窗 -->
    <add-task-type-dialog :visiable.sync="isAddTaskTypeModal" />
  </div>
</template>

<script>
import draggable from 'vuedraggable';

import TaskNavBar from '../../components/TaskNavBar.vue';
import TaskTypeItem from '../components/TaskTypeItem.vue';
import AddTaskTypeDialog from '../components/AddTaskTypeDialog';

export default {
  name: 'task-manage',
  data() {
    return {
      taskTypeList: [{
        id: 1,
        open: true, teamList: [],
        typeName: '默认工单类型标题',
        teams: '杭州市西湖团队',
        updateName: '张燕青',
        updateDate: '2020-10-20'
      },{
        id: 2,
        open: true, teamList: [],
        typeName: '默认工单类型字段超出一行可以换行，最多展示2行',
        teams: '杭州市西湖团队',
        updateName: '张燕青',
        updateDate: '2020-10-20'
      },{
        id: 3,
        open: true, teamList: [],
        typeName: '默认工单类型字段超出一行可以换行，最多展示2行3',
        teams: '杭州市西湖团队',
        updateName: '张燕青',
        updateDate: '2020-10-20'
      },{
        id: 4,
        open: true, teamList: [],
        typeName: '默认工单类型4',
        teams: '杭州市西湖团队',
        updateName: '张燕青',
        updateDate: '2020-10-20'
      },{
        id: 5,
        open: true, teamList: [],
        typeName: '默认工单类型555',
        teams: '杭州市西湖团队',
        updateName: '张燕青',
        updateDate: '2020-10-20'
      }],

      isAddTaskTypeModal: false
    }
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
  methods: {
    addTaskType() {
      // 添加工单类型
      // todo_zr: 需要校验可用工单类型数量 
      this.isAddTaskTypeModal = true;
    }
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
      flex-flow: wrap;
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