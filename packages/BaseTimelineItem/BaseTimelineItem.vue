<template>
  <div class="base-timeline-item">
    <div class="base-timeline-item-icon">
      <slot name="icon"></slot>
    </div>
    <div class="base-timeline-item-wrap">

      <div class="base-timeline-item-header">
        <h5><slot></slot></h5>
        <span><slot name="time"></slot></span>
      </div>

      <div class="base-timeline-item-content" v-if="$slots.content">
        <slot name="content"></slot>
      </div>

      <div class="base-timeline-item-footer" v-if="$slots.footer"> <slot name="footer"></slot></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'base-timeline-item'
}
</script>

<style lang="scss">
.base-timeline-item{
  position: relative;
  margin-bottom: 20px;
}

.base-timeline-item-icon{
  position: absolute;
  left: 15px;
  top: 0;
  width: 30px;
  height: 30px;
  font-size: 15px;
  line-height: 30px;
  color: #fff;
  background: #0073b7;
  border-radius: 50%;
  text-align: center;
  
}

.base-timeline-item-wrap{
  background: #fff;
  color: #444;
  margin-left: 60px;
  margin-right: 15px;
  padding: 0 4px;
  position: relative;
}

.base-timeline-item-header{
  position: relative;
  padding: 3px 120px 3px 0;
  margin-bottom: 5px;

  h5{
    font-size: 14px;
    font-weight: 400;
    word-break: break-all;
    margin: 0;
    line-height: 24px;
  }

  span{
    position: absolute;
    right: 0;
    top: 0px;
    font-size: 12px;
    color: #999;
    line-height: 24px;
  }
}

.base-timeline-item-content{
  margin-bottom: 10px;
  color: #666;

  p{
    line-height: 24px;
    margin: 0;
    font-size: 14px;
  }
}

.base-timeline-item-footer{
  
}
</style>
