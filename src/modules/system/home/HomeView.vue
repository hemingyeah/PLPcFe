<template>
  <div>home
    <a href="/files/get?fileId=f2e38e1e-810a-11e8-8546-00163e304a25">下载</a>
    <br>
    <a href="javascript:;" @click="open">open</a>
    <br>

    <file-upload v-on:update-files="updateFiles"></file-upload>
  </div>
</template>

<script>
import platform from 'src/platform';
import FileUpload from '../../../component/BaseFileUpload';

export default {
  name: 'home-view',
  data: () => {
    return {
      files: [],
    }
  },
  methods: {
    updateFiles(files) {
      this.files = files;
      console.log('$emit', files);
    },
    open(){
      platform.openTab({title:"demo",url:"/demo"});
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
    //
  },
  components: {
    [FileUpload.name]: FileUpload,
  }
}
</script>
<style>
body{
  font-size: 15px;
}
</style>
