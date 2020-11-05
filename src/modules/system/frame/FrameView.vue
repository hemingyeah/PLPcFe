<template>
  <div class="shb-main">
    <div class="frame">
      <frame-nav
        :collapse.sync="collapse"
        :source="navBarMenus"
        :callcenter="has_call_center_module"
        @open="openForNav"
        @collapse-changed="adjustOpenTab"
        v-if="showNavBar"
      />

      <div class="frame-content">
        <header class="frame-header">
          <div class="frame-quick">
            <div class="frame-quick-left">
              <button
                type="button"
                class="btn-text frame-header-btn frame-collapse frame-header-btn-bg"
                @click="collapse = !collapse"
              >
                <i :class="['iconfont', collapse ? 'icon-open': 'icon-Takeup']"></i>
              </button>

              <!-- start 工单列表切换新旧版 -->
              <template v-if="allowChangeTaskVersion">
                <el-button
                  @click="changeTaskVersion(false)"
                  class="task-version-btn"
                  type="primary"
                  v-if="isUserTaskGray"
                >返回旧版</el-button>

                <el-button
                  @click="changeTaskVersion(true)"
                  class="task-version-btn task-new-version"
                  type="primary"
                  v-else
                >切换新版</el-button>
              </template>
              <!-- end 工单列表切换新旧版 -->
            </div>

            <div class="frame-quick-notification" v-show="notificationShow">
              <div class="frame-quick-notification-info" ref="notificationInfo">
                <div class="frame-quick-notification-content" ref="notificationContent">
                  <p
                    ref="notificationText"
                    class="frame-quick-notification-text"
                  >{{ notification.title }}</p>
                </div>
              </div>
              <button type="button" @click="closeNotification" class="frame-quick-notification-btn">
                <i class="iconfont icon-chahao"></i>
              </button>
            </div>

            <!-- profile -->
            <div class="frame-quick-right">
              <button
                v-if="has_call_center_module"
                type="button"
                class="btn-text frame-header-btn"
                @click="handleCallCenterClick"
              >
                <i class="iconfont icon-dianhua1"></i>
              </button>
              <div v-if="showCallCenter" class="call-center-box">
                <p class="customer-name" v-if="!callData.linkmanName">未知联系人</p>
                <p class="customer-name" v-if="callData.linkmanName">{{callData.linkmanName}}</p>
                <p v-if="callData.linkmanName">{{callData.customerName}}</p>
                <div class="divider"></div>
                <div class="call-ripple">
                  <div class="icon-ripple">
                    <img src="../../../assets/img/phone.png" />
                    <div class="ripple1"></div>
                    <div class="ripple2"></div>
                  </div>
                </div>
                <p style="margin-top:10px;font-size: 26px;">{{callData.callPhone}}</p>
                <el-button type="danger" @click="hangUpCall" style="margin-bottom: 20px;">挂断</el-button>
                <!-- 呼入 -->
                <template v-if="callData.callType=='normal'">
                  <div class="call-in">
                    <p class="today">
                      今日已来电（
                      <span>{{callData.dialCount || 0}}</span>）
                    </p>
                    <p>
                      未完成工单（
                      <span>{{callData.taskCount || 0}}</span>）
                    </p>
                    <p>
                      未完成事件（
                      <span>{{callData.eventCount || 0}}</span>）
                    </p>
                  </div>
                </template>
                <template v-else>
                  <!-- 呼出 -->
                  <div class="call-out">
                    <p>
                      今日已来电（
                      <span>{{callData.dialCount || 0}}</span>）
                    </p>
                    <div class="unfinsh">
                      <p>
                        未完成工单（
                        <span>{{callData.taskCount || 0}}</span>）
                      </p>
                      <p>
                        未完成事件（
                        <span>{{callData.eventCount || 0}}</span>）
                      </p>
                    </div>
                  </div>
                </template>
                <p class="last">{{callData.message}}</p>
              </div>

              <el-popover v-if="showDevTool">
                <button type="button" class="btn-text frame-header-btn dev-tool" slot="reference">
                  <i class="iconfont icon-experiment"></i>
                </button>

                <div class="dev-tool-menu">
                  <a href="javascript:;" @click="clearStorage">清空缓存</a>
                  <a href="javascript:;" @click="openDemo">demo</a>
                  <!-- <a href="javascript:;" @click="goRoleTeam">团队管理</a> -->
                  <!-- <a href="javascript:;" @click="goProductTemplate">产品模板旧版</a>
                  <a href="javascript:;" @click="goProductOld">产品管理旧版</a>
                  <a href="javascript:;" @click="goProductSetting">产品字段设置</a>
                  <a href="javascript:;" @click="goCustomerContact">客户联系人</a>
                  <a href="javascript:;" @click="goDoMyself">自助门户设置</a> -->
                  <a href="javascript:;" @click="goTaskSetting">工单表单设置</a>
                  <a href="javascript:;" @click="goTaskReceiptSetting">工单回执表单设置</a>
                  <a href="javascript:;" @click="goCreateTask">新建工单</a>
                  <a href="javascript:;" @click="goCreateTaskForCallcenter">新建工单呼叫中心</a>
                  <a href="javascript:;" @click="goTaskList">工单列表</a>
                  <!-- <a href="javascript:;" @click="goCallCenterSetting">呼叫中心设置</a>
                  <a href="javascript:;" @click="goCallCenterWorkbench">呼叫工作台</a>
                  <a href="javascript:;" @click="goCallCenter">呼叫中心</a> -->
                </div>
              </el-popover>

              <button
                type="button"
                class="btn-text frame-header-btn frame-header-btn-bg"
                @click="openHelpDoc"
                title="帮助文档"
                v-tooltip
              >
                <i class="iconfont icon-bangzhu"></i>
              </button>

              <button
                type="button"
                class="btn-text frame-header-btn frame-header-btn-bg"
                @click="openSaleManager"
                title="专属客服"
                v-tooltip
              >
                <i class="iconfont icon-customerservice"></i>
              </button>

              <el-popover
                trigger="click"
                :value="exportPopperVisible"
                popper-class="export-panel-popper"
                placement="bottom-end"
                @input="exportPopoverToggle"
              >
                <button
                  type="button"
                  :title="backgroundTaskTitle"
                  v-tooltip
                  class="btn-text frame-header-btn frame-header-btn-bg"
                  slot="reference"
                >
                  <i class="iconfont icon-xiazai"></i>
                </button>
                <!-- start 导入导出下载 -->
                <import-and-export-view
                  :title="backgroundTaskTitle"
                  :source-list="exportList"
                  @change="operationListChange"
                ></import-and-export-view>
                <!-- end 导入导出下载 -->
              </el-popover>
              <!--导出下载-->

              <button
                type="button"
                class="btn-text frame-header-btn frame-header-btn-bg notification-btn"
                @click="openNotificationCenter"
                title="通知中心"
                v-tooltip
              >
                <span
                  class="notification-new"
                  v-show="notification.count && notification.count > 0"
                >{{ notification.count>99?99:notification.count }}</span>
                <i class="iconfont">&#xe624;</i>
              </button>

              <!-- 个人信息 -->
              <el-popover popper-class="user-profile-menu" v-model="profilePopperVisible">
                <div class="frame-user-profile" slot="reference">
                  <a
                    class="user-avatar"
                    :href="`/mine/` + loginUser.userId"
                    @click.stop.prevent="openUserView"
                  >
                    <img :src="userAvatar" />
                    <span
                      class="user-color-icon user-color-icon-mini"
                      :style="{backgroundColor: userStateColor}"
                    ></span>
                  </a>
                  <div class="user-info">
                    <h4>{{loginUser.displayName}}</h4>
                    <p>{{loginUser.state}}</p>
                  </div>
                  <i class="iconfont icon-nav-down user-profile-down"></i>
                </div>

                <el-popover
                  placement="left-start"
                  popper-class="user-state-popper"
                  trigger="hover"
                  v-model="userStatePopperVisible"
                >
                  <div class="user-profile-item" slot="reference">
                    <i class="iconfont icon-user-status"></i>工作状态
                  </div>

                  <div class="user-state-panel">
                    <div
                      class="user-profile-item user-state-item"
                      v-for="(color, state) in userStateMap"
                      :key="state"
                      @click="chooseUserState(state)"
                    >
                      <span class="user-color-icon" :style="{backgroundColor: color}"></span>
                      <span>{{state}}</span>
                    </div>
                  </div>
                </el-popover>

                <div class="user-profile-item">
                  <a :href="`/mine/` + loginUser.userId" @click.prevent.self="openUserView">
                    <i class="iconfont icon-people"></i>个人中心
                  </a>
                </div>

                <div class="user-profile-item logout">
                  <a href="javascript:;" @click.prevent="logout">
                    <i class="iconfont icon-logout"></i>注销
                  </a>
                </div>
              </el-popover>
            </div>
          </div>

          <div class="frame-tabs">
            <button
              type="button"
              class="btn-text frame-tabs-prev"
              :class="{'frame-tab-highlight': prevBtnEnable}"
              @click="prev"
            >
              <i class="iconfont icon-zuoyidong"></i>
            </button>

            <!-- tabs -->
            <div class="frame-tabs-scroll" ref="scroll" @wheel="tabScroll">
              <div
                ref="list"
                :class="{'frame-tabs-list': true,'frame-tab-transition': offsetTransition}"
                :style="{transform: `translateX(${-offset}px)`}"
                @transitionend="tabTransitionEnd"
              >
                <frame-tab
                  v-for="(tab, index) in frameTabs"
                  :key="`${index}_${tab.url}`"
                  :tab="tab"
                  @jump="jumpFrameTab"
                  @reload="reloadFrameTab"
                  @close="closeFrameTab"
                />
              </div>
              <div class="frame-tabs-border"></div>
            </div>

            <button
              type="button"
              class="btn-text frame-tabs-next"
              :class="{'frame-tab-highlight': nextBtnEnable}"
              @click="next"
            >
              <i class="iconfont icon-youyidong"></i>
            </button>
          </div>
        </header>

        <div class="frame-main">
          <div class="frame-tab-content">
            <div
              class="frame-tab-window"
              v-for="(tab, index) in frameTabs"
              :key="`${index}_${tab.url}`"
              v-show="tab.show"
            >
              <iframe
                :id="`frame_tab_${tab.id}`"
                :fromid="tab.fromId"
                :data-id="tab.id"
                :src="tab.url"
                @load="updateFrameTab($event,tab)"
                allowfullscreen
              />
            </div>
          </div>
        </div>
      </div>
      <version :version="releaseVersion" v-if="loadedEdition" :edition="shbEdition" @showSystemPopup="updateSystemPopup" />
      <!--start 系统弹窗 -->
      <system-popup :system-data.sync="systemData" v-if="loadedSystemModal" />
      <!--end 系统弹窗 -->
      <sale-manager
        :service-group-url="initData.serviceGroupUrl"
        :qrcode="initData.saleManagerQRCode"
        :show.sync="saleManagerShow"
      />
      <notification-center
        ref="notification"
        :info="notificationInfo"
        :all-count="notification.count"
        @clearNum="clearNum"
        @getNum="getNum"
      ></notification-center>
      <!-- <base-context-menu for=".frame-tab" :menu-render="menuRender" @command="closeTabHandler"></base-context-menu> -->
    </div>
    <!-- start 用户向导 -->
    <user-guide ref="userGuideView"></user-guide>
    <!-- end 用户向导 -->
  </div>
</template>

<script>
import platform from '@src/platform';
import http from '@src/util/http';
import FrameManager from './FrameManager';

import FrameTab from './component/FrameTab.vue';
import FrameNav from './component/FrameNav.vue';
import Version from './component/Version.vue';
import SystemPopup from './component/SystemPopup.vue';
import SaleManager from './component/SaleManager.vue';
import UserGuide from './component/UserGuide.vue';

import ImportAndExport from './component/ImportAndExport.vue';

import DefaultHead from '@src/assets/img/user-avatar.png';
import NotificationCenter from './component/NotificationCenter.vue';
import * as NotificationApi from '@src/api/NotificationApi';
import * as CallCenterApi from '@src/api/CallCenterApi';
import * as SettingApi from '@src/api/SettingApi';

import { isShowDashboardScreen, isShowPlanTask, isShowLinkC, isShowMoreSperaParts } from '@src/util/version.ts'

/* util */
import _ from 'lodash';
import Axios from 'axios';

const newTaskGuideStore = require('@src/component/guide/taskV2Store');
const GuideStoreObj = {
  newTaskGuideStore
}

const NOTIFICATION_TIME = 1000 * 60 * 10;

// const wsUrl = 'ws://30.40.56.211:8080/websocket/asset/7416b42a-25cc-11e7-a500-00163e12f748_dd4531bf-7598-11ea-bfc9-00163e304a25'
let webSocketClient = null,
  lockReconnect = false,
  reconnectTimmer = null;

export default {
  mixins: [FrameManager],
  name: 'frame-view',
  inject: ['initData'],
  data() {
    return {
      notificationInfo: {},
      notification: {
        count: 0,
      },
      systemMsg: '',
      notificationShow: false,
      notificationStyle: {},
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

      // 后台任务
      backgroundTaskTitle: '后台任务',

      showCallCenter: false,
      callData: {},
      heartCheck: {
        timeout: 5000, // 每隔5秒发送心跳
        num: 3, // 3次心跳均未响应重连
        timeoutObj: null,
        serverTimeoutObj: null,
        start() {
          let _num = this.num;
          this.timeoutObj && clearTimeout(this.timeoutObj);
          this.serverTimeoutObj && clearTimeout(this.serverTimeoutObj);
          this.timeoutObj = setTimeout(() => {
            // 这里发送一个心跳，后端收到后，返回一个心跳消息，
            // onmessage拿到返回的心跳就说明连接正常
            webSocketClient.send(JSON.stringify({ action: 'ping' }));
            _num--;
            if (_num === 0) {
              webSocketClient.colse();
            }
          }, this.timeout);
        },
      },
      has_call_center_module: false,
      isUserTaskGray: this.initData.isUserTaskGrayFunction, // 用户选择新旧版工单标识
      navBarMenus: [],
      showNavBar: false,
      loadedEdition: false,
      loadedSystemPopup:false,
      showSystemPopup:false,
      systemData:[],
      shbEdition: 1
    };
  },
  computed: {
    loadedSystemModal(){
      return this.loadedSystemPopup && this.showSystemPopup
    },
    wsUrl() {
      // websocket连接地址
      // return `ws://30.40.56.211:8080/websocket/asset/7416b42a-25cc-11e7-a500-00163e12f748_dd4531bf-7598-11ea-bfc9-00163e304a25`
      const currentProtocol = window.location.protocol;
      let protocol = 'ws';
      if (currentProtocol === 'https:') {
        protocol = 'wss';
      }
      return `${protocol}://${window.location.hostname}/api/callcenter/outside/websocket/asset/${this.loginUser.tenantId}_${this.loginUser.userId}`;
    },
    /** 是否显示devtool */
    showDevTool() {
      return (
        this.$appConfig.env != 'production' || this.initData.env != 'production'
      );
    },
    /** 用户工作状态颜色配置 */
    userStateMap() {
      return this.initData.userStateMap || {};
    },
    /** 用户工作状态颜色 */
    userStateColor() {
      let state = this.loginUser.state;
      return this.userStateMap[state];
    },
    /** 用户头像 */
    userAvatar() {
      return this.loginUser.head || DefaultHead;
    },
    releaseVersion() {
      return (this.initData.releaseVersion && this.initData.releaseVersion.toLocaleLowerCase().replace('vip', '')) || '';
    },
    /** 激活状态的工单列表 */
    currentTaskListTab() {
      let taskList = this.frameTabs.filter(tab => tab.id === 'M_TASK_ALL' && tab.show);
      return taskList[0] || {};
    },
    /** 允许切换工单新旧版本 */
    allowChangeTaskVersion() {
      // 企业是否开启工单灰度功能
      let isTaskGray = this.initData.isTaskGrayFunction;
      return isTaskGray && this.currentTaskListTab.id;
    },
  },
  methods: {
    updateSystemPopup(){
      this.showSystemPopup = true
    },
    async hangUpCall() {
      try {
        let { code, message } = await CallCenterApi.hangUpCall();
        if (code != 0) this.$message.error(message || '内部错误');
        console.log('res:', code, message);
      } catch (error) {
        console.error(error);
      }
    },
    // 判断当前租户是否开启呼叫中心灰度功能
    async judgeCallCenterGray() {
      localStorage.setItem('call_center_gray', 0);
      localStorage.setItem('call_center_module', 0);
      try {
        const { status, data } = await http.get('/setting/callCenterGray');
        if (status !== 0 || !data) {
          return;
        }
        if (data.callcenter) {
          // 说明开启呼叫中心灰度
          localStorage.setItem('call_center_gray', 1);
          return await this.getAccountInfo()
        }

        localStorage.setItem('call_center_module', 0);
        localStorage.setItem('call_center_gray', 0);
        
      } catch (error) {
        console.error(error);
      }
    },
    async getAccountInfo() {
      localStorage.setItem('call_center_module', 0);
      try {
        const { code, result } = await CallCenterApi.getAccountInfo();
        // result为null未申请开通
        if (code !== 0 || !result) {
          return;
        }
        // 审核状态：0待审核，1已审核
        if (result.verifyStatus == 1) {
          this.has_call_center_module = true;
          localStorage.setItem('call_center_module', 1);
          if ('WebSocket' in window) {
            this.initWebSocket();
          } else {
            alert('当前浏览器 Not support websocket');
          }

          return true
        }
      } catch (error) {
        console.error(error);
      }
    },
    menuRender(h, target) {
      let menus = [
        <base-context-menu-item command="other">
          关闭其他
        </base-context-menu-item>,
        <base-context-menu-item command="all">关闭全部</base-context-menu-item>,
      ];

      if (target && target.id != 'tab_HOME') {
        menus.unshift(
          <base-context-menu-item command="itself">关闭</base-context-menu-item>
        );
      }

      return menus;
    },
    adjustOpenTab() {
      let tab = this.frameTabs.find((item) => item.show);
      this.adjustFrameTabs(tab);
    },
    openDemo() {
      this.openForFrame({
        id: 'demo',
        url: '/demo',
        title: 'demo'
      });
    },
    /** @deprecated */
    async updateUser() {
      try {
        let result = await http.get(
          `/security/user/get/${this.loginUser.userId}`
        );
        if (result.status == 0) {
          // 暂时只更新状态
          this.loginUser.state = result.data.state;
        }
      } catch (error) {
        console.error(error);
      }
    },
    /** 选择用户状态 */
    async chooseUserState(state) {
      this.userStatePopperVisible = false;
      this.profilePopperVisible = false;
      try {
        let result = await http.post(
          '/security/user/updateState',
          { state },
          false
        );
        if (result.status == 0) {
          this.updateUserState(state);
        } else {
          platform.alert(result.message);
        }
      } catch (error) {
        console.error(error);
      }
    },
    updateUserState(state) {
      this.loginUser.state = state;
    },
    async logout() {
      if (await platform.confirm('您确定要退出系统吗？')) {
        window.location.href = platform.inDingTalk
          ? '/smlogin/pc/logout'
          : '/logout';
      }
    },
    openHelpDoc(event) {
      platform.openLink('https://www.yuque.com/shb/help');
      this.profilePopperVisible = false;
    },
    openUserView(event) {
      this.openForFrame({
        id: 'userCenter',
        url: `/mine/${this.loginUser.userId}`,
        title: '个人中心',
      });
      this.profilePopperVisible = false;
    },
    openSaleManager() {
      this.saleManagerShow = true;
      this.profilePopperVisible = false;
    },
    openNotificationCenter() {
      this.$refs.notification.showComponent();
      this.profilePopperVisible = false;
    },
    /** 检测是否有导出 */
    async checkExports() {
      try {
        this.exportList = (await http.get('/excels/getList')) || []; // 报错
        // 更新操作列表
        if (!Array.isArray(this.exportList)) this.exportList = [];
        // 更新操作列表
        this.operationList = this.operationList.filter((item) => {
          return (
            item.operate == 'cancel'
            || (item.operate == 'download'
              && this.exportList.some((exp) => exp.id == item.id))
          );
        });

        // 以下情况需要刷新列表
        // 1. 有为导出完成的文件
        // 2. 操作列表中仍有下载的文件
        let autoFetchExportList = this.exportList.some((item) => item.isFinished == 0)
          || this.operationList.some((item) => item.operate == 'download');

        // 如果不需要更新，清空定时器
        if (!autoFetchExportList) {
          clearInterval(this.exportTimer);
          this.exportTimer = null;
          return;
        }

        // 如果需要更新,设置定时抓取数据
        if (!this.exportTimer)
          this.exportTimer = setInterval(() => this.checkExports(), 5000);
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
    clearStorage() {
      localStorage.clear();
    },
    /** @deprecated */
    clearCachedIds() {
      let cachedKey = localStorage.getItem('cachedKey');
      let cachedKeyArray = [];

      if (cachedKey) cachedKeyArray = cachedKey.split(',');
      cachedKeyArray.forEach((key) => localStorage.setItem(key, []));
      localStorage.removeItem('cachedKey');
    },
    // popover manage
    exportPopoverToggle(visible) {
      this.exportPopperVisible = visible;

      if (visible) {
        this.profilePopperVisible = false;
        this.userStatePopperVisible = false;
      }
    },
    goRoleTeam() {
      platform.openTab({
        id: 'team',
        title: '团队管理',
        url: '/security/tag',
        reload: true,
      });
    },
    closeNotification() {
      this.notificationShow = false;
      sessionStorage.setItem(
        'shb_systemMsg',
        this.notificationInfo.msgSystem.id
      );
      this.clearAnimation();
    },
    // 获取系统弹窗
    async getSystemPopup(){
      try{
        let info = await http.get('/api/app/outside/message/v1/getSysMsgAlert')
        if(info.status == 0 && info.data.length > 0){
          this.loadedSystemPopup = true
          this.systemData = info.data
        }
      }catch(error){
        console.error(error);
      }
    },
    // 获取系统消息，本地存储，超出滚动
    async getSystemMsg() {
      try {
        let info = await NotificationApi.newGetMessage();
        if (info.status == 0) {
          this.notificationInfo = info.data;
          this.notification.count = info.data.unReadTotalCount;
          let msgSystem = sessionStorage.getItem('shb_systemMsg');

          if (
            this.notificationInfo.lastMessage
            && (!msgSystem || msgSystem != this.notificationInfo.lastMessage.id)
          ) {
            this.notification.title = info.data.lastMessage.title;
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
    setAnimation() {
      this.$nextTick(() => {
        let textWidth = this.$refs.notificationText.offsetWidth;
        let infoWidth = this.$refs.notificationInfo.offsetWidth - 30;
        if (textWidth > infoWidth) {
          let time = this.notification.title.length / 4;
          this.$refs.notificationContent.style.animation = `text-scroll ${time}s linear infinite`;
        }
      });
    },
    clearAnimation() {
      this.$refs.notificationContent.style.animation = '';
    },

    /** 删除未读消息或消息已读后更新新通知数量 */
    clearNum(e) {
      if (e.count == -1) return (this.notification.count = 0);
      let count_ = this.notification.count - e.count;
      // 通知总数风险把控不把非正整数暴露给用户
      if (count_ < 0) {
        console.warn('通知消息总数为负数');
        count_ = 0;
      }
      count_ = Math.round(count_);
      this.notification.count = count_;
    },
    getNum() {
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
    goCustomerContact() {
      platform.openTab({
        id: 'customer_contact',
        title: '产品设置',
        url: '/customerContact',
        reload: true,
      });
    },
    goDoMyself() {
      platform.openTab({
        id: 'do_myself',
        title: '消息中心',
        url: '/setting/doMyself/wxSet',
        reload: true,
      });
    },
    goTaskSetting() {
      platform.openTab({
        id: 'task_fields_setting',
        title: '工单表单设置',
        url: '/setting/task/field/task',
        reload: true,
      });
    },
    goTaskReceiptSetting() {
      platform.openTab({
        id: 'task_receipt_fields_setting',
        title: '工单回执表单设置',
        url: '/setting/task/field/taskReceipt',
        reload: true,
      });
    },
    goCreateTask() {
      platform.openTab({
        id: 'task_create',
        title: '新建工单',
        url: '/task/edit',
        reload: true,
      });
    },
    goCreateTaskForCallcenter() {
      platform.openTab({
        id: 'task_create',
        title: '新建工单呼叫中心',
        close: true,
        url: '/task/edit4CallCenter?callRecordId=1&linkmanId=e8540bd4-e5eb-11ea-9929-00163e304a25',
      });
    },
    goTaskList() {
      platform.openTab({
        id: 'task_list',
        title: '工单列表',
        url: '/task',
        reload: true,
      });
    },
    goCallCenterSetting() {
      platform.openTab({
        id: 'callcenter_setting',
        title: '呼叫中心设置',
        url: '/setting/callcenter/setting',
        reload: true,
      });
    },
    goCallCenter() {
      platform.openTab({
        id: 'callcenter_stage',
        title: '呼叫中心',
        url: '/setting/callcenter/stage',
        reload: true,
      });
    },
    goCallCenterWorkbench() {
      platform.openTab({
        id: 'M_CALLCENTER_WORKBENCH_LIST',
        title: '呼叫中心工作台',
        url: '/setting/callcenter/workbench',
        reload: true,
      });
    },
    goMyShop() {
      platform.openTab({
        id: 'my_shop',
        title: '门户设置',
        url: '/linkc/setting',
        reload: true,
      });
    },
    goMyShopOrder() {
      platform.openTab({
        id: 'my_shop_order_list',
        title: '订单列表',
        url: '/linkc/order/list',
        reload: true,
      });
    },
    handleCallCenterClick() {
      // this.showCallCenter = true
      this.goCallCenterWorkbench();
    },
    openCallCenterWorkbench(data) {
      // console.info('data::', data);
      let url = data && data.id
        ? `/setting/callcenter/workbench?id=${data.id}&dialCount=${data.dialCount}&linkmanName=${data.linkmanName}&callPhone=${data.callPhone}&callType=${data.callType}&callState=${data.callState}&ringTime=${data.ringTime}`
        : '/setting/callcenter/workbench';
      platform.openTab({
        id: 'M_CALLCENTER_WORKBENCH_LIST',
        title: '呼叫中心工作台',
        url,
        reload: true,
      });
    },
    initWebSocket() {
      webSocketClient = new WebSocket(this.wsUrl);
      try {
        webSocketClient.onopen = this.webSocketOpen;
        webSocketClient.onmessage = this.webSocketOnMessage;
        webSocketClient.onclose = this.webSocketClose;
        webSocketClient.onerror = this.webSocketError;
      } catch (error) {
        console.error(error);
        this.reconnect(this.wsUrl);
      }
    },
    webSocketOpen() {
      // console.info('WebSocket连接成功')
      // this.heartCheck.start();

      setTimeout(() => {
        this.send(JSON.stringify({ action: 'ping' }));
      }, 500);
    },
    async webSocketOnMessage(e) {
      this.heartCheck.start();
      // console.info('数据内容：{0}', e.data)
      // pong 是心跳
      if (e.data === 'pong') return;
      // 这里处理接受到来电的消息
      try {
        const data = JSON.parse(e.data);
        // {"callPhone":"15267183070","callState":"Hangup","callType":"dialout","ringTime":1592636121000}
        // console.info('data:', data.callType, data.callState);

        if (data.callType === 'normal' || data.callType === 'dialout') {
          if (data.callState === 'Hangup') {
            // 没接听
            this.showCallCenter = false;
          } else if (data.callState === 'Unlink' || data.callState === 'Link') {
            // 接听了和接听然后挂断了
            this.callData = data;
            this.showCallCenter = false;
            this.openCallCenterWorkbench(data);
          } else {
            this.callData = data;
            const res = await CallCenterApi.getLinkmanInfo({
              linkmanPhone: data.callPhone,
            });
            if (res.status == 0 && res.data) {
              this.callData.taskCount = res.data.unfinishedTaskCount;
              this.callData.eventCount = res.data.unfinishedEventCount;
            }
            this.showCallCenter = true;
          }
        }
      } catch (error) {
        console.error(error);
      }
    },
    send(param) {
      try {
        // console.info('readyState:', webSocketClient.readyState)
        webSocketClient.send(param);
      } catch (err) {
        console.error('error', err);
      }
    },
    webSocketClose(e) {
      // console.error('WebSocket连接关闭', e)
      this.reconnect(this.wsUrl);
    },
    webSocketError() {
      // console.error('WebSocket连接失败')
      this.reconnect(this.wsUrl);
    },
    reconnect(url) {
      if (lockReconnect) {
        return;
      }
      lockReconnect = true;
      // 没连接上会一直重连，设置延迟避免请求过多
      reconnectTimmer && clearTimeout(reconnectTimmer);
      reconnectTimmer = setTimeout(() => {
        this.initWebSocket();
        lockReconnect = false;
      }, 4000);
    },
    /** 
    * @description 切换工单新旧版本
    */
    changeTaskVersion: _.debounce(function (version) {
      // 工单列表重定向
      this.currentTaskListTab.url = `/task?newVersion=${version}`;
      this.reloadFrameTab(this.currentTaskListTab, true);
      this.isUserTaskGray = !this.isUserTaskGray;
    }, 1000),
    /** 
     * 获取售后宝版本号
    */
    async getShbEdition() {
      const DefaultEdition = 1
      let shbEdition = DefaultEdition
      
      try {
        const Result = await SettingApi.getSettingEdition()
        const IsSuccess = Result.status == 0
        const Edition = Result?.data?.edition || DefaultEdition
        
        shbEdition = IsSuccess ? Edition : DefaultEdition
        
      } catch (error) {
        shbEdition = DefaultEdition
        console.error('Caused: getShbEdition -> error', error)
      }
      
      window.shbEdition = shbEdition
      
      this.loadedEdition = true
      this.shbEdition = shbEdition
      this.buildNavbarMenus()
    },
    buildNavbarMenus() {
      let menus = this.initData?.menus || []
      // 需要被过滤掉的菜单key对象
      let filterMeunKeyMap = {
        'M_DASHBOARD_SCREEN': isShowDashboardScreen(),
        'M_TASK_PLAN': isShowPlanTask(),
        'M_PORTAL': isShowLinkC(),
        'M_PORTAL_SETTING': isShowLinkC(),
        'M_PORTAL_ORDER': isShowLinkC(),
        'M_VIP_SPAREPART_PERSON': isShowMoreSperaParts(),
        'M_CALLCENTER_WORKBENCH_LIST': this.has_call_center_module,
        'M_CALLCENTER_STATISTICS': this.has_call_center_module,
        'M_CALLCENTER_STAGE': this.has_call_center_module
      }
      let isFilter = false
      let filterMenuKeys = []
      
      for (let key in filterMeunKeyMap) {
        let menuShow = filterMeunKeyMap[key] === true
        
        if (!menuShow) {
          isFilter = true
          filterMenuKeys.push(key)
        }
      }
      
      // 是否过滤掉不能查看的菜单
      if (isFilter) {
        menus = menus.filter(menu => {
          return filterMenuKeys.indexOf(menu.menuKey) < 0
        })
      }
      
      this.navBarMenus = menus
      this.showNavBar = true
    }
  },
  created() {
    // TODO: 迁移完成后删除
    window.updateUserState = this.updateUserState;
    window.showExportList = this.checkExports;
    window.exportPopoverToggle = this.exportPopoverToggle;

    window.resizeFrame = function () {
      console.warn('此方法只用于兼容旧页面，无实际效果，不推荐调用');
    };
    this.clearCachedIds();
    sessionStorage.removeItem('shb_systemMsg');
    this.getSystemMsg();
    setInterval(() => {
      this.getSystemMsg();
    }, NOTIFICATION_TIME);
  },
  async mounted() {
    await this.judgeCallCenterGray();
    let userGuide = this?.initData?.userGuide === true || false;

    if (userGuide) {
      this.$refs.userGuideView.show();
    }

    /** * 部分页面引导 数据处理  s*/
    if( this?.initData?.needResetGuide){
      let needResetGuideArr = this?.initData?.needResetGuide;
      
      needResetGuideArr.forEach((item) => {
        try {
          Object.keys(GuideStoreObj[item]).forEach((items) => {
            localStorage.setItem(GuideStoreObj[item][items], '-1')
          })
        } catch (error) {

        }
      })
    }

    if( this?.initData?.needGuide){
      let needGuideArr = this?.initData?.needGuide;
      // let needGuideArr = ['newTaskGuideStore'];
      needGuideArr.forEach((item) => {
        try {
          Object.keys(GuideStoreObj[item]).forEach((items) => {
            localStorage.setItem(GuideStoreObj[item][items], '-1')
          })
        } catch (error) {

        }
      })
    }

    if( this?.initData?.needClearGuide){
      let needClearGuideArr = this?.initData?.needClearGuide;
      // let needGuideArr = ['newTaskGuideStore'];
      needClearGuideArr.forEach((item) => {
        try {
          Object.keys(GuideStoreObj[item]).forEach((items) => {
            localStorage.removeItem(GuideStoreObj[item][items])
          })
        } catch (error) {

        }
      })
    }
    /** * 部分页面引导 数据处理  e*/
    this.checkExports();
    this.getShbEdition()
    this.getSystemPopup();
  },
  components: {
    [FrameNav.name]: FrameNav,
    [FrameTab.name]: FrameTab,
    [Version.name]: Version,
    [SystemPopup.name]: SystemPopup,
    [SaleManager.name]: SaleManager,
    [NotificationCenter.name]: NotificationCenter,
    [ImportAndExport.name]: ImportAndExport,
    [UserGuide.name]: UserGuide,
  },
};
</script>

<style lang="scss" src="./frame.scss"></style>