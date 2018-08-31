<template>
  <div>
    <form-builder :fields="fields"></form-builder>
  </div>
</template>

<script>
import * as FormUtil from '@src/component/form/util';
export default {
  name: 'customer-edit-view',
  props: {
    initData: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    fields(){
      let originFields = this.initData.fieldInfo || [];
      console.log(originFields.map(item => item.formType))
      return FormUtil.migration(originFields);
    }
  },
  mounted(){
    console.log(this.initData)
  }
}
</script>
