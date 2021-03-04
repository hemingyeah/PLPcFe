<template>
  <div class="four-corners">
    <!-- 左上，右上，右下，左下 -->
    <div v-if="hasCorners('lt')" class="clip-corners corners-lt"></div>
    <div v-if="hasCorners('rt')" class="clip-corners corners-rt"></div>
    <div v-if="hasCorners('rb')" class="clip-corners corners-rb"></div>
    <div v-if="hasCorners('lb')" class="clip-corners corners-lb"></div>
  </div>
</template>

<script>
export default {
  name: 'four-corners',
  props: {
    direction: {
      type: Array,
      // leftTop, rightTop, rightBottom, leftBottom
      default: () => (['lt', 'rt', 'rb', 'lb'])
    }
  },
  methods: {
    hasCorners(direction) {
      // ie11 not support includes
      return this.direction.filter(i => i === direction).length > 0;
    }
  }
}
</script>

<style lang="scss">
  $cornersColor: #00FBFF; // 边角颜色
  $cornersMaxLenth: 24px;
  $cornersMinLength: 4px;

  @mixin clipBorder {
    content: '';
    position: absolute;
    background-color: $cornersColor;
  }

  .four-corners {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;

    background: transparent;
    z-index: 0;
    .clip-corners {
      position: absolute;
    }

    .corners-lt {
      left: 0;
      top: 0;
      &::before {
        @include clipBorder();
        left: 0;
        top: 0;
        width: $cornersMaxLenth;
        height: $cornersMinLength;
      }
      &::after {
        @include clipBorder();
        left: 0;
        top: 0;
        width: $cornersMinLength;
        height: $cornersMaxLenth;
      }
    }

    .corners-rt {
      right: 0;
      top: 0;
      &::before {
        @include clipBorder();
        right: 0;
        top: 0;
        width: $cornersMaxLenth;
        height: $cornersMinLength;
      }
      &::after {
        @include clipBorder();
        right: 0;
        top: 0;
        width: $cornersMinLength;
        height: $cornersMaxLenth;
      }
    }

    .corners-rb {
      right: 0;
      bottom: 0;
      &::before {
        @include clipBorder();
        right: 0;
        bottom: 0;
        width: $cornersMaxLenth;
        height: $cornersMinLength;
      }
      &::after {
        @include clipBorder();
        right: 0;
        bottom: 0;
        width: $cornersMinLength;
        height: $cornersMaxLenth;
      }
    }

    .corners-lb {
      left: 0;
      bottom: 0;
      &::before {
        @include clipBorder();
        left: 0;
        bottom: 0;
        width: $cornersMaxLenth;
        height: $cornersMinLength;
      }
      &::after {
        @include clipBorder();
        left: 0;
        bottom: 0;
        width: $cornersMinLength;
        height: $cornersMaxLenth;
      }
    }
  }
</style>