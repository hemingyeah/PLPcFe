<template>

  <!-- start 行业信息 -->
  <div class="trade-item" @click="emit">

    <!-- start 默认显示 -->
    <div class="trade-item-default">
      <!-- start 图标 -->
      <div class="trade-item-default-icon">
        <i class="iconfont" :class="`${item.icon}`">
        </i>
      </div>
      <!-- end 图标 -->
      <!-- start 文字 -->
      <div class="trade-item-default-text">
        <span> {{ item.text }} </span>
      </div>
      <!-- end 文字 -->
    </div>
    <!-- end 默认显示 -->

    <!-- start hover 显示 -->
    <div class="trade-item-hover">
      <!-- start 图标 -->
      <div class="trade-item-hover-icon">
        <i class="iconfont" :class="`${item.icon}`">
        </i>
        <span>
          {{ item.text }}
        </span>
      </div>
      <!-- end 图标 -->
      <!-- start 文字 -->
      <div class="trade-item-hover-text">
        <span> {{ item.message }} </span>
      </div>
      <!-- end 文字 -->
    </div>
    <!-- end hover 显示 -->

  </div>
  <!-- end  行业信息 -->

</template>

<script>
export default {
  name: 'trade-item',
  props: {
    item: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {

    }
  },
  methods: {
    emit() {
      this.$emit('event', this.item)
    }
  },
}
</script>

<style lang="scss">
  .trade-item {
    background-color: #fff;
    box-shadow: 0 3px 9px 0 rgba(0,0,0,0.10);
    border-radius: 5px;
    cursor: pointer;

    transition: all 1s;

    .trade-item-hover {
      display: none;
    }

    &:hover {
      background-color: $color-primary;

      .trade-item-hover {
        display: block;
      }
      .trade-item-default {
        display: none;
      }

    }
    i {
      display: inline-block;
      height: 40px;
      width: 40px;

      font-size: 32px;
    }

    .trade-item-default-icon {
      color: $color-primary;
      text-align: center;

      margin-top: 30px;
    }
    .trade-item-default-text {
      color: #333;
      font-size: 16px;
      margin-top: 25px;
      text-align: center;
    }

    .trade-item-hover-icon {
      color: #fff;
      text-align: center;

      display: flex;
      justify-content: flex-start;
      align-items: center;

      margin-top: 18px;

      span {
        font-size: 16px;
        margin-left: 15px;
      }
    }
    .trade-item-hover-text {
      font-size:12px;
      line-height: 20px;

      margin-top: 15px;
    }

  }
</style>