<template>
  <div class="task-additional-container">
    <!-- start 导航 -->
    <task-nav-bar current="cardManage" />
    <!-- end 导航 -->

    <!-- start 附加组件设置 -->
    <div class="task-additional-right">
      <div class="task-tab-header">
        <div class="task-tabs">
          <el-tabs v-model="activeTab">
            <el-tab-pane name="task-added" label="已添加的组件">
                <p class="tabs_msg">附加组件是在服务工单中用于管理工单信息的辅助工具，可以让您分类记录工单的信息，附加组件可以从模块库中导入或创建。如需将关联组件应用在服务工单上，请在不同的工单类型中添加附加组件</p>
            </el-tab-pane>
            <el-tab-pane name="task-import" label="从模版库添加">
              <p class="tabs_msg">附加组件库里，提供了丰富的模板，点击预览</p>
            </el-tab-pane>
          </el-tabs>
        </div>
        <div class="lh-52">
          <el-button type="primary" icon="el-icon-plus"  :loading="false" @click="addTaskType"> 新建</el-button>
        </div>
      </div>
      
      <!-- start 已添加附加组件 -->
      <div class="task-type-list">
        <task-card-item
          class="task-type-item"
          v-for="(item, idx) in taskTypeList"
          :key="item.id"
          :value.sync="taskTypeList[idx]"
        ></task-card-item>
      </div>
      <!-- end 已添加附加组件 -->

    </div>
     <!-- end 附加组件设置 -->
  </div>
</template>

<script>
import TaskNavBar from "../../components/TaskNavBar.vue";
import TaskCardItem from "../components/TaskCardItem.vue";

export default {
  name: "task-manage",
  data() {
    return {
      activeTab: "task-added",
      taskTypeList: [
        {
          id: 1,
          open: true,
          teamList: [],
          typeName: "默认工单类型标题",
          teams: "杭州市西湖团队",
          updateName: "张燕青",
          updateDate: "2020-10-20",
        },
        {
          id: 2,
          open: true,
          teamList: [],
          typeName: "默认工单类型字段超出一行可以换行，最多展示2行",
          teams: "杭州市西湖团队",
          updateName: "张燕青",
          updateDate: "2020-10-20",
        },
        {
          id: 3,
          open: true,
          teamList: [],
          typeName: "默认工单类型字段超出一行可以换行，最多展示2行3",
          teams: "杭州市西湖团队",
          updateName: "张燕青",
          updateDate: "2020-10-20",
        },
        {
          id: 4,
          open: true,
          teamList: [],
          typeName: "默认工单类型4",
          teams: "杭州市西湖团队",
          updateName: "张燕青",
          updateDate: "2020-10-20",
        },
        {
          id: 5,
          open: true,
          teamList: [],
          typeName: "默认工单类型555",
          teams: "杭州市西湖团队",
          updateName: "张燕青",
          updateDate: "2020-10-20",
        },
      ],

      isAddTaskTypeModal: false,
    };
  },
  computed: {
    dragOptions() {
      return {
        animation: 0,
        group: "description",
        disabled: false,
        ghostClass: "ghost",
      };
    },
  },
  methods: {
    addTaskType() {
      // 添加工单类型
      this.isAddTaskTypeModal = true;
    },
  },
  components: {
    [TaskNavBar.name]: TaskNavBar,
    [TaskCardItem.name]: TaskCardItem,
  },
};
</script>
<style lang="scss">
.task-tabs {
  // tabs标签页
  .el-tabs {
    height: 100%;
    display: flex;
    flex-direction: column;

    &__header {
      margin: 0;

      .el-tabs__item {
        padding: 0 24px !important;
        color: $text-color-regular;
        font-weight: normal;

        &.is-active {
          color: $color-primary;
        }
      }
    }
    &__nav-wrap {
      &:after {
        height: 0;
      }
    }

    &__content {
      flex: 1;
      overflow: auto;
    }
  }
}
</style>
<style lang="scss" scoped>
@import "./taskAdditionalSet.scss";
</style>