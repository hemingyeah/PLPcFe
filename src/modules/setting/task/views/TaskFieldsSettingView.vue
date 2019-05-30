<template>
  <div style="height: 100vh;">
    <form-design v-model="fields" mode="task" v-if="init"></form-design>
  </div>
</template>

<script>
import * as FormUtil from '@src/component/form/util';
import http from '@src/util/http';
import platform from '@src/platform';

export default {
  name: 'task-fields-setting-view',
  data(){
    return {
      init: false,
      fields: [],
    }
  },
  async mounted(){
    let fields = await http.get('/task/getTaskTemplateFields', {tableName: 'task', templateId: '1'});
    let sortedFields = fields.sort((a, b) => a.orderId - b.orderId);
    
    this.fields = FormUtil.toFormField(sortedFields);
    this.init = true;
  }
}
</script>
