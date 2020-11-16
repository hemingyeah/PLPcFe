<template>
  <draggable
    class="dragArea"
    tag="ul"
    :list="tasks"
    :group="{ name: 'g1' }"
    @add="arrUpdate"
    handle=".handle"
    :disabled="disable"
  >
    <template v-if="tasks.length > 0">
      <li
        v-for="(el, index) in tasks"
        :key="index"
        class="dragArea-root"
        :class="{ 'dragArea-root-show': el.showList }"
        @click.stop="checkRootList(index)"
      >
        <div
          class="flex-x tasks-item"
          :class="{
            'tasks-item-check': nowEditMenu.id && nowEditMenu.id == el.id,
          }"
          @mouseenter="tasksItemMove(index)"
          @mouseleave="tasksItemLeave"
        >
          <div class="flex-1 flex-x" :style="`padding-left:${deepCount * 5}px`">
            <i
              v-if="el.tasks.length > 0"
              class="iconfont icon-icon_arrow arrow-right"
              :class="{ 'arrow-down': el.showList }"
              @click.stop="showRootList(index)"
            ></i>
            <div
              class="overHideCon-1"
              :class="{ 'mar-l-12': el.tasks.length <= 0 }"
            >
              {{ el.name }}
            </div>
          </div>
          <div
            class="tasks-item-menu"
            @click.stop
            v-show="nowHoverMenuShow(el)"
          >
            <el-popover
              placement="bottom"
              width="125"
              trigger="hover"
              v-model="el.popoverVisible"
            >
              <div class="item-menu-box">
                <div @click.stop="addChildArr(index)">
                  添加子集目录
                </div>
                <div v-if="el.conData && el.tasks.length <= 0">
                  编辑
                </div>
                <div @click.stop="deleteNowArr(index)">
                  删除
                </div>
              </div>
              <i slot="reference" class="iconfont icon-setting cur-point"></i>
            </el-popover>

            <i class="iconfont icon-tuozhuaipaixu handle can-move"></i>
          </div>
        </div>

        <work-tree-draggable
          :tasks="el.tasks"
          :disable="el.conData ? true : false"
          :root-data="{ id: el.id, routeName: el.routeName, deep: el.deep }"
          :now-edit-menu="nowEditMenu"
          :now-hover-menu="nowHoverMenu"
          :deep-count="deepCount * 1 + 1"
        />
      </li>
    </template>
  </draggable>
</template>
<script>
import draggable from 'vuedraggable';
import _ from 'lodash';
const arrTemp = {
  name: '目录名称',
  tasks: [],
  conData: null,
  showList: true,
};

export default {
  inject: ['nowEditMenuChange', 'nowHoverMenuChange'],
  props: {
    tasks: {
      required: true,
      type: Array,
    },
    rootData: {
      type: Object,
    },
    disable: {
      type: Boolean,
      default: false,
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
  },
  components: {
    draggable,
  },
  computed: {},
  watch: {
    tasksItemCanMove(newVal, oldVal) {
      if (this.popoverVisibleBool) return;
      this.popoverVisibleChange({});
    },
  },
  data() {
    return {
      tasksItemCanMove: -1,
    };
  },
  name: 'work-tree-draggable',
  methods: {
    showRootList(index) {
      if (this.tasks[index].tasks.length <= 0) return;
      this.tasks[index].showList = !this.tasks[index].showList;
    },
    checkRootList(index) {
      console.log(this.nowEditMenu, this.tasks[index]);
      this.nowEditMenuChange({ id: this.tasks[index].id });
      console.log(this.rootData);
    },
    addChildArr(index) {
      this.popoverVisibleChange({});
      console.log(this.$parent, this.tasks);
      this.tasks[index].popoverVisible = false;
      this.tasks[index].tasks.push(
        _.cloneDeep({
          ...arrTemp,
          deep: this.tasks[index].deep + 1,
          ...(this.rootData.routeName
            ? { routeName: `${this.rootData.routeName}/目录名称` }
            : {}),
        })
      );
    },
    deleteNowArr(index) {
      this.popoverVisibleChange({});
      this.tasks[index].popoverVisible = false;
      this.$confirm(
        '此操作将删该目录以及目录下的所有子目录, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
        .then(() => {
          this.tasks[index].tasks.splice(0, this.tasks[index].tasks.length);
        })
        .catch(() => {});
    },
    arrUpdate(e) {
      console.log(this.deepCount);
    },
    tasksItemMove(e) {
      this.nowHoverMenuChange({ id: this.tasks[e].id });
    },
    tasksItemLeave(e) {
      this.nowHoverMenuChange({});
    },
    nowHoverMenuShow(e) {
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
      width: 36px;
      height: 100%;
      top: 0;
      display: flex;
      align-items: center;
      background: #fff;
    }
  }
  .tasks-item-check {
    background: $color-primary;
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
    &:hover {
      background: $color-primary;
      color: #fff;
    }
  }
}
</style>
