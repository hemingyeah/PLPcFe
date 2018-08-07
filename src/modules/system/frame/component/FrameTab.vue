<template>
  <div 
    :id="`tab_` + tab.id"
    class="frame-tab" :class="{'frame-tab-active': tab.show}"
    @click="$emit('jump', tab)">

    <div class="frame-tab-inner">
      <i class="frame-loading-spinner" v-if="tab.loading">
        <svg class="frame-loading-circular " viewBox="0 0 50 50">
          <circle class="frame-loading-path" cx="25" cy="25" r="20" fill="none"/>
        </svg>
      </i>
      <i class="iconfont icon-updete frame-loading" @click="$emit('reload', tab)" v-else></i>
      <span>{{tab.title}}</span>
      <button class="btn-text frame-close-btn" @click.stop="$emit('close', tab)" v-if="tab.closeable">
        <i class="iconfont icon-close"></i>
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
  position: relative;
  display: block;
}
.frame-tab + .frame-tab{
  margin-left: 1px;
}
.frame-tab + .frame-tab:after{
  content: "";
  position: absolute;
  left: -1px;
  top: 12px;
  width: 1px;
  height: 16px;
  background-color: #f4f7f5;
}

.frame-tab-inner{
  display: flex;
  flex-flow: row nowrap;
  align-items: center;

  transition: all ease .15s;
  line-height: 24px;
  padding: 8px 15px;

  span{
    display: inline-block;
    vertical-align: middle;
    cursor: default;
    user-select: none;
    padding: 0 5px;
  }
}

.frame-loading-spinner,
.frame-loading{
  display: block;
  height: 18px;
  width: 18px;
  margin: 0;
}

.icon-updete.frame-loading{
  line-height: 18px;
  text-align: center;
  cursor: pointer;
  font-size: 18px;
}

.frame-loading-spinner .frame-loading-circular{
  display: block;
  width: 100%;
  height: 100%;
  margin: 0;
  will-change: transform;
  animation: frame-loading-rotate 2s linear infinite;
}

.frame-loading-spinner .frame-loading-path{
  animation: frame-loading-dash 1.5s ease-in-out infinite;
  stroke-dasharray: 90,150;
  stroke-dashoffset: 0;
  stroke-width: 4;
  stroke: $color-primary;
  stroke-linecap: round;
}

.frame-tab-active .frame-loading-path{
  stroke: #fff !important;
}

@keyframes frame-loading-rotate{
  100% {
    transform: rotateZ(1turn);
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

  i.icon-close{
    font-size: 12px;
  }
 
  &:hover{
    font-weight: 700;
    color: #fff !important;
  }
}

.frame-tab-active,
.frame-tab:hover{
  .frame-tab-inner{
    background-color: $color-primary;
    color: #fff;
    
    .frame-close-btn{
      color: #fff;
    }
  }
}
</style>
