<template>
  <div class="form-address">
    <div class="form-address-picker">
      <base-dist-picker @input="handleCitySelectorChange" :value="distValue"/>
      <el-button type="button" @click="chooseMap" style="margin-bottom: 10px">地图选址</el-button>
    </div>
    <input
      type="text"
      :value="detail"
      @input="input"
      maxlength="50"
      :placeholder="placeholder"
      :id="`form_${field.fieldName}`"
      autocomplete="off"/>
  </div>
</template>

<script>
import FormMixin from '../FormMixin';

export default {
  name: 'form-address',
  mixins: [FormMixin],
  props: {
    addressBackup: {
      type: Object,
      default: () => ({})
    },  
    value: {
      type: Object,
      default(){
        let value = {
          /**
             * value值必须包含以下值:
             * province: String,
             * city: String,
             * dist: String,
             * address: String
             * 
             * 以下值可选：
             * latitude： [String,Number],
             * longitude: [String,Number],
             * addressType: Number
             */
        };
          
        return value
      }
    }
  },
  computed: {
    /** 将省市区转换成数组 */
    distValue(){
      let {province, city, dist} = this.value;
      if(!province) return [];

      let arr = [province];
      if(!city) return arr;
        
      arr.push(city);
      if(dist) arr.push(dist)

      return arr;
    },
    /** 详细地址 */
    detail(){
      return this.value.address;
    }
  },
  methods: {
    input(event) {
      let newAddress = {
        ...this.value,
        address: event.target.value
      };

      let adrBackup = this.addressBackup;
      newAddress.addressType = this.diffAddress(newAddress, adrBackup);

      if (newAddress.addressType) {
        newAddress.latitude = adrBackup.adLatitude || adrBackup.latitude;
        newAddress.longitude = adrBackup.adLongitude || adrBackup.longitude;
      }

      this.updateValue(newAddress)
    },
    diffAddress(newVal, oldVal) {
      let newAdr = (newVal.adProvince || newVal.province) + (newVal.adCity || newVal.city) + (newVal.adDist || newVal.dist) + (newVal.adAddress || newVal.address);
      let oldAdr = (oldVal.adProvince || oldVal.province) + (oldVal.adCity || oldVal.city) + (oldVal.adDist || oldVal.dist) + (oldVal.adAddress || oldVal.address);

      return Number(newAdr === oldAdr);
    },
    handleCitySelectorChange(val) {
      let newAddress = {
        province: '',
        city: '',
        dist: '',
        address: ''
      };

      if(!Array.isArray(val) || !val.length) {
        return this.updateValue(newAddress);
      }

      newAddress = {
        ...this.value,
        province: val[0] || '',
        city: val[1] || '',
        dist: val[2] || '',
      };

      let adrBackup = this.addressBackup;
      newAddress.addressType = this.diffAddress(newAddress, adrBackup);


      if (newAddress.addressType) {
        newAddress.latitude = adrBackup.adLatitude || adrBackup.latitude;
        newAddress.longitude = adrBackup.adLongitude || adrBackup.longitude;
      }

      this.updateValue(newAddress);
    },
    updateValue(newValue) {
      let oldValue = null;
      this.$emit('update', {newValue, oldValue, field: this.field});
      this.$emit('input', newValue);

      //this.$el.dispatchEvent(new CustomEvent('form.validate', {bubbles: true}));
    },
    chooseMap() {
      const point = {
        latitude: this.value.latitude || '',
        longitude: this.value.longitude || '',
      };

      let defaultArea = this.value.province;
      if(this.value.city && ['郊县', '市辖区', '其他'].indexOf(this.value.city) < 0) defaultArea = this.value.city;
      if(this.value.dist) defaultArea = this.value.dist; 

      // 有经纬度用经纬度，没有使用较小的行政单位
      this.$fast.map.picker(point, {defaultArea}).then(result => {
        if (result.status === 1) return;

        let adr = result.data;
        adr.addressType = 1;

        this.$emit('update-address-backup', adr);
        this.updateValue(adr);
      })
        .catch(err => console.error(err));
    },
    getValue(){
      return this.value;
    }
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

.form-address-picker{
  display: flex;
  justify-content: space-between;
  
  .form-item, .form-text {
    width: 400px;
  }
}
</style>
