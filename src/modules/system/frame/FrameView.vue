<template>
  <div class="frame">
    <frame-nav :collapse.sync="collapse" @open="openForNav" :source="initData.menus" :curr-url="currUrl"/>
    <div class="frame-content">
      <header class="frame-header">
        <div class="frame-header-left">
          <button class="btn-text frame-collapse-btn" @click="collapse = !collapse">
            <i :class="['iconfont', collapse ? 'icon-open': 'icon-Takeup']"></i>
          </button>
        </div>
        <div class="frame-header-right">
          <div><a href="/" style="line-height: 40px;">返回旧版</a></div>
          <div class="dev-tool" v-if="showDevTool">
            <span>测试工具</span>
            <div class="dev-tool-menu">
              <a href="javascript:;" @click="openDemo">demo</a>
              <a href="javascript:;" @click="clearStorage">清空缓存</a>
            </div>
          </div>
          <!-- <button type="button" class="btn-text frame-header-btn" title="用户向导" v-tooltip><i class="iconfont icon-guide"></i></button> -->
          <button type="button" class="btn-text frame-header-btn" @click="openHelpDoc"><i class="iconfont icon-help"></i> 帮助文档</button>
          <button type="button" class="btn-text frame-header-btn" @click="saleManagerShow = !saleManagerShow"><i class="iconfont icon-customerservice"></i> 专属客服</button>
          
          <el-popover class="export-wrap" popper-class="export-panel-popper" placement="bottom-end">
            <div class="export-btn" slot="reference"><i class="iconfont icon-download"></i> 导出下载</div>

            <div class="export-panel">
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
          <el-popover class="user-profile-wrap" popper-class="user-profile-menu" v-model="profilePopperVisible">
            <div class="user-profile" slot="reference">
              <a class="user-avatar" :href="`/mine/` + loginUser.userId" @click.stop.prevent="openUserView">
                <img :src="userAvatar"/>
              </a>
              <div class="user-info">
                <h4>{{loginUser.displayName}}</h4>
                <p><span class="user-color-icon user-color-icon-mini" :style="{backgroundColor: userStateColor}"></span> {{loginUser.state}}</p>
              </div>
              <i class="iconfont icon-triangle-down user-profile-down"></i>
            </div>
            
            <el-popover placement="left-start" popper-class="user-state-popper" v-model="userStatePopperVisible">
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
              <a href="javascript:;" @click.prevent="logout"><i class="iconfont icon-Signout"></i>注销</a>
            </div>
            
          </el-popover>
        </div>
      </header>

      <frame-main ref="frameMain" v-model="currUrl"></frame-main>
    </div>

    <version :version="newVersion" :show.sync="versionShow"/>
    <sale-manager :qrcode="initData.saleManagerQRCode" :show.sync="saleManagerShow"/>
  </div>
</template>

<script>
import platform from '@src/platform'
import http from '@src/util/http';
import eventBus from '@src/util/eventBus';

import FrameNav from './component/FrameNav.vue';
import FrameMain from './component/FrameMain.vue';
import Version from './component/Version.vue';
import SaleManager from './component/SaleManager.vue';

import DefaultHead from '@src/assets/img/user-avatar.png';

const VERSION_NUM_KEY = 'shb_version_num';

export default {
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
    openDemo(){
      this.openFrameTab({
        id: "demo",
        url: '/demo',
        title: 'demo'
      })
    },
    toggleCollapse(){
      eventBus.$emit('es.frame.toggleCollapse');
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
    },
    openUserView(event){
      this.openFrameTab({
        id: "userCenter",
        url: `/mine/` + this.loginUser.userId,
        title: '个人中心'
      })
    },
    openFrameTab(option){
      this.$refs.frameMain.openForFrame(option)
    },
    openForNav(menu){
      this.$refs.frameMain.openForNav(menu)
    },
    //兼容旧页面，迁移完成后删除
    addTabs(option){
      console.warn('不推荐调用该方法，使用platform.openFrameTab替代');
      this.openFrameTab(option)
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

    //处理消息跳转url
    if(this.initData.pcUrl){
      this.openFrameTab({id: "PcUrl", title: "正在加载", close: true, url: this.initData.pcUrl});
    }
  },
  mounted(){
    this.checkVersion();
    this.checkExports();
  },
  components: {
    [FrameNav.name]: FrameNav,
    [FrameMain.name]: FrameMain,
    [Version.name]: Version,
    [SaleManager.name]: SaleManager
  }
}
</script>

<style lang="scss">
html, body, .frame{
  height: 100%;
  overflow: hidden;
}

.frame{
  display: flex;
  flex-flow: row nowrap;
}

.frame-content{
  flex: 1;
  height: 100%;
}

.frame-header{
  height: 52px;
  display: flex;
  align-items: center;

  border-bottom: 1px solid #f4f7f5;
}

.frame-header-left{
  padding-left: 10px;
  flex: 1;
}

.frame-collapse-btn{
  padding: 4px;
  line-height: 20px;
  text-align: center;
  margin: 0;
  color: $text-color-second;
}

.frame-header-right{
  display: flex;
  flex-flow: row nowrap;
  height: 51px;
  align-items: center;
  padding-right: 8px;
  user-select: none;
}

.frame-header-btn,
.export-wrap,
.user-profile-wrap{
  position: relative;
  color: $text-color-second;
  width: 100px;
  margin: 0;
  padding: 0;
  height: 100%;
  transition: background-color ease .3s;
  z-index: 98;
  cursor: pointer;
  
  i{
    font-size: 14px; 
  }

  &:hover{
    background-color: $color-primary-hover;
  }
}

.export-btn{
  height: 100%;
  line-height: 50px;
  text-align: center; 
}

.export-panel-popper{
  width: 380px;
  background-color: #fff;
  box-shadow: 1px 1px 5px rgba(0,21,41, .15);
  border: none;
  padding: 0;
  border-radius: 2px;
}

.export-panel{
  padding: 5px 0;
  max-height: 520px;
  overflow: auto;
}

.export-row{
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  padding: 8px;
  transition: background-color ease .3s;

  img{
    display: block;
    width: 32px;
    height: 32px;
    border-radius: 2px;
  }

  a{
    text-decoration: none;
    margin-left: 5px;
  }

  &:hover{
    background-color: $color-primary-hover;
  }
}

.export-empty{
  margin: 0;
  text-align: center;
  padding: 10px 0;
}

.export-row-info{
  flex: 1;
  overflow: hidden;
  padding: 0 5px;

  h4,p{
    margin: 0;
  }

  h4{
    font-size: 14px;
    line-height: 18px;
    color: $text-color-primary;
    font-weight: 400;
    @include text-ellipsis;
  }

  p{
    line-height: 14px;
    font-size: 12px;
    color: #797e89;
  }
}

.export-row-badge{
  border-radius: 4px;
  background-color: #409EFF;
  font-size: 12px;
  color: #fff;
  text-align: center;
  padding: 4px 6px;
  line-height: 1;
  margin: 0 5px;
}

.export-row-badge-finished{
  background-color: #6cc87f;
}

.user-profile-wrap{
  width: 160px;
}

.user-profile{
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
}

.user-avatar{
  padding: 0 8px;

  img{
    display: block;
    width: 36px;
    height: 36px;
    border-radius: 50%;
  }
}

.user-info{
  flex: 1;
  overflow: hidden;

  h4,p{
    margin-bottom: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    cursor: default;
  }

  h4{
    font-size: 14px;
    line-height: 24px;
    color: $text-color-primary;
  }

  p{
    font-size: 12px;
    line-height: 16px;
    color: #797e89;
  }
}

.user-profile-down{
  font-size: 12px;
  padding: 0 5px;
  color: #797e89;
}

.user-profile-menu{
  width: 160px;
  background-color: #fff;
  padding: 5px 0;
  border-radius: 2px;
  border: none;
  box-shadow: 1px 1px 5px rgba(0,21,41, .15);
  transition: background-color ease .3s;
}

.user-profile-item{
  height: 40px;
  line-height: 40px;
  padding: 0 10px;
  cursor: pointer;
  color: #797e89;
  transition: background-color ease .3s;
  
  i{
    font-size: 14px;
    margin-right: 8px;
  }

  &:hover{
    background-color: $color-primary-hover;
  }

  a{
    display: block;
    width: 100%;
    color: inherit;
    text-decoration: none;
  }
}

.logout:hover a{
  color: #ed3f14;
}

.export-row{
  display: flex;
  flex-flow: row nowrap;
}

.dev-tool{
  position: relative;
  color: red;
  cursor: default;
  margin: 0 5px;
  height: 20px;
  line-height: 20px;
  z-index: 90;

  &:hover{
    .dev-tool-menu{
      display: block;
    }
  }
}

.dev-tool-menu{
  display: none;
  position: absolute;
  top: 20px;
  left: -5px;
  min-width: 100px;
  background-color: #ddd;

  max-height: 360px;
  overflow: auto;

  a{
    display: block;
    width: 100%;
    padding: 5px 8px;
    color: red;
  }
}

.user-state-popper{
  margin-top: -5px;
  background-color: #fff;
  padding: 0;
  
  border-radius: 2px;
  border: none;
  box-shadow: 1px 1px 5px rgba(0,21,41, .15);
  transition: background-color ease .3s;
}

.user-state-panel{
  padding: 5px 0;
  max-height: 620px;
  overflow-y: auto;
}

.user-state-item{
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
}

.user-color-icon{
  display: block;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  margin-right: 8px;
  background-color: $text-color-second;
}

.user-color-icon-mini{
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-right: 2px;
  vertical-align: middle;
}
</style>