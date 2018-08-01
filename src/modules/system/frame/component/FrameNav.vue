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
        <div class="frame-float-menu-wrap" v-if="collapse && menu.children.length > 0">
          <div class="frame-float-menu-title">{{menu.name}}</div>
          <ul class="frame-float-menu">
            <li v-for="menu in menu.children" :key="menu.menuKey">
              <a :href="menu.url ? menu.url : 'javascript:;'" @click.prevent="open(menu)">{{menu.name}}</a>
            </li>
          </ul>
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
      if(menu.children && menu.children.length > 0) {
        this.currMenu = menu;
        return
      }

      if(!menu.url) return;

      this.$emit('open', menu)
    }
  },
  mounted(){
    
  },
  components: {

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
  background-color: #00ac97;
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

  &:hover > a{
    background-color: #037a6d;
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
    background-color: #00ac97;
  }
}

.frame-float-menu-wrap{
  display: none;
  position: absolute;
  left: 52px;
  top: 0;
  width: 200px;
  color: #333;
  background-color: #f4f7f5;
  border-radius: 0 4px 4px 0;
  z-index: 99;
  overflow: hidden;

  a{
    padding: 8px 8px;
    color: #314659;
    text-decoration: none;

    &:hover{
      color: #00ac97;
    }
  }
}

.frame-float-menu-title{
  font-size: 16px;
  height: 52px;
  line-height: 52px;
  color: #fff;
  padding-left: 8px;
  background-color: #037a6d;
}

.frame-float-menu{
  padding: 0;
  margin: 0;
  list-style: none;

  li{
    width: 100%;
  }

  a{
    width: 100%;
    display: block;
    padding: 5px 8px;
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
  width: 100%;
  height: 52px;
  margin: 0;
  padding: 0 10px;
  line-height:  52px;
  color: #00ac97;
  font-size: 14px;
  white-space: nowrap;  
  text-align: center;
  border-bottom: 1px solid #fafafa;
}

.frame-second-menu{
  margin: 0;
  padding: 0;
  list-style: none;
  width: 100%;
  display: block;

  li{
    width: 100%;
    display: block;
    transition: background-color ease .3s;
    
    &:hover{
      background-color: rgba(0,172,151, .1)
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
    color: #333;
    text-decoration: none;
  }
}

.frame-second-menu-active{
  background-color: rgba(0,172,151, .1)
}

.frame-nav.frame-nav-collapse{
  .frame-second-menu{
    width: 0;
  }
}
</style>
