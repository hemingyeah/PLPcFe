<template>
  <div class="daily-report">
    <!-- <img :src="`/files/getDailyBanner?module=${item.module}`" alt=""> -->
    <div v-for="item in items.details" :key="item.key" class="report-list">
      <div class="name"><div>{{item.name}}</div></div>
      <strong class="value" :style="{'font-size':fontSize(item.result.toString().length)}">{{item.result}}</strong>
    </div>
    <div class="message"><p>如需自定义日报，请到</p><p><strong>售后宝PC端[系统管理>订阅通知管理]</strong>中进行配置</p></div>
    <div @click="jump" class="to-index-btn">进入售后宝查看详情</div>
  </div>
</template>

<script>
  import '../../../assets/specile_font.css'
  export default {
    name: "daily-report",
    data: function data() {
      return {
        items:{
          pcUrl:'dingtalk://dingtalkclient/action/openapp?corpid=ding73b203abd39ac5e935c2f4657eb6378f&container_type=work_platform&app_id=3397&redirect_type=jump&redirect_url=https://pubapp.shb.ltd/client/pc?corpId=ding73b203abd39ac5e935c2f4657eb6378f',
          module: "manager", //personal
          details:[
            {
              key:"1",
              name: "今日计划工单",
              result: 37438479312
            },
            {
              key:"2",
              name: "未完成的服务台事件",
              result: "26479865234"
            },
            {
              key:"3",
              name: "今日计划今日计划工单今日计划工单工单",
              result: "374384793"
            },
            {
              key:"4",
              name: "未完成的服务台事件",
              result: "26479865"
            },
            {
              key:"5",
              name: "今日计划工单",
              result: "3648490"
            },
            {
              key:"6",
              name: "未完成的服务台事件",
              result: "264950"
            },
            {
              key:"7",
              name: "今日计划工单",
              result: "26485"
            },
            {
              key:"8",
              name: "未完成的服务台事件",
              result: "33"
            }
          ]
        }
      }
    },
    computed:{
      
    },
    methods: {
      fontSize(len){
        if(len > 5 && len <= 9) return 30 * (1 - (len - 5) / 5 + (len - 5) / 12) + 'px';
        if(len > 9) return '12px';
        return '30px';      
      },
      jump() {
        window.location.href = this.item.pcUrl
      },
      fetchData(){
        let params = {};
        this.$http.get('/dd/statistic/getDailyReport', params).then(result => {
          this.list = result.data;
        }).catch(err => console.log(err)) 
      }
    },
    mounted() {
      let params = {};
      // params.module = ;
      // params.staffId = ;
      //this.fetchData();
    }
  }
</script>

<style lang="scss">
body, html{
  height:100%;
}
.daily-report{
  height:100%;
  padding-bottom:10px;
  background:#f4f7f5;
  img{
    display:block;
    width:100%;
  }
  .report-list{
    margin:8px 10px;
    display:flex;
    height:54px;
    line-height:54px;
    padding:0 10px;
    background:#fff;
    border-radius:2px;
    font-size:14px;
    color:#333;
    box-shadow: 0 1px 4px rgba(204, 204, 204, 0.4);
    .name{
      flex:1;
      overflow: hidden;
      div{
        width:100%;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
    .value{
      width:100px;
      font-size:30px;
      text-align: right;
      overflow: hidden;
      font-family: DINCondensed-Bold;
    }
  }
  .to-index-btn{
    margin:0 10px;
    text-align: center;
    margin-top: 10px;
    background:#00ac97; 
    color:#fff;
    height:50px;
    line-height:50px;
    font-size:15px;
    border-radius:2px;
  }
  .message{
    font-size:12px;
    text-align: center;
    line-height:1.5;
    color:#999;
    p{margin:0;}
    strong{
      color:#00ac97;            
    }
  }
}

</style>

