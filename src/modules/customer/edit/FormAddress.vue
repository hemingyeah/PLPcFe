<template>
  <div class="form-address">
    <div class="input-and-btn">
      <base-dist-picker @input="handleCitySelectorChange" ref="baseDistPicker" :value="value.adAddress"></base-dist-picker>
      <el-button type="button" @click="chooseMap" style="margin-bottom: 10px">地图选址</el-button>
    </div>
    <input
      type="text"
      :value="value.detail"
      @input="input"
      :placeholder="placeholder"
      :id="`form_${field.fieldName}`"/>
  </div>
</template>

<script>
  import BaseDistPicker from '@src/component/common/BaseDistPicker';

  export default {
    name: "form-address",
    components: {BaseDistPicker,},

    props: {
      addressBackup: {
        type: Object,
        default: () => ({})
      },
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
    methods: {
      input(event) {
        let newAddress = {
          ...this.value,
          detail: event.target.value,
        };

        if (!this.diffAddress(newAddress, this.addressBackup)) {
          newAddress.addressType = 0;
          newAddress.adLatitude = '';
          newAddress.adLongitude = '';
        } else {

          newAddress.addressType = 1;
          newAddress.adLatitude = this.addressBackup.adLatitude;
          newAddress.adLongitude = this.addressBackup.adLongitude;
        }

        this.updateValue(newAddress)
      },
      diffAddress(newVal, oldVal) {
        if (newVal.detail === oldVal.detail &&
          newVal.adAddress.toString() === oldVal.adAddress.toString()) {
          return true;
        }
        return false;
      },
      handleCitySelectorChange(val) {
        let newAddress = {};

        if (!val || !val.length) {
          newAddress = {
            adAddress: [],
            detail: '',
            adLongitude: '',
            adLatitude: '',
            addressType: 0,
          };

        } else {
          newAddress = {
            ...this.value,
            adAddress: val,
            adProvince: val[0] || '',
            adCity: val[1] || '',
            adDist: val[2] || '',
            adLongitude: '',
            adLatitude: '',
            addressType: 0,
          };
        }

        this.updateValue(newAddress);

      },
      updateValue(newValue) {
        let oldValue = null;
        this.$emit('input', {newValue, oldValue, field: this.field});
        this.$el.dispatchEvent(new CustomEvent('form.validate', {bubbles: true}));
      },
      chooseMap() {

        // let defaultArea = this.addressBackup.adAddress.filter(a => a !== '郊县' && a !== '市辖区' && a.indexOf('其他') === -1);
        let defaultArea = this.value.adAddress.filter(a => a !== '郊县' && a !== '市辖区' && a.indexOf('其他') === -1);
        this.$fast.map.picker(this.addressBackup, {defaultArea: defaultArea[defaultArea.length - 1],}).then(result => {

          if (result.status === 1) return;

          const { province, city, dist, address, latitude, longitude} = result.data;

          const newVal = {
            adAddress: [ province, city, dist,],
            detail: address,
            adLatitude: latitude,
            adLongitude: longitude,
            addressType: 1,
          };


          this.$emit('update-address-backup', newVal);

          this.updateValue(newVal);
        })
          .catch(err => console.error(err));
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

      // this.addressBackup = this.value;
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

    .el-input__inner:hover {
      border-color: #00ac97;
    }

    .base-dist-picker {
      flex-grow: 1;
      padding-right: 10px;
      .el-cascader {
        width: 100%;
      }
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