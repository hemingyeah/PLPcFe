<template>
  <div>
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
    
    <div style="height: 100vh;"><form-design v-model="fields"></form-design></div>

    <!-- <div>
      <textarea :value="JSON.stringify(fields)" style="width: 100%; height: 50px;"></textarea>
      <button @click="save">保存</button> <a href="javascript:;" @click="toCreateCustomer">新建</a>
    </div>  -->
    <!-- <button @click="contact">contatc</button>

    <div style="display:flex;">
      <form-builder :fields="buildFields" :value="form" @update="update" style="flex: 1;"></form-builder>
      <textarea style="width: 400px;" rows="5" :value="JSON.stringify(form)"></textarea>
    </div> -->
    
  </div>
</template>

<script>
import platform from "@src/platform";
import * as dom from "@src/util/dom";

import frameReload from "@src/mixin/frameReload";
import * as FormUtil from "@src/component/form/util";

export default {
  name: "demo-view",
  mixins: [frameReload],
  data() {
    return {
      fields: [
        {
          fieldName: "field_19627",
          formType: "text",
          displayName: "标题1",
          isNull: 1,
          isSearch: 0,
          placeHolder: null,
          defaultValue: null,
          options: [],
          isMulti: false
        },
        {
          fieldName: "field_37667",
          formType: "textarea",
          displayName: "标题2",
          isNull: 1,
          isSearch: 0,
          placeHolder: null,
          defaultValue: null,
          options: [],
          isMulti: false
        },
        {
          fieldName: "field_47762",
          formType: "number",
          displayName: "标题3",
          isNull: 1,
          isSearch: 0,
          placeHolder: null,
          defaultValue: null,
          options: [],
          isMulti: false
        },
        {
          fieldName: "field_51551",
          formType: "select",
          displayName: "标题4",
          isNull: 1,
          isSearch: 0,
          placeHolder: null,
          defaultValue: null,
          options: [{ value: "选项1", isDefault: false }],
          isMulti: false
        },
        {
          fieldName: "field_21116",
          formType: "code",
          displayName: "标题5",
          isNull: 1,
          isSearch: 0,
          placeHolder: null,
          defaultValue: null,
          options: [],
          isMulti: false
        },
        {
          fieldName: "field_13320",
          formType: "attachment",
          displayName: "标题6",
          isNull: 1,
          isSearch: 0,
          placeHolder: null,
          defaultValue: null,
          options: [],
          isMulti: false
        },
        {
          fieldName: "field_57518",
          formType: "date",
          displayName: "标题7",
          isNull: 1,
          isSearch: 0,
          placeHolder: null,
          defaultValue: null,
          options: [],
          isMulti: false
        },
        {
          fieldName: "field_85065",
          formType: "datetime",
          displayName: "标题8",
          isNull: 1,
          isSearch: 0,
          placeHolder: null,
          defaultValue: null,
          options: [],
          isMulti: false
        },
        {
          fieldName: "field_81707",
          formType: "phone",
          displayName: "标题9",
          isNull: 1,
          isSearch: 0,
          placeHolder: null,
          defaultValue: null,
          options: [],
          isMulti: false
        },
        {
          fieldName: "field_90171",
          formType: "user",
          displayName: "标题10",
          isNull: 1,
          isSearch: 0,
          placeHolder: null,
          defaultValue: null,
          options: [],
          isMulti: false
        },
        {
          fieldName: "field_87233",
          formType: "date",
          displayName: "标题11",
          isNull: 1,
          isSearch: 0,
          placeHolder: null,
          defaultValue: null,
          options: [],
          isMulti: false
        },
        {
          fieldName: "field_27377",
          formType: "phone",
          displayName: "标题12",
          isNull: 1,
          isSearch: 0,
          placeHolder: null,
          defaultValue: null,
          options: [],
          isMulti: false
        }
      ],
      files: [],
      form: {}
    };
  },
  computed: {
    buildFields() {
      return FormUtil.toField(this.fields);
    }
  },
  methods: {
    contact() {
      this.$fast.contact.choose("dept", {
        title: "请选择负责人",
        max: 10
      });
    },
    update({ field, newValue, oldValue }) {
      let { fieldName, displayName } = field;
      if (this.$appConfig.debug) {
        console.log(
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
    //
  },
  components: {}
};
</script>

<style>
body {
  font-size: 15px;
}
</style>
