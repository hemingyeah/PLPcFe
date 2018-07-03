<template>
  <div class="app">
    <div>
      <a href="/home" @click.prevent="open">home</a>
      <a href="/home2" @click.prevent="open">home2</a>
    </div>
    <div>
      <frame-tabs :tabs="frameTabs" @jump="jumpFrameTab" @close="closeFrameTab"></frame-tabs>
    </div>
    <div>
      <div class="frame-tab-window" v-for="tab in frameTabs" v-show="tab.show">
        <iframe :src="tab.url"></iframe>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import FrameTabs from './component/FrameTabs.vue';

export default {
  name: 'frame-view',
  data(){
    let homeFrameTab = new FrameTab({url: '/home', title: '首页', show: true})

    return {
      frameTabs: [homeFrameTab]
    }
  },
  methods: {
    open(event){
      let target = event.target;
      this.openFrameTab({url: target.getAttribute('href'), title: target.innerText})
    },
    jumpFrameTab(frameTab){
      this.frameTabs.forEach(item => item.show = false);
      frameTab.show = true;
    },
    openFrameTab(option){
      let index = _.findIndex(this.frameTabs, item => item.url == option.url);
      if(index >= 0) return this.jumpFrameTab(this.frameTabs[index]);

      if(this.frameTabs.some(item => item.url === option.url)) return this.jumpFrameTab(option);

      //隐藏其他iframe 
      this.frameTabs.forEach(item => item.show = false);

      let frameTab = new FrameTab(option);
      frameTab.show = true;

      this.frameTabs.push(frameTab)
    },
    //关闭frameTab
    closeFrameTab(frameTab){
      let index = this.frameTabs.indexOf(frameTab);
      if(index >= 0) {
        this.frameTabs.splice(index, 1);
        if(this.frameTabs.length > 0) {
          this.frameTabs[this.frameTabs.length - 1].show = true;
        }
      }
    },
    //处理接受到的消息
    receiveMessage(event){
      //不接收其他域名发送的信息
      if(event.origin !== window.location.origin) return;
      
      //验证数据格式
      let eventData = event.data;
      if(!eventData || !eventData.action) return;

      let action = eventData.action;

      if(action == 'shb.system.openFrameTab') this.openFrameTab(eventData.data);
    },
    //兼容旧页面，迁移完成后删除
    addTabs(){
      console.warn('不推荐调用该该方法，使用platform.openFrameTab替代')
    }
  },
  created(){

  },
  mounted(){
    window.addEventListener("message", this.receiveMessage, false);
    window.addTabs = this.addTabs;
  },
  components: {
    [FrameTabs.name]: FrameTabs
  }
}

//FrameTab对象
function FrameTab(options = {}){
  let closeable = options.close;
  //close closeable属性作用一样，但是closeable会覆盖close
  if(undefined !== options.closeable) closeable = options.closeable;
  //首页不允许关闭
  if(options.url == '/home') closeable = false;

  this.id = options.id;
  this.title = options.title || '';
  this.url = options.url || '';
  this.closeable = closeable !== false;
  this.show = options.show === true;
  //this.fromId = null;
}
</script>

<style lang="scss">
html, body, .app{
  height: 100%;
  overflow: hidden;
}

.frame-tab-window{
  iframe{
    display: block;
    width: 100%;
    height: 100%;
  }
}
</style>

