<template>
  <div>
    <form @submit.prevent="submit">
      <form-builder ref="form" :fields="fields" :value="form" @input="update">
        <form-item label="客户编号" :field="customerSNField">
          <form-text :field="customerSNField" :value="form.serialNumber" @input="update"></form-text>
        </form-item>
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
          <button type="button" @click="chooseMap">地址选址</button>
        </div>
        <div>
          <label>服务团队*</label>
          <input>
        </div>
        <div>
          <label>客户负责人*</label>
          <input>
        </div>
      </form-builder>
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
      //serialNumber
      customerSNField: { //客户编号字段
        formType: 'text',
        fieldName: 'serialNumber',
        displayName: "客户编号",
        isNull: 0
      },

      form: {},
      address: {}
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
      this.$refs.form.validate().then(valid => {
        if(!valid) return Promise.reject('validate fail.')
        console.log(this.form)
      })
      .catch(err => console.error(err))
    },
    chooseMap(){
      this.$fast.map.picker(this.address, {defaultArea: "临沂市"}).then(result => {
        console.log(result)
        if(result.status == 0) this.address = result.data
      })
      .catch(err => console.log(err));
    }
  },
  mounted(){
    //console.log(this.initData)
  }
}
</script>
