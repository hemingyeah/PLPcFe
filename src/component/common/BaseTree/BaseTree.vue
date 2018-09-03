<template>
  <div class="base-tree">
    <base-tree-node v-for="node in data" :key="node.id" 
      :node="node" :selected="selected"
      @node-click="transmit"/>
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
    }
  },
  methods: {
    transmit(node){
      this.$emit('node-selected',node)
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
