<template>
  <div 
    :id="`tab_` + tab.id"
    class="frame-tab" :class="{'frame-tab-active': tab.show, 'frame-tab-home': tab.isHome, 'frame-tab-hover': hover}"
    @click="$emit('jump', tab)">

    <div class="frame-tab-inner">
      <span class="frame-tab-icon-wrap">
        <base-spin size="small" v-if="tab.loading"></base-spin>
        <template v-else>
          <i :class="['iconfont', tab.isHome ? 'icon-shouye' : 'icon-juxing', 'frame-tab-icon']"></i>
          <i class="iconfont icon-updete frame-tab-reload" @click="reload"></i>
        </template>
      </span>
      <span class="frame-tab-name">{{tab.title}}</span>
      <button class="btn-text frame-tab-close" @click.stop="$emit('close', tab)" v-if="tab.closeable">×</button>
    </div>
  </div>
</template>

<script>
//ie 显示bug
export default {
  name: 'frame-tab',
  props: {
    tab: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      hover: false,
    }
  },
  mounted() {
    this.check();
  },
  beforeDestroy() {
    clearInterval(this.timer);
    this.timer = null;
  },
  methods: {
    check() {
      const tab = this.tab;
      this.timer = setInterval(() => {
        if (new Date() - tab.timeStamp >= 10000) {
          this.hover = true;
          clearInterval(this.timer);
        }
      }, 1000)
    },
    reload() {
      this.hover = false;
      this.check();
      this.$emit('reload', this.tab);
    }
  }
}
</script>

<style lang="scss">
.frame-tab{
  position: relative;
  display: inline-block;
  vertical-align: middle;
  border-left: 1px solid #f2f2f2;
  border-bottom: 1px solid #f2f2f2;

  &:last-child{
    border-right: 1px solid #f2f2f2;
  }
}

.frame-tab-home .frame-tab-inner{
  min-width: 0;
}

.frame-tab-inner{
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  min-width: 120px;
  position: relative;

  transition: all ease .3s;
  padding: 12px 10px;

  .base-spin{
    display: block;
  }
}

.frame-tab-icon-wrap{
  display: block;
  height: 16px;
  width: 16px;
  text-align: center;
  line-height: 16px;
}

.frame-tab-name{
  display: block;
  cursor: default;
  user-select: none;
  height: 16px;
  line-height: 16px;
  font-size: 15px;
  margin-left: 5px;
  
  max-width: 180px;
  @include text-ellipsis();
}

.frame-tab-reload{
  cursor: pointer;
  font-size: 16px;
  display: none;
}

.frame-tab-icon{
  display: block;
  color: #757575;
  font-size: 16px;
}

.frame-tab-close{
  display: block;
  margin: 0 0 0 10px;
  padding: 0;
  width: 16px;
  height: 16px;
  line-height: 16px;
  color: #bbb;
  font-size: 18px;
  
  &:hover{
    color: $color-danger;
  }
}

.frame-tab-active,
.frame-tab:hover{  
  border-bottom-color: $color-primary;
  &:before{
    background-color: transparent !important;
  }

  & + .frame-tab{
    &:before{
      background-color: transparent !important;
    }
  }

  i.frame-tab-icon{
    color: $color-primary;
  }

  .frame-tab-inner{
    //background-color: $color-primary-hover;
    color: $color-primary;    
  }
}

.frame-tab-hover:hover{
  .frame-tab-reload{
    display: block;
  }

  .frame-tab-icon{
    display: none;
  }
}
</style>
