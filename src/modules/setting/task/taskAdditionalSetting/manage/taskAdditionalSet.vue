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
              <p class="tabs_msg">附加组件库里，提供了丰富的模板，点击<span>预览</span>可查看使用案例。</p>
            </el-tab-pane>
          </el-tabs>
        </div>
        <div class="lh-52" v-if="activeTab=='task-added'">
          <el-button type="primary" icon="el-icon-plus"  :loading="false" @click="addTaskCard">新建</el-button>
        </div>
      </div>
      
      <!-- start 已添加附加组件 -->
      <div class="task-type-list" v-if="activeTab=='task-added'">
        <task-card-item
          class="task-type-item"
          v-for="(item, idx) in cardList"
          :key="item.id"
          :cardData.sync="cardList[idx]"
        ></task-card-item>
      </div>
      <!-- end 已添加附加组件 -->

      <!-- start 从模版库添加 -->
      <div class="task-type-list" v-if="activeTab=='task-import'">
        <template-library></template-library>
      </div>
      <!-- end 从模版库添加 -->

    </div>
    <!-- end 附加组件设置 -->

    <!-- 创建附加组件 -->
    <edit-cardname-dialog ref="batchCardnameDialog"></edit-cardname-dialog>
  </div>
</template>

<script>
import TaskNavBar from "../../components/TaskNavBar";
import TaskCardItem from "../components/TaskCardItem";
import EditCardnameDialog from "../components/EditCardnameDialog";
import templateLibrary from "../components/templateLibrary";

export default {
  name: "task-manage",
  data() {
    return {
      activeTab: "task-added",
      cardList: [
        {
          id: 'b7a32503-2704-11ea-bfc9-00163e304a25',
          name: '费用备注',
          description: '记录备注费用信息',
          specialfrom: null,
          inputType: 'single',//单次single 多次multiple   
          range:[{name:'工单类型1',id:'ee7a0934-2840-4b55-bcc4-000e6435b70c'},{name:'工单类型2',taskTypeId:'ee7a0934-2840-4b55-bcc4-000e6435b70c'}], 
          enabled:1 //1开启 0关闭
        }, {
          id: "ccdddc47-390b-11ea-bfc9-00163e304a25",
          name: '单次组件一',
          description: '费用备注费用备注费用备注费用备注费用备注超过16',
          specialfrom: null,
          inputType: 'single',//单次single 多次multiple
          range:[{name:'工单类型1',id:'ee7a0934-2840-4b55-bcc4-000e6435b70c'}], 
          enabled:1 //1开启 0关闭
        },{
          id: "d98f1607-e20a-11ea-9929-00163e304a25",
          name: '工时记录',
          description: '工时记录信息',
          specialfrom: null,
          inputType: 'single',//单次single 多次multiple
          range:[{name:'工单类型1',id:'ee7a0934-2840-4b55-bcc4-000e6435b70c'}], 
          enabled:1 //1开启 0关闭
        },
      ],

    };
  },
  computed: {
  },
  mounted() {

  },
  methods: {
    //新建组件
    addTaskCard(){
      this.$refs.batchCardnameDialog.openDialog();
    }
  },
  components: {
    [TaskNavBar.name]: TaskNavBar,
    [TaskCardItem.name]: TaskCardItem,
    [EditCardnameDialog.name]: EditCardnameDialog,
    [templateLibrary.name]: templateLibrary   
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