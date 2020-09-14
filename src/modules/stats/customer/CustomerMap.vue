<template>
  <div class="stats-panel">
    <div class="stats-panel-head stats-form">
      <h3 class="stats-map">客户位置&nbsp;

        <el-popover trigger="hover">
          <ul>
            <li>显示全部客户或者某个团队下的客户的位置，但暂不支持超过2万条以上的数据显示。</li>
            <li>如果要按团队显示客户位置，请先在客户上配置团队。</li>
            <li>此地图不受顶部筛选条件影响。</li>
          </ul>

          <stats-popover-icon slot="reference"></stats-popover-icon>
        </el-popover>
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

      <el-popover trigger="hover">
        <ul>
          <!-- <li>钉钉版暂不支持进入全屏模式。</li>
          <li>如有需要，请在web版进去全屏模式。</li> -->
          <li>全屏模式下按<kbd>esc</kbd>键可退出全屏模式。</li>
        </ul>

        <button slot="reference" type="button" class="stats-fullscreen-btn" @click="fullScreen">
          <i class="iconfont icon-open"></i>
        </button>
      </el-popover>
    </div>
    <div class="stats-panel-body stats-customer-map-wrap" ref="mapWrap">
      <div id="map"></div>

      <div class="stats-customer-list" v-if="customerList.length > 0">
        <div class="stats-customer-list-head">
          <h3>客户列表</h3>
          <button type="button" @click="close">
            <i class="iconfont icon-guanbi"></i>
          </button>
        </div>
        <div class="stats-customer-list-body">
          <div class="stats-plan-map-customer" v-for="item in customerList" :key="item.id">
            <div class="stats-plan-row"> 
              <div class="stats-plan-row-left">客户：</div>
              <div class="stats-plan-row-right"><a @click.stop.prevent="openDetail(item.id)">{{item.name}}</a></div>
            </div>
            <div class="stats-plan-row"> 
              <div class="stats-plan-row-left">联系人：</div>
              <div class="stats-plan-row-right">{{item.lmName}}</div>
            </div>
            <div class="stats-plan-row"> 
              <div class="stats-plan-row-left">电话：</div>
              <div class="stats-plan-row-right">{{item.lmPhone}}</div>
            </div>
            <div class="stats-plan-row"> 
              <div class="stats-plan-row-left">地址：</div>
              <div class="stats-plan-row-right">{{item.customerAddress | prettyAddress}}</div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  </div>
</template>

<script>
/*global AMap*/
import DomUtil from 'src/util/DomUtil';
import http from 'src/util/HttpUtil';
import BaseCheckbox from 'packages/BaseCheckbox.vue';
import {isEnterprise} from '@src/util/Platform';
let map = null;
let clusterer = null;
let t1;

function generateKey(lng, lat){
  return `lng_${lng}_lat_${lat}`;
}

function timeChunk(arr, num, callback) {
  let delay = 25; 
  let timer = null;
  let _resolve = null;
  let _reject = null; // eslint-disable-line

  function done(){
    if(arr.length > 0) return invoke(arr);

    clearTimeout(timer);
    _resolve();
  }

  function invoke(arr){
    timer = setTimeout(function(){
      let data = arr.length > num ? arr.splice(0, num) : arr.splice(0);
      callback(data, done);
    }, delay);
  }

  return new Promise((resolve, reject) => {
    _resolve = resolve;
    _reject = reject;

    invoke(arr);
  });
}

export default {
  name: 'customer-map',
  data(){
    return {
      tag: [],
      customerMap: {},
      customerList: [],
      // teams: [],
      teamId: '',
      isRefresh:false
    };
  },
  methods: {
    fetchTeam(params){
      return http.post(isEnterprise ? '/security/tag/tree' : '/security/tag/list', {...params, ...{authKey: 'VIP_REPORT_VIEW'}})
    },
    openDetail(cId){

      var fromId = window.frameElement.getAttribute('id');

      parent.window.addTabs({
        id: `customerView_${cId}`,
        title: "正在加载",
        close: true,
        url: `/customer/view/${cId}?noHistory=1`,
        fromId:fromId
      });
      parent.window.resizeFrame();
    },
    changeRefresh(value){
      this.isRefresh = value;
      if(!this.isRefresh) return clearInterval(t1);   
      t1 = setInterval(() => {
        this.refreshMap();
      },300000);      
    },
    async refreshMap(){
      try {        
        let instance = this.$loading.show(this.$el)
        let data = await this.fetchData();
        this.renderMap(data);

        instance.hide();
      } catch (error) {
        console.log(error)
      }
    },
    async chooseTeam(value){
      try { 
        let tag = (Array.isArray(value) ? value[0] : value) || {};
        this.tag = value;
        this.teamId = tag.id;
        
        let instance = this.$loading.show(this.$el)
        let data = await this.fetchData();
        this.renderMap(data);

        instance.hide();
      } catch (error) {
        console.log(error)
      }
    },
    fullScreen(){
      if(this.$platform.inDingTalk()) return;
      
      DomUtil.fullScreen(this.$refs.mapWrap);
    },
    loadMap() {
      let callback = "_amap_callback_stats_plan_dongls_0111";
      let url = "https://webapi.amap.com/maps?v=1.3&key=3cf1b829475ac81c406ceca9ec57d73d&callback=" + callback;
      window[callback] = () => {
        setTimeout(() => this.initMap(), 100);
      };

      DomUtil.importScript(url).catch(err => console.log(err));
    },
    async initMap() {
      try {
        map = new AMap.Map("map", {
          resizeEnable: true,
          center:[105,34],
          zoom: 4,
          zooms: [4,18]
        });

        let microTask = [];

        microTask.push(this.fetchData());
        microTask.push(new Promise((resolve, reject) => {
          map.plugin(["AMap.MarkerClusterer"],() => resolve(true));
        }));
        
        let instance = this.$loading.show(this.$el)
        let result = await Promise.all(microTask);

        this.renderMap(result[0])
        instance.hide();
      } catch (error) {
        console.log(error)
      }
    },
    async renderMap(data = []){
      if(clusterer) {
        clusterer.clearMarkers();
        map.clearMap();
      }
      
      this.customerMap = {};
      this.customerList = []
       
      data = data.filter(item => {
        let customerAddress = item.customerAddress || {};
        return customerAddress.adLatitude && customerAddress.adLongitude;
      });

      data.forEach(item => {
        let customerAddress = item.customerAddress || {};
        let key = generateKey(customerAddress.adLongitude, customerAddress.adLatitude);
        if(!this.customerMap[key]) this.customerMap[key] = [];
        this.customerMap[key].push(item)
      })

      let markers = [];
      let createMarker = this.createMarker;
      
      await timeChunk(data, 500, function(chunk, done){
        //创建marker
        for(let i = 0; i < chunk.length; i++){
          markers.push(createMarker(chunk[i]))
        }
        done();
      })

      //创建cluster
      var count = markers.length;
      clusterer = new AMap.MarkerClusterer(map, markers, {
        maxZoom: 12,
        averageCenter:true,
        renderCluserMarker: context => this.renderCluserMarker(count,context)
      });
    },
    fetchData(){
      let params = {
        tagId: this.teamId
      };
      return http.get('/stats/customer/list', params)
    },
    renderCluserMarker(count, context){
      //let factor = Math.pow(context.count / count, 1 / 18);
      let size = Math.round(10 + Math.pow(context.count / count,1 / 5) * 30);

      let div = document.createElement('div');
      //var Hue = 180 - factor * 180;

      div.style.width = div.style.height = div.style.lineHeight = size + 'px';

      div.className = 'customer-map-cluser ripple';
      div.innerHTML = `<span>${context.count}</span>`;

      context.marker.setOffset(new AMap.Pixel( -size / 2,-size / 2));
      context.marker.setContent(div)
    },
    createMarker(data){
      let customerAddress = data.customerAddress || {};

      let marker = new AMap.Marker({
        position: [customerAddress.adLongitude,customerAddress.adLatitude],
        extData: data,
        content: '<div class="customer-map-marker"></div>'
      });

      marker.on('click',event => {
        let extData = marker.getExtData();
        let ca = extData.customerAddress || {};
        let key = generateKey(ca.adLongitude, ca.adLatitude);
        this.customerList = this.customerMap[key] || [];
      })

      return marker;
    },
    close(){
      this.customerList = [];
    }
  },
  mounted(){
    let initData = JSON.parse(JSON.stringify(window._init_data)) || {};
    // this.teams = initData.teams || [];

    setTimeout(() => this.loadMap(), 1500);
  },
  components: {
    [BaseCheckbox.name]: BaseCheckbox
  }
}
</script>

<style lang="scss">
#map {
  width: 100%;
  height: 100%;
  min-height: 600px;
}

.stats-map{
  display:flex;
  .refresh-checkbox{
    margin-left:20px;
  }
}

.customer-map-cluser{
  font-size: 14px;
  text-align: center;
  
  &:hover span{
    color: #fff;
  }

  span{
    color: transparent;
  }
}

.customer-map-marker{
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 3px solid #fff;
  background-color: #c41d7f;
  box-shadow: 1px 1px 8px rgba(0,0,0, .35);
}

.ripple{
  position: relative;
  border-radius: 50%;
  margin: 0 auto;
  background-color: #c41d7f;
  box-shadow: 0 0 4px rgba(0,0,0,.45)
}

.ripple:after,
.ripple:before{
  content: '';
  position: absolute;
  top: 0;
  left: 0;

  width: 100%;
  height: 100%;
  border: 0.5px solid #c41d7f;
  border-radius: 50%;
  box-shadow: 0 0 1px rgba(0, 0, 0, .25)
}

.ripple:before{
  animation:opac 2s linear infinite;
}

.ripple:after{
  animation:opac 2s linear infinite 1s;
}

.stats-customer-map-wrap{
  position: relative;
  height: 100%;
  width: 100%;
}

@keyframes opac{
  0% {
    opacity: 1;
    transform: scale(1);
  }

  100% {
    opacity: 0;
    transform: scale(2);
  }
}

.stats-customer-list{
  position: absolute;
  top: 10px;
  right: 10px;
  width: 240px;
  background-color: #fff;
  box-shadow: 0 2px 2px rgba(0,0,0,.15);
  border-radius: 2px;
}


.stats-customer-list-head{
  height: 31px;
  border-bottom: 1px solid #d5d5d5;

  display: flex;
  flex-flow: row nowrap;

  h3{
    margin: 0;
    line-height: 30px;
    font-size: 16px;
    font-weight: 400;
    padding-left: 5px;
    flex: 1;
  }

  button{
    width: 30px;
    height: 30px;
    margin: 0;
    padding: 0;
    color: #333;
    border: none;
    outline: none;
    background-color: transparent;
  }
}

.stats-customer-list-body{
  max-height: 549px;
  overflow: auto;
}

.stats-plan-map-customer{
  padding: 5px;
  border-top: 1px solid #d5d5d5;
  color: #666;

  &:first-child{
    border-top-color: transparent;
  }

  p{
    margin: 0;
    line-height: 24px;
    font-size: 14px;
  }
}

.stats-plan-row{
  display: flex;
	flex-flow: row nowrap;
}

.stats-plan-row-left{
	font-size: 14px;
	width: 70px;
	line-height: 24px;
}

.stats-plan-row-right{
  flex: 1;
	font-size: 14px;
	word-break: break-all;
	line-height: 24px;
}
</style>
