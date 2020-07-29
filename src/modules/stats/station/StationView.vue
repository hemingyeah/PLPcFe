<template>
  <div class="stats-container">
    <div class="stats-station-head">
      <div class="stats-station-card">
        <p>接入客户</p>
        <h3>{{unfinishedCus | convertZero}}</h3>
        <div class="stats-station-card-bottom">昨日服务客户：{{yesterdayCus | convertZero}}</div>
      </div>

      <div class="stats-station-card">
        <p>未完成事件</p>
        <h3><a href="/event" data-to="unfinishedEvent" @click.prevent="openDetail">{{unfinishedEvent | convertZero}}</a></h3>
        <div class="stats-station-card-bottom">进行中事件：{{processingEvent | convertZero}}</div>
      </div>

      <div class="stats-station-card">
        <p>今日完成事件</p>
        <h3><a href="/event" data-to="todayFinish" @click.prevent="openDetail">{{todayFinish | convertZero}}</a></h3>
        <div class="stats-station-card-bottom">昨日完成事件：{{yesterdayFinish | convertZero}}</div>
      </div>

      <div class="stats-station-card">
        <p>未完成订单</p>
        <h3><a href="/event/order" data-to="unfinishedOrder" @click.prevent="openDetail">{{unfinishedOrder | convertZero}}</a></h3>
        <div class="stats-station-card-bottom">近30天订单：{{the30daysOrder | convertZero}}</div>
      </div>

      <div class="stats-station-card">
        <p>近30天好评率</p>
        <h3>{{the30daysGood | toPercent}}</h3>
        <div class="stats-station-card-bottom">近30天差评率：{{the30daysBad | toPercent}}</div>
      </div>

    </div>

    <div class="stats-row">
      <station-chart @trackEvent="scTrackEventHandler"></station-chart>
    </div>

    <div class="stats-row">
      <station-table @trackEvent="stTrackEventHandler"></station-table>
    </div>
  </div>
</template>

<script>
import http from 'src/util/HttpUtil';
import qs from 'src/util/QueryString';
import DateUtil from 'src/util/date';
import StationChart from './StationChart.vue';
import StationTable from './StationTable.vue';

export default {
  name: 'station-view',
  data(){
    return {
      //未完成事件
      unfinishedEvent: '--',
      //今日完成事件
      todayFinish: '--',
      //昨日完成事件
      yesterdayFinish: '--',
      //近30天好评率
      the30daysGood: '--',
      //未完成订单
      unfinishedOrder: '--',
      //近30天订单
      the30daysOrder: '--',
      //接入客户
      unfinishedCus: '--',
      //昨日服务客户
      yesterdayCus: '--',
      //进行中事件
      processingEvent: '--',
      //近30天差评率
      the30daysBad: '--',
      loading: true
    }
  },
  methods: {
    openDetail(event){
      let fromId = window.frameElement.getAttribute('id');
      let url = event.target.getAttribute('href');
      let to = event.target.dataset.to;

      let model = {};

      if(to == 'unfinishedEvent'){
        model.state = 'created';
      }

      if(to == 'todayFinish'){
        model.state = 'finished'
        //2018/05/02 - 2018/05/02
        let today = DateUtil.format(new Date(), 'yyyy/MM/dd');
        model.completeTime = today + ' - ' + today;
      }

      if(to == 'unfinishedOrder'){
        model.state = 'created';
      }

      parent.window.addTabs({
        id: "M_CASE_LIST", 
        title: "正在加载", 
        close: true, 
        url: url + '?' + qs.stringify(model),
        fromId: fromId
      });
      
      parent.window.resizeFrame();
    },
    async initStationHead(){
      try {
        let data = await this.fetchStationCountData();
        
        this.unfinishedEvent = data.unfinishedEvent;
        this.todayFinish = data.todayFinish;
        this.yesterdayFinish = data.yesterdayFinish;
        this.the30daysGood = data['30daysGood'];
        this.unfinishedOrder = data.unfinishedOrder;
        this.the30daysOrder = data['30daysOrder'];
        this.unfinishedCus = data.unfinishedCus;
        this.yesterdayCus = data.yesterdayCus;
        this.processingEvent = data.processingEvent;
        this.the30daysBad = data['30daysBad'];
      } catch (error) {
        console.log(error)
      }
    },
    fetchStationCountData(){
      return http.get('/stats/station/count', {});
    },
    // station-chart trackEventHandler TalkingData事件埋点
    scTrackEventHandler(type) {
      switch (type) {
        case 'chooseDate':
          this.$tdOnEvent('pc：服务台报表-日期选择事件');
          break;
        default:
          break;
      }
    },
    // station-table trackEventHandler TalkingData事件埋点
    stTrackEventHandler(type) {
      switch (type) {
        case 'updateServerName':
          this.$tdOnEvent('pc：服务台报表-服务人员输入框事件');
          break;
        case 'selectColumn':
          this.$tdOnEvent('pc：服务台报表-选择列事件');
          break;
        case 'expand':
          this.$tdOnEvent('pc：服务台报表-展开数据事件');
          break;
        default:
          break;
      }
    },
  },
  mounted(){
    this.initStationHead();
  },
  components: {
    [StationChart.name]: StationChart,
    [StationTable.name]: StationTable
  }
}
</script>

<style lang="scss">
.stats-station-head{
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  margin: 7.5px;
}

.stats-station-card{
  flex: 1;
  margin-left: 15px;

  border-radius: 2px;
  background-color: #fff;
  text-align: center;

  p{
    padding: 15px;
    margin: 0;
    font-size: 14px;
  }

  h3{
    font-weight: 400;
    font-size: 24px;
    color: #2d9cf5;
    margin: 0;
    padding: 5px 0 20px 0;

    a{
      color: #2d9cf5;
    }
  }

  &:first-child{
    margin-left: 0;
  }
}

.stats-station-card-bottom{
  border-top: 1px solid #eee;
  background: #fafafa;
  border-radius: 0 0 2px 2px;
  padding: 18px 0;
  font-size: 13px;
}

.stats-station-panel{
  .stats-form{
    justify-content: flex-end;
  }
}

</style>
