<template>
  <div class="daily-report" v-if="items.module">
    <img :style="{'height':17*width/32+'px'}" :src="`/files/getDailyBanner?module=${items.module}`" alt="">
    <div class="information">
      <div v-for="item in items.details" :key="item.key" class="report-list">
        <div class="name"><div>{{item.name}}</div></div>
        <strong class="value" :style="{'font-size':fontSize(item.result.toString().length)}">{{item.result}}</strong>
      </div>
      <div class="message"><p>如需自定义日报，请到</p><p><span>售后宝PC端[系统管理>订阅通知管理]</span>中进行配置</p></div>
      <div @click="jump" class="to-index-btn">进入售后宝查看详情</div>
    </div>    
  </div>
</template>

<script>
  var width = document.body.offsetWidth;
  export default {
    name: "daily-report-view",
    props: {
      initData: {
        type: Object,
        default: () => ({})
      }
    },
    data: function data() {
      return {
        items:{},
        width:width
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
        window.location.href = this.items.pcUrl;
      },
    },
    mounted() {
      this.items = this.initData;
    }
  }
</script>

<style lang="scss">
body, html{
  height:100%;
}
.daily-report{
  height:100%;
  background:#f4f7f5;
  img{
    display:block;
    width:100%;
  }
  .information{
    background:#f4f7f5;
    padding-bottom:10px;
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
    span{
      color:#00ac97;            
    }
  }
}

</style>

