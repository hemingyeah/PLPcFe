<template>
  <nav class="frame-nav" :class="{'frame-nav-collapse': collapse}">
    <div>logo</div>
    <div class="app-menu" @click.prevent="open">
      <ul>
        <li v-for="menu in menus" :key="menu.menuKey">
          <a :href="menu.url">{{menu.name}}</a>
          <template v-if="menu.subMenu.length > 0">
            <ul>
              <li v-for="sub in menu.subMenu" :key="sub.menuKey">
                <a :href="sub.url">{{sub.name}}</a>
              </li>
            </ul>
          </template>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'frame-nav',
  props: {
    collapse: {
      type: Boolean,
      default: false
    },
    menus: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    open(event){
      let a = event.target.closest('.app-menu a')
      if(a == null) return;
      
      this.$emit('open', {
        url: a.getAttribute('href'),
        title: a.textContent
      })
    }
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
  width: 50px;
}

.app-menu{
 
}
</style>
