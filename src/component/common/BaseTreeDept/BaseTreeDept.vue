<template>
  <div class="base-tree">
    <base-tree-dept-node 
      v-for="node in data" :key="node.id" 
      :node="node" :selected="selected" :show-checkbox="showCheckbox"
      @node-click="$emit('node-selected', $event)" 
      @node-check="$emit('node-check', $event)"
      @selected-change="selectedChange"
      :node-render="nodeRender">
    </base-tree-dept-node>
  </div>  
</template>

<script>
import BaseTreeDeptNode from './BaseTreeDeptNode.vue';

export default {
  name: 'base-tree-dept',
  props: {
    data: {
      type: Array,
      default: () => []
    },
    isAutoOpenTree: {
      type: Boolean,
      default: true,
    },
    selected: {
      type: Object,
      default: () => ({})
    },
    showCheckbox: {
      type: Boolean,
      default: false
    },
    nodeRender: Function
  },
  methods: {
    selectedChange() {
      if(!this.isAutoOpenTree) return;
    },
  },
  components: {
    [BaseTreeDeptNode.name]: BaseTreeDeptNode
  }
}
</script>

<style lang="scss">
.base-tree > .base-tree-node{
  padding-left: 0;
}
</style>
