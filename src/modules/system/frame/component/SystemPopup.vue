<template>
  <transition name="slide-down">
    <div class="version-mask" v-if="show">
      <div class="version transition-container">
        <div class="version-banner">
          <img :src='systemData[0].img'>
        </div>
        <h3 class="version-title">{{systemData[0].title}}</h3>
        <div class="version-description">{{systemData[0].content}}</div>
        <div class="version-bottom">
          <button type="button" class="btn btn-text" @click="confirm">我知道了</button>
          <button type="button" class="btn btn-text version-btn" @click="seeHelp">{{systemData[0].btnName}}</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import http from '@src/util/http';
import platform from '@src/platform'


export default {
  name: 'system-popup',
  props: {
    systemData: {
      type:Array,
      default:() => []
    }
  },
  data(){
    return {
      show:true
    }
  },
  methods: {
    // 跳转链接
    seeHelp(){
      platform.openLink(this.systemData[0]?.url);
      this.confirm()
    },
    // 有下一条弹窗更新内容，没有就关闭弹窗
    async confirm(){
      try{
        let res = await http.get(`/api/app/outside/message/v1/msgAlertMark?msgId=${this.systemData[0].id}`)
        if(res.status === 0 && res.succ){
          if(this.systemData.length > 1){
            this.$emit('update:systemData', this.systemData.filter(item=>item.id !== this.systemData[0].id))
          }
          else{
            this.show = false
          }
        }
      }catch(error){
        console.log(error)
      }
    },
  },

}
</script>

<style lang="scss">
.version-mask{
  @include mask();
  z-index: 999;
  overflow: auto;
}

.version{
  position: relative;
  margin: 100px auto 20px auto;
  background-color: #fff;
  width: 420px;
  box-shadow: 1px 1px 8px rgba(0,0,0,0.15);
  color: #333;
}

.version-banner{
  position: relative;
  padding-top: 1px;
  user-select: none;

  img{
    width: 100%;
    display: block;
    overflow: hidden;
    margin: -35px 0 0 0;
  }
}

.version-title{
  font-size: 20px;
  text-align: center;
  padding: 8px 0 15px 0;
  margin: 0;
}

.version-description{
  padding: 5px 30px 20px 30px;
  max-height: 240px;
  overflow: auto;

  p{
    margin-bottom: 8px !important;

    &:last-child{
      margin-bottom: 0 !important;
    }
  }
}

.version-description p{
  line-height: 20px;

  &:last-child{
    margin-bottom: 0 !important;
  }
}
.version-bottom{
  text-align: center;
  padding: 10px 15px;
  overflow: hidden;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-around;
  border-top: 1px solid #f0f0f0;

  button.btn{
    width: 100px;
    height: 32px;
    padding: 0;
    color: $color-primary;
    line-height: 32px;
  }
}

.version-btn{
  font-size: 14px;
  color: #fff !important;
  border: none;
  outline: none;
  background-color: $color-primary;
  border-radius: 4px;
  box-shadow: 0 1px 4px 0px rgba($color-primary,0.5);
  &:hover {
    border-color: $color-primary !important;
    background-color: $color-primary !important;
  }
}
</style>