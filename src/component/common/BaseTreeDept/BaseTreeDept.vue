<template>
  <div class="base-tree">
    <base-tree-dept-node 
      v-for="node in data" 
      :expand="expand"
      :key="node.id" 
      :node="node" 
      :node-render="nodeRender"
      :selected="selected"
      :show-checkbox="showCheckbox"
      @node-click="$emit('node-selected', $event)" 
      @node-check="$emit('node-check', $event)"
      @selected-change="selectedChange"
    >
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
      type: Array,
      default: () => []
    },
    showCheckbox: {
      type: Boolean,
      default: false
    },
    nodeRender: Function,
    expand: {
      type: Boolean,
      default: false
    },
  },
  computed: {
    /* 选中的节点对象 key: node.id, value: node */
    // selectedNodeMap() {
    //   return (
    //     this.selected.reduce((accumulator = {}, currentNode = {}) => {
    //       accumulator[currentNode.id] = currentNode
    //       return accumulator
    //     }, {})
    //   )
    // }
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
