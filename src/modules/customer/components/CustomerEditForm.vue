<template>
  <form-builder ref="form" :fields="fields" :value="value" @update="update">
    <template slot="serialNumber" slot-scope="{field}">
      <form-item :label="field.displayName" :validation="validation.serialNumber">
        <form-text
          v-if="validation.serialNumber"
          :field="field"
          :value="value.serialNumber" @update="update"/>
        <div v-else class="form-item__text">客户编号将在创建后由系统生成</div>
      </form-item>
    </template>

    <template slot="name" slot-scope="{field}">
      <form-item :label="field.displayName" :validation="validation.name">
        <form-text :field="field" :value="value.name" @update="update"/>
      </form-item>
    </template>

    <template slot="lmName" slot-scope="{field}">
      <form-item :label="field.displayName" validation>
        <div class="input-and-btn">
          <form-text :field="field" :value="value.lmName" @update="update"/>
          <el-button @click="copyName">同客户名</el-button>
        </div>
      </form-item>
    </template>

    <template slot="lmPhone" slot-scope="{field}">
      <form-item :label="field.displayName" :validation="validation.lmPhone">
        <form-text :field="field" :value="value.lmPhone" @update="update"/>
      </form-item>
    </template>

    <template slot="customerAddress" slot-scope="{field}">
      <form-item :label="field.displayName" validation>
        <form-address
          :field="field"
          :value="value.customerAddress" @update="update"
          @update-address-backup="updateAddressBackup" :address-backup="addressBackup"/>
      </form-item>
    </template>

    <template slot="manager" slot-scope="{field}">
      <form-item :label="field.displayName">
        <form-user
          :field="field"
          :value="value.manager" @update="update"
          :see-all-org="seeAllOrg"/>
      </form-item>
    </template>

    <template slot="tags" slot-scope="{field}">
      <form-item :label="field.displayName" validation>
        <div class="input-and-btn">
          <biz-team-select v-model="value.tags" multiple/>
          <el-button type="button" @click="autoAssign">自动分配</el-button>
        </div>
      </form-item>
    </template> 
  </form-builder>
</template>

<script>
import * as CustomerApi from '@src/api/CustomerApi';
import * as LinkmanApi from '@src/api/LinkmanApi';

import _ from 'lodash'
import platform from '@src/platform'

export default {
  name: 'customer-edit-form',
  props: {
    fields: {
      type: Array,
      required: true
    },
    value: {
      type: Object,
      required: true
    }
  },
  inject: ['initData'],
  data() {
    return {
      validation: this.buildValidation(),
      addressBackup: this.value.customerAddress,
    }
  },
  computed: {
    /** 是否只显示 自己所在团队 */
    seeAllOrg() {
      return this.initData.seeAllOrg; 
    }
  },
  methods: {
    buildValidation(){
      let {isAutoSerialNumber, isCustomerNameDuplicate, isPhoneUnique} = this.initData;
      
      let checkCustomerProp = _.debounce(function(params, resolve, changeStatus){
        changeStatus(true);
        return CustomerApi.unique(params).then(res => {
          changeStatus(false);
          return resolve(res.error ? res.error : null);
        })
      }, 250);

      let checkLmPhone = _.debounce(function(params, resolve, changeStatus){
        changeStatus(true);
        return LinkmanApi.checkUnique4Phone(params).then(res => {
          changeStatus(false);
          return resolve(res.error ? res.error : null);
        })
      }, 250)

      return Object.freeze({
        serialNumber: isAutoSerialNumber ? false : function(value, field, changeStatus){
          let params = {
            id: value.id || '',
            fieldName: 'serialNumber',
            value
          }

          return new Promise((resolve, reject) => checkCustomerProp(params, resolve, changeStatus))
        },
        name: isCustomerNameDuplicate ? false : function(value, field, changeStatus){
          let params = {
            id: value.id || '',
            fieldName: 'name',
            value
          }

          return new Promise((resolve, reject) => checkCustomerProp(params, resolve, changeStatus))
        },
        lmPhone: !isPhoneUnique ? false : function(value, field, changeStatus){
          let params = {
            customerId: value.id || '',
            phone: value
          }

          return new Promise((resolve, reject) => checkLmPhone(params, resolve, changeStatus))
        }
      });
    },
    update({field, newValue, oldValue}){
      let {fieldName, displayName} = field;
      if (this.$appConfig.debug) {
        console.info(`[FormBuilder] ${displayName}(${fieldName}) : ${JSON.stringify(newValue)}`);
      }
      let value = this.value;
      this.$set(value, fieldName, newValue)
      this.$emit('input', value)
    },
    copyName() {
      let value = this.value;
      if(!value.name) return;

      this.$set(value, 'lmName', value.name)
      this.$emit('input', value)
    },
    /** 自动匹配客户服务团第 */
    async autoAssign(){
      try {
        let adr = this.value.customerAddress;
        let {province, city, dist} = adr;
        if(!province || !city) return this.$platform.alert('请先补全客户地址');

        let result = await CustomerApi.matchTag({province, city, dist});

        if(result.status == 1){
          return platform.notification({
            type: 'error',
            title: '服务团队匹配失败',
            message: result.message
          })
        }

        let tags = result.data || [];
        if(tags.length == 0){
          return platform.notification({
            type: 'error',
            title: '服务团队匹配失败',
            message: '未能按照规则分配成功，请到服务团队中设置负责区域'
          })
        }

        this.value.tags = tags.map(item => ({
          id: item.id,
          tagName: item.tagName
        }));
        this.$emit('input', this.value)
      } catch (error) {
        console.error(error)
      }

      // let tags = [];
      // this.tags.forEach(team => {
      //   let places = team.places || [];
      //   for(let i = 0; i < places.length; i++){
      //     let place = places[i];
      //     let placeProvince = (place.province || '').replace('所有省', '');
      //     let placeCity = (place.city || '').replace('所有市', '');
      //     let placeDist = (place.dist || '').replace('所有区', '');

      //     let placeStr = placeProvince + placeCity + placeDist;
      //     let adrStr = province + city + dist;
      //     if(placeStr && adrStr.indexOf(placeStr) == 0) tags.push(team.id);
      //   }
      // });

      // if(tags.length == 0) return this.$platform.alert('未能按照规则分配成功，请到服务团队中设置负责区域');
    },
    updateAddressBackup(ad) {
      this.addressBackup = ad;
    },
    validate(){
      return this.$refs.form.validate();
    }
  }
}
</script>
