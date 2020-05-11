<template>
  <div class="base-timeline">
    <slot name="header">
      <div class="base-timeline-header">
        <span>{{title}}</span>
      </div>
    </slot>
    <slot></slot>
    <slot name="footer"></slot>
  </div>
</template>

<script>
export default {
  name: 'base-timeline',
  props: {
    title: {
      type: String,
      default: '最近更新'
    }
  }
}
</script>

<style lang="scss">
.base-timeline{
  position: relative;
  color: #444;

  &:before{
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    width: 4px;
    background: #ddd;
    left: 29px;
    margin: 0;
    border-radius: 2px;
    z-index: 0;
  }
}

.base-timeline-header{
  position: relative;
  margin-bottom: 15px;

  span{
    width: 60px;
    text-align: center;
    display: inline-block;
    background-color: #dd4b39;
    font-weight: 600;
    padding: 5px;
    border-radius: 4px;
    color: #fff;
    font-size: 12px;
  }
  
}
</style>
