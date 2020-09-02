<template>
  <div class="stats-container">
    <div class="stats-row" > 
      <div class="stats-panel" ref="mapPanel">
        <div class="stats-panel-head stats-form">
          <h3 class="stats-map">
            <span>人员地图</span>
            <div class="stats-form-group stats-checkbox refresh-checkbox">          
              <el-popover trigger="hover">            
                <div>勾选自动刷新后，每隔5分钟更新数据</div>         
                <base-checkbox slot="reference" :value="isRefresh" @input="changeRefresh">自动刷新</base-checkbox>     
              </el-popover>         
            </div>     
          </h3> 
          <biz-team-select class="stats-team-select" :value="tag" @input="chooseTeam" :fetchFunc="fetchTeam"/>
          <!-- <div class="stats-form-group">
            <select @change="chooseTeam">
              <option value="">全部</option>
              <option v-for="team in teams" :key="team.id" :value="team.id">{{team.name}}</option>
            </select>
          </div> -->
          <div class="stats-form-group">
            <select @change="chooseState">
              <option value="">全部状态</option>
              <option v-for="state in states" :key="state" :value="state">{{state}}</option>
              <option value="notSetState">未设置工作状态</option>
            </select>
          </div>
          <div class="stats-form-group">
            <el-select :value="selectedUser" @input="chooseUser" filterable clearable placeholder="请选择人员" class="stats-staff-select">
              <el-option
                v-for="item in teamUsers"
                :key="item.userId"
                :label="item.displayName"
                :value="item.userId">
              </el-option>
            </el-select>
          </div>
          <el-popover trigger="hover">
            <ul>
              <li>钉钉版暂不支持进入全屏模式。</li>
              <li>如有需要，请在web版进去全屏模式。</li>
              <li>全屏模式下按<kbd>esc</kbd>键可退出全屏模式。</li>
            </ul>

            <button slot="reference" type="button" class="stats-fullscreen-btn" style="margin-left:5px;" @click="fullScreen">
              <i class="iconfont icon-open"></i>
            </button>
          </el-popover>
        </div>
        <div class="stats-panel-body">
          <div class="stats-staff-map-wrap" ref="mapWrap">
            <div id="map"></div>

            <div class="stats-staff-map-info">
              <div class="stats-staff-map-summary">
                <p>
                  <span><i class="iconfont icon-team"></i></span>
                  <strong>服务团队：</strong>
                  <span>{{teamName}}</span></p>
                <p>
                  <span><i class="iconfont icon-zhuangtai"></i></span>
                  <strong>状态：</strong>
                  <span>{{stateName}}</span>
                </p>

                <p>
                  <span><i class="iconfont icon-sum"></i></span>
                  <strong>合计：</strong>
                  <span>{{teamUsers.length}}</span>人
                </p>
              </div>
              <div class="stats-staff-map-state-panel">
                <div v-for="state in states" :key="state" class="stats-staff-state-row">
                  <div class="stats-staff-state-badge" :style="{backgroundColor: stateColorMap[state]}"></div>
                  <div><strong>{{state}}：</strong> {{teamUserStateMap[state] || 0}}人 </div>
                </div>
                <div class="stats-staff-state-row">
                  <div class="stats-staff-state-badge" :style="{backgroundColor: '#000'}"></div>
                  <div><strong>未设置状态：</strong> {{teamUserStateMap['notSetState'] || 0}}人 </div>
                </div>
              </div>
            </div>

            <div ref="mapInfo" v-show="showInfoWindow" class="stats-staff-window">
              <div class="stats-staff-window-head">
                <img :src="head()">
              </div>
              <div class="stats-staff-window-info">
                <h5 class="stats-staff-window-name">
                  <a href="javascript:;" @click="openDetail">{{showUser.displayName}}</a>
                  <button type="button" class="stats-staff-window-close" @click="closeWindow"><i class="iconfont icon-guanbi"></i></button>
                </h5>
                <p>记录位置时间：<span class="pull-right">{{showUser.attribute && showUser.attribute.lastLocateTime}}</span></p>
                <p>未完成工单：{{showUser.unfinishedTask}} <a href="javascript:;" @click="openDetail" class="pull-right">查看</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="stats-row"> 
      <staff-task-table @trackEvent="sttTrackEventHandler"></staff-task-table>
    </div>
    
    <div class="stats-row"> 
      <staff-category-chart :evaluateConfig="evaluateConfig" @trackEvent="sccTrackEventHandler"></staff-category-chart>
    </div>
  </div>
</template>

<script>
/*global AMap, moment, _init_data*/
import {isEnterprise} from '@src/util/Platform';
import DomUtil from "src/util/DomUtil";
import http from 'src/util/HttpUtil';

import StaffCategoryChart from './StaffCategoryChart.vue';
import StaffTaskTable from './StaffTaskTable.vue';
import BaseCheckbox from 'packages/BaseCheckbox.vue';

import Loading from 'packages/BaseLoading';

let map = null;
let infoWindow = null;
const DEFAULT_HEAD = '/resource/images/account_userhead.png';
let t1;

export default {
  name: 'staff-view',
  data(){
    return {
      tag: [],

      // teams: [],
      states: [],
      stateColorMap: {},
      evaluateConfig: {},

      teamId: '',
      teamName: '全部',
      state: '',
      stateName: '全部',
      teamUsers: [],
      teamUserStateMap: {},
      selectedUser: '',

      filterTeamUser: [],

      showInfoWindow: false,
      showUser: {},

      isRefresh:false
    };
  },
  methods: {
    fetchTeam(params){
      return http.post(isEnterprise ? '/security/tag/tree' : '/security/tag/list', {...params, ...{authKey: 'VIP_REPORT_VIEW'}})
    },
    changeRefresh(value){  
      this.isRefresh = value;
      if(!this.isRefresh) return clearInterval(t1);   
      t1 = setInterval(() => {
        this.renderMap();
      },300000);      
    },
    chooseUser(value){
      this.$tdOnEvent('pc：人员报表-人员地图人员筛选事件');

      this.selectedUser = value;

      let filterTeamUser = this.teamUsers;

      if(value){
        let user = null;
        for(let i = 0; i < this.teamUsers.length; i++){
          if(this.teamUsers[i].userId == value){
            user = this.teamUsers[i]
            break;
          }
        }

        filterTeamUser = [user];
      }
     
      this.filterTeamUser = filterTeamUser;
      this.drawMap();
    },
    fullScreen(){
      if(this.$platform.inDingTalk()) return;
      
      DomUtil.fullScreen(this.$refs.mapWrap);
    },
    initMap() {
      map = new AMap.Map("map", {
        resizeEnable: true,
        zoom: 4,
        zooms: [4,18]
      });

      this.renderMap();
    },    
    chooseTeam(value){
      this.$tdOnEvent('pc：人员报表-人员地图团队选择事件');

      let tag = (Array.isArray(value) ? value[0] : value) || {};
      this.tag = value;
      // let target = event.target;
      // let selectedIndex = target.selectedIndex;
      // let option = target.options[selectedIndex];
      
      this.teamId = tag.id || '';
      this.teamName = tag.tagName || '全部';

      this.renderMap();
    }, 
    chooseState(event){
      this.$tdOnEvent('pc：人员报表-人员地图工作状态筛选事件')

      let target = event.target;
      let selectedIndex = target.selectedIndex;
      let option = target.options[selectedIndex];
      
      this.state = option.value;
      this.stateName = option.innerHTML;
      this.renderMap();
    }, 
    async renderMap(){
      try {
        let instance = Loading.show(this.$refs.mapPanel);
        let teamUsers = await this.fetchTeamUser();
        this.teamUsers = teamUsers;
        this.teamUserStateMap = this.buildTeamUserStateMap(teamUsers);

        this.filterTeamUser = teamUsers;
        this.selectedUser = '';
        instance.hide();

        this.drawMap();
        
      } catch (error) {
        console.log(error)
      }
    },
    drawMap(){
      let teamUsers = this.filterTeamUser;

      map.clearMap();
      for(let i = 0; i < teamUsers.length; i++){
        this.createMarker(teamUsers[i])
      }

      infoWindow = new AMap.InfoWindow({
        isCustom: true, //使用自定义窗体
        autoMove: true,
        content: this.$refs.mapInfo,
        offset: new AMap.Pixel(0, -36),
        closeWhenClickMap: true
      });

      map.setFitView();
    },
    buildTeamUserStateMap(teamUsers = []){
      let map = {};

      teamUsers.forEach(user => {
        let state = user.state;            
        if(map['notSetState'] == null) map['notSetState'] = 0;
        if(!state) return map['notSetState'] += 1;
        if(map[state] == null) map[state] = 0;
        map[state] += 1;
      })

      return map;
    },
    createMarker(user){
      if(!user.longitude || !user.latitude) return;
      let marker = new AMap.Marker({
        map: map,
        position: [user.longitude, user.latitude],
        icon: new AMap.Icon({            
          size: new AMap.Size(36, 36), //图标大小
          image: DEFAULT_HEAD,
          imageSize: new AMap.Size(36, 36)
        }),
        extData: user  
      });

      let ctx = this;
      marker.on('mouseover', function(event){
        !ctx.showInfoWindow && (ctx.showInfoWindow = true);
        ctx.showUser = marker.getExtData();
        infoWindow.open(map, marker.getPosition());
      })
    },
    loadMap() {
      let callback = "_amap_callback_stats_staff_dongls_0111";
      let url =
        "https://webapi.amap.com/maps?v=1.3&key=3cf1b829475ac81c406ceca9ec57d73d&callback=" +
        callback;
      window[callback] = () => {
        setTimeout(() => this.initMap(), 100);
      };

      DomUtil.importScript(url).catch(err => console.log(err));
    },
    fetchTeamUser(){
      let params = {
        teamId: this.teamId,
        state: this.state
      }
      return http.get('/stats/staff/teamUser', params);
    },
    head(){
      return this.showUser.head || DEFAULT_HEAD;
    },
    closeWindow(){
      infoWindow && infoWindow.close();
    },
    openDetail(){
      let user = this.showUser || {};
      var fromId = window.frameElement.getAttribute('id');
      parent.window.addTabs({
        id: "userView_" + user.userId, 
        title: "正在加载", 
        close: true, 
        url: "/security/user/view/" + user.userId,
        fromId:fromId
      });
      parent.window.resizeFrame();
    },
    // staff-task-table strackEventHandler
    sttTrackEventHandler(type) {
      switch (type) {
        case 'chooseTeam':
          this.$tdOnEvent('pc：人员报表-工单统计团队选择事件');
          break;
        case 'updateServerName':
          this.$tdOnEvent('pc：人员报表-工单统计服务人员输入框事件');
          break;
        case 'chooseColumn':
          this.$tdOnEvent('pc：人员报表-选择列事件');
          break;
        case 'chooseTaskType':
          this.$tdOnEvent('pc：人员报表-选择工单类型事件');
          break;
        default:
          break;
      }
    },
    // staff-category-chart strackEventHandler
    sccTrackEventHandler(type) {
      switch (type) {
        case 'chooseTeam':
          this.$tdOnEvent('pc：人员报表-人员统计团队选择事件');
          break;
        case 'chooseDate':
          this.$tdOnEvent('pc：人员报表-日期选择事件');
          break;
        case '工单':
          this.$tdOnEvent('pc：人员报表-工单事件');
          break;
        case '营收':
          this.$tdOnEvent('pc：人员报表-营收事件');
          break;
        case '满意度':
          this.$tdOnEvent('pc：人员报表-满意度事件');
          break;
        case '效率':
          this.$tdOnEvent('pc：人员报表-效率事件');
          break;                              
        default:
          break;
      }
    }
  },
  mounted(){
    let initData = JSON.parse(JSON.stringify(_init_data || {}));
    // this.teams = initData.teams || [];
    this.states = initData.states || [];
    this.stateColorMap = initData.stateColorMap || {};
    this.evaluateConfig = initData.evaluateConfig || {};
    //加载地图
    this.loadMap();
  },
  components: {
    [StaffCategoryChart.name]: StaffCategoryChart,
    [StaffTaskTable.name]: StaffTaskTable,
    [BaseCheckbox.name]: BaseCheckbox
  }
}
</script>


<style lang="scss">
.stats-map{
  display:flex;
  .refresh-checkbox{
    margin-left:20px;
  }
}

.stats-staff-map-wrap{
  position: relative;
  height: 100%;
  width: 100%;
}

.stats-staff-map-info{
  position: absolute;
  top: 10px;
  right: 10px;
  width: 240px;
  
  border-radius: 2px;
  background-color: #fff;
  box-shadow: 0 2px 2px rgba(0,0,0,.15);
  z-index: 998;

  strong{
    font-weight: 700;
  }
}

.stats-staff-map-summary{
  padding: 5px 8px;
  border-bottom: 1px dashed #DCDCDC;

  p{
    color: #333;
    margin: 0;
    height: 28px;
    line-height: 28px;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;

    span:first-child{
      display: block;
      width: 20px;
      height: 28px;
      text-align: center;
      margin-right: 6px;
    }

    i{
      color: #999;
      font-size: 18px; 
    }
  }
}

.stats-staff-map-state-panel{
  background-color: #fafafa;
  padding: 5px 8px;
}

.stats-staff-state-row{
  display: flex;
  flex-flow: row nowrap;
  align-items: center;

  line-height: 20px;
  padding: 4px 0;

  .stats-staff-state-badge{
    width: 20px;
    height: 14px;
    border-radius: 2px;
    margin-right: 6px;
  }
}


#map {
  width: 100%;
  height: 100%;
  min-height: 600px;
}

.stats-staff-window{
  position: relative;
  width: 320px;
  display: flex;
  flex-flow: row nowrap;

  box-shadow: 0 2px 2px rgba(0,0,0,.15);
  background-color: #fff;
  border-radius: 2px;
  padding: 8px;
}

.stats-staff-window-head{
  width: 68px;
  height: 68px;

  img{
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 4px;
  }
}

.stats-staff-window-info{
  flex: 1;
  padding-left: 8px;
  overflow: hidden;

  p{
    margin: 0;
    padding-top: 2px;
    font-size: 13px;
    line-height: 20px;
    color: #666;
  }
}

.stats-staff-window-name{
  position: relative;
  margin: 0;
  line-height: 1;
  height: 24px;
  font-size: 18px;
  font-weight: 400;
  padding-right: 30px;
  overflow: hidden;

  a{
    display: block;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
}

.stats-staff-window-close{
  position: absolute;
  top: 0;
  right: 0;
  width: 16px;
  height: 16px;
  padding: 0;
  margin: 0;
  background-color: transparent;
  outline: none;
  border: none;
  color: #666;

  &:hover{
    color: #000;
  }
}

.stats-staff-select .el-input__inner{
  height: 24px;
  line-height: 20px !important;
}

.stats-staff-select {
  .el-input{
    & > span.el-input__suffix {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  } 
}

</style>
