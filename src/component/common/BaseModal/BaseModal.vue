<template>
  <transition
    name="modal-fade"
    @after-leave="closed">
    <div v-show="show" class="base-modal-mask" @click.self="maskClose">
      <div class="base-modal transition__container" :style="{width: width}">
        <div class="base-modal-header">
          <slot name="header">
            <h3 v-if="title">{{ title }}</h3>
            <template v-else>
              <slot name="cHeader"></slot>
            </template>
            <button type="button" class="base-modal-header-close" @click="cancel" v-if="closeable">
              <i class="iconfont icon-guanbi"></i>
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
      }
    },
    watch: {
      show(val) {
        if (val) return this.computeStyle();
        this.restoreBodyStyle();
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
  }

  .base-modal-header {
    position: relative;
    padding: 10px 40px 10px 20px;
    border-bottom: 1px solid #e9ecef;
    background: #f8f8f8;
    font-size: 16px;
    color: $text-color-primary;
    font-weight: normal;

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

    &-close {
      position: absolute;
      right: 0;
      top: 0;
      height: 40px;
      width: 40px;
      padding: 8px;
      margin: 0;
      outline: none;
      color: #666;
      border: none;
      background-color: transparent;

      transition: color ease .15s;

      i {
        font-size: 14px;
      }

      &:hover {
        color: #e84040;
      }
    }
  }

  .base-modal-body {
    padding: 0 30px;
  }

  .base-modal-footer {
    padding: 15px 30px;
  }
</style>
