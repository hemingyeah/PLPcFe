<template>
  <transition 
    name="slide-down"
    @after-leave="$emit('transitionend')">
    <div v-show="show" class="base-modal-mask">
      <div class="base-modal transition-container" :style="{width: width}">
        <div class="base-modal-header">
          <slot name="header">
            <h3>{{ title }}</h3>
            <button type="button" class="btn-text base-modal-header-close" @click="close">
              <i class="iconfont icon-guanbi"></i>
            </button>
          </slot>
        </div>
        <div class="base-modal-body"><slot></slot></div>  
        <div class="base-modal-footer" v-if="$slots.footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: "base-modal",
  props: {
    show: { //是否显示组件
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    width: {
      type: String,
      default: '640px'
    }
  },
  methods: {
    close(){
      this.$emit('modal-close');
      //兼容sync
      this.$emit('update:show', false);
    },
    escClose(event){
      if(this.show && event.keyCode == 27){
        this.close();
      }
    }
  },
  mounted(){
    document.addEventListener('keydown', this.escClose)
  },
  destroyed(){
    document.removeEventListener('keydown', this.escClose)
  }
}
</script>

<style lang="scss">
.base-modal-mask{
  @include mask();
  z-index: 9999;
  overflow: auto;
}

.base-modal{
  position: relative;
  margin: 50px auto;
  background-color: #fff;
  border-radius: 1px;
  box-shadow: 1px 2px 4px rgba(0,0,0,0.15);
  color: #333;
}

.base-modal-header{
  position: relative;
  padding: 8px 40px 8px 8px;
  border-bottom: 1px solid #e9ecef;

  align-items: center;

  h3{
    flex: 1;
    margin: 0;
    height: 24px;
    line-height: 24px;
    font-size: 16px;
    font-weight: 400;

    @include text-ellipsis()
  }

  &-close{
    position: absolute;
    right: 0;
    top: 0;
    height: 40px;
    width: 40px;
    padding: 8px;
    margin: 0;
    outline: none;

    font-size: 14px;
    color: #999;

    &:hover{
      color: #e84040;
    }
  }
}
.base-modal-body{

}
</style>
