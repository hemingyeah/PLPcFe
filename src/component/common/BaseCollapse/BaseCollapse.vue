<template>
  <div class="base-collapse">
    <div :class="['base-collapse-left', {'active': collapse == 'left'}]">
      <slot name="left"></slot>

      <!-- start 折叠按钮 -->
      <div class="base-collapse-btn" v-if="showCollapse">
        <el-tooltip content="收起" placement="left">
          <div class="base-collapse-btn-left" v-show="collapse != 'left'" @click="expand('left')">
            <i class="iconfont icon-arrow-right"></i>
          </div>
        </el-tooltip>
        <el-tooltip content="展开" placement="right">
          <div class="base-collapse-btn-right" v-show="collapse != 'right'" @click="expand('right')">
            <i class="iconfont icon-arrow-right"></i>
          </div>
        </el-tooltip>
      </div>
      <!-- end 折叠按钮 -->
    </div>

    <div :class="['base-collapse-right', {'active': collapse == 'right'}]" v-if="showCollapse">
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
      default: ''
    },
    showCollapse: {
      type: Boolean,
      default: true
    }
  },
  data(){
    return {
      collapse: this.direction
    }
  },
  methods: {
    /** 
    * @description 折叠
    */
    expand(direction) {
      // 折叠过，则恢复
      if (this.collapse) return this.collapse = '';

      this.collapse = direction;
    }
  },
  watch: {
    collapse(newValue) {
      this.$emit('update:direction', newValue);
    }
  }
}
</script>


<style lang="scss">
.base-collapse {
  position: relative;
  overflow: hidden;

  display: flex;
  flex-flow: row nowrap;

  &-left,
  &-right {
    flex: 1;
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
    width: 20px;
    position: absolute;
    right: -20px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 9;

    &-left,
    &-right {
      width: 100%;
      height: 72px;

      background-color: #fff;
      border: 1px solid $color-border-l2;
      border-left: none;
      box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.1);
      border-radius: 4px;

      display: flex;
      align-items: center;
      justify-content: center;

      cursor: pointer;

      .iconfont {
        font-size: 12px;
        color: $text-color-secondary;
      }

      &:hover {
        .iconfont {
          color: $color-primary;
        }
      }
    }

    &-left {
      margin-bottom: 10px;

      .iconfont {
        transform: rotate(-180deg);
      }
    }
  }
}
</style>
