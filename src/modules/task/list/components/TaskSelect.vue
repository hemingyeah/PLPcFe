<template>
  <div class="common-list-filter-select" v-if="show">
    <div
      class="common-list-filter-select-option"
      v-for="(item, index) in list"
      :key="index"
      @click="checkId(index)"
      :class="{ 'common-list-filter-select-active': id === index }"
    >
      {{ item }}
    </div>
  </div>
</template>
<script>
export default {
  props: {
    list: {
      type: Array,
      default: [1, 2, 3, 4, 5, 6, 7], // 筛选列表
    },
    show: {
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
    checkId(index) {
      this.id = index;
    },
  },
};
</script>
<style lang="scss">
.common-list-filter-select {
  background-color: #fff;
  border: 1px solid #eee;
  position: absolute;
  right: 0;
  top: 40px;
  border-radius: 3px;
  padding-top: 3px;
  z-index: 100;
  cursor: pointer;
  &-option {
    padding: 3px 20px;
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
</style>
