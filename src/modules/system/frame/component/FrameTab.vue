<template>
  <div 
    :id="`tab_` + tab.id"
    class="frame-tab" :class="{'frame-tab-active': tab.show}"
    @click="$emit('jump', tab)">

    <div class="frame-tab-inner">
      <span class="frame-tab-icon-wrap">
        <base-spin size="small" v-if="tab.loading"></base-spin>
        <template v-else>
          <i :class="['iconfont', tab.isHome ? 'icon-home' : 'icon-yemian', 'frame-tab-icon']"></i>
          <i class="iconfont icon-updete frame-tab-reload" @click="$emit('reload', tab)"></i>
        </template>
      </span>
      <span class="frame-tab-name">{{tab.title}}</span>
      <button class="btn-text frame-tab-close" @click.stop="$emit('close', tab)" v-if="tab.closeable">
        <i class="iconfont icon-close"></i>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'frame-tab',
  props: {
    tab: {
      type: Object,
      default: () => ({})
    }
  }
}
</script>

<style lang="scss">
.frame-tab{
  position: relative;
  display: block;
}

.frame-tab:not(:first-child){
  margin-left: 3px;

  &:before{
    content: "";
    position: absolute;
    left: -2px;
    top: 12px;
    width: 1px;
    height: 16px;
    background-color: #e4e7e5;
  }
}

.frame-tab-inner{
  display: flex;
  flex-flow: row nowrap;
  align-items: center;

  transition: all ease .3s;
  padding: 12px 10px;
  border-radius: 4px 4px 0 0;
}

.frame-tab-icon-wrap{
  display: inline-block;
  height: 16px;
  width: 16px;
  text-align: center;
  line-height: 16px;
}

.frame-tab-name{
  display: inline-block;
  cursor: default;
  user-select: none;
  height: 16px;
  line-height: 16px;
  font-size: 14px;
  margin-left: 5px;
  min-width: 70px;
  white-space: nowrap;
}

.frame-tab-reload{
  cursor: pointer;
  font-size: 16px;
  display: none;
}

.frame-tab-icon{
  color: #757575;
  font-size: 16px;
}

.frame-tab-close{
  margin: 0;
  margin-left: 5px;
  padding: 0;
  width: 16px;
  height: 16px;
  line-height: 16px;
  color: #6a6a6a;
  font-weight: 500;

  i.icon-close{
    font-size: 12px;
  }
 
  &:hover{
    color: $color-danger;
  }
}

.frame-tab-active,
.frame-tab:hover{
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
    background-color: $color-primary-hover;
    color: $color-primary;    
  }
}

.frame-tab:hover{
  .frame-tab-reload{
    display: inline-block;
  }

  .frame-tab-icon{
    display: none;
  }
}
</style>
