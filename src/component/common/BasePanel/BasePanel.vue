<template>
  <transition-group tag="div" name="slide-left" @after-leave="$emit('closed')">
    <template v-if="diyTransfer">
      <slot name="diyTransferCon" v-if="show">
      
      </slot>
    </template>
    <template v-else>
      <!-- <div v-show="show" class="base-panel-mask" @click.self="close"> -->
      <aside v-if="show && !re" key="aside1" class="base-panel" :style="{width: width}" @click.stop>
        <slot name="header">
          <header class="base-panel-title">
            <slot name="title">
              <h3>{{title}}</h3>
            </slot>
            <button type="button" @click="close" class="base-panel-close">
              <i class="iconfont icon-fe-close"></i>
            </button>
          </header>
        </slot>

        <slot></slot>

        <slot name="footer"></slot>
      </aside>
      <aside v-show="show && re" key="aside2" class="base-panel" :style="{width: width}" @click.stop>
        <slot name="header">
          <header class="base-panel-title">
            <slot name="title">
              <h3>{{title}}</h3>
            </slot>
            <button type="button" @click="close" class="base-panel-close">
              <i class="iconfont icon-fe-close"></i>
            </button>
          </header>
        </slot>

        <slot></slot>

        <slot name="footer"></slot>
      </aside>
    </template>

    <!-- </div> -->
  </transition-group>
</template>

<script>
export default {
  name: 'base-panel',
  props: {
    title: String,
    re: {
      // 显示方式 v-if 或者 V-show
      type: Boolean,
      default: false
    },
    show: {
      // 是否显示组件
      type: Boolean,
      default: false
    },
    diyTransfer: {
      // 是否显示组件
      type: Boolean,
      default: false
    },
    width: {
      type: String,
      default: '360px'
    }
  },
  methods: {
    close() {
      this.$emit('close');
      // 兼容sync
      this.$emit('update:show', false);
    },
    /** 监听文档的点击事件，如果点击组件外的元素，关闭组件 */
    handleClickOutside(e) {
      let { isTrusted, detail } = e;
      if (!isTrusted && (detail == null || !detail.isTrusted)) return;

      if (this.show && !this.$el.contains(e.target)) this.close();
    }
  },
  mounted() {
    if (this.re) return
    document.addEventListener('click', this.handleClickOutside, false);
  },
  destroyed() {
    if (this.re) return
    document.removeEventListener('click', this.handleClickOutside);
  }
};
</script>

<style lang="scss">

.base-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  overflow-x: hidden;
  overflow-y: auto;
  background-color: #fff;
  box-shadow: -1px 0 8px rgba(0, 0, 0, 0.125);
  overflow: hidden;
}

.base-panel-title {
  display: flex;
  flex-flow: row nowrap;
  border-bottom: 1px solid #f2f8f7;
  padding: 10px;

  h3 {
    margin: 0;
    font-size: 18px;
    color: $text-color-primary;
    font-weight: 400;
    line-height: 30px;
    flex: 1;
  }

  .base-panel-close {
    width: 30px;
    height: 30px;
    padding: 0;
    margin: 0;
    border: none;
    outline: none;
    background-color: transparent;
    transition: color ease 0.15s;

    i {
      font-size: 14px;
    }

    &:hover {
      color: #e84040;
    }
  }
}
</style>
