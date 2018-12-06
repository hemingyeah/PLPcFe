<template>
  <nav class="frame-nav" :class="{'frame-nav-expand': !collapse}" @transitionend="navTransitionEnd">
    <div class="frame-logo">
      <a href="javascript:;" @click="openHome"><img :src="logoImg"></a>
    </div>
    <div class="frame-menu-scroll">
      <ul class="frame-menu">
        <template v-for="menu in menus">
          <li 
            :class="{
              'frame-menu-item': true, 
              'frame-menu-active': menu == currMenu,
              'frame-menu-expand': menu == currMenu
            }" 
            :key="menu.url">
            <a 
              :href="menu.url ? menu.url : 'javascript:;'" 
              @click.prevent="open(menu)" 
              :class="{'': menu.active}"> 
              <span class="frame-menu-icon"><i :class="['iconfont', menuIcon[menu.menuKey]]"></i></span>
              <template v-if="!collapse">
                <span class="frame-menu-name">{{menu.name}}</span>
                <i class="iconfont icon-nav-down" v-if="menu.children && menu.children.length > 0"></i>
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

import Logo from '@src/assets/img/logo.png';
import MiniLogo from '@src/assets/svg/logo.svg';

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
  computed: {
    logoImg(){
      return this.collapse ? MiniLogo : Logo;
    }
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
        this.$emit('update:collapse', false);
        return
      }

      if(!menu.url) return;

      let parentMenu = null;
      this.originMenus.forEach(item => {
        item.active && (item.active = false)
        if(item.menuKey == menu.parent) parentMenu = item;
      });

      this.currMenu = parentMenu;
      this.$set(menu, 'active', true);

      this.$emit('open', menu)
    },
    openHome(){
      this.$emit('open', {menuKey: 'HOME', url: '/home', title: '首页'})
    }
  }
}
</script>

<style lang="scss">
.frame-nav{
  width: 50px;
  height: 100%;
  background-color: $color-primary;
  box-shadow: 1px 0 8px rgba(0,0,0,.125);
  transition: width ease .2s;
  position: relative;
  z-index: 9;

  a{
    text-decoration: none !important;
  }
}

.frame-nav.frame-nav-expand{
  width: 220px;
  overflow: hidden;

  .frame-menu-scroll{
    overflow: auto;
    height: calc(100% - 44px);
    margin-right: -40px;
  }

  .frame-menu{
    width: 220px;
  }

  .frame-menu-item{
    width: 220px;
    overflow: hidden;
  }

  .frame-subMenu-item {
    color: #fff;

    & > a{
      padding: 13px 15px 13px 46px;
    }

    &.frame-subMenu-active:before{
      content: "";
      position: absolute;
      left: 25px;
      top: 20px;
      width: 6px;
      height: 6px;
      background-color: $color-primary;
      border-radius: 50%;
    }
  }

  .frame-float-menu-title{
    display: none;
  }
}

.frame-logo{
  height: 50px;
  border-bottom: 1px solid rgba(0,0,0,0.1);
  
  a{
    height: 49px;
    width: 100%;

    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  img{
    display: block;
    margin: 0;
    height: 34px;
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
  min-height: 50px;
  transition: background-color ease .3s;

  &:hover{
    background-color: lighten($color-primary, 3%);

    .frame-float-menu{
      display: block !important;
    }
  }
  
  & > a{
    position: relative;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    color: #fff;
    font-size: 14px;

    i.iconfont{
      font-size: 16px;
    }

    i.icon-nav-down{
      margin-right: 15px;
      font-size: 12px;
    }
  }
}

.frame-menu-active > a:before{
  content: '';
  position: absolute;
  width: 3px;
  height: 30px;
  top: 10px;
  left: 0;
  background-color: #fff;
}

.frame-menu-expand .icon-nav-down{
  transform: rotateZ(180deg);
}

.frame-menu-icon{
  width: 50px;
  height: 50px;

  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
}

.frame-menu-name{
  flex: 1;
}

.frame-subMenu{
  background-color: #4AA09E;
  margin: 0;
  padding: 0;
}

.frame-subMenu-item{
  display: block;
  position: relative;
  width: 100%;
  transition: background-color ease .3s,
              color ease .3s;
  
  &:hover,
  &.frame-subMenu-active{
    background: mix(#fff, $color-primary, 89.88%);
    color: $color-primary !important;
  }
  
  & > a{
    width: 100%;
    display: block;
    padding: 10px 25px;
    line-height: 20px;
    color: inherit;
  }
}

.frame-float-menu{
  display: none;
  position: absolute;
  left: 50px;
  top: 0;
  overflow: hidden;
  width: 176px;
  background-color: #fff;
  box-shadow: 1px 1px 4px 0 rgba(0,0,0,.1);
}

.frame-float-menu-title h3{
  margin: 0;
  font-size: 16px;
  padding: 13px 25px;
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
