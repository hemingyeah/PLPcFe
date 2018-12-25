<template>
  <div class="base-tabbar">
    <slot v-if="$slots.head"></slot>
    <div :class="{'base-tabbar-ghost': true, 'base-tabbar-highlight': prevBtnEnable}"></div>
    <div class="base-tabbar-scroll" ref="scroll" @wheel="tabScroll">
      <div 
        ref="list" 
        :class="{'base-tabbar-list': true, 'base-tabbar-transition': offsetTransition}" 
        :style="{transform: `translateX(${-offset}px)`}"
        @transitionend="tabTransitionEnd">
        <div 
          v-for="t in tabs" :key="t.component"
          class="base-tabbar-item" :class="{'base-tabbar-selected': t.component === value}"
          @click="selectTab(t)">
          <slot :name="`${t.component}__tab`">{{t.displayName}}</slot>
        </div>
      </div>
    </div>
    <el-popover trigger="click" placement="top-end" popper-class="base-tabbar-popover" v-model="isShowPopver" v-if="showAll">
      <button type="button" slot="reference" :class="{'base-tabbar-all': true, 'base-tabbar-highlight': nextBtnEnable, 'base-tabbar-rotate': isShowPopver}"><i class="iconfont icon-more"></i></button>
      <div class="base-tabbar-panel">
        <div 
          v-for="t in tabs" :key="t.component"
          class="base-tabbar-item" :class="{'base-tabbar-selected': t.component === value}"
          @click="jump(t)">
          <slot :name="`${t.component}__tab`">{{t.displayName}}</slot>
        </div>
      </div>
    </el-popover>
    
  </div>
</template>

<script>
import _ from 'lodash';

export default {
  name: "base-tabbar",
  props: {
    tabs: {
      type: Array,
      default: () => ([])
    },
    value: String
  },
  data() {
    return {
      offset: 0,
      offsetTransition: false,
      nextBtnEnable: false,
      prevBtnEnable: false,
      showAll: false,
      isShowPopver: false
    }
  },
  methods: {
    selectTab(tab) {
      this.$emit('input', tab.component);
    },
    jump(tab){
      this.selectTab(tab);
      this.$nextTick(this.showSelectTab)
    },
    tabScroll(event){ 
      event.preventDefault();
      let scrollEl = this.$refs.scroll;
      let listEl = this.$refs.list;

      let scrollOffsetWidth = scrollEl.offsetWidth; //外层容器的宽度
      let listOffsetWidth = listEl.offsetWidth; //tab list的宽度
      let maxOffset = listOffsetWidth - scrollOffsetWidth;
      //无法滚动
      if(listOffsetWidth <= scrollOffsetWidth) return;

      //1. 兼容不同浏览器的事件
      //2. 根据方向设置offset
      let direction = event.deltaX != 0 
        ? event.deltaX > 0 ? 1 : -1//存在横向滚动,
        : event.deltaY > 0 ? 4 : -4;

      let offset = this.offset + direction * 12;
      if(offset < 0) offset = 0;
      if(offset > maxOffset) offset = maxOffset;

      this.offset = offset;
      this.prevBtnEnable = this.offset > 0;
      this.nextBtnEnable = this.offset < maxOffset;
    },
    showSelectTab(){
      let scrollEl = this.$refs.scroll;
      let listEl = this.$refs.list;

      let scrollOffsetWidth = scrollEl.offsetWidth; //外层容器的宽度
      let listOffsetWidth = listEl.offsetWidth; //tab list的宽度
      let maxOffset = listOffsetWidth - scrollOffsetWidth;
      if(maxOffset < 0){
        this.offset = 0;
        return;
      }
        
      let selectedEl = this.$refs.list.querySelector('.base-tabbar-selected');      
      let offset = selectedEl.offsetLeft < maxOffset ? selectedEl.offsetLeft : maxOffset;
      if(offset != this.offset){
        this.offsetTransition = true;
        this.prevBtnEnable = offset > 0;
        this.nextBtnEnable = offset < maxOffset;
        this.offset = offset;
      }
    },
    tabTransitionEnd(event){
      //只处理tab list的tranform效果
      if(event.propertyName != 'transform' || !event.target.classList.contains('base-tabbar-list')) return;
      this.offsetTransition = false;
    },
    adjustTabs: _.debounce(function(tab){
      let scrollEl = this.$refs.scroll;
      let listEl = this.$refs.list;

      let scrollOffsetWidth = scrollEl.offsetWidth; //外层容器的宽度
      let listOffsetWidth = listEl.offsetWidth; //tab list的宽度

      if(scrollOffsetWidth >= listOffsetWidth){ //全部显示
        this.offset = 0;
        this.nextBtnEnable = false;
        this.prevBtnEnable = false;
        this.showAll = false;
        return;
      }

      let maxOffset = listOffsetWidth - scrollOffsetWidth;

      this.showAll = true;
      this.prevBtnEnable = this.offset > 0;
      this.nextBtnEnable = this.offset < maxOffset;
    }, 160)
  },
  mounted(){
    window.addEventListener("resize", this.adjustTabs);
    this.$nextTick(this.adjustTabs)
  },
  watch: {
    tabs: {
      deep: true,
      handler(){
        this.$nextTick(this.showSelectTab)
      }
    }
  }
}
</script>

<style lang="scss">
.base-tabbar{
  margin: 0;
  height: 50px;
  overflow: hidden;
  display: flex;
  flex-flow: row nowrap;
  position: relative;
  background: $color-regular;
}

.base-tabbar-scroll{
  flex: 1;
  position: relative;
  overflow: hidden;
}

.base-tabbar-list{
  position: absolute;
  bottom: 0;
  white-space: nowrap;
}

.base-tabbar-item {
  display: inline-block;
  line-height: 24px;
  padding: 12px 15px;
  font-size: 14px;
  color: #444;
  text-align: center;
  cursor: pointer;
  transition: color ease .15s;
  background: $color-regular;
  font-weight: normal;
  white-space: nowrap;
  border-bottom: 2px solid $color-regular;
  min-width: 120px;
  
  i.iconfont{
    font-size: 14px;
    margin: 5px;
  }
}

.base-tabbar-item:hover,
.base-tabbar-item.base-tabbar-selected {
  background: #CFEAE9 !important;
  color: #55B7B4;
  border-bottom-color: $color-primary;
}

.base-tabbar-popover{
  padding: 5px;
  .base-tabbar-panel{
    max-height: 360px;
  }
  .base-tabbar-item{
    padding: 2px 5px;
    font-size: 13px;
    border: none;

    text-align: left;
    display: block;
    background: #fff;
    border-radius: 2px;
  }

  .base-tabbar-item + .base-tabbar-item{
    margin-top: 5px;
  }
}

.base-tabbar-transition{
  transition: transform linear .3s;
}

.base-tabbar-all{
  outline: none;
  width: 50px;
  height: 50px;
  margin: 0;
  background: $color-regular;
  color: #444;
  border: none;
  padding: 0 0 2px 0;
  position: relative;

  &:hover{
    background: #CFEAE9 !important;
    color: #55B7B4;
  }

  i{
    display: block;
  }

  &.base-tabbar-rotate i{
    transform: rotate(180deg);
  }
}

.base-tabbar-all.base-tabbar-highlight{
  box-shadow: -2px 0 4px rgba(0, 0, 0, .125);
}

.base-tabbar-ghost{
  position: absolute;
  left: -4px;
  top: 0;
  bottom: 0;
  background: $color-regular;
  width: 4px;
  z-index: 9;
}

.base-tabbar-ghost.base-tabbar-highlight{
  box-shadow: 2px 0 4px rgba(0, 0, 0, .125);
}
</style>


