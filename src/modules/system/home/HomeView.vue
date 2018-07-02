<template>
  <div>home</div>
</template>

<script>
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
    }
  },
  mounted(){
    this.login();
  }
}
</script>
<style>
body{
  font-size: 15px;
}
</style>
