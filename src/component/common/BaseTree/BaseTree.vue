<template>
  <div class="base-tree">
    <base-tree-node 
      v-for="node in data" :key="node.id" 
      :node="node" :selected="selected" :show-checkbox="showCheckbox"
      @node-click="$emit('node-selected', $event)" 
      @node-check="$emit('node-check', $event)"/>
  </div>  
</template>

<script>
import BaseTreeNode from './BaseTreeNode.vue';

export default {
  name: 'base-tree',
  props: {
    data: {
      type: Array,
      default: () => []
    },
    selected: {
      type: Object,
      default: () => ({})
    },
    showCheckbox: {
      type: Boolean,
      default: false
    }
  },
  components: {
    [BaseTreeNode.name]: BaseTreeNode
  }
}
</script>

<style lang="scss">
.base-tree > .base-tree-node{
  padding-left: 0;
}
</style>
