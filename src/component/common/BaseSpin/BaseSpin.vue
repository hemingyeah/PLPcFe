<template>
  <i :class="['base-spin', spinSize]" >
    <svg class="base-spin-circular " viewBox="25 25 50 50">
      <circle class="base-spin-path" cx="50" cy="50" r="20" fill="none"/>
    </svg>
  </i>
</template>

<script>
export default {
  name: 'base-spin',
  props: {
    size: {
      type: String, //large medium small
      default: 'medium'
    }
  },
  computed: {
    spinSize(){
      return `base-spin-${this.size}`
    }
  }
}
</script>

<style lang="scss">
.base-spin{
  display: inline-block;
  height: 42px;
  width: 42px;
  position: relative;
}

.base-spin-circular{
  display: block;
  width: 100%;
  height: 100%;
  will-change: transform;
  animation: base-spin-rotate 2s linear infinite;
}

.base-spin-path{
  animation: base-spin-dash 1.5s ease-in-out infinite;
  stroke-dasharray: 90,150;
  stroke-dashoffset: 0;
  stroke-width: 2;
  stroke: $color-primary;
  stroke-linecap: round;
}

@keyframes base-spin-rotate{
  100% {
    transform: rotateZ(1turn);
  }
}

@keyframes base-spin-dash{
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

.base-spin-large{
  height: 42px;
  width: 42px;

  .base-spin-path{
    stroke-width: 2;
  }
}

.base-spin-medium{
  height: 30px;
  width: 30px;

  .base-spin-path{
    stroke-width: 4;
  }
}

.base-spin-small{
  height: 16px;
  width: 16px;
  
  .base-spin-path{
    stroke-width: 6;
  }
}
</style>
