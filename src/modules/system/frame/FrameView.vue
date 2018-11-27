<template>
  <div class="frame">
    <frame-nav 
      :collapse.sync="collapse" 
      :source="initData.menus" 
      :curr-url="currUrl"
      @open="openForNav"
      @collapse-changed="adjustOpenTab"/>

    <div class="frame-content">
      <header class="frame-header">
        <div class="frame-header-left" :class="{'frame-tab-highlight': prevBtnEnable}">
          <button type="button" class="btn-text frame-nav-btn frame-collapse" @click="collapse = !collapse">
            <i :class="['iconfont', collapse ? 'icon-open': 'icon-Takeup']"></i>
          </button>
          <button type="button" class="btn-text frame-nav-btn frame-tabs-prev" @click="prev" v-if="showOperateBtn">
            <i class="iconfont icon-left"></i>
          </button>
        </div>
        
        <!-- tabs -->
        <div class="frame-tabs-scroll" ref="scroll" @wheel="tabScroll">
          <div ref="list" :class="{'frame-tabs-list': true,'frame-tab-transition': offsetTransition}" :style="{transform: `translateX(${-offset}px)`}" @transitionend="tabTransitionEnd">
            <frame-tab 
              v-for="tab in frameTabs" :key="tab.url" :tab="tab" 
              @jump="jumpFrameTab" @reload="reloadFrameTab" @close="closeFrameTab"/>
          </div>
        </div>

        <!-- profile -->
        <div class="frame-header-right" :class="{'frame-tab-highlight': nextBtnEnable}">
          <template v-if="showOperateBtn">
            <button type="button" class="btn-text frame-nav-btn frame-tabs-next" @click="next">
              <i class="iconfont icon-right"></i>
            </button>

            <el-popover trigger="click" popper-class="frame-tabs-popper" placement="bottom-end">
              <button type="button" class="btn-text frame-nav-btn frame-tabs-more" slot="reference">
                <i class="iconfont icon-pile"></i>
              </button>
              <div class="frame-tabs-panel">
                <frame-tab 
                  v-for="tab in frameTabs" :key="tab.url" :tab="tab" 
                  @jump="jumpFrameTab" @reload="reloadFrameTab" @close="closeFrameTab"/>
              </div>
            </el-popover>
          </template>
          
          <el-popover v-if="showDevTool">
            <button type="button" class="btn-text frame-nav-btn dev-tool" slot="reference">
              <i class="iconfont icon-gongju"></i>
            </button> 

            <div class="dev-tool-menu">
              <a href="javascript:;" @click="openDemo">demo</a>
              <a href="javascript:;" @click="clearStorage">清空缓存</a>
            </div>
          </el-popover>

          <a 
            href="/v3" class="btn-text frame-nav-btn frame-helpDoc"
            title="返回旧版" v-tooltip>
            <i class="iconfont icon-jiuban"></i>
          </a>
          
          <button 
            type="button" class="btn-text frame-nav-btn frame-helpDoc"
            @click="openHelpDoc"
            title="帮助文档" v-tooltip>
            <i class="iconfont icon-help"></i>
          </button>

          <button 
            type="button" class="btn-text frame-nav-btn frame-saleManager" 
            @click="openSaleManager"
            title="专属客服" v-tooltip>
            <i class="iconfont icon-customerservice"></i>
          </button>

          <el-popover trigger="hover" popper-class="export-panel-popper" placement="bottom-end" @input="exportPopoverToggle">
            <button type="button" class="btn-text frame-nav-btn frame-export" slot="reference">
              <i class="iconfont icon-export"></i>
            </button>

            <div class="frame-export-panel">
              <h3>导出下载（{{exportList.length || 0}}）</h3>
              <template v-if="exportList.length > 0">
                <div v-for="item in exportList" :key="item.id" class="export-row">
                  <img src="../../../assets/img/excel.png">
                  <div class="export-row-info">
                    <h4>{{item.name}}</h4>
                    <p>{{item.createTime | fmt_datetime}}</p>
                  </div>  
                  <div class="export-row-badge" :class="{'export-row-badge-finished': item.isFinished == 1}">{{item.isFinished == 0 ? '导出中' : '已完成'}}</div>
                  <template v-if="operationList.some(o => o.id == item.id)"><span class="export-operate-btn">请稍等</span></template>
                  <button type="button" class="btn btn-text export-operate-btn" @click="execExportFile(item)" v-else>{{item.isFinished == 0 ? '取消' : '下载'}}</button>
                </div>
              </template>
              <p class="export-empty" v-else>您没有待下载的文件</p>
            </div>
          </el-popover>
          <!--导出下载-->
    
          <!-- 个人信息 -->
          <el-popover popper-class="user-profile-menu" v-model="profilePopperVisible">
            <div class="frame-user-profile" slot="reference">
              <a class="user-avatar" :href="`/mine/` + loginUser.userId" @click.stop.prevent="openUserView">
                <img :src="userAvatar"/>
              </a>
              <div class="user-info">
                <h4>{{loginUser.displayName}}</h4>
                <p>
                  <span class="user-color-icon user-color-icon-mini" :style="{backgroundColor: userStateColor}"></span> 
                  <span>{{loginUser.state}}</span>
                </p>
              </div>
              <i class="iconfont icon-triangle-down user-profile-down"></i>
            </div>
            
            <el-popover placement="left-start" popper-class="user-state-popper" trigger="hover" v-model="userStatePopperVisible">
              <div class="user-profile-item" slot="reference"><i class="iconfont icon-user-status"></i>工作状态</div>

              <div class="user-state-panel">
                <div 
                  class="user-profile-item user-state-item" 
                  v-for="(color, state) in userStateMap" :key="state"
                  @click="chooseUserState(state)">
                  <span class="user-color-icon" :style="{backgroundColor: color}"></span>
                  <span>{{state}}</span>
                </div>
              </div>
            </el-popover>
            
            <div class="user-profile-item">
              <a :href="`/mine/` + loginUser.userId" @click.prevent.self="openUserView"><i class="iconfont icon-people"></i>个人中心</a>
            </div>
            
            <div class="user-profile-item logout">
              <a href="javascript:;" @click.prevent="logout"><i class="iconfont icon-logout"></i>注销</a>
            </div>

          </el-popover>
        </div>
      </header>

      <div class="frame-main">
        <div class="frame-tab-content">
          <div class="frame-tab-window" v-for="tab in frameTabs" :key="tab.url" v-show="tab.show">
            <iframe :id="`frame_${tab.id}`" :data-id="tab.id" :src="tab.url" @load="updateFrameTab($event,tab)" allowfullscreen/>
          </div>
        </div>
      </div>
    </div>

    <version :version="releaseVersion"/>
    <sale-manager :qrcode="initData.saleManagerQRCode" :show.sync="saleManagerShow"/>
  </div>
</template>

<script>
import platform from '@src/platform'
import http from '@src/util/http';
import FrameManager from './FrameManager';

import FrameTab from './component/FrameTab.vue';
import FrameNav from './component/FrameNav.vue';
import Version from './component/Version.vue';
import SaleManager from './component/SaleManager.vue';

import DefaultHead from '@src/assets/img/user-avatar.png';

export default {
  mixins: [FrameManager],
  name: 'frame-view',
  props: {
    initData: {
      type: Object,
      default: () => ({})
    }
  },
  data(){
    return {
      loginUser: this.initData.user || {}, //当前登录的用户

      profilePopperVisible: false, 
      userStatePopperVisible: false,
      saleManagerShow: false, // 是否显示专属客服

      collapse: true,
      currUrl: '/home',

      //导出相关变量
      exportPanelShow: false,
      exportTimer: null,
      exportList: [],
      operationList: []
    }
  },
  computed: {
    /** 是否显示devtool */
    showDevTool(){
      return this.$appConfig.appConfig != 'production' || this.initData.env != 'production';
    },
    /** 用户工作状态颜色配置 */
    userStateMap(){
      return this.initData.userStateMap || {};
    },
    /** 用户工作状态颜色 */
    userStateColor(){
      let state = this.loginUser.state;
      return this.userStateMap[state];
    },
    /** 用户头像 */
    userAvatar(){
      return this.loginUser.head || DefaultHead;
    },
    releaseVersion(){
      return this.initData.releaseVersion || '';
    }
  },
  methods: {
    adjustOpenTab(){
      let tab = this.frameTabs.find(item => item.show);
      this.adjustFrameTabs(tab)
    },
    openDemo(){
      this.openForFrame({
        id: "demo",
        url: '/demo',
        title: 'demo'
      })
    },
    /** @deprecated */
    async updateUser(){
      let result = await http.get(`/security/user/get/${this.loginUser.userId}`);
      if(result.status == 0){
        //暂时只更新状态
        this.loginUser.state = result.data.state;
      }
    },
    /** 选择用户状态 */
    async chooseUserState(state){
      this.userStatePopperVisible = false;
      this.profilePopperVisible = false;
      try {
        let result = await http.post('/security/user/updateState', {state}, false);
        if(result.status == 0) {
          this.updateUserState(state)
        }else{
          platform.alert(result.message)
        }
      } catch (error) {
        console.error(error)
      }
    },
    updateUserState(state){
      this.loginUser.state = state;
      //TODO: 判断是否打开个人中心，如果打开了，就刷新tab
    },
    async logout(){
      if(await platform.confirm('您确定要退出系统吗？')){
        window.location.href = platform.inDingTalk ? '/smlogin/pc/logout' : '/logout'
      }
    },
    openHelpDoc(event){
      platform.openLink("https://help.shb.ltd");
      this.profilePopperVisible = false;
    },
    openUserView(event){
      this.openForFrame({
        id: "userCenter",
        url: `/mine/` + this.loginUser.userId,
        title: '个人中心'
      })
      this.profilePopperVisible = false;
    },
    openSaleManager(){
      this.saleManagerShow = true;
      this.profilePopperVisible = false;
    },
    //兼容旧页面，迁移完成后删除
    addTabs(option){
      console.warn('不推荐调用该方法，使用platform.openFrameTab替代');
      this.openForFrame(option)
    },
    
    /** 检测是否有导出 */
    async checkExports(){
      try {
        this.exportList = await http.get('/export/getList');
        //更新操作列表
        this.operationList = this.operationList.filter(item => {
          return (
            item.operate == 'cancel' || 
            item.operate == 'download' && this.exportList.some(exp => exp.id == item)
          );
        })

        //以下情况需要刷新列表
        // 1. 有为导出完成的文件
        // 2. 操作列表中仍有下载的文件
        let autoFetchExportList = this.exportList.some(item => item.isFinished == 0) || this.operationList.some(item => item.operate == 'download')
                
        //如果不需要更新，清空定时器
        if(!autoFetchExportList){
          clearInterval(this.exportTimer);
          this.exportTimer = null;
          return;
        }

        //如果需要更新,设置定时抓取数据
        if(!this.exportTimer) this.exportTimer = setInterval(() => this.checkExports(), 5000);
      } catch (error) {
        console.error(error);

        clearInterval(this.exportTimer);
        this.exportTimer = null;
      }
    },
    async execExportFile(item){
      //下载文件
      if(item.isFinished == 1){
        let frame = document.createElement("iframe");
        frame.style.display = 'none';
        frame.src = `/export/download?id=${item.id}`;
        document.body.appendChild(frame);

        this.operationList.push({id: item.id, operate: 'download'})
        this.checkExports();
        return
      }

      //取消下载
      if(await platform.confirm(`确定要取消文件[${item.name}]的导出？`)){
        this.operationList.push({id: item.id, operate: 'cancel'})
        let result = await http.post('export/cancel', {id: item.id}, false);
        if(result.status == 0) this.checkExports();
      }
    },
    clearStorage(){
      localStorage.clear();
    },
    /** @deprecated */
    clearCachedIds(){
      let cachedKey = localStorage.getItem('cachedKey');
      let cachedkeyArray = [];

      if(cachedKey) cachedkeyArray = cachedKey.split(",")
      cachedkeyArray.forEach(key => localStorage.setItem(key,[]))
      localStorage.removeItem('cachedKey');
    },
    // popover manage
    exportPopoverToggle(visable){
      if(visable){
        this.profilePopperVisible = false
        this.userStatePopperVisible = false;
      }
    }
  },
  created(){
    window.addTabs = this.addTabs;
    window.updateUserState = this.updateUserState;
    window.showExportList = this.checkExports;
    window.removeHistoryUrl = window.resizeFrame = function(){
      console.warn('此方法只用于兼容旧页面，无实际效果，不推荐调用');
    }

    this.clearCachedIds();
  },
  mounted(){
    
    this.checkExports();
  },
  components: {
    [FrameNav.name]: FrameNav,
    [FrameTab.name]: FrameTab,
    [Version.name]: Version,
    [SaleManager.name]: SaleManager
  }
}
</script>

<style lang="scss" src="./frame.scss"></style>