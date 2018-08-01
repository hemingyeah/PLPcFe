<template>
  <div :id="`tab_` + tab.id"
    class="frame-tab" :class="{'frame-tab-active': tab.show}"
    @click="$emit('jump', tab)">

    <div class="frame-tab-inner">
      <i class="frame-loading-spinner" v-if="tab.loading">
        <svg class="frame-loading-circular" viewBox="0 0 50 50">
          <circle class="frame-loading-path" cx="25" cy="25" r="20" fill="none"/>
        </svg>
      </i>
      <i class="iconfont icon-shuaxin" @click="$emit('reload', tab)" v-else></i>

      <span>{{tab.title}}</span>
      <button class="btn-text frame-close-btn" @click.stop="$emit('close', tab)" v-if="tab.closeable">
        <i class="iconfont icon-guanbi"></i>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'frame-tab',
  props: {
    tab: {
      type: Object,
      default: () => ({})
    }
  }
}
</script>

<style lang="scss">
.frame-tab{
  display: inline-block;
  user-select: none;
}

.frame-tab-inner{
  line-height: 24px;
  padding: 8px 8px;

  span{
    display: inline-block;
    vertical-align: middle;
  }
}

.frame-loading-spinner{
  display: inline-block;
  height: 20px;
  width: 20px;
  margin: 0;
  vertical-align: middle;
}

.frame-loading-spinner .frame-loading-circular{
  display: block;
  height: 20px;
  width: 20px;
  animation: frame-loading-rotate 2s linear infinite;
}

.frame-loading-spinner .frame-loading-path {
  animation: frame-loading-dash 1.5s ease-in-out infinite;
  stroke-dasharray: 90,150;
  stroke-dashoffset: 0;
  stroke-width: 6;
  stroke: #fff;
  stroke-linecap: round;
}

@keyframes frame-loading-rotate{
  100% {
    transform: rotate(1turn);
  }
}

@keyframes frame-loading-dash{
  0% {
    stroke-dasharray: 1,200;
    stroke-dashoffset: 0;
  }

  50% {
    stroke-dasharray: 90,150;
    stroke-dashoffset: -40px;
  }

  100% {
    stroke-dasharray: 90,150;
    stroke-dashoffset: -120px;
  }
}

.frame-tab-inner .icon-shuaxin{
  width: 20px;
  height: 20px;
  font-size: 20px;
  vertical-align: middle;
  cursor: pointer;
}

.frame-close-btn{
  vertical-align: middle;
  margin: 0;
  padding: 0;
  width: 20px;
  height: 20px;
  line-height: 20px;
  color: #9a9a9a;

  i.icon-guanbi{
    font-size: 14px;
  }
 
  &:hover{
    color: #ed3f14 !important;
  }
}

.frame-tab-active{
  .frame-tab-inner{
    background-color: #00ac97;
    
    .frame-close-btn{
      color: #fff;
    }
  }
}
</style>
