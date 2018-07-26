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
          <a href="http://help.shb.ltd" @click.prevent="openHelpDoc" title="帮助文档" v-tooltip>帮助文档</a>
          <a href="/logout" @click.prevent="logout">注销</a>
        </div>
      </header>
      <frame-tabs :frame-tabs="frameTabs" @jump="jumpFrameTab" @close="closeFrameTab" @reload="reloadFrameTab"/>
      <div class="app-content">
        <frame-tab-content v-for="tab in frameTabs" :key="tab.url" :frame-tab="tab"/>
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

import FrameNav from './component/FrameNav.vue';
import FrameTabs from './component/FrameTabs.vue';
import FrameTabContent from './component/FrameTabContent.vue';

export default {
  name: 'frame-view',
  props: {
    initData: {
      type: Object,
      default: () => ({})
    }
  },
  data(){
    let homeFrameTab = new FrameTab({url: '/home', title: '首页', show: true})
    
    return {
      frameTabs: [homeFrameTab],
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
    reloadFrameTab(frameTabId){
      let iframe = document.getElementById(`frame_${frameTabId}`);
      iframe && iframe.contentWindow && iframe.contentWindow.location.reload();
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
  },
  components: {
    [FrameTabs.name]: FrameTabs,
    [FrameTabContent.name]: FrameTabContent,
    [FrameNav.name]: FrameNav
  }
}

//FrameTab对象
function FrameTab(options = {}){
  let closeable = options.close;
  //close closeable属性作用一样，但是closeable会覆盖close
  if(undefined !== options.closeable) closeable = options.closeable;
  //首页不允许关闭
  if(options.url == '/home') closeable = false;

  this.id = options.id || Math.random() * 10000000 >> 0;
  this.title = options.title || '';
  this.url = options.url || '';
  this.closeable = closeable !== false;
  this.show = options.show === true;
  this.fromId = options.fromId;
}
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

