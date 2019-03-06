<template>
  <div style="padding: 10px;">
    <!-- <button @click="Notification">show Notification</button> -->
    <!-- <tsx-comp/> -->
    <!-- <base-datatable-demo/> -->
    <biz-team-select-demo/>
  </div>
</template>

<script>
import platform from '@src/platform';
import * as dom from '@src/util/dom';

import BaseDatatableDemo from './components/BaseDatatableDemo.vue';
import BizTeamSelectDemo from './components/BizTeamSelectDemo.vue'

export default {
  name: 'demo-view',
  methods: {
    contact() {
      let options = {};
      let users = [
        {
          'head':'http://static.dingtalk.com/media/lADPACOG82jnjMnNASDNASA_288_288.jpg',
          'displayName':'董', 'userId':'cf12d356-4130-11e7-a318-00163e304a25',
          'staffId':'035206101333891'
        },
        {
          'head':'',
          'displayName':'黄',
          'userId':'bf25402f-93d9-11e7-9789-00163e304a25',
          'staffId':'086328395240644'
        },
        {
          'head':'http://static.dingtalk.com/media/lADOuEIYhc0C7s0C7A_748_750.jpg',
          'displayName':'李', 'userId':'bf659348-93d9-11e7-9789-00163e304a25',
          'staffId':'0633526626446'
        },
        {
          'head':'', 'displayName':'赵', 'userId':'bfa699c3-93d9-11e7-9789-00163e304a25', 'staffId':'071729261636213'
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

      this.$fast.contact.choose('dept', options).then(res => {
        // console.log(res)
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
        id: 'customer_create',
        title: '新建客户',
        url: '/customer/create',
        reload: true
      });
    },
    inserText() {
      let text = '(0_0)';
      let textarea = document.getElementById('textarea');
      let selectionStart = textarea.selectionStart;
      let selectionEnd = textarea.selectionEnd;
      let value = textarea.value;

      textarea.value = value.substring(0, selectionStart) + text + value.substring(selectionEnd);
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
      // console.log('$emit', files);
    },
    open() {
      platform.openTab({
        id: 'demo',
        title: 'demo',
        url: '/demo',
        reload: true
      });
    },
    open2() {
      platform.openTab({
        id: 'demo',
        title: 'demo',
        url: '/mine/cf12d356-4130-11e7-a318-00163e304a25',
        reload: true
      });
    },

    open3() {
      platform.openTab({ id: 'demo', title: 'demo', url: '/demo' });
    },
    upload(event) {
      const files = event.target.files;
      const file = files[0];

      let xhr = new XMLHttpRequest();
      let form = new FormData();
      form.append('upload', file);

      xhr.onerror = error => console.error(error);
      xhr.onload = function onload() {
        // console.log(xhr);
      };

      xhr.open('post', '/files/upload', true);
      xhr.send(form);
    },
    save() {
      this.fields.forEach(item => item.toField());
    },
    Notification(){
      platform.notification({
        title: '成功',
        //content: '<p>这是一条成功的提示消息</p><p>这是一条成功的提示消息</p><p>这是一条成功的提示消息</p><p>这是一条成功的提示消息</p>',
        message: (function name(h) {
          return <div>hello world</div>
        })(this.$createElement),
        type: 'success',
        duration: 0
      })
    }
  },
  components: {
    [BaseDatatableDemo.name]: BaseDatatableDemo,
    [BizTeamSelectDemo.name]: BizTeamSelectDemo
  }
};
</script>



