<template>
  <div 
    class="base-tree-node" 
    :ref="`${node.id}_base_tree_node`"
  >
    <div 
      class="base-tree-node-content" 
      :class="{'base-tree-selected': isSelected}" :style="{paddingLeft: `${16 * deep}px`}">
      <span class="base-tree-node-arrow" :class="{'base-tree-node-arrow-down': isExpand}" @click="toggle">
        <i class="iconfont icon-arrow-right" v-if="node.children.length > 0"></i>
      </span>
      <el-checkbox v-if="showCheckbox" :value="node.isChecked" @input="input"/>
      <span class="base-tree-node-name" @click.stop="transmit(node)">
        <tree-node-content/>
      </span>
    </div>
    
    <template v-if="isExpand">
      <base-tree-dept-node 
        v-for="n in node.children" 
        :deep="deep + 1" 
        :key="n.id"
        :node="n" 
        :node-render="nodeRender"
        :selected="selected" 
        :show-checkbox="showCheckbox"
        @node-click="transmit" 
        @node-check="$emit('node-check', $event)"
      />  
    </template>

  </div>
</template>

<script>
export default {
  name: 'base-tree-dept-node',
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
      type: Array,
      default: () => []
    },
    deep: {
      type: Number,
      default: 0
    },
    showCheckbox: {
      type: Boolean,
      default: false
    },
    nodeRender: Function
  },
  data(){
    return {
      isExpand: this.expand === true
    }
  },
  computed: {
    /** 
     * @description 是否选中
     * -- 后面考虑下性能
    */
    isSelected(){
      let isSelected = false
      
      try {
        isSelected = this.selected.some(item => {
          return JSON.stringify(this.node) == JSON.stringify(item)
        })
      } catch (error) {
        console.warn('base-tree-dept-node -> isSelected -> error', error)
      }
      
      return isSelected
    }
  },
  watch: {
    selected(newValue) {
      this.$emit('selected-change')
    }
  },
  methods: {
    transmit(node){
      this.$emit('node-click', node);
    },
    toggle(){
      if(this.node.children.length == 0) return;
      this.isExpand = !this.isExpand;
    },
    input(value){
      this.$emit('node-check', {node: this.node, value})
    }
  },
  components: {
    TreeNodeContent: {
      name: 'tree-node-content',
      render(h){
        const parent = this.$parent;
        const node = parent.node;
        
        return (
          parent.nodeRender 
            ? parent.nodeRender(h, parent.node) 
            : <span>{node.tagName}</span>
        )
      }
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
  align-items: center;
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

.base-tree-node .el-checkbox{
  margin: 0;
}
</style>