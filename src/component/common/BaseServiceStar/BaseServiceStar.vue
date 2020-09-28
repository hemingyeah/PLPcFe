<template>
  <div class="base-service-star">
    <i class="iconfont" v-for="num in 5" :key="num" :class="num<=value ? 'icon-favorfill' : 'icon-favor'" @click="evaluate(num)"></i>
  </div>
</template>
<script>
export default {
  name: 'base-service-star',
  props: {
    value: {
      type: Number,
      default: 0
    },
    handle: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    evaluate(num) { 
      if(!this.handle) return;
      this.$emit('input', num);
    }
  },
  watch: {
    value(newVal) {
      console.log(newVal, 77777)
    }
  }
}
</script>
<style lang="scss">
.base-service-star {    
  color: #c6c6c6;

  .iconfont {
    font-size: 18px;
    margin-left: 12px;
    height: 20px;
    line-height: 20px;
    cursor: pointer;

    &:first-child {
      margin-left: 0;
    }

    &.icon-favorfill {
      color: #ffb001;
    }
  }
}
</style>


