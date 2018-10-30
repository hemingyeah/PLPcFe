<template>
  <div class="contact-user-item" :class="{'contact-selected': user.selected}" @click="$emit('toggle', user)">
    <div class="contact-user-wrap">
      <div class="contact-user-avatar" :style="{backgroundImage: `url(${head})`}"></div>
      <div class="contact-user-info">
        <h3>
          <div class="contact-user-name">{{user.displayName}}</div>
          <div class="contact-user-state" v-if="showUserState && user.state">
            <i class="contact-user-state-icon" :style="{backgroundColor: stateColor[user.state]}"></i> 
            <span>{{user.state}}</span>
          </div>
        </h3>
        <p>{{user.cellPhone}}</p>
      </div>
      <div class="contact-user-addition" v-if="showLocation">
        <p>{{initDis(user.cusDistance)}}{{diftime(user)}}</p>
      </div>
      <div class="contact-user-addition" v-if="showTaskCount">
        <p>未完成：{{user.unfinishedTask}}</p>
        <p>今日完成：{{user.todayFinishedTask}}</p>
      </div>
    </div>
  </div>
</template>

<script>
import DefaultHead from '@src/assets/img/avatar.png';

export default {
  name: 'contact-user-item',
  props: {
    //用户数据
    user: {
      type: Object,
      default: () => ({})
    },
    //是否显示用户状态
    showUserState: {
      type: Boolean,
      default: false
    },
    //工作状态颜色
    stateColor: {
      type: Object,
      default: () => ({})
    },
    //是否显示任务统计
    showTaskCount: {
      type: Boolean,
      default: false
    },
    //是否显示定位信息
    showLocation: { 
      type: Boolean,
      default: false
    }
  },
  computed: {
    head(){
      return this.user.head || DefaultHead;
    }
  },
  methods: {
    //转换时间
    diftime(user){
      let attr = user.attribute || {}
      if(!attr.lastLocateTime) return '';

      let date = attr.lastLocateTime.substring(0,19).replace(/-/g,'/');
      let timestamp = new Date(date).getTime();
      let timeDiff = new Date().getTime() - timestamp;//时间差的毫秒数

      let days = Math.floor(timeDiff / (24 * 3600 * 1000));
      if(days > 0) return days < 3 ? `(${days}天前)` : '(3天前)';
      
      let hours = Math.floor(timeDiff / (3600 * 1000));
      return hours > 0 ? `(${hours}小时前)` : '(小时内)';
    },
    //计算距离
    initDis(val){
      if(!val) return "";
      return val > 1000 ? (val / 1000).toFixed(2) + 'km' : val + 'm';
    }
  }
}
</script>

<style lang="scss">
.contact-user-item{
  padding: 0 8px;
  cursor: pointer;
  transition: background-color ease .15s;

  &.contact-selected,
  &:hover{
    background-color: $color-primary-hover;
  }

  &:last-child .contact-user-wrap{
    border-bottom-color: transparent;
  }
}

.contact-user-wrap{
  display: flex;
  flex-flow: row nowrap;
  padding: 5px 0;
  border-bottom: 1px dashed #e9ecef;
}

.contact-user-avatar{
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;

  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
}

.contact-user-info{
  flex: 1;
  padding-left: 10px;
  overflow: hidden;
  
  h3{
    margin: 0;
    line-height: 24px;
    font-size: 14px;
    font-weight: 400;
    overflow: hidden;
    
    display: flex;
    flex-flow: row nowrap;
  }

  p{
    line-height: 20px;
    font-size: 13px;
    margin: 0;
    color: $text-color-secondary;
  }
}
 
.contact-user-addition{
  color: #9a9a9a;
  font-size: 12px;
  margin-left: 5px;
  p{
    margin: 0;
    line-height: 22px;
    text-align: right;
  }
}

.contact-user-name{
  max-width: 180px;
  @include text-ellipsis();
}

.contact-user-state{
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  font-size: 12px;
  color: $text-color-secondary;
}

.contact-user-state-icon{
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #f0f0f0;
  margin: 0 2px 0 5px;
}
</style>

