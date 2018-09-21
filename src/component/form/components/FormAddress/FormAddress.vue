<template>
  <div class="form-address">
    <div class="input-and-btn">
      <base-dist-picker @city-selector-change="handleCitySelectorChange" ref="baseDistPicker" :default-value="locationValue"></base-dist-picker>
      <el-button type="button" @click="chooseMap" style="margin-bottom: 10px">地图选址</el-button>
    </div>
    <input
      type="text"
      @input="input"
      :placeholder="placeholder"
      :id="`form_${field.fieldName}`"/>
  </div>
</template>

<script>
  import BaseDistPicker from '@src/component/common/BaseDistPicker';
  import FormText from '../FormText/FormText';

  export default {
    name: "form-address",
    components: {FormText, BaseDistPicker,},
    props: {
      field: {
        type: Object,
        default: () => ({})
      },
      placeholder: {
        type: String,
        default: ''
      },
      value: {
        type: Object,
        default: () => ({})
      }
    },

    computed: {
      locationValue() {
        const {adProvince, adCity, adDist, } = this.value;
        return [adProvince, adCity, adDist, ].filter(l => l);
      }
    },
    methods: {
      input(event) {
        console.log('this.value', this.value);
        const newAddress = {
          ...this.value,
          adAddress: event.target.value,
        };
        this.updateValue(newAddress)
      },
      handleCitySelectorChange(val) {

        if (!val || !val.length) return;

        const newAddress = {
          ...this.value,
          adProvince: val[0] || '',
          adCity: val[1] || '',
          adDist: val[2] || '',
        };
        this.updateValue(newAddress);

        console.log('handleCitySelectorChange val', val);
      },
      updateValue(newValue) {
        let oldValue = null;
        console.log('newValue', newValue);
        this.$emit('input', {newValue, oldValue, field: this.field});
        this.$el.dispatchEvent(new CustomEvent('form.validate', {bubbles: true}));
      },
      chooseMap() {
        this.$fast.map.picker(this.address, {defaultArea: "临沂市"}).then(result => {
          console.log(result)
          if (result.status == 0) this.address = result.data
        })
          .catch(err => console.log(err));
      },
      getValue(){
        return this.value;
      },
    },
    mounted(){
      //触发注册事件，用于注册字段到外层formitem组件，和formbuilder组件
      let params = {value: this.getValue, fieldName: this.field.fieldName};
      let event = new CustomEvent('form.add.field', {detail: params, bubbles: true})
      this.$nextTick(() => this.$el.dispatchEvent(event));


      console.log('mounted svalue', this.value);
    },
    destroyed(){
      //注册解绑事件，用于解绑组件
      let params = {fieldName: this.field.fieldName}
      let event = new CustomEvent('form.remove.field', {detail: params, bubbles: true})
      this.$el.dispatchEvent(event)
    }
  }
</script>

<style lang="scss">

  .form-address {
    input {
      width: 100%;
    }
  }


  .input-and-btn {
    display: flex !important;
    justify-content: space-between;
    .form-item, .form-text {
      width: 400px;
    }
  }

</style>