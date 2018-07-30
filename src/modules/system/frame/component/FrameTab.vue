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
      <i class="iconfont icon-shuaxin" @click="$emit('reload', tab.id)" v-else></i>

      <span>{{tab.title}}</span>
      <button class="frame-close-btn" @click.stop="$emit('close', tab)" v-if="tab.closeable">
        <i class="frame-close-icon"></i>
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
  background-color: transparent;
  margin: 0;
  padding: 0;
  border: none;
  outline: none;
  padding: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  transition: background-color ease .15s;
 
  &:hover{
    background-color: #f0f0f0;
    box-shadow: 0 0 8px rgba(0, 0, 0, .15);

    .frame-close-icon:after,
    .frame-close-icon:before{
      background-color: #ed3f14;
    }
  }
}

.frame-close-icon{
  display: block;
  position: relative;
  width: 16px;
  height: 16px;

  &:before,
  &:after{
    content: "";
    position: absolute;
    left: 2px;
    top: 7px;
    width: 12px;
    height: 2px;
    background-color: #ddd;
    transition: background-color ease .15s;
  }

  &:before{
    transform: rotate(45deg)
  }

  &:after{
    transform: rotate(-45deg)
  }
}

.frame-tab-active{
  .frame-tab-inner{
    background-color: #00ac97;
    
    .frame-close-icon:after,
    .frame-close-icon:before{
      background-color: #fff;
    }
  }
}
</style>
