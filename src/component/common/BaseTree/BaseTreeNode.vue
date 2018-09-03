<template>
  <div class="base-tree-node">
    <div class="base-tree-node-content" :class="{'base-tree-selected': isSelected}" :style="{paddingLeft: `${16 * deep}px`}">
      <span class="base-tree-node-arrow" :class="{'base-tree-node-arrow-down': isExpand}" @click="toggle"><i class="iconfont icon-arrow-right" v-if="node.subDepartments.length > 0"></i></span>
      <span class="base-tree-node-name"  @click.stop="transmit(node)">{{node.name}}</span>
    </div>
    
    <template v-if="isExpand">
      <base-tree-node v-for="n in node.subDepartments" :key="n.id"
        :node="n" :selected="selected" :deep="deep + 1"
        @node-click="transmit"/>  
    </template>
  </div>
</template>

<script>
export default {
  name: 'base-tree-node',
  props: {
    node: {
      type: Object,
      default: () => ({})
    },
    expand: {
      type: Boolean,
      default: false
    },
    selected: {
      type: Object,
      default: () => ({})
    },
    deep: {
      type: Number,
      default: 0
    }
  },
  data(){
    return {
      isExpand: this.expand === true
    }
  },
  computed: {
    isSelected(){
      return this.node == this.selected;
    }
  },
  methods: {
    transmit(node){
      this.$emit('node-click',node);
    },
    toggle(){
      if(this.node.subDepartments.length == 0) return;
      this.isExpand = !this.isExpand;
    }
  }
}
</script>

<style lang="scss">
.base-tree-node{
  position: relative;
  font-size: 14px;
  margin: 2px 0;
}

.base-tree-node-content{
  display: flex;
  flex-flow: row nowrap;
  line-height: 28px;
  cursor: pointer;
  transition: background-color ease .15s,
              color ease .15s;

  &:hover,
  &.base-tree-selected{
    background-color: $color-primary-hover;
    color: $color-primary;
    border-radius: 2px;
  }
}

.base-tree-node-arrow{
  color: #97a8be;
  width: 20px;
  text-align: center;

  &.base-tree-node-arrow-down{
    transform: rotateZ(45deg)
  }

  i{
    font-size: 14px !important;
    font-style: normal !important;
    line-height: 28px !important;
  }
}

.base-tree-node-name{
  flex: 1;  
  padding: 0 5px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>