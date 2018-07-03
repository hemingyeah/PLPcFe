<template>
  <div>home
    <a href="javascript:;" @click="open">open</a>
  </div>
</template>

<script>
import platform from 'src/platform';

export default {
  name: 'home-view',
  methods: {
     login(){
      let url = '/dd/login?code=dev_code&corpId=dev_corpId';
      var xhr = new XMLHttpRequest();
      xhr.onload = function(){
        console.log('已登录')
      };
      xhr.onerror = function(e) {console.log(e)}
      xhr.open("post", url, true);
      xhr.send();
    },
    open(){
      platform.openTab({title:"home2",url:"/home2"})
    }
  },
  mounted(){
    //this.login();
  }
}
</script>
<style>
body{
  font-size: 15px;
}
</style>
