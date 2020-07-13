<template>
  <transition name="slide-left" @after-leave="$emit('closed')">
    <template v-if="diyTransfer">
      <div v-if="show" class="normal-note-box">
        <div class="normal-note-right-box"></div>
        <div class="normal-note-left-box"></div>
      </div>
    </template>
    <template v-else>
      <!-- <div v-show="show" class="base-panel-mask" @click.self="close"> -->
      <aside v-if="show" class="base-panel" :style="{width: width}" @click.stop>
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
  </transition>
</template>

<script>
export default {
  name: "base-panel",
  props: {
    title: String,
    show: {
      //是否显示组件
      type: Boolean,
      default: false
    },
    diyTransfer: {
      //是否显示组件
      type: Boolean,
      default: false
    },
    width: {
      type: String,
      default: "360px"
    }
  },
  methods: {
    close() {
      this.$emit("close");
      //兼容sync
      this.$emit("update:show", false);
    },
    /** 监听文档的点击事件，如果点击组件外的元素，关闭组件 */
    handleClickOutside(e) {
      let { isTrusted, detail } = e;
      if (!isTrusted && (detail == null || !detail.isTrusted)) return;

      if (this.show && !this.$el.contains(e.target)) this.close();
    }
  },
  mounted() {
    document.addEventListener("click", this.handleClickOutside, false);
  },
  destroyed() {
    document.removeEventListener("click", this.handleClickOutside);
  }
};
</script>

<style lang="scss">
.normal-note-box {
  width: 300px;
  position: absolute;
  height: 100%;
  right: 0;
  z-index: 99;
  box-shadow: none !important;
}
.normal-note-right-box {
  width: 300px;
  position: absolute;
  height: 100%;
  right: 0;
  z-index: 99;
  background: #fff;
  box-shadow: -3px 0px 5px #ccc;
}

.normal-note-left-box {
  width: 300px;
  background: #fff;
  position: absolute;
  height: 100%;
  transform: translateX(0);
  transition: all 0.8s;
  box-shadow: -3px 0px 5px #ccc;
  z-index: 98;
}
.normal-note-left-box-show{
  transform: translateX(-300px);
}
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
