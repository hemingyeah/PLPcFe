<template>
  <div style="padding: 10px;">
    <!-- <button @click="Notification">show Notification</button> -->
    <!-- <tsx-comp/> -->
    <!-- <base-datatable-demo/> -->
    <!-- <biz-team-select-demo/> -->
    <img @click="contact" :src="imgUrl" >
    <base-cascader :options="options" v-model="typeValue">
    </base-cascader>
    {{typeValue}}

    <base-editor v-model="article" ref="editor" :isEdit="false"></base-editor>


    <base-cascader :options="options" v-model="typeValue" clearable filterable check-strictly>
      <template slot-scope="slotsProps">
        <span>{{ slotsProps.data.label }}</span>
        <span v-if="slotsProps.data.children">添加</span>
      </template>
      <div slot="footer">
        新建类别
      </div>
    </base-cascader>

  </div>
</template>

<script>
import platform from '@src/platform';
import * as dom from '@src/util/dom';

// import BaseDatatableDemo from './components/BaseDatatableDemo.vue';
// import BizTeamSelectDemo from './components/BizTeamSelectDemo.vue'
// import BaseCascader from '@src/component/common/BaseCascader/BaseCascader.vue';

export default {
  name: 'demo-view',
  data () {
    return {
      selectedUsers: [],
      imgUrl: '',
      article: '',
      typeValue: ['zhinan', 'shejiyuanze'],
      options: [{
        value: 'zhinan',
        label: '指南',
        children: [{
          value: 'shejiyuanze',
          label: '设计原则',
          children: [{
            value: 'yizhi',
            label: '一致'
          }, {
            value: 'fankui',
            label: '反馈'
          }, {
            value: 'xiaolv',
            label: '效率'
          }, {
            value: 'kekong',
            label: '可控'
          }]
        }, {
          value: 'daohang',
          label: '导航',
          children: [{
            value: 'cexiangdaohang',
            label: '侧向导航'
          }, {
            value: 'dingbudaohang',
            label: '顶部导航'
          }]
        }]
      }, {
        value: 'zujian',
        label: '组件',
        children: [{
          value: 'basic',
          label: 'Basic',
          children: [{
            value: 'layout',
            label: 'Layout 布局'
          }, {
            value: 'color',
            label: 'Color 色彩'
          }, {
            value: 'typography',
            label: 'Typography 字体'
          }, {
            value: 'icon',
            label: 'Icon 图标'
          }, {
            value: 'button',
            label: 'Button 按钮'
          }]
        }, {
          value: 'form',
          label: 'Form',
          children: [{
            value: 'radio',
            label: 'Radio 单选框'
          }, {
            value: 'checkbox',
            label: 'Checkbox 多选框'
          }, {
            value: 'input',
            label: 'Input 输入框'
          }, {
            value: 'input-number',
            label: 'InputNumber 计数器'
          }, {
            value: 'select',
            label: 'Select 选择器'
          }, {
            value: 'cascader',
            label: 'Cascader 级联选择器'
          }, {
            value: 'switch',
            label: 'Switch 开关'
          }, {
            value: 'slider',
            label: 'Slider 滑块'
          }, {
            value: 'time-picker',
            label: 'TimePicker 时间选择器'
          }, {
            value: 'date-picker',
            label: 'DatePicker 日期选择器'
          }, {
            value: 'datetime-picker',
            label: 'DateTimePicker 日期时间选择器'
          }, {
            value: 'upload',
            label: 'Upload 上传'
          }, {
            value: 'rate',
            label: 'Rate 评分'
          }, {
            value: 'form',
            label: 'Form 表单'
          }]
        }, {
          value: 'data',
          label: 'Data',
          children: [{
            value: 'table',
            label: 'Table 表格'
          }, {
            value: 'tag',
            label: 'Tag 标签'
          }, {
            value: 'progress',
            label: 'Progress 进度条'
          }, {
            value: 'tree',
            label: 'Tree 树形控件'
          }, {
            value: 'pagination',
            label: 'Pagination 分页'
          }, {
            value: 'badge',
            label: 'Badge 标记'
          }]
        }, {
          value: 'notice',
          label: 'Notice',
          children: [{
            value: 'alert',
            label: 'Alert 警告'
          }, {
            value: 'loading',
            label: 'Loading 加载'
          }, {
            value: 'message',
            label: 'Message 消息提示'
          }, {
            value: 'message-box',
            label: 'MessageBox 弹框'
          }, {
            value: 'notification',
            label: 'Notification 通知'
          }]
        }, {
          value: 'navigation',
          label: 'Navigation',
          children: [{
            value: 'menu',
            label: 'NavMenu 导航菜单'
          }, {
            value: 'tabs',
            label: 'Tabs 标签页'
          }, {
            value: 'breadcrumb',
            label: 'Breadcrumb 面包屑'
          }, {
            value: 'dropdown',
            label: 'Dropdown 下拉菜单'
          }, {
            value: 'steps',
            label: 'Steps 步骤条'
          }]
        }, {
          value: 'others',
          label: 'Others',
          children: [{
            value: 'dialog',
            label: 'Dialog 对话框'
          }, {
            value: 'tooltip',
            label: 'Tooltip 文字提示'
          }, {
            value: 'popover',
            label: 'Popover 弹出框'
          }, {
            value: 'card',
            label: 'Card 卡片'
          }, {
            value: 'carousel',
            label: 'Carousel 走马灯'
          }, {
            value: 'collapse',
            label: 'Collapse 折叠面板'
          }]
        }]
      }, {
        value: 'ziyuan',
        label: '资源',
        children: [{
          value: 'axure',
          label: 'Axure Components'
        }, {
          value: 'sketch',
          label: 'Sketch Templates'
        }, {
          value: 'jiaohu',
          label: '组件交互文档'
        }]
      }]
    }
  },
  mounted () {
    this.getImg();
  },
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
      options.selected = this.selectedUsers;
      options.max = 0;
      options.title = '请选择负责人';
      options.showDeptCheckbox = true;
      // options.showTaskCount = true;
      // options.showUserState = true;
      // options.allotMap = true;
      // options.lat = '27.127668'
      // options.lng = '113.961467'

      this.$fast.contact.choose('dept', options).then(res => {
        let users = res.data.users || [];
        this.selectedUsers = users;
        // console.log(res)
      })
        .catch(err => console.error(err))
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
    },
    getImg () {
      let res = {
        compressedPath: null,
        compressedSize: null,
        contentType: 'image/png',
        createTime: 1569641778031,
        fileMd5: '7CE188F7E6F9FE3A01D2A48458A7D6E6',
        fileName: 'image-张爱军-2019-09-28.png',
        fileSizeStr: '8.60M',
        id: '6d5bbf2f-38e4-46ff-a060-39c97b747cc7',
        localPath: '/acs/newfiles/7416b42a-25cc-11e7-a500-00163e12f748/201909/f0c7136a-f5e3-4d4e-8483-f180a3a65459.png',
        ossUrl: 'https://she-dev.oss-cn-hangzhou.aliyuncs.com/acs/newfiles/7416b42a-25cc-11e7-a500-00163e12f748/201909/3d4339c8-3ca8-4f63-b03c-d6f44da19f18.png',
        size: 8810,
        symLink: null,
        tenantId: '7416b42a-25cc-11e7-a500-00163e12f748',
        type: 0,
        url: null,
      }

      this.imgUrl = this.genUrl(res);
    },
    genUrl({fileSizeStr, ossUrl}) {
      let size = Number(fileSizeStr.replace(/[a-z A-Z]/gi, ''));

      // 1M 以下不压缩
      if (/kb/gi.test(fileSizeStr) || !size) return ossUrl;

      const existParams = ossUrl.indexOf('?') >= 0;

      if (size > 3) return existParams ? `${ ossUrl }&x-oss-process=image/resize,p_50` : `${ ossUrl }?x-oss-process=image/resize,p_50`;
      if (size > 1) return existParams ? `${ ossUrl }&x-oss-process=image/resize,p_70` : `${ ossUrl }?x-oss-process=image/resize,p_70`;
      return ossUrl;
    },
  },
  components: {
    // [BaseDatatableDemo.name]: BaseDatatableDemo,
    // [BizTeamSelectDemo.name]: BizTeamSelectDemo,
    // [BaseCascader.name]: BaseCascader
  },
};
</script>



