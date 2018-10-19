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
    
    <div style="height: 720px; min-width:1000px">
      <form-design v-model="fields"></form-design>
      <button type="button" @click="saveToLocal">本地存储</button>
    </div>
    <!-- <textarea :value="JSON.stringify(buildFields)" style="width: 100%; height: 150px;"></textarea> -->
    <!-- <div>
      <textarea :value="JSON.stringify(fields)" style="width: 100%; height: 50px;"></textarea>
      <button @click="save">保存</button> <a href="javascript:;" @click="toCreateCustomer">新建</a>
    </div>  -->
    <!-- <button @click="contact">contatc</button> -->
    <!-- 

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

const FORM_DESIGN_FIELDS = 'demo_form_design_fields'

export default {
  name: "demo-view",
  mixins: [frameReload],
  data() {
    return {
      fields: [],
      fields2: [
        {
          fieldName: null,
          formType: "text",
          displayName: "单行文本",
          isNull: 1,
          isSearch: 0,
          placeHolder: null,
          defaultValue: null,
          options: [],
          isMulti: false,
          _id: "field_3584"
        },
        {
          fieldName: null,
          formType: "textarea",
          displayName: "多行文本",
          isNull: 1,
          isSearch: 0,
          placeHolder: null,
          defaultValue: null,
          options: [],
          isMulti: false,
          _id: "field_14261"
        },
        {
          fieldName: null,
          formType: "number",
          displayName: "数字",
          isNull: 1,
          isSearch: 0,
          placeHolder: null,
          defaultValue: null,
          options: [],
          isMulti: false,
          _id: "field_36397"
        },
        {
          fieldName: null,
          formType: "select",
          displayName: "下拉菜单",
          isNull: 1,
          isSearch: 0,
          placeHolder: null,
          defaultValue: null,
          options: [{ value: "选项1", isDefault: false }],
          isMulti: false,
          _id: "field_5672"
        },
        {
          fieldName: null,
          formType: "code",
          displayName: "扫码",
          isNull: 1,
          isSearch: 0,
          placeHolder: null,
          defaultValue: null,
          options: [],
          isMulti: false,
          _id: "field_40138"
        },
        {
          fieldName: null,
          formType: "attachment",
          displayName: "附件",
          isNull: 1,
          isSearch: 0,
          placeHolder: null,
          defaultValue: null,
          options: [],
          isMulti: false,
          _id: "field_40127"
        },
        {
          fieldName: null,
          formType: "user",
          displayName: "人员",
          isNull: 1,
          isSearch: 0,
          placeHolder: null,
          defaultValue: null,
          options: [],
          isMulti: false,
          _id: "field_41998"
        },
        {
          fieldName: null,
          formType: "date",
          displayName: "日期",
          isNull: 1,
          isSearch: 0,
          placeHolder: null,
          defaultValue: null,
          options: [],
          isMulti: false,
          _id: "field_66988"
        },
        {
          fieldName: null,
          formType: "datetime",
          displayName: "日期时间",
          isNull: 1,
          isSearch: 0,
          placeHolder: null,
          defaultValue: null,
          options: [],
          isMulti: false,
          _id: "field_15176"
        },
        {
          fieldName: null,
          formType: "phone",
          displayName: "电话",
          isNull: 1,
          isSearch: 0,
          placeHolder: null,
          defaultValue: null,
          options: [],
          isMulti: false,
          _id: "field_10333"
        },
        {
          fieldName: null,
          formType: "text",
          displayName: "单行文本",
          isNull: 1,
          isSearch: 0,
          placeHolder: null,
          defaultValue: null,
          options: [],
          isMulti: false,
          _id: "field_62023"
        },
        {
          fieldName: null,
          formType: "textarea",
          displayName: "多行文本",
          isNull: 1,
          isSearch: 0,
          placeHolder: null,
          defaultValue: null,
          options: [],
          isMulti: false,
          _id: "field_84756"
        },
        {
          fieldName: null,
          formType: "number",
          displayName: "数字",
          isNull: 1,
          isSearch: 0,
          placeHolder: null,
          defaultValue: null,
          options: [],
          isMulti: false,
          _id: "field_19152"
        },
        {
          fieldName: null,
          formType: "select",
          displayName: "下拉菜单",
          isNull: 1,
          isSearch: 0,
          placeHolder: null,
          defaultValue: null,
          options: [{ value: "选项1", isDefault: false }],
          isMulti: false,
          _id: "field_28524"
        },
        {
          fieldName: null,
          formType: "code",
          displayName: "扫码",
          isNull: 1,
          isSearch: 0,
          placeHolder: null,
          defaultValue: null,
          options: [],
          isMulti: false,
          _id: "field_39805"
        },
        {
          fieldName: null,
          formType: "attachment",
          displayName: "附件",
          isNull: 1,
          isSearch: 0,
          placeHolder: null,
          defaultValue: null,
          options: [],
          isMulti: false,
          _id: "field_68372"
        },
        {
          fieldName: null,
          formType: "user",
          displayName: "人员",
          isNull: 1,
          isSearch: 0,
          placeHolder: null,
          defaultValue: null,
          options: [],
          isMulti: false,
          _id: "field_51088"
        },
        {
          fieldName: null,
          formType: "datetime",
          displayName: "日期时间",
          isNull: 1,
          isSearch: 0,
          placeHolder: null,
          defaultValue: null,
          options: [],
          isMulti: false,
          _id: "field_27273"
        },
        {
          fieldName: null,
          formType: "phone",
          displayName: "电话",
          isNull: 1,
          isSearch: 0,
          placeHolder: null,
          defaultValue: null,
          options: [],
          isMulti: false,
          _id: "field_6164"
        }
      ],
      fieldInfo: [],
      fieldInfo2: [
        {
          "fieldId": "30153",
          "tableName": "customer",
          "isSystem": 0,
          "fieldName": "field_gF2uHmI4",
          "displayName": "单选",
          "formType": "select",
          "defaultValue": null,
          "maxLength": 0,
          "dotLength": 0,
          "isNull": 1,
          "isValidate": 0,
          "enabled": false,
          "isSearch": 1,
          "isAdd": 1,
          "isReadonly": 0,
          "placeHolder": "",
          "setting": {
            "dataSource": [
              "单选1",
              "单选2",
              "单选3"
            ]
          },
          "orderId": 0,
          "tableChsName": ""
        },
        {
          "fieldId": "30155",
          "tableName": "customer",
          "isSystem": 0,
          "fieldName": "field_HEVZRFgZ",
          "displayName": "单行",
          "formType": "text",
          "defaultValue": null,
          "maxLength": 0,
          "dotLength": 0,
          "isNull": 1,
          "isValidate": 0,
          "enabled": false,
          "isSearch": 1,
          "isAdd": 1,
          "isReadonly": 0,
          "placeHolder": "",
          "setting": {},
          "orderId": 1,
          "tableChsName": ""
        },
        {
          "fieldId": "30150",
          "tableName": "customer",
          "isSystem": 0,
          "fieldName": "field_6gOv2Tq7",
          "displayName": "多选",
          "formType": "selectMulti",
          "defaultValue": null,
          "maxLength": 0,
          "dotLength": 0,
          "isNull": 1,
          "isValidate": 0,
          "enabled": false,
          "isSearch": 1,
          "isAdd": 1,
          "isReadonly": 0,
          "placeHolder": "",
          "setting": {
            "dataSource": [
              "选项1",
              "选项2",
              "选项3"
            ]
          },
          "orderId": 2,
          "tableChsName": ""
        },
        {
          "fieldId": "30157",
          "tableName": "customer",
          "isSystem": 0,
          "fieldName": "field_2wz34vyH",
          "displayName": "数字",
          "formType": "number",
          "defaultValue": null,
          "maxLength": 0,
          "dotLength": 0,
          "isNull": 1,
          "isValidate": 0,
          "enabled": false,
          "isSearch": 1,
          "isAdd": 1,
          "isReadonly": 0,
          "placeHolder": "",
          "setting": {},
          "orderId": 3,
          "tableChsName": ""
        },
        {
          "fieldId": "30158",
          "tableName": "customer",
          "isSystem": 0,
          "fieldName": "field_B5e86l1f",
          "displayName": "日期时间",
          "formType": "datetime",
          "defaultValue": null,
          "maxLength": 0,
          "dotLength": 0,
          "isNull": 1,
          "isValidate": 0,
          "enabled": false,
          "isSearch": 1,
          "isAdd": 1,
          "isReadonly": 0,
          "placeHolder": "",
          "setting": {},
          "orderId": 4,
          "tableChsName": ""
        },
        {
          "fieldId": "30156",
          "tableName": "customer",
          "isSystem": 0,
          "fieldName": "field_nvl96FTd",
          "displayName": "多行",
          "formType": "textarea",
          "defaultValue": null,
          "maxLength": 0,
          "dotLength": 0,
          "isNull": 1,
          "isValidate": 0,
          "enabled": false,
          "isSearch": 0,
          "isAdd": 1,
          "isReadonly": 0,
          "placeHolder": "",
          "setting": {},
          "orderId": 5,
          "tableChsName": ""
        },
        {
          "fieldId": "30159",
          "tableName": "customer",
          "isSystem": 0,
          "fieldName": "field_wDGwyh9E",
          "displayName": "日期",
          "formType": "date",
          "defaultValue": null,
          "maxLength": 0,
          "dotLength": 0,
          "isNull": 1,
          "isValidate": 0,
          "enabled": false,
          "isSearch": 1,
          "isAdd": 1,
          "isReadonly": 0,
          "placeHolder": "",
          "setting": {},
          "orderId": 6,
          "tableChsName": ""
        },
        {
          "fieldId": "30160",
          "tableName": "customer",
          "isSystem": 0,
          "fieldName": "field_tdaMB58A",
          "displayName": "人员",
          "formType": "user",
          "defaultValue": null,
          "maxLength": 0,
          "dotLength": 0,
          "isNull": 1,
          "isValidate": 0,
          "enabled": false,
          "isSearch": 1,
          "isAdd": 1,
          "isReadonly": 0,
          "placeHolder": "",
          "setting": {},
          "orderId": 7,
          "tableChsName": ""
        },
        {
          "fieldId": "30161",
          "tableName": "customer",
          "isSystem": 0,
          "fieldName": "field_XzsqzdRe",
          "displayName": "附件",
          "formType": "attachment",
          "defaultValue": null,
          "maxLength": 0,
          "dotLength": 0,
          "isNull": 1,
          "isValidate": 0,
          "enabled": false,
          "isSearch": 0,
          "isAdd": 1,
          "isReadonly": 0,
          "placeHolder": "",
          "setting": {},
          "orderId": 8,
          "tableChsName": ""
        },
        {
          "fieldId": "30162",
          "tableName": "customer",
          "isSystem": 0,
          "fieldName": "field_Cp82p2KQ",
          "displayName": "扫码",
          "formType": "code",
          "defaultValue": null,
          "maxLength": 0,
          "dotLength": 0,
          "isNull": 1,
          "isValidate": 0,
          "enabled": false,
          "isSearch": 0,
          "isAdd": 1,
          "isReadonly": 0,
          "placeHolder": "",
          "setting": {},
          "orderId": 9,
          "tableChsName": ""
        },
        {
          "fieldId": "30166",
          "tableName": "customer",
          "isSystem": 0,
          "fieldName": "field_SwN9sJ9b",
          "displayName": "测试1",
          "formType": "text",
          "defaultValue": null,
          "maxLength": 0,
          "dotLength": 0,
          "isNull": 1,
          "isValidate": 0,
          "enabled": false,
          "isSearch": 0,
          "isAdd": 1,
          "isReadonly": 0,
          "placeHolder": "",
          "setting": {},
          "orderId": 10,
          "tableChsName": ""
        },
        {
          "fieldId": "30167",
          "tableName": "customer",
          "isSystem": 0,
          "fieldName": "field_hXZ0m4dz",
          "displayName": "测试1",
          "formType": "text",
          "defaultValue": null,
          "maxLength": 0,
          "dotLength": 0,
          "isNull": 1,
          "isValidate": 0,
          "enabled": false,
          "isSearch": 0,
          "isAdd": 1,
          "isReadonly": 0,
          "placeHolder": "",
          "setting": {},
          "orderId": 11,
          "tableChsName": ""
        },
        {
          "fieldId": "30168",
          "tableName": "customer",
          "isSystem": 0,
          "fieldName": "field_PQiBLIoj",
          "displayName": "测试1",
          "formType": "text",
          "defaultValue": null,
          "maxLength": 0,
          "dotLength": 0,
          "isNull": 1,
          "isValidate": 0,
          "enabled": false,
          "isSearch": 0,
          "isAdd": 1,
          "isReadonly": 0,
          "placeHolder": "",
          "setting": {},
          "orderId": 12,
          "tableChsName": ""
        },
        {
          "fieldId": "30169",
          "tableName": "customer",
          "isSystem": 0,
          "fieldName": "field_VwoVdMkB",
          "displayName": "测试1",
          "formType": "text",
          "defaultValue": null,
          "maxLength": 0,
          "dotLength": 0,
          "isNull": 1,
          "isValidate": 0,
          "enabled": false,
          "isSearch": 0,
          "isAdd": 1,
          "isReadonly": 0,
          "placeHolder": "cao",
          "setting": {},
          "orderId": 13,
          "tableChsName": ""
        }
      ],
      files: [],
      form: {}
    };
  },
  computed: {
    // buildFields() {
    //   return FormUtil.toField(this.fields);
    // }
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
      options.max = 10;
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
    //this.fields = FormUtil.toFormField(this.fieldInfo);

    let fieldsJson = localStorage.getItem(FORM_DESIGN_FIELDS);
    let fields = [];
    try {
      fields = JSON.parse(fieldsJson);
    } catch (error) {
      console.error(error)
    }
    
    this.fields = FormUtil.toFormField(fields || [])
  },
  components: {}
};
</script>

