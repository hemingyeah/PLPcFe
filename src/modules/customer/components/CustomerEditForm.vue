<template>
  <!-- COMMENT: 暂时去除团队 -->
  <!-- <form-builder ref="form" :fields="fields" :value="value" @update="update">
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
  </form-builder> -->

  <form-builder ref="form" :fields="fields" :value="value" @update="update">
    <template slot="serialNumber" slot-scope="{field}">
      <form-item :label="field.displayName" :remote="remote.serialNumber" :validation="!config.isAutoSerialNumber">
        <form-text
          v-if="!config.isAutoSerialNumber"
          :field="field"
          :value="value.serialNumber" @update="update"
          :placeholder="genPlaceholder(field)"/>
        <div v-else class="form-item__text">客户编号将在创建后由系统生成</div>
      </form-item>
    </template>

    <template slot="manager" slot-scope="{field}">
      <form-item :label="field.displayName" :remote="remote.manager">
        <form-user
          :field="field"
          :value="value.manager" 
          :placeholder="genPlaceholder(field)"
          :see-all-org="seeAllOrg"
          @update="update"
        />
      </form-item>
    </template>

    <template slot="name" slot-scope="{field}">
      <form-item :label="field.displayName" :remote="remote.name" validation>
        <form-text
          :field="field"
          :value="value.name" @update="update"
          :placeholder="genPlaceholder(field)"/>
      </form-item>
    </template>

    <template slot="lmName" slot-scope="{field}">
      <form-item :label="field.displayName" validation>
        <div class="input-and-btn">
          <form-text
            :field="field"
            :value="value.lmName" @update="update"
            :placeholder="genPlaceholder(field)"/>
          <el-button @click="copyName">同客户名</el-button>
        </div>
      </form-item>
    </template>

    <template slot="lmPhone" slot-scope="{field}">
      <form-item :label="field.displayName" :remote="remote.lmPhone" validation>
        <form-text
          :field="field"
          :value="value.lmPhone" @update="update"
          :placeholder="genPlaceholder(field)"/>
      </form-item>
    </template>

    <template slot="customerAddress" slot-scope="{field}">
      <form-item :label="field.displayName" validation>
        <form-address
          :field="field"
          :value="value.customerAddress" @update="update"
          @update-address-backup="updateAddressBackup" :address-backup="addressBackup"
          :placeholder="genPlaceholder(field)"></form-address>
      </form-item>
    </template>

    <template slot="tags" slot-scope="{field}">
      <form-item :label="field.displayName" validation>
        <div class="input-and-btn">
          <form-select
            :field="field" :source="selectTagOptions || []"
            :value="value.tags" @update="update"
            :placeholder="genPlaceholder(field)"/>
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
import * as FormUtil from '@src/component/form/util';

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
      remote: this.buildRemote(),
      validation: this.buildValidation(),
      addressBackup: this.value.customerAddress,
    }
  },
  computed: {
    /* 配置项 */
    config() {
      const { customerAddress, isAutoSerialNumber, isDivideByTag, isCustomerNameDuplicate, isPhoneUnique} = this.initData;
      return {
        isCustomerNameDuplicate,
        isAutoSerialNumber,
        customerAddress,
        isDivideByTag,
        isPhoneUnique,
      }
    },
    /** 是否只显示 自己所在团队 */
    seeAllOrg() {
      return this.initData.seeAllOrg; 
    },
    /* 团队选择配置项 */
    selectTagOptions() {
      if (!this.initData.tags) return [];
      return this.initData.tags
        .map(tag => ({
          text: tag.tagName,
          value: tag.id,
        })) || [];
    },
    /* 团队 */
    tags() {
      return this.initData.tags || [];
    },
  },
  methods: {
    genPlaceholder(field){
      return FormUtil.genPlaceholder(field)
    },
    buildRemote(){
      let customerId = this.initData.id;
      let {isAutoSerialNumber, isCustomerNameDuplicate, isPhoneUnique} = this.initData;
      return {
        serialNumber: isAutoSerialNumber ? null : {
          action: '/customer/unique',
          method: 'post',
          // 提交表单的时候，验证请求不可取消
          buildParams(value) {
            return {
              id: customerId,
              fieldName: 'serialNumber',
              value
            };
          }
        },
        name: isCustomerNameDuplicate ? null : {
          action: '/customer/unique',
          method: 'post',
          buildParams(value) {
            return {
              id: customerId,
              fieldName: 'name',
              value,
            };
          }
        },
        lmPhone: !isPhoneUnique ? null : {
          action: '/linkman/checkUnique4Phone',
          method: 'post',
          buildParams(value) {
            return {
              customerId: customerId,
              phone: value,
            };
          }
        }
      }
    },
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
      this.$set(value, fieldName, newValue);
      this.$emit('input', value);
    },
    copyName() {
      let value = this.value;
      if(!value.name) return;

      this.$set(value, 'lmName', value.name)
      this.$emit('input', value)
    },
    /** 自动匹配客户服务团队修改 */
    async autoAssign(){
      // COMMENT: 暂时去除团队
      // try {
      //   let adr = this.value.customerAddress;
      //   let {province, city, dist} = adr;
      //   if(!province || !city) return this.$platform.alert('请先补全客户地址');

      //   let result = await CustomerApi.matchTag({province, city, dist});

      //   if(result.status == 1){
      //     return platform.notification({
      //       type: 'error',
      //       title: '服务团队匹配失败',
      //       message: result.message
      //     })
      //   }

      //   let tags = result.data || [];
      //   if(tags.length == 0){
      //     return platform.notification({
      //       type: 'error',
      //       title: '服务团队匹配失败',
      //       message: '未能按照规则分配成功，请到服务团队中设置负责区域'
      //     })
      //   }

      //   this.value.tags = tags.map(item => ({
      //     id: item.id,
      //     tagName: item.tagName
      //   }));
      //   this.$emit('input', this.value)
      // } catch (error) {
      //   console.error(error)
      // }

      let adr = this.value.customerAddress;
      let {province, city, dist} = adr;
      if(!province || !city) return this.$platform.alert('请先补全客户地址');

      let tags = [];
      this.tags.forEach(team => {
        let places = team.places || [];
        for(let i = 0; i < places.length; i++){
          let place = places[i];
          let placeProvince = (place.province || '').replace('所有省', '');
          let placeCity = (place.city || '').replace('所有市', '');
          let placeDist = (place.dist || '').replace('所有区', '');

          let placeStr = placeProvince + placeCity + placeDist;
          let adrStr = province + city + dist;
          if(placeStr && adrStr.indexOf(placeStr) == 0) {
            tags.push(team.id);
            break
          }
        }
      });

      if(tags.length == 0) return platform.alert('未能按照规则分配成功，请到服务团队中设置负责区域');

      this.value.tags = tags;
      this.$emit('input', this.value);
    },
    updateAddressBackup(ad) {
      this.addressBackup = ad;
    },
    validate() {
      return this.$refs.form.validate()
        .then(valid => { 
          return valid
        })
    }
  }
}
</script>
