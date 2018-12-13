<template>
  <div>
    <base-datatable-demo/>
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
    
    <!-- <div style="height: 720px; min-width:1000px">
      <form-design v-model="fields"></form-design>
    </div> -->
    <!-- <textarea :value="JSON.stringify(buildFields)" style="width: 100%; height: 150px;"></textarea> -->
    <!-- <div>
      <textarea :value="JSON.stringify(fields)" style="width: 100%; height: 50px;"></textarea>
      <button @click="save">保存</button> <a href="javascript:;" @click="toCreateCustomer">新建</a>
    </div>  -->
    <!-- <button type="button" @click="saveToLocal">本地存储</button>-->
    <!-- 
    <div style="display:flex;">
      <form-builder :fields="buildFields" :value="form" @update="update" style="flex: 1;"></form-builder>
      <textarea style="width: 400px;" rows="5" :value="JSON.stringify(form)"></textarea>
    </div> -->
    <!-- <button @click="contact">contatc</button> -->
  </div>
</template>

<script>
import platform from "@src/platform";
import * as dom from "@src/util/dom";
import * as FormUtil from "@src/component/form/util";

import BaseDatatableDemo from './components/BaseDatatableDemo.vue';

const FORM_DESIGN_FIELDS = 'demo_form_design_fields'

export default {
  name: "demo-view",
  data() {
    return {
      fields: [],
      files: [],
      form: {}
    };
  },
  computed: {
    
  },
  methods: {
    saveToLocal(){
      let fields = FormUtil.toField(this.fields);
      localStorage.setItem(FORM_DESIGN_FIELDS, JSON.stringify(fields))
    },
    contact() {
      var options = {};
      var users = [
        {
          "head":"http://static.dingtalk.com/media/lADPACOG82jnjMnNASDNASA_288_288.jpg",
          "displayName":"董","userId":"cf12d356-4130-11e7-a318-00163e304a25",
          "staffId":"035206101333891"
        },
        {
          "head":"",
          "displayName":"黄",
          "userId":"bf25402f-93d9-11e7-9789-00163e304a25",
          "staffId":"086328395240644"
        },
        {
          "head":"http://static.dingtalk.com/media/lADOuEIYhc0C7s0C7A_748_750.jpg",
          "displayName":"李","userId":"bf659348-93d9-11e7-9789-00163e304a25",
          "staffId":"0633526626446"
        },
        {
          "head":"","displayName":"赵","userId":"bfa699c3-93d9-11e7-9789-00163e304a25","staffId":"071729261636213"
        }
      ]
      
      options.selected = users;
      options.max = 0;
      options.title = '请选择负责人';
      options.showDeptCheckbox = true;
      // options.showTaskCount = true;
      // options.showUserState = true;
      // options.allotMap = true;
      // options.lat = '27.127668'
      // options.lng = '113.961467'

      this.$fast.contact.choose("dept", options).then(res => {
        console.log(res)
      })
    },
    update({ field, newValue, oldValue }) {
      let { fieldName, displayName } = field;
      if (this.$appConfig.debug) {
        console.info(
          `[FormBuilder] => ${displayName}(${fieldName}) : ${JSON.stringify(
            newValue
          )}`
        );
      }

      this.$set(this.form, fieldName, newValue);
    },
    toCreateCustomer() {
      platform.openTab({
        id: "customer_create",
        title: "新建客户",
        url: "/customer/create",
        reload: true
      });
    },
    inserText() {
      var text = "(0_0)";
      var textarea = document.getElementById("textarea");
      var selectionStart = textarea.selectionStart;
      var selectionEnd = textarea.selectionEnd;
      var value = textarea.value;

      textarea.value =
        value.substring(0, selectionStart) +
        text +
        value.substring(selectionEnd);
      textarea.setSelectionRange(
        selectionEnd + text.length,
        selectionEnd + text.length
      );
      textarea.focus();
    },
    fullScreen(event) {
      dom.fullScreen(document.body);
    },
    updateFiles(files) {
      this.files = files;
      console.log("$emit", files);
    },
    open() {
      platform.openTab({
        id: "demo",
        title: "demo",
        url: "/demo",
        reload: true
      });
    },
    open2() {
      platform.openTab({
        id: "demo",
        title: "demo",
        url: "/mine/cf12d356-4130-11e7-a318-00163e304a25",
        reload: true
      });
    },

    open3() {
      platform.openTab({ id: "demo", title: "demo", url: "/demo" });
    },
    upload(event) {
      const files = event.target.files;
      const file = files[0];

      let xhr = new XMLHttpRequest();
      let form = new FormData();
      form.append("upload", file);

      xhr.onerror = error => console.log(error);
      xhr.onload = function onload() {
        console.log(xhr);
      };

      xhr.open("post", "/files/upload", true);
      xhr.send(form);
    },
    save() {
      this.fields.forEach(item => item.toField());
    }
  },
  mounted() {
    let fieldsJson = localStorage.getItem(FORM_DESIGN_FIELDS);
    let fields = [];
    
    try {
      fields = JSON.parse(fieldsJson);
    } catch (error) {
      console.error(error)
    }
    
    this.fields = FormUtil.toFormField(fields || [])
  },
  components: {
    [BaseDatatableDemo.name]: BaseDatatableDemo
  }
};
</script>

