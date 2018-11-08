<template>
  <div class="frame">
    <frame-nav 
      :collapse.sync="collapse" 
      :source="initData.menus" 
      :curr-url="currUrl"
      @open="openForNav"
      @transitionEnd="navTransitionEnd"/>
    <div class="frame-content">
      <header class="frame-header">
        <div class="frame-header-left" :class="{'frame-tab-highlight': prevBtnEnable}">
          <!-- <button type="button" class="btn-text frame-collapse" @click="collapse = !collapse">
            <i :class="['iconfont', collapse ? 'icon-open': 'icon-Takeup']"></i>
          </button> -->
          <button type="button" class="btn-text frame-tabs-prev" @click="prev" v-if="showOperateBtn">
            <i class="iconfont icon-left"></i>
          </button>
        </div>
        
        <!-- tabs -->
        <div class="frame-tabs-scroll" ref="scroll">
          <div class="frame-tabs-list" ref="list" :style="{transform: `translateX(${-offset}px)`}" @transitionend="tabTransitionEnd">
            <frame-tab 
              v-for="tab in frameTabs" :key="tab.url" :tab="tab" 
              @jump="jumpFrameTab" @reload="reloadFrameTab" @close="closeFrameTab"/>
          </div>
        </div>

        <!-- profile -->
        <div class="frame-header-right" :class="{'frame-tab-highlight': nextBtnEnable}">
          <button type="button" class="btn-text frame-tabs-next" @click="next" v-if="showOperateBtn">
            <i class="iconfont icon-right"></i>
          </button>

          <el-popover popper-class="frame-tabs-popper" placement="bottom-end" v-if="showOperateBtn">
            <button type="button" class="btn-text frame-tabs-more" slot="reference">
              <i class="iconfont icon-pile"></i>
            </button>
            <div class="frame-tabs-panel">
              <frame-tab 
                v-for="tab in frameTabs" :key="tab.url" :tab="tab" 
                @jump="jumpFrameTab" @reload="reloadFrameTab" @close="closeFrameTab"/>
            </div>
          </el-popover>
         
          <!-- <div><a href="/" style="line-height: 40px;">返回旧版</a></div>
          <div class="dev-tool" v-if="showDevTool">
            <span>测试工具</span>
            <div class="dev-tool-menu">
              <a href="javascript:;" @click="openDemo">demo</a>
              <a href="javascript:;" @click="clearStorage">清空缓存</a>
            </div>
          </div> -->
          <el-popover popper-class="export-panel-popper" placement="bottom-end">
            <button type="button" class="btn-text frame-export" slot="reference"><i class="iconfont icon-download"></i> 导出下载</button>

            <div class="frame-export-panel">
              <template v-if="exportList.length > 0">
                <div v-for="item in exportList" :key="item.id" class="export-row">
                  <img src="../../../assets/img/excel.png">
                  <div class="export-row-info">
                    <h4>{{item.name}}</h4>
                    <p>{{item.createTime | fmt_datetime}}</p>
                  </div>  
                  <div class="export-row-badge" :class="{'export-row-badge-finished': item.isFinished == 1}">{{item.isFinished == 0 ? '导出中' : '已完成'}}</div>
                  <a href="javascript:void(0);" @click="execExportFile(item)">{{item.isFinished == 0 ? '取消' : '下载'}}</a>
                </div>
              </template>

              <p class="export-empty" v-else>暂无待下载的文件</p>
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
            <div class="user-profile-item">
              <a href="https://help.shb.ltd" @click.prevent.self="openHelpDoc"><i class="iconfont icon-help"></i>帮助文档</a>
            </div>
            <div class="user-profile-item">
              <a href="javascript:;" @click.prevent.self="openSaleManager"><i class="iconfont icon-customerservice"></i>专属客服</a>
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

    <version :version="newVersion" :show.sync="versionShow"/>
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

const VERSION_NUM_KEY = 'shb_version_num';

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

      collapse: true,
      currUrl: '/home',

      versionShow: false, //是否显示版本信息
      saleManagerShow: false, // 是否显示专属客服
      newVersion:{}, //跟新了的版本信息

      //导出相关变量
      exportPanelShow: false,
      exportTimer: null,
      exportList: [],
      autoFetchExportList: true,
      downloadList: []
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
    }
  },
  methods: {
    navTransitionEnd(){
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
        if(platform.inDingTalk()){
            window.location.href = '/smlogin/pc/logout'
        }else{
            window.location.href = '/logout'
        }
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
    /** 检测是否有版本更新提示 */
    async checkVersion(){
      let currVersion = localStorage.getItem(VERSION_NUM_KEY);
      let versionNum = this.initData.releaseVersion || '';
      if(versionNum && (!currVersion || currVersion != versionNum)){
        try {
          let version = await http.get('/getLastVersion');
          this.newVersion = version.data;
          this.versionShow = true;
          localStorage.setItem(VERSION_NUM_KEY, versionNum);
        } catch (error) {
          console.error(error);
        }               
      }
    },
    /** 检测是否有导出 */
    async checkExports(){
      try {
        this.exportList = await http.get('/export/getList');

        let autoFetchExportList = this.exportList.length > 0 && this.exportList.some(item => item.isFinished == 0);
        //如果文件仍被抓取到，说明文件还没下载完成，仍需刷新导出列表
        if(this.downloadList.length > 0){
          this.downloadList = this.downloadList.filter(item => this.exportList.some(exp => exp.id == item))
          this.autoFetchExportList = true;
        }

        this.autoFetchExportList = autoFetchExportList;
        
        //如果不需要更新，清空定时器
        if(!this.autoFetchExportList){
          if(this.exportTimer){
            clearInterval(this.exportTimer);
            this.exportTimer = null;
          }
          return;
        }

        //如果需要更新,设置定时抓取数据
        if(!this.exportTimer) this.exportTimer = setInterval(() => this.checkExports(), 15000);
      } catch (error) {
        console.error(error);

        if(this.exportTimer){
          clearInterval(this.exportTimer);
          this.exportTimer = null;
        }
      }
    },
    async execExportFile(item){
      //下载文件
      if(item.isFinished == 1){
        let frame = document.createElement("iframe");
        frame.style.display = 'none';
        frame.src = `/export/download?id=${item.id}`;
        document.body.appendChild(frame);

        this.downloadList.push(item.id)
        this.checkExports();
        return
      }

      //取消下载
      if(await platform.confirm(`确定要取消文件[${item.name}]的导出？`)){
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
    this.checkVersion();
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