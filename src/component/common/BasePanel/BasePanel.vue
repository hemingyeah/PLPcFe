<template>
  <transition 
    name="slide-left"
    @after-leave="$emit('closed')">
    <div v-show="show" class="base-panel-mask" @click.self="close">
      <div class="base-panel transition__container" :style="{width: width}">
        <slot></slot>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'base-panel',
  props: {
    show: { //是否显示组件
      type: Boolean,
      default: false
    },
    width: {
      type: String,
      default: '360px'
    }
  },
  methods: {
    close(){
      this.$emit('close');
      //兼容sync
      this.$emit('update:show', false);
    }
  }
}
</script>

<style lang="scss">
.base-panel-mask{
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: transparent;
  z-index: 999;
  overflow-x: hidden;
  overflow-y: auto;
}

.base-panel{
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  background-color: #fff;
  box-shadow: -1px 0 8px rgba(0,0,0,0.125);
  color: #333;
}
</style>
