<template>
  <nav class="frame-nav" :class="{'frame-nav-collapse': collapse}">
    <div>logo</div>
    <div class="app-menu">
      <ul class="frame-nav-menu">
        <li v-for="menu in menus" :key="menu.menuKey" class="frame-nav-menu-item" :class="{'frame-nav-menu-expand': menu.expand}">
          <a :href="menu.url ? menu.url : 'javascript:;'" @click.prevent="open(menu)" title="hello tooltip" v-tooltip data-placement="right">
            <i class="iconfont icon-gongdanbiaodanshezhi"></i>
            <span>{{menu.name}}</span>
          </a>
          <template v-if="menu.children && menu.children.length > 0">
            <ul class="frame-nav-menu">
              <li v-for="children in menu.children" :key="children.menuKey">
                <a :href="children.url ? children.url : 'javascript:;'" @click.prevent="open(children)">
                  <i class="iconfont icon-gongdanbiaodanshezhi"></i>
                  <span>{{children.name}}</span>
                </a>
              </li>
            </ul>
          </template>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script>
import _ from 'lodash';

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
    let menus = this.buildMenus(_.cloneDeep(this.source));

    return {
      menus: menus
    };
  },
  methods: {
    buildMenus(menus){
      return menus.map(item => {
        let menu = {};

        menu.name = item.name;
        menu.url = item.url;
        menu.key = item.menuKey;
        menu.parent = item.parent;
        menu.children = this.buildMenus(item.subMenu || []);

        if(menu.children.length > 0){
          menu.isDirectory = true;
          menu.expand = false;
        }

        return menu;
      })
    },
    open(menu){
      if(menu.isDirectory) {
        menu.expand = !menu.expand;
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
    //
  },
  components: {

  }
}
</script>

<style lang="scss">
.frame-nav{
  width: 200px;
  border-right: 1px solid #ddd;
  transition: width ease .15s;
  overflow: auto;


}

.frame-nav.frame-nav-collapse{
  width: 150px;
}

.frame-nav-menu{
  list-style: none;
  padding: 0;
  margin: 0;
}
.frame-nav-menu .frame-nav-menu{
  padding-left: 15px;
}

.frame-nav-menu-item > .frame-nav-menu{
  display: none;
}

.frame-nav-menu-item.frame-nav-menu-expand > .frame-nav-menu{
  display: block;
}



</style>
