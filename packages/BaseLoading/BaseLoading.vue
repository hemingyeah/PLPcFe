<template>
  <transition name="base-loading-fade" @after-leave="destory">
    <div class="base-loading-mask" v-show="visible">
      <div class="base-loading-spinner">
        <svg class="base-loading-circular" viewBox="25 25 50 50">
          <circle class="base-loading-path" cx="50" cy="50" r="20" fill="none"/>
        </svg>
        <p class="base-loading-text">{{text}}</p>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'base-loading',
  props: {
    text: {
      type: String,
      default: '正在加载中...'
    },
    visible: Boolean
  },
  methods: {
    destory(){
      this.$emit('destory')
    }
  }
}
</script>

<style lang="scss">
.base-loading-target{
  position: relative;
  min-height: 180px;
}

.base-loading-mask {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: 0;

  z-index: 999;
  background-color: rgba(255, 255, 255, .9);
  transition: opacity .15s;
}

.base-loading-spinner {
  position: absolute;
  width: 100%;
  top: 50%;
  margin-top: -21px;
  text-align: center;
}

.base-loading-spinner .base-loading-circular{
  height: 42px;
  width: 42px;
  animation: base-loading-rotate 2s linear infinite;
}

.base-loading-text {
  color: '#666';
  margin: 3px 0;
  font-size: 14px;
}

.base-loading-spinner .base-loading-path {
  animation: base-loading-dash 1.5s ease-in-out infinite;
  stroke-dasharray: 90,150;
  stroke-dashoffset: 0;
  stroke-width: 3;
  stroke: #55b7b4;
  stroke-linecap: round;
}

.base-loading-fade-enter,
.base-loading-fade-leave-active {
  opacity: 0;
}

@keyframes base-loading-rotate{
  100% {
    transform: rotate(1turn);
  }
}

@keyframes base-loading-dash{
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
</style>
