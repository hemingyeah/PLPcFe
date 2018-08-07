<template>
  <div class="frame">
    <frame-nav :collapse="collapse" @open="openForNav" :source="initData.menus" :curr-url="currUrl"/>
    <div class="frame-content">
      <header class="frame-header">
        <div class="frame-header-left">
          <button class="btn-text frame-collapse-btn" @click="collapse = !collapse">
            <i :class="['iconfont', collapse ? 'icon-open': 'icon-Takeup']"></i>
          </button>
        </div>
        <div class="frame-header-right">
          <div><a href="/" style="line-height: 40px;">返回旧版</a></div>
          <div class="dev-tool" v-if="$appConfig.env != 'production'">
            <span>测试工具</span>
            <div class="dev-tool-menu">
              <a href="javascript:;" @click="clearStorage">清空缓存</a>
            </div>
          </div>
          <button type="button" class="btn-text" title="用户向导" v-tooltip><i class="iconfont icon-guide"></i></button>
          <button type="button" class="btn-text" @click="openHelpDoc" title="帮助文档" v-tooltip><i class="iconfont icon-help"></i></button>
          <button type="button" class="btn-text" @click="saleManagerShow = !saleManagerShow" title="专属客服" v-tooltip><i class="iconfont icon-customerservice"></i></button>
          <button type="button" class="btn-text" @click="exportModal = !exportModal" title="导出下载" v-tooltip><i class="iconfont icon-download"></i></button>

          <div class="user-profile">
            <a class="user-avatar" :href="`/mine/` + loginUser.userId" @click.prevent="openUserView">
              <img :src="loginUser.head"/>
            </a>
            
            <div class="user-info">
              <h4>{{loginUser.displayName}}</h4>
              <p>{{loginUser.state}}</p>
            </div>

            <div class="user-profile-menu-wrap">
              <div class="user-profile-menu">
                <div class="user-profile-item">
                  <a :href="`/mine/` + loginUser.userId" @click.prevent.self="openUserView"><i class="iconfont icon-people"></i>个人中心</a>
                </div>
                <div class="user-profile-item logout">
                  <a href="javascript:;" @click.prevent="logout"><i class="iconfont icon-Signout"></i>注销</a>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </header>

      <frame-main ref="frameMain" v-model="currUrl"/>
    </div>

    <version :version="initData.version" :show.sync="versionShow"/>
    <sale-manager :qrcode="initData.saleManagerQRCode" :show.sync="saleManagerShow"/>

    <base-modal :title="`导出下载(${exportList.length || 0})`" :show.sync="exportModal">
      <div class="exportDiv" >
        <div v-for="item in exportList" :key="item.id" class="export-row">
          <img src="/resource/images/excel.png">
          <div>
            <h4>{{item.name}}</h4>
            <p>{{item.createTime | fmt_datetime}}</p>
          </div>
          <div>{{item.isFinished == 0?'导出中':'已完成'}}</div>
          <div>
            <a v-if="item.isFinished == 1" href="javascript:void(0);" @click="downloadFile(item)">下载</a>
            <a v-if="item.isFinished == 0" href="javascript:void(0);" @click="cancelExport(item)">取消</a>
          </div>
        </div>
      </div>
    </base-modal>
  </div>
</template>

<script>
import platform from 'src/platform'
import http from 'src/util/http';
import eventBus from 'src/util/eventBus';

import FrameNav from './component/FrameNav.vue';
import FrameMain from './component/FrameMain.vue';
import Version from './component/Version.vue';
import SaleManager from './component/SaleManager.vue';

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
      collapse: true,
      currUrl: '/home',

      versionShow: false, //是否显示版本信息
      saleManagerShow: false, // 是否显示专属客服

      exportTimer: null,
      exportModal: false,
      exportList: []
    }
  },
  computed: {
    loginUser(){
      return this.initData.user || {};
    }
  },
  methods: {
    toggleCollapse(){
      eventBus.$emit('es.frame.toggleCollapse');
    },
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
      platform.openLink("https://help.shb.ltd");
    },
    openUserView(event){
      let a = event.target
      this.openFrameTab({
        id: "userCenter",
        url: a.getAttribute('href'),
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
    checkVersion(){
      let currVersion = localStorage.getItem(VERSION_NUM_KEY);
      let versionNum = (this.initData.version || {}).versionNum;
      if(versionNum && (!currVersion || currVersion != versionNum)){
        this.versionShow = true;
        localStorage.setItem(VERSION_NUM_KEY, versionNum)
      }
    },

    downloadFile(item){
      let frame = document.createElement("iframe");
      frame.style.display = 'none';
      frame.src = `/export/download?id=${item.id}`;
      frame.onload = event => setTimeout(() => document.body.removeChild(frame), 1500)
      document.body.appendChild(frame);
    },
    async cancelExport(item){
      try {
        await http.post('export/cancel', {id: item.id}, false)
      } catch (error) {
        console.log(error)
      }
    },
    async fetchExportList(){
      try {
        this.exportList = await http.get('/export/getList');
      } catch (error) {
        console.log(error)
      }
    },
    updateExportList(){
      if(this.exportTimer) clearInterval(this.exportTimer);
      
      this.fetchExportList();
      setInterval(() => this.fetchExportList(), 30000)
    },
    clearStorage(){
      localStorage.clear();
    }
  },
  mounted(){
    window.addTabs = this.addTabs;
    window.showExportList = this.updateExportList;

    //处理消息跳转url
    if(this.initData.pcUrl){
      this.openFrameTab({id: "PcUrl", title: "正在加载", close: true, url: this.initData.pcUrl});
    }

    this.checkVersion();
    this.updateExportList();
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
  color: #797e89;
}

.frame-header-right{
  display: flex;
  flex-flow: row nowrap;
  height: 51px;
  align-items: center;
  padding-right: 10px;

  button{
    color: #797e89;
    width: 60px;
    margin: 0;
    padding: 0;
    height: 100%;
    transition: background-color ease .3s;

    i{
      font-size: 16px;
    }

    &:hover{
      background-color: $color-primay-hover;
    }
  }
}

.user-profile{
  position: relative;
  display: flex;
  align-items: center;
  width: 150px;
  height: 100%;
  transition: background-color ease .3s;
  
  &:hover{
    background-color: $color-primay-hover;
  }
}

.user-avatar{
  padding: 0 10px;
  img{
    display: block;
    width: 36px;
    height: 36px;
    border-radius: 50%;
  }
}

.user-info{
  overflow: hidden;

  h4,p{
    margin-bottom: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  h4{
    font-size: 14px;
    line-height: 24px;
  }

  p{
    font-size: 12px;
    line-height: 16px;
    color: #797e89;
  }
}

.user-profile-menu-wrap{
  display: none;
  position: absolute;
  top: 51px;
  right: 0;
  padding-top: 5px;
  z-index: 10;
}

.user-profile-menu{
  width: 160px;
  background-color: #fff;
  padding: 5px 0;
  
  border-radius: 0 2px 2px 0;
  box-shadow: 1px 1px 5px rgba(0,21,41, .15);
  transition: background-color ease .3s;
}

.user-profile-item{
  height: 40px;
  line-height: 40px;
  padding: 0 10px;
  transition: background-color ease .3s;
  
  i{
    font-size: 14px;
    margin-right: 8px;
  }

  &:hover{
    background-color: $color-primay-hover;
  }

  a{
    display: block;
    width: 100%;
    color: #797e89;
    text-decoration: none;
  }
}

.logout:hover a{
  color: #ed3f14;
}

.user-profile:hover{
  .user-profile-menu-wrap{
    display: block;
  }
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
}

.dev-tool:hover{
  .dev-tool-menu{
    display: block;
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
</style>