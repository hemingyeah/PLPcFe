<template>
  <div style="height: 1000px">
    <!--   
    
    <a href="javascript:;" @click="open">open</a>
    <a href="javascript:;" @click="open2">open2</a>
    <a href="javascript:;" @click="open3">open3</a>
    <br>
    <a href="http://www.baidu.com">jump</a>
    <a href="javascript:;" @click="fullScreen">全屏</a>

    <base-file-upload @:update-files="updateFiles"></base-file-upload>

    <button type="button" @click="inserText">替换</button>
    <textarea id="textarea" style="width: 320px; height: 180px;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut facilisis, arcu vitae adipiscing placerat, nisl lectus accumsan nisi, vitae iaculis sem neque vel lectus. Praesent tristique commodo lorem quis fringilla. Sed ac tellus eros. Sed consectetur eleifend felis vitae luctus. Praesent sagittis, est eget bibendum tincidunt, ligula diam tincidunt augue, a fermentum odio velit eget mi. Phasellus mattis, elit id fringilla semper, orci magna cursus ligula, non venenatis lacus augue sit amet dui. Pellentesque lacinia odio id nisi pulvinar commodo tempus at odio. Ut consectetur eros porttitor nunc mollis ultrices. Aenean porttitor, purus sollicitudin viverra auctor, neque erat blandit sapien, sit amet tincidunt massa mi ac nibh. Proin nibh sem, bibendum ut placerat nec, cursus et lacus. Phasellus vel augue turpis. Nunc eu mauris eu leo blandit mollis interdum eget lorem. </textarea>
  -->
    <div>{{fields}}</div>
    <button @click="save">保存</button>
    <div style="height: 600px"><form-design v-model="fields"></form-design></div>
    
  </div>
</template>

<script>
import platform from '@src/platform';
import * as dom from '@src/util/dom';

export default {
  name: 'home-view',
  data(){
    return {
      fields: [],
      files: [],
      tableData: [{
        date: '2016-05-02',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '2016-05-04',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1517 弄'
      }, {
        date: '2016-05-01',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1519 弄'
      }, {
        date: '2016-05-03',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1516 弄'
      }]
    }
  },
  methods: {
    inserText(){
      var text = '(0_0)'
      var textarea = document.getElementById("textarea")
      var selectionStart = textarea.selectionStart;
      var selectionEnd = textarea.selectionEnd;
      var value = textarea.value;

      textarea.value = value.substring(0, selectionStart) + text + value.substring(selectionEnd)
      textarea.setSelectionRange(selectionEnd + text.length, selectionEnd + text.length);
      textarea.focus();
    },
    fullScreen(event){
      dom.fullScreen(document.body)
    },
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
    },
    save(){
      this.fields.forEach(item =>item.toField())
    }
  },
  mounted(){
    //
  },
  components: {
  }
}
</script>

<style>
body{
  font-size: 15px;
}
</style>
