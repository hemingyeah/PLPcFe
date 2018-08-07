<template>
  <nav class="frame-nav" :class="{'frame-nav-collapse': collapse}">
    <div class="frame-bar">
      <a class="logo" href="/">
        <img src="../../../../assets/svg/logo.svg">
      </a>
      
      <div class="frame-bar-menu" v-for="menu in menus" :key="menu.url">
        <a :href="menu.url ? menu.url : 'javascript:;'" @click.prevent="open(menu)"> 
          <i :class="['iconfont', menuIcon[menu.menuKey]]"></i>
        </a>
        <div class="frame-float-menu-wrap" v-if="collapse">
          <div class="frame-float-menu">
            <div class="frame-float-menu-title">
              <template v-if="menu.children.length > 0">{{menu.name}}</template>
              <template v-else>
                <a :href="menu.url ? menu.url : 'javascript:;'" @click.prevent="open(menu)">{{menu.name}}</a>
              </template>
            </div>
            <ul class="frame-float-menu-item">
              <li v-for="menu in menu.children" :key="menu.menuKey">
                <a :href="menu.url ? menu.url : 'javascript:;'" @click.prevent="open(menu)">{{menu.name}}</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <transition name="collapse">
      <div class="frame-second-menu-wrap" v-if="!collapse && currMenu">
        <h3 class="frame-second-menu-title">{{currMenu.name}}</h3>
        <ul class="frame-second-menu">
          <li v-for="menu in currMenu.children" :key="menu.menuKey" :class="{'frame-second-menu-active': menu.url == currUrl}">
            <a :href="menu.url ? menu.url : 'javascript:;'" @click.prevent="open(menu)">{{menu.name}}</a>
          </li>
        </ul>
      </div>
    </transition>
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
    let {subMenus} = this.buildMenus(_.cloneDeep(this.source), null);

    return {
      menus: subMenus,
      menuIcon: MenuIcon,
      currMenu: subMenus[0]
    };
  },
  methods: {
    buildMenus(menus, parent){
      let subMenus = [];
      let otherMenus = [];

      for(let i = 0; i < menus.length; i++){
        let menu = menus[i]
        if(menu.parent == parent){
          subMenus.push(menu);
        }else{
          otherMenus.push(menu)
        }
      }

      if(subMenus.length > 0){
        for(let j = 0; j < subMenus.length; j++){
          let subMenu = subMenus[j];
          let subRes = this.buildMenus(otherMenus, subMenu.menuKey);

          subMenu.children = subRes.subMenus;
          otherMenus = subRes.otherMenus;
        }
      }


      return {subMenus, otherMenus};
    },
    open(menu){
      if(null == menu.parent && menu.children.length == 0){
        this.$emit('update:collapse', true);
      }

      if(menu.children && menu.children.length > 0) {
        this.currMenu = menu;
        return
      }

      if(!menu.url) return;

      this.$emit('open', menu)
    }
  }
}
</script>

<style lang="scss">
.frame-nav{
  position: relative;
  padding-left: 52px;

  border-right: 1px solid #f4f7f5;
}

.frame-bar{
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 52px;
  background-color: $color-primary;
}

.logo{
  display: block;
  width: 52px;
  height: 52px;
  padding: 12px;

  img{
    display: block;
    margin: 0;
    width: 100%;
    height: 100%;
  }
}

.frame-bar-menu{
  width: 52px;
  height: 52px;
  position: relative;
  z-index: 10;

  &:hover > a{
    background-color: lighten($color-primary, 3%);
    color: #fff;
  }

  & > a{
    display: block;
    width: 100%;
    height: 100%;
    color: #ededed;
    line-height: 52px;
    text-decoration: none;
    cursor: pointer;
    text-align: center;
    background-color: $color-primary;
  }
}

.frame-float-menu-wrap{
  display: none;
  position: absolute;
  left: 52px;
  top: 0;
}

.frame-float-menu{
  overflow: hidden;
  width: 174px;
  background-color: #fcfcfc;
  box-shadow: 2px 1px 2px rgba(0,0,0, .15)
}

.frame-float-menu-title{
  font-size: 16px;
  height: 52px;
  line-height: 52px;
  color: #fff;
  padding-left: 15px;
  background-color: lighten($color-primary, 3%);

  a{
    color: #fff;
    text-decoration: none;
    width: 100%;
    display: block;
  }
}

.frame-float-menu-item{
  padding: 0;
  margin: 0;
  list-style: none;

  li{
    width: 100%;
  }

  a{
    width: 100%;
    display: block;
    padding: 10px 15px;
    color: $text-color-primary;
    text-decoration: none;

    &:hover{
      color: $color-primary;
    }
  }
}

.frame-bar-menu:hover{
  .frame-float-menu-wrap{
    display: block;
  }
}

.frame-second-menu-wrap{
  width: 180px;
  overflow: hidden;
}

.frame-second-menu-title{
  width: 180px;
  height: 52px;
  margin: 0;
  padding: 0 10px;
  line-height:  52px;
  color: $color-primary;
  font-size: 14px;
  white-space: nowrap;  
  text-align: center;
  border-bottom: 1px solid #f4f7f5;
}

.frame-second-menu{
  margin: 0;
  padding: 0;
  list-style: none;
  width: 180px;
  display: block;

  li{
    width: 100%;
    display: block;
    transition: background-color ease .3s;
    
    &:hover{
      background-color: $color-primay-hover;
    }
  }

  a{
    display: block;
    width: 100%;
    height: 52px;
    line-height: 52px;
    text-align: center;
    white-space: nowrap;
    padding: 0 10px;
    font-size: 14px;
    color: $text-color-primary;
    text-decoration: none;
  }
}

.frame-second-menu-active{
  background-color: $color-primay-hover;
}
</style>
