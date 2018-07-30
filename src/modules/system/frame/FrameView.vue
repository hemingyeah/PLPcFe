<template>
  <div class="app">
    <frame-nav :collapse="collapse" @open="openFrameTab" :source="initData.menus"></frame-nav>
    <div class="app-main">
      <header class="app-header">
        <button @click="collapse = !collapse">收起</button>

        <div style="float:right;">
          <a href="/">旧版</a>
          <span @click="versionModal = !versionModal">版本说明</span>
          <a :href="`/mine/` + loginUser.userId" @click.prevent="openUserView">
            <img :src="loginUser.head" style="display:inline-block; width:32px;height:32px; border-radius:50%;"/>  
            {{loginUser.displayName}}
            <span>{{loginUser.state}}</span>
          </a>

          <span title="hello tooltip" v-tooltip>专属客服</span>
          <a href="http://help.shb.ltd" @click.prevent="openHelpDoc">帮助文档</a>
          <a href="/logout" @click.prevent="logout">注销</a>
        </div>
      </header>

      <div class="app-tabs">
        <div>
          <button @click="prevFrameTab">←</button>
        </div>
        <div class="frame-tabs-scroll" ref="scroll">
          <div class="frame-tabs-list" ref="list" :style="{transform: `translateX(-${offset}px)`}">
            <frame-tab v-for="tab in frameTabs" :key="tab.url" :tab="tab" 
              @reload="reloadFrameTab(tab)" @close="closeFrameTab(tab)" @jump="jumpFrameTab(tab)"/>
          </div>
        </div>
        <div>
          <button @click="nextFrameTab">→</button>
          <button>更多</button>
        </div>
      </div>

      <div class="app-content">
        <div class="app-frame-tab-window" v-for="tab in frameTabs" :key="tab.url" v-show="tab.show">
          <iframe :id="`frame_${tab.id}`" :data-id="tab.id" :src="tab.url" @load="updateTab"></iframe>
        </div>
      </div>
    </div>

    <base-modal class="version-modal" title="版本说明" :show.sync="versionModal" :closeable="false">
      <span>说明信息</span>
      <button @click="versionModal = false">关闭</button>
    </base-modal>
  </div>
</template>

<script>
import _ from 'lodash';
import platform from 'src/platform'
import http from 'src/util/http';
import Tab from './model/Tab'

import FrameNav from './component/FrameNav.vue';
import FrameTab from './component/FrameTab.vue';

export default {
  name: 'frame-view',
  props: {
    initData: {
      type: Object,
      default: () => ({})
    }
  },
  data(){
    let homeFrameTab = new Tab({url: '/home', title: '首页', show: true})
    
    return {
      frameTabs: [homeFrameTab],
      offset: 0,
      collapse: false,
      versionModal: false //版本信息modal
    }
  },
  computed: {
    loginUser(){
      return this.initData.user || {};
    }
  },
  methods: {
    async updateUser(){
      let result = await http.get(`/security/user/get/${this.loginUser.userId}`);
      if(result.status == 0){
        //暂时只更新状态
        this.loginUser.state = result.data.state;
      }
    },
    async logout(){
      if(await platform.confirm('您确定要退出系统吗？')){
        if(platform.inDingTalk()){
            window.location.href = '/smlogin/pc/logout'
        }else{
            window.location.href = '/logout'
        }
      }
    },
    openHelpDoc(event){
      platform.openLink(event.target.href);
    },
    openUserView(event){
      let a = event.target.closest('a')
      //addTabs({id: "userCenter", title: "正在加载", close: true, url: "/mine/" + currentLoginUserId});
      this.openFrameTab({
        url: a.getAttribute('href'),
        title: '个人中心'
      })
    },
    updateTab(event){
      let frame = event.target;
      let id = frame.dataset.id;

      let index = _.findIndex(this.frameTabs, tab => tab.id == id);
      if(index >= 0){
        let tab = this.frameTabs[index];
        tab.loading = false;
        tab.title = frame.contentWindow.document.title || tab.originTitle;
      }
    },
     /** 显示上一页tab */
    prevFrameTab(){
      let scrollEl = this.$refs.scroll;
      let scrollOffset = scrollEl.offsetWidth;
      this.offset = this.offset - scrollOffset < 0 ? 0 : this.offset - scrollOffset;
    },
    /** 显示下一页tab */
    nextFrameTab(){
      let scrollEl = this.$refs.scroll;
      let listEl = this.$refs.list;

      let scrollOffset = scrollEl.offsetWidth;
      let listWidth = listEl.offsetWidth;
      
      this.offset = this.offset + scrollOffset < listWidth - scrollOffset ? this.offset + scrollOffset : listWidth - scrollOffset;
    },
    /** 显示已激活的tab */
    showActiveTab(tabs){
      let activeTabs = tabs.filter(item => item.show);
      if(activeTabs.length > 0) {
        let tab = activeTabs[0];
        let tabEl = this.$el.querySelector(`#tab_${tab.id}`);
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
      }
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

      let tab = new Tab(option);
      tab.show = true;

      this.frameTabs.push(tab)
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
    reloadFrameTab(tab){
      let iframe = document.getElementById(`frame_${tab.id}`);
      if(null != iframe){
        tab.loading = true;
        tab.title = '正在加载...';

        iframe.contentWindow && iframe.contentWindow.location.reload();
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
      if(action == 'shb.system.reloadFrameTab') this.reloadFrameTab(eventData.data);
    },
    //兼容旧页面，迁移完成后删除
    addTabs(option){
      console.warn('不推荐调用该该方法，使用platform.openFrameTab替代');
      this.openFrameTab(option)
    }
  },
  created(){
    //
  },
  mounted(){
    window.addEventListener("message", this.receiveMessage, false);
    window.addTabs = this.addTabs;

    this.updateUser();

    setTimeout(() => this.title += ' update', 1000)
  },
  components: {
    [FrameTab.name]: FrameTab,
    [FrameNav.name]: FrameNav
  }
}

//FrameTab对象

</script>

<style lang="scss">
html, body, .app{
  height: 100%;
  overflow: hidden;
}

.app{
  display: flex;
  flex-flow: row nowrap;
}

.app-main{
  flex: 1;
  height: 100%;
}

.app-header{
  height: 33px;
  border-bottom: 1px solid #ddd;  
}

.app-content{
  height: calc(100% - 73px);
}

.app-frame-tab-window{
  height: 100%;

  iframe{
    display: block;
    width: 100%;
    height: 100%;
  }
}
</style>

<!-- tab相关 -->
<style lang="scss">
.app-tabs{
  width: 100%;
  display: flex;
  flex-flow: row  nowrap;
  overflow: hidden;
  height: 41px;

  border-bottom: 1px solid #ddd;
}

.frame-tabs-scroll{
  position: relative;
  flex: 1;
  overflow: hidden;
}

.frame-tabs-list{
  position: absolute;
  white-space: nowrap;
  transition: transform ease .3s;
}
</style>