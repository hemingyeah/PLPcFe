<template>
  <div class="base-collapse">
    <div
      :class="['base-collapse-left', { active: collapse == 'left' }]"
      :style="`flex:${leftSize}`"
    >
      <slot name="left"></slot>

      <!-- start 折叠按钮 -->
      <div class="base-collapse-btn" v-if="showCollapse">
        <el-tooltip content="收起" placement="left">
          <div
            class="base-collapse-btn-left"
            v-show="collapse != 'left'"
            @click="expand('left')"
          >
            <i class="iconfont icon-mianbanjiantou"></i>
          </div>
        </el-tooltip>
        <el-tooltip content="展开" placement="right">
          <div
            class="base-collapse-btn-right"
            v-show="collapse != 'right'"
            @click="expand('right')"
          >
            <i class="iconfont icon-mianbanjiantou"></i>
          </div>
        </el-tooltip>
      </div>
      <!-- end 折叠按钮 -->
    </div>

    <div
      :class="['base-collapse-right', { active: collapse == 'right' }]"
      :style="`flex:${rightSize}`"
      v-if="showCollapse"
    >
      <slot name="right"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'base-collapse',
  props: {
    direction: {
      type: String,
      default: '',
    },
    showCollapse: {
      type: Boolean,
      default: true,
    },
    leftSize: {
      type: Number,
      default: 1,
    },
    rightSize: {
      type: Number,
      default: 1,
    },
  },
  data() {
    return {
      collapse: this.direction,
    };
  },
  methods: {
    /**
     * @description 折叠
     */
    expand(direction) {
      // 折叠过，则恢复
      if (this.collapse) return (this.collapse = '');

      this.collapse = direction;
    },
  },
  watch: {
    collapse(newValue) {
      this.$emit('update:direction', newValue);
    },
  },
};
</script>

<style lang="scss">
.base-collapse {
  position: relative;
  overflow: hidden;

  display: flex;
  flex-flow: row nowrap;

  &-left,
  &-right {
    max-width: 100%;
    min-width: 128px;
    height: 100%;

    background-color: #fff;
    border-radius: 4px;

    transition-duration: 300ms;

    &.active {
      max-width: 128px;
    }
  }

  &-left {
    position: relative;
  }

  &-right {
    margin-left: 12px;
  }

  &-btn {
    width: 10px;
    position: absolute;
    right: -10px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 9;

    &-left,
    &-right {
      width: 100%;
      height: 34px;

      background-color: #fff;
      border: 1px solid $color-border-l2;
      border-left: none;
      border-top-right-radius: 4px;
      border-bottom-right-radius: 4px;

      display: flex;
      align-items: center;
      justify-content: center;

      cursor: pointer;

      .iconfont {
        font-size: 12px;
        color: $text-color-secondary;
      }

      &:hover {
        background-color: #e9f9f9;
        border-color: #d0f3f4;

        .iconfont {
          color: $color-primary;
        }
      }
    }

    &-left {
      margin-bottom: 8px;

      .iconfont {
        transform: rotate(-180deg) translateX(1px);
      }
    }
  }
}
</style>
