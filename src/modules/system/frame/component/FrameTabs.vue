<template>
  <div class="frame-tabs">
    <div>
      <button @click="prev">←</button>
    </div>
    <div class="frame-tabs-scroll" ref="scroll">
      <div class="frame-tabs-list" ref="list" :style="{transform: `translateX(-${offset}px)`}">
        <div 
          v-for="tab in tabs" :key="tab.url"
          class="frame-tab" :class="{'frame-tab-active': tab.show}"
          @click="$emit('jump', tab)">
          <span>{{tab.title}}</span>
          <button class="frame-close-btn" @click.stop="$emit('close', tab)" v-if="tab.closeable">
            <i class="frame-close-icon"></i>
          </button>
        </div>
      </div>
    </div>
    <div>
      <button @click="next">→</button>
      <button>更多</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'frame-tabs',
  props: {
    tabs: {
      type: Array,
      default: () => []
    }
  },
  data(){
    return {
      offset: 0
    }
  },
  methods: {
    prev(){
      let scrollEl = this.$refs.scroll;
      let scrollOffset = scrollEl.offsetWidth;
      this.offset = this.offset - scrollOffset < 0 ? 0 : this.offset - scrollOffset;
    },
    next(){
      let scrollEl = this.$refs.scroll;
      let listEl = this.$refs.list;

      let scrollOffset = scrollEl.offsetWidth;
      let listWidth = listEl.offsetWidth;
      
      this.offset = this.offset + scrollOffset < listWidth - scrollOffset ? this.offset + scrollOffset : listWidth - scrollOffset;
    },
    close(tab){
      console.log(tab)
    }
  },
}
</script>

<style lang="scss">
.frame-tabs{
  width: 100%;
  display: flex;
  flex-flow: row  nowrap;
  overflow: hidden;
}

.frame-tabs-scroll{
  flex: 1;
  overflow: hidden;
}

.frame-tabs-list{
  float: left;
  white-space: nowrap;
  transition: transform ease .3s;
}

.frame-tab{
  display: inline-block;
  line-height: 20px;
  padding: 5px 10px;
  border: 1px solid #ddd;
  cursor: pointer;

  &.frame-tab-active{
    background-color: #00ac97;
    
    .frame-close-icon:after,
    .frame-close-icon:before{
      background-color: #fff;
    }
  }

  span{
    display: inline-block;
    vertical-align: middle;
  }
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
</style>

