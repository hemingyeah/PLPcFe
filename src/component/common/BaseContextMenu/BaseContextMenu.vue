<template>
  <div class="base-context-menu" :style="style" @click.stop="close">
    <slot></slot>
    <!-- <div class="base-context-menu-line"></div>
    <base-context-menu-item @click="close">关闭</base-context-menu-item> -->
  </div>
</template>

<script>
export default {
  name: 'base-context-menu',
  props: {
    for: {
      type: String,
      required: true
    }
  },
  data(){
    return {
      top: 0,
      left: 0,
      opacity: 0,
      show: false,

      $target: null,
      menuHandler: e => this.showMenu(e),
      closeHandler: e => this.closeMenu(e)
    }
  },
  computed: {
    style(){
      return {
        left: `${this.left}px`,
        top: `${this.top}px`,
        opacity: this.opacity,
        display: this.show ? 'block' : 'none'
      }
    }
  },
  methods: {
    exec(command){
      let event = {target: this.$data.$target, command}
      this.$emit('command', event)
    },
    close(){
      this.show = false;
    },
    showMenu(event){
      if(this.$el.contains(event.target)) return event.preventDefault();

      let target = event.target.closest(this.for);
      if(null == target) return this.show = false;

      event.preventDefault();
      this.top = event.clientY;
      this.left = event.clientX;
      this.opacity = 0;
      this.show = true;
      this.$data.$target = target;
      
      this.$nextTick(this.updatePosition)
    },
    updatePosition(){
      // TODO: 更新位置
      this.opacity = 1;
    },
    closeMenu(event){
      this.show = false
    }
  },
  mounted(){
    document.addEventListener('contextmenu', this.menuHandler)
    document.addEventListener('click', this.closeHandler)
  },
  destroyed(){
    document.removeEventListener('contextmenu', this.menuHandler)
    document.removeEventListener('click', this.closeHandler)
  }
}
</script>

<style lang="scss">
.base-context-menu{
  position: fixed;
  background-color: #fff;
  box-shadow: 1px 1px 8px rgba(0, 21, 41, 0.175);
  z-index: 9999;
  padding: 5px 0;
  border-radius: 2px;
  user-select: none;
}

.base-context-menu-line{
  margin: 5px 0;
  border-bottom: 1px solid #e6e6e6;
}
</style>

