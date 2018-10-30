<template>
  <div class="base-tabbar">
    <slot name="" v-if="$slots.head"></slot>
    <div 
      v-for="t in tabs" :key="t.component"
      class="base-tabbar-item" :class="{'base-tabbar-selected': t.component === value}"
      @click="selectTab(t)">
      <slot :name="`${t.component}__tab`">{{t.displayName}}</slot>       
    </div>
    <div class="base-tabbar-line" :style="borderStyle"></div>
  </div>
</template>

<script>
export default {
  name: "base-tabbar",
  props: {
    tabs: {
      type: Array,
      default: () => ([])
    },
    value: String
  },
  data() {
    return {
      borderStyle: {
        left: '0px',
        width: '0px',
      }
    }
  },
  mounted() {
    this.resetTabOffset();
    window.addEventListener('resize', this.computeOffset)
  },
  methods: {
    selectTab(tab) {
      this.$emit('input', tab.component)
      this.resetTabOffset()
    },
    //设置底部线的偏移量
    resetTabOffset(){
      this.$nextTick(() => {
        let target = this.$el.querySelector('.base-tabbar-selected');
        this.borderStyle = {
          left: `${target.offsetLeft}px`,
          width: `${target.offsetWidth}px`,
        }
      })
    }
  },
  watch: {
    value(newVal){
      this.resetTabOffset();
    }
  }
}
</script>

<style lang="scss">
.base-tabbar{
  display: flex;
  padding-bottom: 2px;
  position: relative;
  margin: 0;
  
  &:after{
    content: "";
    position: absolute;
    width: 100%;
    height: 2px;
    background-color: #e4e7ed;
    bottom: 0;
    z-index: 1;
  }

  .base-tabbar-item {
    min-width: 80px;
    line-height: 20px;
    padding: 12px 10px;
    font-size: 14px;
    color: #444;
    text-align: center;
    cursor: pointer;
    transition: color ease .15s;
    font-weight: 500;

    i.iconfont{
      font-size: 14px;
      margin: 5px;
    }
  }

  .base-tabbar-item + .base-tabbar-item{
    margin-left: 25px;
  }

  .base-tabbar-item:hover,
  .base-tabbar-item.base-tabbar-selected {
    color:$color-primary;
  }

  .base-tabbar-line {
    position: absolute;
    height: 2px;
    background: $color-primary;
    left: 0;
    bottom: 0;
    transition: left ease .15s;
    z-index: 9;
  }
}
</style>


