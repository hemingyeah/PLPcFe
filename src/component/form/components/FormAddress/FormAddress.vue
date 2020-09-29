<template>
  <div class="form-address">
    <div class="form-address-picker">
      <base-dist-picker @input="handleCitySelectorChange" :value="distValue" :placeholder="placeholder"/>
      <el-button type="button" @click="chooseMap" v-if="!disableMap" class="action-btn">地图选址</el-button>
    </div>
    <div class="form-address-picker">
      <input
        type="text"
        :value="detail"
        @input="input"
        :maxlength="maxlength"
        :id="`form_${field.fieldName}`"
        autocomplete="off"/>
      <el-button type="button" class="action-btn" @click="toggleModal">解析地址</el-button>
    </div>

    <base-modal :show.sync="visible" title="解析地址" class="form-address-modal">
      <textarea v-model.trim="copy" placeholder="请输入或粘贴地址到文本框进行解析" maxlength="1000"></textarea>
      <el-button type="primary" @click="analyze" :disabled="!copy.length || pending">解析</el-button>
    </base-modal>
  </div>
</template>

<script>
import FormMixin from '@src/component/form/mixin/form';
import { parseAddress } from '@src/api/CommonApi';
import { FORM_FIELD_TEXT_MAX_LENGTH } from '@src/model/const/Number.ts';

/* global AMap */
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
    },
    /** 是否启禁用图选址 */
    disableMap: {
      type: Boolean,
      default: false
    },
    // 工单客户关联字段清除位置信息时候不调用update
    taskDisableUpdate: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      visible: false,
      pending: false,
      copy: '',
      maxlength: FORM_FIELD_TEXT_MAX_LENGTH
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
  mounted() {
  },
  methods: {
    toggleModal() {
      this.visible = !this.visible;
      if (this.visible) {
        this.copy = '';
      }
    },
    analyze() {

      this.pending = true;
      parseAddress({detailAddress: this.copy})
        .then(res => {

          this.pending = false;
          if (!res || res.status) return this.$platform.notification({
            title: '解析地址失败，请手动选择省市区以及详细地址',
            message: res.message || '',
            type: 'error',
          });

          let {province, city, district, address, lat, lng} = res.data;

          this.updateValue({
            province: province || '',
            city: city || '',
            dist: district || '',
            address: address || '',
            latitude: lat || '',
            longitude: lng || '',
            addressType: (lat || lng) ? 1 : 0,
          });

          this.visible = false;
          this.copy = '';
        })
        .catch(e => console.error('e', e))
    },
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
      } else {
        newAddress.latitude = '';
        newAddress.longitude = '';
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
      // 工单客户关联字段清除位置信息时候不调用update
      if(!this.taskDisableUpdate){
        this.$emit('update', {newValue, oldValue, field: this.field});
      }
      this.$emit('input', newValue);
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
    .el-cascader {
      width: 100%;
    }
  }


  .form-address-modal {

    .base-modal-body {
      padding: 20px;
      display: flex;
      justify-content: flex-end;
      flex-wrap: wrap;

      textarea {
        flex-shrink: 0;
        line-height: 24px;
        height: 48px;
        width: 100%;
        resize: none;
      }

      .el-button {
        margin-top: 10px;
      }

    }
  }
}

.form-address-picker{
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;

  .form-item, .form-text {
    width: 400px;
  }

  .action-btn {
    margin-left: 10px;
  }
}
</style>
