<template>
  <!-- <div
    class="common-list-filter-select"
    v-if="show"
    :class="{ postion: right, left: !right }"
  >
    <div
      class="common-list-filter-select-option"
      v-for="(item, index) in list"
      :key="index"
      @click="checkId(index, item)"
    >
      {{ item.name }}
    </div>
  </div> -->
  <el-dropdown-menu slot="dropdown">
    <el-dropdown-item v-for="(item, index) in list" :key="index"
      >{{item.name}}</el-dropdown-item
    >
  </el-dropdown-menu>
</template>
<script>
// :class="{ 'common-list-filter-select-active': id === index }"
export default {
  props: {
    list: {
      type: Array,
      default: [], // 筛选列表
    },
    show: {
      type: Boolean,
      default: false,
    },
    right: {
      type: Boolean,
      default: false,
    },
  },
  name: "TaskSelect",
  data() {
    return {
      id: "",
    };
  },
  methods: {
    checkId(index, item) {
      this.id = index;
      this.$emit("checkOther", item);
    },
  },
};
</script>
<style lang="scss" scoped>
.common-list-filter-select {
  background-color: #fff;
  border: 1px solid #eee;
  position: absolute;
  top: 40px;
  border-radius: 3px;
  padding-top: 3px;
  z-index: 100;
  cursor: pointer;
  &-option {
    padding: 3px 20px;
    min-width: 130px;
    line-height: 20px;
    color: #777;
    font-size: 14px;
    transition: background-color ease 0.3s, color ease 0.3s,
      border-color ease 0.3s;
    &:hover {
      background-color: #55b7b4;
      color: #fff;
    }
  }
  &-active {
    background-color: #55b7b4;
    color: #fff;
  }
}
.postion {
  right: 0;
}
.left {
  left: 0;
}
</style>
