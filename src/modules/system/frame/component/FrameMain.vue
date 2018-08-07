<template>
  <div class="frame-main">
    <!-- tabs -->
    <div class="frame-tabs">
      <button class="btn-text frame-tabs-prev" @click="prev">
        <i class="iconfont icon-left"></i>
      </button>
      <div class="frame-tabs-scroll" ref="scroll" @wheel="scroll">
        <div class="frame-tabs-list" ref="list" :style="{transform: `translateX(${-offset}px)`}">
          <frame-tab 
            v-for="tab in frameTabs" :key="tab.url" :tab="tab" 
            @jump="jumpFrameTab" @reload="reloadFrameTab" @close="closeFrameTab"/>
        </div>
      </div>
      <button class="btn-text frame-tabs-next" @click="next">
        <i class="iconfont icon-right"></i>
      </button>
    </div>

    <!-- content-->
    <div class="frame-tab-content">
      <div class="frame-tab-window" v-for="tab in frameTabs" :key="tab.url" v-show="tab.show">
        <iframe :id="`frame_${tab.id}`" :data-id="tab.id" :src="tab.url" @load="updateFrameTab($event,tab)"/>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import Tab from '../model/Tab';

import FrameTab from './FrameTab.vue';

export default {
  name: 'frame-main',
  data(){
    return {
      frameTabs: [],
      offset: 0
    }
  },
  computed: {
    
  },
  methods: {
    receiveMessage(event){
      //不接收其他域名发送的信息
      if(event.origin !== window.location.origin) return;
      
      //验证数据格式
      let eventData = event.data;
      if(!eventData || !eventData.action) return;

      let action = eventData.action;

      if(action == 'shb.system.openFrameTab') this.openForFrame(eventData.data);
      if(action == 'shb.system.realodFrameById') this.reloadFrameTabById(eventData.id);
    },
    /** 用于从导航菜单打开tab */
    openForNav(menu){
      let tab = new Tab({id: menu.menuKey, url: menu.url, title: menu.name});
      this.openFrameTab(tab)
    },
    /** 
     * 用于从其他iframe中打开新的tab
     * option: {id,title,close,url,fromId} 
     */
    openForFrame(option){
      let tab = new Tab(option)
      this.openFrameTab(tab)
    },
    openFrameTab(tab){
      let index = _.findIndex(this.frameTabs, item => item.id == tab.id);
      if(index >= 0){
        let target = this.frameTabs[index];
        target.merge(tab);
        return this.jumpFrameTab(target);
      }

      this.frameTabs.forEach(item => item.show = false);
      this.frameTabs.push(tab)
      this.$emit('input', tab.url)

      this.$nextTick(() => this.showActiveTab(tab))
    },
    jumpFrameTab(frameTab){
      this.frameTabs.forEach(item => item.show = false);
      frameTab.show = true;
      this.$emit('input', frameTab.url)
      this.showActiveTab(frameTab);

      if(frameTab.reload) this.reloadFrameTab(frameTab, frameTab.isUrlChange)
    },
    /** 显示已激活的tab */
    showActiveTab(frameTab){
       //显示tab
      let tabEl = this.$el.querySelector(`#tab_${frameTab.id}`);
      let scrollOffsetWidth = this.$refs.scroll.offsetWidth;

      //左侧不可见
      if(tabEl.offsetLeft < this.offset){
        this.offset = tabEl.offsetLeft;
        return
      }

      //右侧不可见
      if(this.offset < tabEl.offsetLeft + tabEl.offsetWidth - scrollOffsetWidth){
        this.offset = tabEl.offsetLeft + tabEl.offsetWidth - scrollOffsetWidth;
      }
    },
    updateFrameTab(event, tab){
      let frame = event.target;

      tab.title = frame.contentWindow.document.title || tab.originTitle;
      tab.loading = false;
      tab.reload = false;
      tab.currentUrl = frame.contentWindow.location.pathname;
    },
    reloadFrameTab(tab, redirect = false){
      let iframe = document.getElementById(`frame_${tab.id}`);
      if(null != iframe){
        tab.loading = true;
        tab.title = '正在加载...';

        if(redirect){
          iframe.src = tab.url;
        }else{
          iframe.contentWindow.location.reload();
        }
      }
    },
    reloadFrameTabById(id){
      let index = _.findIndex(this.frameTabs, item => item.id == id);
      if(index >= 0){
        this.reloadFrameTab(this.frameTabs[index])
      }
    },
    //关闭frameTab
    closeFrameTab(frameTab){
      //迁移完成后删除
      localStorage.removeItem("frame_"+ frameTab.id+"_idArray");

      let index = this.frameTabs.indexOf(frameTab);
      if(index >= 0) {
        let currTab = this.frameTabs.splice(index, 1)[0];
        if(currTab.show){
          let prevTab = this.frameTabs[index - 1];

          if(prevTab ){
            prevTab.show = true;
            this.$emit('input', prevTab.url);
          }
        }

        this.$nextTick(() => {
          let scrollEl = this.$refs.scroll;
          let listEl = this.$refs.list;
          
          let offset = listEl.offsetWidth - scrollEl.offsetWidth;
          if(offset < 0) offset = 0;
          this.offset = offset;
        })
      }
    },
    scroll(event){ 
      return; 
      // let scrollEl = this.$refs.scroll;
      // let listEl = this.$refs.list;
      
      // if(listEl.offsetWidth <= scrollEl.offsetWidth) return;
      
      // event.deltaY > 0 ? this.next() : this.prev()
    },
     /** 显示上一页tab */
    prev(){
      let scrollEl = this.$refs.scroll;
      let listEl = this.$refs.list;
      if(listEl.offsetWidth <= scrollEl.offsetWidth) return;

      let scrollOffset = scrollEl.offsetWidth;
      this.offset = this.offset - scrollOffset < 0 ? 0 : this.offset - scrollOffset;
    },
    /** 显示下一页tab */
    next(){
      let scrollEl = this.$refs.scroll;
      let listEl = this.$refs.list;
      if(listEl.offsetWidth <= scrollEl.offsetWidth) return;

      let scrollOffset = scrollEl.offsetWidth;
      let listWidth = listEl.offsetWidth;
      
      this.offset = this.offset + scrollOffset < listWidth - scrollOffset ? this.offset + scrollOffset : listWidth - scrollOffset;
    },
  },
  created(){
    window.addEventListener("message", this.receiveMessage);

    let homeTab = new Tab({url: '/home', title: '首页', show: true})
    this.openFrameTab(homeTab);
  },
  components: {
    [FrameTab.name]: FrameTab
  }
}
</script>

<style lang="scss">
.frame-main{
  height: calc(100% - 53px);
}

.frame-tabs{
  width: 100%;
  display: flex;
  flex-flow: row  nowrap;
  overflow: hidden;
  height: 41px;
  border-bottom: 1px solid #f4f7f5;
}

.frame-tabs-scroll{
  position: relative;
  flex: 1;
  overflow: hidden;
}

.frame-tabs-list{
  position: absolute;
  height: 40px;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  white-space: nowrap;
  transition: transform ease .3s;
}

.frame-tabs-prev,
.frame-tabs-next{
  width: 40px;
  height: 40px;
  text-align: center;
  line-height: 40px;
}

.frame-tabs-prev{
  border-right: 1px solid #f4f7f5;
}

.frame-tabs-next{
  border-left: 1px solid #f4f7f5;
}

.frame-tab-content{
  height: calc(100% - 40px);
}

.frame-tab-window{
  height: 100%;

  iframe{
    display: block;
    width: 100%;
    height: 100%;
  }
}
</style>