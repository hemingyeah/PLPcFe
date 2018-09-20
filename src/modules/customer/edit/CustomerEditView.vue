<template>
  <div>
    <form @submit.prevent="submit" style="width: 640px;">
      <button type="submit">提交</button>
      <form-builder ref="form" :fields="fields" :value="form" @input="update">
        <form-item label="客户编号" :field="SNField">
          <form-text :field="SNField" :value="form.serialNumber" @input="update" :place-holder="SNField.placeHolder"></form-text>
        </form-item>
        <form-item label="客户" :field="nameField">
          <form-text :field="nameField" :value="form.name" @input="update" :place-holder="nameField.placeHolder"></form-text>
        </form-item>
        <!--<form-item label="客户" :field="customerSNField">-->
          <!--<form-text :field="customerSNField" :value="form.serialNumber" @input="update"></form-text>-->
        <!--</form-item>-->
        <!--<form-item label="联系人" :field="customerSNField">-->
          <!--<form-text :field="customerSNField" :value="form.serialNumber" @input="update"></form-text>-->
        <!--</form-item>-->
        <!--<form-item label="电话" :field="phone">-->
          <!--<form-text :field="phone" :value="form.phone" @input="update"></form-text>-->
        <!--</form-item>-->
        <!--<form-item label="地址" :field="customerSNField">-->
          <!--<form-text :field="customerSNField" :value="form.serialNumber" @input="update"></form-text>-->
        <!--</form-item>-->
        <!--<form-item label="服务团队" :field="customerSNField">-->
          <!--<form-text :field="customerSNField" :value="form.serialNumber" @input="update"></form-text>-->
          <!--&lt;!&ndash; <button type="button" @click="chooseMap">地址选址</button> &ndash;&gt;-->
        <!--</form-item>-->
        <!--<form-item label="客户负责人" :field="customerSNField">-->
          <!--<form-text :field="customerSNField" :value="form.serialNumber" @input="update"></form-text>-->
        <!--</form-item>-->
      </form-builder>
      <button type="submit">提交</button>
    </form>
  </div>
</template>

<script>
import * as FormUtil from '@src/component/form/util';
import FormText from "../../../component/form/components/FormText/FormText";
export default {
  name: 'customer-edit-view',
  components: {FormText},
  props: {
    initData: {
      type: Object,
      default: () => ({})
    }
  },
  data(){
    return {
      //serialNumber
      SNField: { //客户编号字段
        formType: 'text',
        fieldName: 'serialNumber',
        displayName: "客户编号",
        placeHolder: '[最多50字]',
        isNull: 0,
        remoteValidation: {
          action: '/customer/unique',
          buildParams() {
            const params = {
              id: '',
              fieldName: 'serialNumber',
            };
            return params;
          }
        },
      },
      nameField: { //客户编号字段
        formType: 'text',
        fieldName: 'name',
        displayName: "客户",
        placeHolder: '[最多50字]',
        isNull: 0,
        remoteValidation: {
          action: '/customer/unique',
          buildParams() {
            const params = {
              id: '',
              fieldName: 'name',
            };
            return params;
          }
        },
      },
      customerSNField: { //客户编号字段
        formType: 'text',
        fieldName: 'serialNumber',
        displayName: "客户编号",
        placeholder: '[最多50字]',
        isNull: 0,
      },
      phone: { //客户编号字段
        formType: 'phone',
        fieldName: 'phone',
        displayName: "电话",
        placeholder: '请输入电话或者手机号',
        isNull: 0,
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
        if(!valid) return Promise.reject('validate fail.');
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
