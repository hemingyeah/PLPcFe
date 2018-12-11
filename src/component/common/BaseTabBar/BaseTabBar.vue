<template>
  <div class="base-tabbar">
    <slot name="" v-if="$slots.head"></slot>
    <div 
      v-for="t in tabs" :key="t.component"
      class="base-tabbar-item" :class="{'base-tabbar-selected': t.component === value}"
      @click="selectTab(t)">
      <slot :name="`${t.component}__tab`">
        {{t.displayName}}
      </slot>
    </div>
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
  methods: {
    selectTab(tab) {
      this.$emit('input', tab.component);
    },
  },
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
    background-color: $color-regular;
    bottom: 0;
    z-index: 1;
  }

  .base-tabbar-item {
    min-width: 80px;
    line-height: 24px;
    padding: 12px 10px;
    font-size: 14px;
    color: #444;
    text-align: center;
    cursor: pointer;
    transition: color ease .15s;
    background: $color-regular;
    flex-grow: 1;
    font-weight: normal;
    position: relative;

    i.iconfont{
      font-size: 14px;
      margin: 5px;
    }
  }

  .base-tabbar-item:hover,
  .base-tabbar-item.base-tabbar-selected {
    background: #CFEAE9;
    color: #55B7B4;
    &:after {
      content: '';
      position: absolute;
      height: 2px;
      background: $color-primary;
      left: 0;
      bottom: -2px;
      transition: left ease .15s;
      z-index: 9;
      width: 100%;

    }
  }
}
</style>


