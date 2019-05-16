<template>
  <div class="shb-main">
    <div class="frame">
      <frame-nav 
        :collapse.sync="collapse" 
        :source="initData.menus" 
        @open="openForNav"
        @collapse-changed="adjustOpenTab"/>

    <div class="frame-content">
      <header class="frame-header">
        <div class="frame-quick">
          <div class="frame-quick-left">
            <button type="button" class="btn-text frame-header-btn frame-collapse frame-header-btn-bg" @click="collapse = !collapse">
              <i :class="['iconfont', collapse ? 'icon-open': 'icon-Takeup']"></i>
            </button>     
          </div>
          
          <div class="frame-quick-notification" v-show="notificationShow">
            <div class="frame-quick-notification-info" ref="notificationInfo">
              <div class="frame-quick-notification-content" ref="notificationContent">
                <p ref="notificationText" class="frame-quick-notification-text">{{ notification.title }}</p>
              </div>
            </div>
            <button type="button" @click="closeNotification" class="frame-quick-notification-btn">
              <i class="iconfont icon-chahao"></i>
            </button>
          </div>

          <!-- profile -->
          <div class="frame-quick-right">
            <el-popover v-if="showDevTool">
              <button type="button" class="btn-text frame-header-btn dev-tool" slot="reference">
                <i class="iconfont icon-experiment"></i>
              </button> 

              <div class="dev-tool-menu">
                <a href="javascript:;" @click="clearStorage">清空缓存</a>
                <a href="javascript:;" @click="openDemo">demo</a>
                <a href="javascript:;" @click="goRoleTeam">团队管理</a>
                <a href="javascript:;" @click="goProductTemplate">产品模板旧版</a>
                <a href="javascript:;" @click="goProductOld">产品管理旧版</a>
                <a href="javascript:;" @click="goProductSetting">产品字段设置</a>
              </div>
            </el-popover>
        
            <button 
              type="button" class="btn-text frame-header-btn frame-header-btn-bg"
              @click="openHelpDoc"
              title="帮助文档" v-tooltip>
              <i class="iconfont icon-bangzhu"></i>
            </button>

            <button 
              type="button" class="btn-text frame-header-btn frame-header-btn-bg" 
              @click="openSaleManager"
              title="专属客服" v-tooltip>
              <i class="iconfont icon-kefu"></i>
            </button>

            <el-popover trigger="click" :value="exportPopperVisible" popper-class="export-panel-popper" placement="bottom-end" @input="exportPopoverToggle">
              <button type="button" class="btn-text frame-header-btn frame-header-btn-bg" slot="reference">
                <i class="iconfont icon-xiazai"></i>
              </button>
              <!-- start 导入导出下载 -->
              <import-and-export-view 
                :source-list="exportList" 
                @change="operationListChange"
              >
              </import-and-export-view>
              <!-- end 导入导出下载 -->
            </el-popover>
            <!--导出下载-->

            <button
              type="button" class="btn-text frame-header-btn frame-header-btn-bg notification-btn"
              @click="openNotificationCenter"
              title="通知中心" v-tooltip>
              <span class="notification-new" v-show="notification.count && notification.count > 0">{{ msgCount || notification.count }}</span>
              <i class="iconfont">&#xe624;</i>
            </button>

            <!-- 个人信息 -->
            <el-popover popper-class="user-profile-menu" v-model="profilePopperVisible">
              <div class="frame-user-profile" slot="reference">
                <a class="user-avatar" :href="`/mine/` + loginUser.userId" @click.stop.prevent="openUserView">
                  <img :src="userAvatar"/>
                  <span class="user-color-icon user-color-icon-mini" :style="{backgroundColor: userStateColor}"></span> 
                </a>
                <div class="user-info">
                  <h4>{{loginUser.displayName}}</h4>
                  <p>{{loginUser.state}}</p>
                </div>
                <i class="iconfont icon-nav-down user-profile-down"></i>
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
        </div>

        <div class="frame-tabs">
          <button type="button" class="btn-text frame-tabs-prev" :class="{'frame-tab-highlight': prevBtnEnable}" @click="prev">
            <i class="iconfont icon-zuoyidong"></i>
          </button>

          <!-- tabs -->
          <div class="frame-tabs-scroll" ref="scroll" @wheel="tabScroll">
            <div ref="list" :class="{'frame-tabs-list': true,'frame-tab-transition': offsetTransition}" :style="{transform: `translateX(${-offset}px)`}" @transitionend="tabTransitionEnd">
              <frame-tab 
                v-for="tab in frameTabs" :key="tab.url" :tab="tab" 
                @jump="jumpFrameTab" @reload="reloadFrameTab" @close="closeFrameTab"/>   
            </div>
            <div class="frame-tabs-border"></div>
          </div>

          <button type="button" class="btn-text frame-tabs-next" :class="{'frame-tab-highlight': nextBtnEnable}" @click="next">
            <i class="iconfont icon-youyidong"></i>
          </button>
        </div>
      </header>
      
      <div class="frame-main">
        <div class="frame-tab-content">
          <div class="frame-tab-window" v-for="tab in frameTabs" :key="tab.url" v-show="tab.show">
            <iframe 
              :id="`frame_tab_${tab.id}`" :fromid="tab.fromId" :data-id="tab.id" 
              :src="tab.url" 
              @load="updateFrameTab($event,tab)" allowfullscreen/>
          </div>
        </div>
      </div>
    </div>

      <version :version="releaseVersion"/>
      <sale-manager :qrcode="initData.saleManagerQRCode" :show.sync="saleManagerShow"/>
      <notification-center ref="notification" :info="notificationInfo" @clearNum="clearNum" @getNum="getNum"></notification-center>
    <!-- <base-context-menu for=".frame-tab" :menu-render="menuRender" @command="closeTabHandler"></base-context-menu> -->
    </div>
    <!-- star 用户向导 -->
    <base-modal :show.sync="isShowUserGuide" width="600px" class="user-guide-modal-dialog" :class="isGuideLast ? 'base-modal-header-hidden' : ''">
      <div slot="title">
        <h3 class="user-guide-modal-header" slot="reference">立刻设置您的个性化系统</h3>
      </div>
      <div class="user-guide-view" @click.prevent>
        <guide-view :init-data="initData" @isLast="guideLast" @guideUpdateModalShow="guideUpdateModalShow">
        </guide-view>
      </div>
    </base-modal>
    <!-- end 用户向导 -->

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

import ImportAndExport from './component/ImportAndExport.vue'

import DefaultHead from '@src/assets/img/user-avatar.png';
import NotificationCenter from './component/NotificationCenter.vue'
import * as NotificationApi from '@src/api/NotificationApi';

// 用户向导
import GuideView from './../guide/GuideView.vue'

const NOTIFICATION_TIME = 1000 * 60 * 10

export default {
  mixins: [FrameManager],
  name: 'frame-view',
  inject: ['initData'],
  data(){
    return {
      notificationInfo: {},
      notification: {
        count: 0,
      },
      systemMsg: '',
      notificationShow: false,
      notificationStyle: {},
      msgCount: '',
      loginUser: this.initData.user || {}, // 当前登录的用户

      profilePopperVisible: false, 
      userStatePopperVisible: false,
      saleManagerShow: false, // 是否显示专属客服
      exportPopperVisible: false,

      collapse: true,

      // 导出相关变量
      exportPanelShow: false,
      exportTimer: null,
      exportList: [],
      operationList: [],

      // 用户向导
      isShowUserGuide: false,
      isGuideLast: false,
    }
  },
  computed: {
    /** 是否显示devtool */
    showDevTool(){
      return this.$appConfig.env != 'production' || this.initData.env != 'production';
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
    menuRender (h, target) {
      let menus = [
        <base-context-menu-item command="other">关闭其他</base-context-menu-item>,
        <base-context-menu-item command="all">关闭全部</base-context-menu-item>
      ];

      if(target && target.id != 'tab_HOME'){
        menus.unshift(<base-context-menu-item command="itself">关闭</base-context-menu-item>)
      }

      return menus;
    },
    adjustOpenTab(){
      let tab = this.frameTabs.find(item => item.show);
      this.adjustFrameTabs(tab)
    },
    openDemo(){
      this.openForFrame({
        id: 'demo',
        url: '/demo',
        title: 'demo'
      })
    },
    /** @deprecated */
    async updateUser(){
      let result = await http.get(`/security/user/get/${this.loginUser.userId}`);
      if(result.status == 0){
        // 暂时只更新状态
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
    },
    async logout(){
      if(await platform.confirm('您确定要退出系统吗？')){
        window.location.href = platform.inDingTalk ? '/smlogin/pc/logout' : '/logout'
      }
    },
    openHelpDoc(event){
      platform.openLink('https://help.shb.ltd');
      this.profilePopperVisible = false;
    },
    openUserView(event){
      this.openForFrame({
        id: 'userCenter',
        url: `/mine/${this.loginUser.userId}`,
        title: '个人中心'
      })
      this.profilePopperVisible = false;
    },
    openSaleManager(){
      this.saleManagerShow = true;
      this.profilePopperVisible = false;
    },
    openNotificationCenter () {
      this.$refs.notification.showComponent();
      this.profilePopperVisible = false;
    },
    /** 检测是否有导出 */
    async checkExports(){
      try {
        this.exportList = (await http.get('/excels/getList') || []);
        // 更新操作列表
        if(!Array.isArray(this.exportList)) this.exportList = [];
        // 更新操作列表
        this.operationList = this.operationList.filter(item => {
          return (
            item.operate == 'cancel'
            || (item.operate == 'download' && this.exportList.some(exp => exp.id == item.id))
          );
        })

        // 以下情况需要刷新列表
        // 1. 有为导出完成的文件
        // 2. 操作列表中仍有下载的文件
        let autoFetchExportList = this.exportList.some(item => item.isFinished == 0) || this.operationList.some(item => item.operate == 'download')
                
        // 如果不需要更新，清空定时器
        if(!autoFetchExportList){
          clearInterval(this.exportTimer);
          this.exportTimer = null;
          return;
        }

        // 如果需要更新,设置定时抓取数据
        if(!this.exportTimer) this.exportTimer = setInterval(() => this.checkExports(), 5000);
      } catch (error) {
        console.error(error);

        clearInterval(this.exportTimer);
        this.exportTimer = null;
      }
    },
    /* 导入导出操作列表变化 */
    operationListChange(list) {
      this.operationList = list;
      this.checkExports();
    },
    clearStorage(){
      localStorage.clear();
    },
    /** @deprecated */
    clearCachedIds(){
      let cachedKey = localStorage.getItem('cachedKey');
      let cachedKeyArray = [];

      if(cachedKey) cachedKeyArray = cachedKey.split(',')
      cachedKeyArray.forEach(key => localStorage.setItem(key, []))
      localStorage.removeItem('cachedKey');
    },
    // popover manage
    exportPopoverToggle(visible){
      this.exportPopperVisible = visible;

      if(visible){
        this.profilePopperVisible = false
        this.userStatePopperVisible = false;
      }
    },
    goRoleTeam() {
      platform.openTab({
        id: 'team',
        title: '团队管理',
        url: '/security/tag',
        reload: true
      });
    },
    closeNotification () {
      this.notificationShow = false;
      sessionStorage.setItem('shb_systemMsg', this.notificationInfo.msgSystem.id);
      this.clearAnimation();
    },

    // 获取系统消息，本地存储，超出滚动
    async getSystemMsg () {
      try {
        let info = await NotificationApi.getSystemMessage();
        if(info.status == 0) {
          this.notificationInfo = info.data;        
          this.notification.count = info.data.systemMsg + info.data.workMsg;
          let msgSystem = sessionStorage.getItem('shb_systemMsg');
        
          if(this.notification.count > 99) {
            this.msgCount = '99+';
          } else {
            this.msgCount = '';
          }
          if(this.notificationInfo.msgSystem && (!msgSystem || msgSystem != this.notificationInfo.msgSystem.id)) {
            this.notification.title = info.data.msgSystem.title;
            this.notificationShow = true;
            this.setAnimation();
          } else {
            this.notification.title = null;
            this.notificationShow = false;
          }
        }
      } catch (error) {
        console.error(error);
      }
    },

    /** 设置滚动动画 */
    setAnimation () {
      this.$nextTick(() => {
        let textWidth = this.$refs.notificationText.offsetWidth;
        let infoWidth = this.$refs.notificationInfo.offsetWidth - 30;
        if(textWidth > infoWidth) {
          let time = this.notification.title.length / 4;
          this.$refs.notificationContent.style.animation = `text-scroll ${time}s linear infinite`;
        }
      })
    },
    clearAnimation () {
      this.$refs.notificationContent.style.animation = '';
    },

    /** 删除未读消息或消息已读后更新新通知数量 */
    clearNum (val, n) {
      if(val == 'system') {
        this.notificationInfo.systemMsg = (n == 1 ? --this.notificationInfo.systemMsg : 0);
      } else if (val == 'work') {
        this.notificationInfo.workMsg = (n == 1 ? --this.notificationInfo.workMsg : 0);
      }
      this.notification.count = this.notificationInfo.systemMsg + this.notificationInfo.workMsg;
    },
    getNum () {
      this.getSystemMsg();
    },
    goProductTemplate() {
      platform.openTab({
        id: 'product_template',
        title: '产品模板列表',
        url: '/product/old',
        reload: true,
      });
    },
    goProductOld() {
      platform.openTab({
        id: 'product',
        title: '产品管理',
        url: '/customer/product/old',
        reload: true,
      });
    },
    goProductSetting() {
      platform.openTab({
        id: 'product_setting',
        title: '产品设置',
        url: '/setting/product/fields',
        reload: true,
      });
    },
    guideLast(data) {
      this.isGuideLast = data;
    },
    guideUpdateModalShow() {
      this.isShowUserGuide = false;
    }
  },
  created(){
    // TODO: 迁移完成后删除
    window.updateUserState = this.updateUserState;
    window.showExportList = this.checkExports;
    window.exportPopoverToggle = this.exportPopoverToggle;

    window.resizeFrame = function(){
      console.warn('此方法只用于兼容旧页面，无实际效果，不推荐调用');
    }
    this.clearCachedIds();
    sessionStorage.removeItem('shb_systemMsg');
    this.getSystemMsg();
    setInterval(() => {
      this.getSystemMsg();
    }, NOTIFICATION_TIME);

    let userGuide = this?.initData?.userGuide === true || false;
    // let userGuide = true;

    if(userGuide) {
      this.isShowUserGuide = true;
    }

  },
  mounted(){
    this.checkExports();
  },
  components: {
    [FrameNav.name]: FrameNav,
    [FrameTab.name]: FrameTab,
    [Version.name]: Version,
    [SaleManager.name]: SaleManager,
    [NotificationCenter.name]: NotificationCenter,
    [ImportAndExport.name]: ImportAndExport,
    [GuideView.name]: GuideView
  }
}
</script>

<style lang="scss" src="./frame.scss"></style>