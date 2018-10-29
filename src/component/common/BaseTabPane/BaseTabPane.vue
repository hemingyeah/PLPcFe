<template>
  <ul class="base-tab-pane">
    <li 
      v-for="t in tabs" :key="t.component"
      :class="{'base-tab-pane-selected': t.component === value}"
      @click="selectTab(t)">
      <slot :name="t.slotName">{{t.displayName}}</slot>       
    </li>
    <li class="base-tab-pane-line" :style="borderStyle"></li>
  </ul>
</template>

<script>
export default {
  name: "base-tab-pane",
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
    // 设置底边的宽度和左偏移
    selectTab(tab) {
      this.$emit('input', tab.component)
      this.resetTabOffset()
    },
    resetTabOffset(){
      this.$nextTick(() => {
        let target = this.$el.querySelector('.base-tab-pane-selected');
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
.base-tab-pane{
  display: flex;
  padding: 0;
  position: relative;
  margin: 0;

  li {
    flex: 1;
    list-style: none;
    line-height: 58px;
    font-size: 16px;
    color: #333333;
    text-align: center;
    cursor: pointer;
  }

  li.base-tab-pane-selected {
    color:$color-primary;
  }

  li.base-tab-pane-line {
    width: 100px;
    height: 2px;
    background: $color-primary;
    position: absolute;
    left: 0;
    bottom: 0;
    transition: all .2s ease;
  }
}
</style>


