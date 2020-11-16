<template>
  <div class="work-tree-box">
    <base-collapse class="modal-box" :right-size="3">
      <template slot="left">
        <div class="draggable-box">
          <div class="flex-1 draggable-data">
            <work-tree-draggable
              ref="workTreeDraggable"
              :tasks="treeData.tasks"
              :root-data="{ id: treeData.id, deep: 0 }"
              :now-edit-menu="nowEditMenu"
              :now-hover-menu="nowHoverMenu"
              :deep-count="0"
            />
          </div>
          <div class="flex-x">
            <el-button @click.stop="changeAll"
            >全部{{ allType ? '折叠' : '展开' }}</el-button
            >
            <el-button @click.stop="changeDialog('addMenu')"
            >新建一级目录</el-button
            >
          </div>
        </div>
      </template>
      <template slot="right">
        <div class="data-box">
          <work-tree-data />
      </div> </template
    ></base-collapse>

    <!--  -->
    <public-dialog
      :visible-prop="visibleProp"
      @changeVisibleProp="changeVisibleProp"
      @confirm="addMenuDialogConfirm"
      :dialog-type="dialogType"
    ></public-dialog>
    <!--  -->
  </div>
</template>
<script>
import workTreeDraggable from '@src/modules/productV2/productMenu/WorkTree/workTreeDraggable';
import WorkTreeData from '@src/modules/productV2/productMenu/WorkTree/WorkTreeData';
import PublicDialog from '@src/modules/productV2/productMenu/WorkTree/compoment/PublicDialog';
export default {
  provide() {
    return {
      nowEditMenuChange: this.nowEditMenuChange,
      nowHoverMenuChange: this.nowHoverMenuChange,
    };
  },
  data() {
    return {
      allType: true,
      visibleProp: false,
      dialogType: 'addMenu',
      treeData: {
        id: 0,
        deep: 0,
        tasks: [
          {
            name: 1, // 目录名称
            id: 1, // 目录id
            routeName: '1/', // 路由名称
            showList: true, // 是否是展开状态
            conData: false, // 是否有内容
            routerIndex: '0|1', // 后端拼接
            deep: 1,
            tasks: [
              // 子目录
              {
                name: 1.1,
                id: 1.1,
                routeName: '1/1.1', // 路由名称
                showList: true,
                deep: 2,
                tasks: [
                  {
                    name: 1.11,
                    routeName: '1/1.1/1.11', // 路由名称
                    id: 1.11,
                    deep: 3,
                    parentId: 1.1,
                    showList: true,
                    tasks: [
                      {
                        name: 1.111,
                        routeName: '1/1.1/1.11/1.111', // 路由名称
                        id: 1.111,
                        deep: 4,
                        parentId: 1.11,
                        showList: true,
                        tasks: [
                          {
                            name: 1.1111,
                            routeName: '1/1.1/1.11/1.111', // 路由名称
                            id: 1.1111,
                            deep: 5,
                            parentId: 1.111,
                            showList: true,
                            tasks: [
                              {
                                name: 1.11111,
                                routeName: '1/1.1/1.11/1.111/1.1111', // 路由名称
                                id: 1.11111,
                                deep: 6,
                                parentId: 1.1111,
                                showList: true,
                                tasks: [],
                                conData: false,
                              },
                              {
                                name: 1.11112,
                                routeName: '1/1.1/1.11/1.111/1.1112', // 路由名称
                                id: 1.11112,
                                deep: 6,
                                parentId: 1.1111,
                                showList: true,
                                tasks: [],
                                conData: false,
                              },
                            ],
                            conData: false,
                          },
                        ],
                        conData: false,
                      },
                    ],
                    conData: false,
                  },
                ],
                conData: false,
              },
              {
                name: 1.2,
                routeName: '1/1.2', // 路由名称
                id: 1.2,
                deep: 2,
                tasks: [],
                showList: true,
                conData: true,
              },
            ],
          },
        ],
      },
      httpPending: [],
      nowEditMenu: {},
      nowHoverMenu: {},
      popoverVisible: {},
    };
  },
  components: {
    workTreeDraggable,
    WorkTreeData,
    PublicDialog,
  },
  methods: {
    changeVisibleProp(e) {
      this.visibleProp = e;
    },
    changeAll() {
      this.allType = !this.allType;
      this.forAllArr(this.treeData.tasks, this.allType);
      window.parent.changeLinkPage()
    },
    forAllArr(obj, val) {
      for (let index = 0; index < obj.length; index++) {
        let item = obj[index];
        item.showList = val;
        try {
          if (item.tasks.length > 0) {
            this.forAllArr(item.tasks, val);
          }
        } catch (error) {}
      }
    },
    addMenuDialogConfirm(e) {
      this.treeData.tasks.push({
        name: e.name,
        tasks: [],
        conData: null,
        showList: true,
      });
    },
    changeDialog(type) {
      this.dialogType = type;
      this.changeVisibleProp(true);
    },
    nowEditMenuChange(e) {
      this.$set(this, 'nowEditMenu', e);
    },
    nowHoverMenuChange(e) {
      this.$set(this, 'nowHoverMenu', e);
    },
  },
};
</script>
<style lang="scss">
@import url(../../linkc/assets/public.scss);

.work-tree-box {
  min-width: 300px;
  height: 100vh;
  overflow: hidden;

  .modal-box {
    .draggable-box {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100vh;
      overflow-x: hidden;
      .draggable-data {
        min-width: 250px;
        overflow-y: scroll;
        &::-webkit-scrollbar {
          width: 0 !important;
        }
        -ms-overflow-style: none;
        overflow: -moz-scrollbars-none;
      }
    }
    .data-box {
      height: 100vh;
      overflow-y: scroll;
      &::-webkit-scrollbar {
        width: 0 !important;
      }
      -ms-overflow-style: none;
      overflow: -moz-scrollbars-none;
    }
  }
}
</style>
