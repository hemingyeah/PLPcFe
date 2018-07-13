<template>
  <nav class="frame-nav" :class="{'frame-nav-collapse': collapse}">
    <div>logo</div>
    <div class="app-menu" @click.prevent="open">
      <ul>
        <li><a href="/home"><span>home</span></a></li>
        <li><a href="/demo">demo</a></li>
        <li>
          <a href="/setting">setting</a>
          <ul>
            <li><a href="/demo">demo</a></li>
          </ul>
        </li>
        <li> <a href="/demo2">demo2</a></li>
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
}

.frame-nav.frame-nav-collapse{
  width: 50px;
}
</style>
