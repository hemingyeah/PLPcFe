<template>
  <transition
    name="modal-fade"
    @after-leave="closed">
    <div v-show="show" class="base-modal-mask" @click.self="maskClose">
      <div :class="{
        'base-modal': true,
        'transition__container': true,
        'base-modal-fullscreen': isFullscreen
      }" :style="{width: width}">
        <div class="base-modal-header">
          <slot name="header">
            <slot name="title">
              <h3 v-if="title">{{title}}</h3>
            </slot>
            <button type="button" v-if="allowFullscreen" @click="isFullscreen = !isFullscreen">
              <i class="iconfont icon-quanping"></i>
            </button>
            <button type="button" class="base-modal-header-close" @click="cancel" v-if="closeable">
              <i class="iconfont icon-fe-close"></i>
            </button>
          </slot>
        </div>
        <div :class="['base-modal-body', bodyClass]">
          <slot></slot>
        </div>
        <div class="base-modal-footer" v-if="$slots.footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { scrollBarWidth as getScrollBarWidth, hasClass, removeClass, addClass, getStyle } from '@src/util/dom';

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
    },
    closeable: { //是否能手动关闭
      type: Boolean,
      default: true
    },
    maskCloseable: {//是否允许点击遮罩关闭
      type: Boolean,
      default: false
    },
    bodyClass: String,
    appendToBody: { //是否将弹窗插入body中
      type: Boolean,
      default: false
    },
    /** 是否允许全屏 */
    allowFullscreen: { 
      type: Boolean,
      default: false
    }
  },
  data(){
    return {
      isFullscreen: false
    }
  },
  watch: {
    show(val) {
      if (val) return this.computeStyle();
      this.restoreBodyStyle();
      this.isFullscreen = false;
    }
  },
  methods: {
    closed() {
      this.$emit('closed'); //关闭动画结束时触发
    },
    close() {
      this.$emit('close'); //关闭时触发
      //兼容sync
      this.$emit('update:show', false);
    },
    cancel() {
      this.$emit('cancel'); //点击关闭按钮，或遮罩层关闭时触发
      this.close();
    },
    maskClose() {
      if (this.closeable && this.maskCloseable) {
        this.cancel();
      }
    },
    escClose(event) {
      if (this.show && this.closeable && event.keyCode == 27) {
        this.cancel();
      }
    },
    computeStyle() {
      this.withoutHiddenClass = !hasClass(document.body, 'overflow-body-for-modal');
      this.bodyPaddingRight = document.body.style.paddingRight;
      let computedBodyPaddingRight = parseInt(getStyle(document.body, 'paddingRight'), 10);
      let bodyHasOverflow = document.documentElement.clientHeight < document.body.scrollHeight;
      let bodyOverflowY = getStyle(document.body, 'overflowY');
      let scrollBarWidth = getScrollBarWidth();

      if (scrollBarWidth > 0 && (bodyHasOverflow || bodyOverflowY === 'scroll') && this.withoutHiddenClass) {
        document.body.style.paddingRight = computedBodyPaddingRight + scrollBarWidth + 'px';
      }
      addClass(document.body, 'overflow-body-for-modal');
    },
    restoreBodyStyle() {
      if (!this.show && this.withoutHiddenClass) {
        document.body.style.paddingRight = this.bodyPaddingRight;
        removeClass(document.body, 'overflow-body-for-modal');
      }
      this.withoutHiddenClass = true;
    }
  },
  mounted() {
    //document.addEventL.body-heightistener('keydown', this.escClose)

    if (this.appendToBody) {
      document.body.appendChild(this.$el);
    }
  },
  destroyed() {
    //document.removeEventListener('keydown', this.escClose)

    // if appendToBody is true, remove DOM node after destroy
    if (this.appendToBody && this.$el && this.$el.parentNode) {
      this.$el.parentNode.removeChild(this.$el);
    }
  }
}
</script>

<style lang="scss">
.overflow-body-for-modal {
  overflow: hidden;
}

.base-modal-mask {
  @include mask();
  z-index: 999;
  overflow: auto;
}

.base-modal {
  position: relative;
  margin: 50px auto;
  background-color: #fff;
  border-radius: 1px;
  box-shadow: 1px 1px 8px rgba(0, 0, 0, 0.15);

  &.base-modal-fullscreen{
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: 0;
    width: auto !important;
  }
}

.base-modal-header {
  position: relative;
  padding: 8px 10px;
  border-bottom: 1px solid #e9ecef;
  background: #f8f8f8;
  font-size: 16px;
  color: $text-color-primary;
  font-weight: normal;

  display: flex;
  align-items: center;

  h3 {
    flex: 1;
    margin: 0;
    height: 24px;
    line-height: 24px;
    font-size: 16px;
    font-weight: 400;

    @include text-ellipsis()
  }

  button{
    height: 24px;
    line-height: 24px;
    width: 24px;

    padding: 0;
    margin: 0;
    outline: none;
    color: #666;
    border: none;
    background-color: transparent;
    transition: color ease .15s;

    i {
      font-size: 14px;
    }

    &:hover{
      color: $color-primary;
    }

    &.base-modal-header-close:hover {
      color: #e84040;
    }
  }

  button + button{
    margin-left: 5px;
  }
}

.base-modal-footer {
  padding: 15px 30px;
}

.base-modal-text-btn{
  outline: none;
  border:none;
  background-color: transparent;
  color: $text-color-secondary;

  &:hover{
    background-color: #f0f0f0;
  }

  &:disabled{
    cursor: not-allowed;
  }

  & + button{
    margin-left: 10px;
  }
}
</style>
