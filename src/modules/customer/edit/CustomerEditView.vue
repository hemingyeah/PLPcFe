<template>
  <div>
    <form @submit.prevent="submit">
      <div>
        <label>客户编号*</label>
        <input>
      </div>
      <div>
        <label>客户*</label>
        <input>
      </div>
      <div>
        <label>联系人*</label>
        <input>
      </div>
      <div>
        <label>电话*</label>
        <input>
      </div>
      <div>
        <label>地址*</label>
        <input>
      </div>
      <div>
        <label>服务团队*</label>
        <input>
      </div>
      <div>
        <label>客户负责人*</label>
        <input>
      </div>
      <form-builder :fields="fields" :value="form" @update="update"></form-builder>
      <button type="submit">提交</button>
    </form>
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
  data(){
    return {
      form: {}
    }
  },
  computed: {
    fields(){
      let originFields = this.initData.fieldInfo || [];
      return FormUtil.migration(originFields);
    }
  },
  methods:{
    update({field, newValue, oldValue}){
      let {fieldName, displayName} = field;
      if(this.$appConfig.debug){
        console.info(`[FormBuilder] => ${displayName}(${fieldName}) : ${JSON.stringify(newValue)}`);
      }

      this.$set(this.form, fieldName, newValue)
    },
    submit(){
      console.log(this.for)
    }
  },
  mounted(){
    console.log(this.initData)
  }
}
</script>
