<template>
  <nav class="frame-nav" :class="{'frame-nav-expand': !collapse}" @transitionend="navTransitionEnd">
    <div class="frame-logo">
      <a href="javascript:;" @click="openHome">
        <img src="../../../../assets/svg/logo.svg">
        <span v-show="!collapse">售后宝</span>
      </a>
    </div>
    <div class="frame-menu-scroll">
      <ul class="frame-menu">
        <template v-for="menu in menus">
          <li :class="{'frame-menu-item': true, 'frame-subMenu-expand': !collapse && menu == currMenu}" :key="menu.url">
            <a :href="menu.url ? menu.url : 'javascript:;'" @click.prevent="open(menu)"> 
              <i :class="['iconfont', menuIcon[menu.menuKey]]"></i>
              <template v-if="!collapse">
                <span class="frame-menu-name">{{menu.name}}</span>
                <i class="iconfont icon-nav-right" v-if="menu.children && menu.children.length > 0"></i>
              </template>
            </a>
            <el-collapse-transition>
              <ul 
                :class="{'frame-subMenu': true,'frame-float-menu': collapse}"
                v-show="!collapse && menu == currMenu">
                <li class="frame-float-menu-title"><h3>{{menu.name}}</h3></li>
                <template v-for="menu in menu.children">
                  <li :class="{'frame-subMenu-item': true, 'frame-subMenu-active': menu.active}" :key="menu.menuKey">
                    <a :href="menu.url ? menu.url : 'javascript:;'" @click.prevent="open(menu)">{{menu.name}}</a>
                  </li>
                </template>
              </ul>
            </el-collapse-transition>
          </li>
        </template>
      </ul>
    </div>
  </nav>
</template>

<script>
import _ from 'lodash';
import MenuIcon from '../model/MenuIcon';

export default {
  name: 'frame-nav',
  props: {
    collapse: {
      type: Boolean,
      default: false
    },
    source: {
      type: Array,
      default: () => []
    },
    currUrl: {
      type: String,
      default: ""
    }
  },
  data(){
    let originMenus = _.cloneDeep(this.source);
    let {menus} = this.buildMenus(originMenus, null);

    return {
      originMenus: originMenus,
      menus: menus,
      menuIcon: MenuIcon,
      currMenu: null
    };
  },
  methods: {
    navTransitionEnd(event){
      //只监听nav宽段变化
      if(event.target != this.$el || event.propertyName != 'width') return;
      this.$emit('collapse-changed')
    },
    /** 将后端返回的菜单，重整为多根树形结构 */
    buildMenus(source, parent){
      let menus = [];
      let otherMenus = [];

      for(let i = 0; i < source.length; i++){
        let menu = source[i]
        if(menu.parent == parent){
          menus.push(menu);
        }else{
          otherMenus.push(menu)
        }
      }

      if(menus.length > 0){
        for(let j = 0; j < menus.length; j++){
          let subMenu = menus[j];
          let subRes = this.buildMenus(otherMenus, subMenu.menuKey);

          subMenu.children = subRes.menus;
          otherMenus = subRes.otherMenus;
        }
      }

      return {menus, otherMenus};
    },
    open(menu){
      //如果有子菜单，展开子菜单
      if(menu.children && menu.children.length > 0) {
        this.currMenu = this.currMenu == menu ? null : menu;
        return
      }

      this.originMenus.forEach(item => item.active && (item.active = false));
      this.$set(menu, 'active', true);
      if(menu.url) this.$emit('open', menu)
    },
    openHome(){
      this.$emit('open', {menuKey: 'HOME', url: '/home', title: '首页'})
    }
  }
}
</script>

<style lang="scss">
.frame-nav{
  width: 44px;
  height: 100%;
  background-color: $color-primary;
  box-shadow: 1px 0 4px rgba(0,0,0,.125);
  transition: width ease .2s;
  position: relative;
  z-index: 9;

  a{
    text-decoration: none !important;
  }
}

.frame-nav.frame-nav-expand{
  width: 200px;
  overflow: hidden;

  .frame-logo{
    box-shadow: 0 1px 2px rgba(0,0,0,.125);

    a {
      width: 180px;
    }
  }

  .frame-menu-scroll{
    overflow: auto;
    height: calc(100% - 44px);
    margin-right: -40px;
  }

  .frame-menu{
    width: 200px;
  }

  .frame-menu-item{
    width: 200px;
    overflow: hidden;
  }

  .frame-subMenu-item > a{
    padding: 8px 15px 8px 39px;
  }
  .frame-float-menu-title{
    display: none;
  }
}

.frame-logo{
  height: 44px;
  padding: 8px;
  
  a{
    display: flex;
    flex-flow: row nowrap;
    overflow: hidden;
    align-items: flex-end;

    span{
      line-height: 20px;
      vertical-align: bottom;
      font-size: 18px;
      padding-left: 15px;
      color: #fff;
    }
  }

  img{
    display: block;
    margin: 0;
    width: 28px;
    height: 28px;
  }
}

.frame-menu{
  margin: 0;
  padding: 0;
  list-style: none;
}

.frame-menu-item{
  position: relative;
  margin: 0;
  padding: 0;
  min-height: 44px;
  transition: background-color ease .3s;

  &:hover{
    background-color: lighten($color-primary, 3%);

    .frame-float-menu{
      display: block !important;
    }
  }
  
  & > a{
    display: flex;
    flex-flow: row nowrap;
    line-height: 24px;
    padding: 10px;
    color: #fff;
    font-size: 14px;

    i.iconfont{
      display: block;
      width: 24px;
      height: 24px;
      line-height: 24px;
      text-align: center;
      font-size: 16px;

      transition: transform ease .15s;
    }
  }
}

.frame-menu-name{
  padding-left: 5px;
  flex: 1;
}

.frame-subMenu{
  background-color: #fff;
  margin: 0;
  padding: 0;
}

.frame-subMenu-item{
  display: block;
  width: 100%;
  transition: background-color ease .3s,
              color ease .3s;
  
  &:hover,
  &.frame-subMenu-active{
    background-color: $color-primary-hover;
    color: $color-primary;
  }
  
  & > a{
    width: 100%;
    display: block;
    padding: 8px 25px;
    line-height: 24px;
    color: inherit;
  }
}

.frame-subMenu-expand .icon-nav-right{
  transform: rotateZ(90deg);
}

.frame-float-menu{
  display: none;
  position: absolute;
  left: 44px;
  top: 0;
  overflow: hidden;
  width: 176px;
  background-color: #fff;
  box-shadow: 1px 1px 4px 0 rgba(0,0,0,.1);
}

.frame-float-menu-title h3{
  margin: 0;
  font-size: 16px;
  padding: 10px 25px;
  line-height: 24px;
  color: #303133;
  border-bottom: 1px solid #ebeef5;
  cursor: default;
  
  a{
    color: $text-color-primary;
    width: 100%;
    display: block;
  }
}
</style>
