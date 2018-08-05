<template>
  <transition name="slide-down">
    <div class="version-mask" v-if="show">
      <div class="version transition-container">
        <div class="version-banner">
          <img src="../../../../assets/img/version.png">
        </div>
        <h3 class="version-title">售后宝 | {{version.versionNum}} 更新内容</h3>
        <div class="version-description" v-html="version.description"></div>
        <div class="version-bottom">
          <button type="button" class="btn btn-text version-btn" @click="close">开始使用</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: "version",
  props: {
    show: { //是否显示组件
      type: Boolean,
      default: false
    },
    version: {
      type: Object,
      default: () =>({})
    }
  },
  methods: {
    close(){
      this.$emit('update:show', false)
    }
  }
}
</script>

<style lang="scss">
.version-mask{
  @include mask();
  z-index: 999;
  overflow: auto;
}

.version{
  position: relative;
  margin: 120px auto;
  background-color: #fff;
  width: 522px;
  box-shadow: 1px 1px 8px rgba(0,0,0,0.15);
  color: #333;
}

.version-banner{
  position: relative;
  padding-top: 1px;

  img{
    width: 100%;
    display: block;
    overflow: hidden;
    margin: -54px 0 0 0;
  }
}

.version-title{
  font-size: 20px;
  text-align: center;
  padding: 10px 0 20px 0;
  margin: 0;
}

.version-description{
  padding: 0 36px;
}

.version-description p{
  line-height: 20px;

  &:last-child{
    margin-bottom: 0 !important;
  }
}
.version-bottom{
  text-align: center;
  padding: 20px 0;
}

.version-btn{
  background-color: $color-primary;
  color: #fff;
  width: 450px;
  margin: 0 auto;
  font-size: 20px;
  padding: 0;
  height: 45px;
  line-height: 45px;
  border-radius: 1px;
}
</style>
