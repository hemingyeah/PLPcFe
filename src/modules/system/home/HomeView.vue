<template>
  <div style="height: 1000px">
    home
    <br>
    <a href="javascript:;" @click="open">open</a>
    <a href="javascript:;" @click="open2">open2</a>
    <a href="javascript:;" @click="open3">open3</a>
    <br>
    <a href="http://www.baidu.com">jump</a>

    <base-file-upload @:update-files="updateFiles"></base-file-upload>
  </div>
</template>

<script>
import platform from 'src/platform';
import FileUpload from '../../../component/BaseFileUpload';
import BaseFileUpload from "../../../component/BaseFileUpload/BaseFileUpload";

import frameReload from 'src/mixin/frameReload'

export default {
  name: 'home-view',
  mixins: [frameReload],
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
      platform.openTab({id:'demo', title:"demo",url:"/demo", reload: true});
    },
    open2(){
      platform.openTab({id:'demo', title:"demo",url:"/mine/cf12d356-4130-11e7-a318-00163e304a25", reload: true});
    },
    
    open3(){
      platform.openTab({id:'demo', title:"demo",url:"/demo"});
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
    BaseFileUpload,
    [FileUpload.name]: FileUpload,
  }
}
</script>
<style>
body{
  font-size: 15px;
}
</style>
