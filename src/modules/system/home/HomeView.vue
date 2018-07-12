<template>
  <div>home
    <a href="javascript:;" @click="login">登录</a>
    <br>
    <a href="/files/get?fileId=f2e38e1e-810a-11e8-8546-00163e304a25">下载</a>
    <br>
    <a href="javascript:;" @click="open">open</a>
    <br>
    <input type="file" @change="upload">
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
      platform.openTab({title:"demo",url:"/demo"})
    },
    upload(event){
      const files = event.target.files;
      const file = files[0];

      let xhr = new XMLHttpRequest();
      let form = new FormData();
      form.append('upload',file);

      xhr.onerror = error => console.log(error)
      xhr.onload = function onload() {
        console.log(xhr)
      };
      
      xhr.open("post", '/files/upload', true);
      xhr.send(form);
    }
  },
  mounted(){
    //todo
    this.login()
  }
}
</script>
<style>
body{
  font-size: 15px;
}
</style>
