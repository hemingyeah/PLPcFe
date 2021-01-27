<template>
  <div class="task-manage">
    <task-nav-bar current="taskType"/>
    <div class="task-manage-main" v-loading="pendding">
      <div id="task-manange-guide"></div>
      <div class="task-manage-header" id="task-manage-header-guide">
        <div>
          <h2>
            工单类型
            <el-tooltip
              trigger="hover"
            >
              <div slot="content" style="width: 420px">
                <h3>规则说明</h3>
                <p>单个租户可启用的工单类型上限为{{maxTypeNum}}个</p>
                <h3>字段说明</h3>
                <p>可用团队：可以配置该工单类型只给部分团队使用，默认为全部可用，工单管理员（拥有查看工单全部权限）不受该条件显示，具体使用场景为：</p>
                <p>1.  新建工单时，工单类型仅【可见团队】可以使用，查看不受影响；</p>
                <p>2.  工单池中的工单，仅该工单类型设置的可见团队才可查看；</p>
              </div>
              <i class="el-icon-question" />
            </el-tooltip>
          </h2>
          <p>工单支持多种工单类型，可以添加或配置不同类型的工单来分类处理业务，一个工单类型中可以定义表单、流程及附加组件</p>
        </div>
        <div class="lh-52">
          <el-button type="primary" :loading="false" @click="addTaskType">
            <i class="iconfont icon-add2" style="font-size: 12px;"></i> 新建
          </el-button>
        </div>
      </div>
      <div
        class="task-type-list"
        id="task-type-list-guide"
      >
        <task-type-item
          class="task-type-item"
          v-for="item in taskTypeList"
          :key="item.id"
          :task-type="item"
          :team-list="teamList"
          :type-num="enableTypeNum"
          :max-type-num="maxTypeNum"
          @update="fetchTaskTypeList"
          @updateAttr="obj => {
            updateTaskType(item, obj)
        }">
        </task-type-item>
      </div>
    </div>

    <!-- 新建工单类型弹窗 -->
    <add-task-type-dialog :visiable.sync="isAddTaskTypeModal" :task-type-list="taskTypeList"/>
  </div>
</template>

<script>
import draggable from 'vuedraggable';

/** api */
import * as SettingApi from '@src/api/SettingApi';

/** component */
import TaskNavBar from '../../components/TaskNavBar.vue';
import TaskTypeItem from './components/TaskTypeItem.vue';
import AddTaskTypeDialog from './components/AddTaskTypeDialog';

// 新存储工具方法
import { storageGet, storageSet } from '@src/util/storage.ts';
/* enum */
import StorageModuleEnum from '@model/enum/StorageModuleEnum';

const { TASK_TYPE_SETTING_GUIDE } = require('@src/component/guide/taskSettingStore');

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
    // /** 工单类型排序 (不做拖拽排序，统一后端排序) */
    // updateTaskTypeOrder(data) {
    //   let params = {};
    //   this.taskTypeList.forEach((item, idx) => {
    //     params[item.id] = idx +1;
    //   })

    //   SettingApi.taskTypeOrder(params).then(() => {
    //     console.log('updateTaskTypeOrder success');
    //   }).catch(err => {
    //     console.log('updateTaskTypeOrder => err', err);
    //   });
    // },
    /** 获取工单类型列表 */
    fetchTaskTypeList() {
      this.pendding = true;
      return SettingApi.getTaskTypeManage().then((res) => {
        this.pendding = false;
        let {tagListJson, taskTypeListJson, maxTypeNum} = res;

        this.maxTypeNum = maxTypeNum;
        this.teamList = tagListJson || [];
        taskTypeListJson = taskTypeListJson || [];

        // 排序
        this.taskTypeList = taskTypeListJson.sort(
          (a, b) => (a.orderId > b.orderId && a.enabled > b.enabled));
      }).catch(err => {
        console.error('fetch taskTypeList => error', err);
      })
        .finally(() => {
          this.pendding = false;
        })
    },
  },
  async mounted() {
    await this.fetchTaskTypeList();

    this.$nextTick(async() => {
      const guideStore = await storageGet(TASK_TYPE_SETTING_GUIDE, 0, StorageModuleEnum.Task);
      if (guideStore > 0) return this.$Guide().destroy('task-manange-guide');

      this.$Guide([{
        id: 'task-manange-guide',
        content: '工单类型以卡片的形式存在，单个卡片代表一个工单类型',
        haveStep: true,
        needCover: true,
        nowStep: 1,
        domObj: () => {
          return document.getElementById('task-manage-header-guide')
        },
        finishBtn: 'ok',
      }, {
        id: 'task-manange-guide',
        content: '可用编辑功能，调整可用团队。',
        haveStep: true,
        needCover: true,
        inside: true,
        nowStep: 2,
        domObj: () => {
          return document.getElementById('task-type-list-guide').getElementsByClassName('task-type-item')[0]
        },
        insideDom: () => {
          return document.getElementById('task-type-list-guide').getElementsByClassName('task-type-item')[0].getElementsByClassName('task-type-team-setting')[0]
        },
        finishBtn: 'ok',
      }], 0, '', (e) => {
        return new Promise((resolve, reject) => {
          resolve()
        })
      }).create()
        .then(res_ => { 
          if(res_) storageSet(TASK_TYPE_SETTING_GUIDE, '2', StorageModuleEnum.Task);
        })
    })
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
  height: 100vh;
  padding: 12px;
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
      .el-icon-question{
        color: #666666;
      }
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
</style>