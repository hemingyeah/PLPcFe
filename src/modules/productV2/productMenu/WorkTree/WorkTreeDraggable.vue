<template>
  <draggable class="dragArea"
             tag="ul"
             :list="tasks"
             :group="{ name: 'g1' }"
             @add="addArr"
             @update="arrUpdate"
             @choose="arrChoose"
             handle=".handle"
             :disabled="rootData.banMoveIn">
    <template v-if="tasks.length > 0">
      <li v-for="(el, index) in tasks"
          :key="el.id"
          class="dragArea-root"
          :class="{ 'dragArea-root-show': el.showList }"
          @click.stop="checkRootList(index)">
        <div class="flex-x tasks-item"
             :class="{
               'tasks-item-check': nowEditMenu.id && nowEditMenu.id == el.id,
               'tasks-item-hover': nowHoverMenuShow(el)
             }"
             @mouseenter="tasksItemMove(index)"
             @mouseleave="tasksItemLeave">
          <div class="flex-1 flex-x"
               :style="`padding-left:${deepCount * 8}px`">
            <i v-if="el.tasks.length > 0"
               class="iconfont icon-icon_arrow arrow-right font-16"
               :class="{ 'arrow-down': el.showList }"
               @click.stop="showRootList(index)"></i>
            <div class="overHideCon-1 catalog-item"
                 :class="{ 'mar-l-12': el.tasks.length <= 0 }">
              {{ el.name }}
            </div>
          </div>
          <div class="tasks-item-menu"
               @click.stop
               v-show="nowHoverMenuShow(el)">
            <el-popover placement="bottom"
                        width="125"
                        trigger="hover"
                        v-model="el.popoverVisible">
              <div class="item-menu-box">
                <div @click.stop="addChildArr(index)"
                     v-show="!el.conData">
                  添加子集类型
                </div>
                <div @click.stop="renameChildArr(index)">
                  重命名
                </div>
                <div @click.stop="deleteNowArr(index)">
                  删除
                </div>
              </div>
              <i slot="reference"
                 class="iconfont icon-setting cur-point "
                 :class="{'color-primary': el.popoverVisible}"></i>
            </el-popover>

            <i class="iconfont icon-tuozhuaipaixu handle can-move mar-l-8"></i>
          </div>
        </div>

        <work-tree-draggable :tasks="el.tasks"
                             :root-data="{
                               id: el.id,
                               banMoveIn: el.tasks.conData == 1 ? true : false,
                               indexArr: [...rootData.indexArr, index],
                               pathNameArr: [...rootData.pathNameArr, el.name],
                             }"
                             :now-edit-menu="nowEditMenu"
                             :now-hover-menu="nowHoverMenu"
                             :deep-count="deepCount * 1 + 1"
                             :sort-menu="sortMenu" />
      </li>
    </template>
  </draggable>
</template>
<script>
import draggable from "vuedraggable";
import _ from "lodash";
import { sortTreeList, delTreeList } from "@src/api/ProductV2Api";
const arrTemp = {
  name: "类型名称",
  tasks: [],
  conData: null,
  showList: 1,
};

export default {
  inject: ["rootDataChange", "changeDialog", "getTreeData", "changeTree"],
  props: {
    tasks: {
      required: true,
      type: Array,
    },
    rootData: {
      type: Object,
    },
    nowEditMenu: {
      type: Object,
    },
    nowHoverMenu: {
      type: Object,
    },
    deepCount: {
      type: Number | String,
    },
    sortMenu: {
      type: Object,
    },
  },
  components: {
    draggable,
  },
  computed: {},
  data () {
    return {};
  },
  name: "work-tree-draggable",
  methods: {
    showRootList (index) {
      if (this.tasks[index].tasks.length <= 0) return;
      this.tasks[index].showList = 1 - this.tasks[index].showList;
    },
    checkRootList (index) {
      if (this.nowEditMenu.id == this.tasks[index].id) return
      this.rootDataChange("nowEditMenu", {
        id: this.tasks[index].id,
        canEditConData: !(this.tasks[index].tasks.length > 0),
        conData: this.tasks[index].conData,
        name: this.tasks[index].name,
        indexArr: [...this.rootData.indexArr, index],
        nowIndex: index
      });
    },
    addChildArr (index) {
      let nowMenu = this.tasks[index];
      this.rootDataChange("childData", {
        id: nowMenu.id,
        pathName: nowMenu.pathName,
        indexArr: [...this.rootData.indexArr, index],
        pathNameArr: [...this.rootData.pathNameArr, nowMenu.name],
        orderId: nowMenu.tasks.length
      });
      this.changeDialog("addMenuChild");
      this.tasks[index].popoverVisible = false;
    },
    deleteNowArr (index) {
      this.tasks[index].popoverVisible = false;

      this.$confirm(
        "此操作将删除该类型以及类型下的所有子类, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(() => {
          delTreeList({
            ids: [this.tasks[index].id],
          }).then((res) => {
            if (res.code == 0) {
              this.changeTree(
                "delete",
                [...this.rootData.indexArr],
                index,
                this.tasks[index]
              );
            } else {
              this.$notify.error({
                title: "网络错误",
                message: res.message,
                duration: 2000,
              });
            }
          });
        })
        .catch(() => { });
    },
    renameChildArr (index) {
      let nowMenu = this.tasks[index];
      this.rootDataChange("childData", {
        id: nowMenu.id,
        pathName: nowMenu.pathName,
        indexArr: [...this.rootData.indexArr, index],
        pathNameArr: this.rootData.pathNameArr,
        name: nowMenu.name,
        nowIndex: index,
      });
      this.changeDialog("renameMenuChild");
      this.tasks[index].popoverVisible = false;
    },
    arrUpdate (e) {
      let obj = {
        id: this.sortMenu.id,
        parentId: this.rootData.id,
        pathName: [
          ..._.cloneDeep(this.rootData.pathNameArr),
          this.sortMenu.name,
        ].join("/"),
        orderId: e.newIndex,
        showList: this.sortMenu.showList,
      };
      sortTreeList(obj).then((res) => {
        if (res.code == 0) {
          this.sortMenu.pathName = res.result.pathName;
          this.sortMenu.parentId = res.result.parentId;
          this.rootDataChange("sortMenu", this.sortMenu);
        } else {
          this.$notify.error({
            title: "网络错误",
            message: res.message,
            duration: 2000,
          });
          this.getTreeData();
        }
      });
    },
    addArr (e) {
      let obj = {
        id: this.sortMenu.id,
        parentId: this.rootData.id,
        pathName: [
          ..._.cloneDeep(this.rootData.pathNameArr),
          this.sortMenu.name,
        ].join("/"),
        orderId: e.newIndex,
        showList: this.sortMenu.showList,
      };
      sortTreeList(obj).then((res) => {
        if (res.code == 0) {
          this.sortMenu.pathName = res.result.pathName;
          this.sortMenu.parentId = res.result.parentId;
          this.rootDataChange("sortMenu", this.sortMenu);
        } else {
          this.$notify.error({
            title: "网络错误",
            message: res.message,
            duration: 2000,
          });
          this.getTreeData();
        }
      });
    },
    arrChoose (e) {
      this.rootDataChange("sortMenu", this.tasks[e.oldIndex]);
    },
    tasksItemMove (e) {
      this.rootDataChange("nowHoverMenu", { id: this.tasks[e].id });
    },
    tasksItemLeave (e) {
      this.rootDataChange("nowHoverMenu", {});
    },
    nowHoverMenuShow (e) {
      return e.popoverVisible
        ? true
        : this.nowHoverMenu && this.nowHoverMenu.id == e.id;
    },
  },
};
</script>
<style lang="scss" scoped>
ul {
  padding-inline-start: 0;
  li {
    list-style: none;
    padding: 0px;
    margin: 0px;
  }
}

.dragArea {
  background: #fff;
  .dragArea-root {
    height: 40px;
    overflow: hidden;
    transition: all 0.8s;
  }
  .dragArea-root-show {
    height: auto;
  }
  .flex-1 {
    flex: 1;
  }
  .overHideCon-1 {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    overflow: hidden;
    white-space: normal;
    word-wrap: break-word;
    word-break: break-all;
  }

  .tasks-item {
    position: relative;
    padding-left: 10px;
    padding-right: 10px;
    // &:hover{
    //   background: #E6FFFB;
    // }
    &:active {
      background: #e6fffb;
    }
    .arrow-right {
      transition: all 0.5s;
      transform: rotateZ(0);
      font-size: 12px;
      color: #999;
      cursor: pointer;
    }
    .arrow-down {
      transform: rotateZ(90deg);
    }
    height: 40px;
    .tasks-item-menu {
      position: absolute;
      right: 0;
      min-width: 36px;
      height: 100%;
      padding: 0 12px;
      top: 0;
      display: flex;
      align-items: center;
      background: #e6fffb;
    }
  }
  .tasks-item-check {
    .catalog-item {
      color: $color-primary;
    }
  }
  .tasks-item-hover {
    background: #e6fffb;
  }
  .can-move {
    cursor: move;
  }
  .cur-point {
    cursor: pointer;
  }
}
.item-menu-box {
  div {
    cursor: pointer;
    padding: 10px 20px;
    &:hover {
      background: #e5fffb;
    }
  }
}
</style>
<style lang="scss">
.el-popover {
  padding: 6px 0;
}
</style>
