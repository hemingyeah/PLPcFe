<template>
  <div>
    <button @click="Notification">show Notification</button>
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
    Notification(){
      platform.notification({
        title: '成功',
        message: '这是一条成功的提示消息',
        //content: '<p>这是一条成功的提示消息</p><p>这是一条成功的提示消息</p><p>这是一条成功的提示消息</p><p>这是一条成功的提示消息</p>',
        // message: (function name(h) {
        //   return <div>hello world</div>
        // })(this.$createElement),
        type: 'success',
        duration: 0
      })
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

