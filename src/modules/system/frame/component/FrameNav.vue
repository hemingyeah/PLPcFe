<template>
  <nav class="frame-nav" :class="{'frame-nav-collapse': collapse}">
    <div class="frame-bar">
      <div class="logo">
        <img src="../../../../assets/svg/logo.svg">
      </div>
      
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

    <div class="frame-second-menu-wrap" v-if="!collapse && currMenu">
      <h3 class="frame-second-menu-title">{{currMenu.name}}</h3>
      <ul class="frame-second-menu">
        <li v-for="menu in currMenu.children" :key="menu.menuKey">
          <a :href="menu.url ? menu.url : 'javascript:;'" @click.prevent="open(menu)">
            <span>{{menu.name}}</span>
          </a>
        </li>
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

      if(!menu.url) return

      this.$emit('open', {
        url: menu.url,
        title: menu.name
      })
    }
  },
  mounted(){
    this.menus.forEach(item => console.log(item.menuKey))
  },
  components: {

  }
}
</script>

<style lang="scss">
.frame-nav{
  position: relative;
  padding-left: 52px;

  box-shadow: 0 0 12px rgba(0,0,0,.125);
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
  width: 52px;
  height: 52px;
  padding: 8px;

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
    color: #fff;
    background-color: #037a6d;
  }

  & > a{
    display: block;
    width: 100%;
    height: 100%;
    line-height: 52px;
    text-decoration: none;
    cursor: pointer;
    text-align: center;
    background-color: #00ac97;

    color: #e5e5e5;
  }
}

.frame-float-menu-wrap{
  display: none;
  position: absolute;
  left: 52px;
  top: 0;
  width: 200px;
  color: #333;
  background-color: #f0f0f0;
  border-radius: 0 4px 4px 0;
  z-index: 99;
  overflow: hidden;

  a{
    color: #444;
  }
}

.frame-float-menu-title{
  font-size: 16px;
  height: 52px;
  color: #fff;
  padding-left: 8px;
  background-color: #037a6d;
}

.frame-float-menu{
  padding: 0;
  margin: 0;
  list-style: none;

  li{

  }

  a{
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
  height: 52px;
  margin: 0;
  padding: 0 10px;
  line-height:  52px;
}

.frame-second-menu{
  margin: 0;
  padding: 0;
  list-style: none;

  a{
    padding: 10px;
  }
}

.frame-nav.frame-nav-collapse{
  .frame-second-menu{
    width: 0;
  }
}
</style>
