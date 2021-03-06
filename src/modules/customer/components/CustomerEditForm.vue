<template>
  <form-builder ref="form" :fields="fields" :value="value" mode="customer" @update="update">
    <template slot="serialNumber" slot-scope="{field}">
      <form-item :label="field.displayName" :validation="validation.serialNumber">
        <form-text
          v-if="validation.serialNumber && initData && !initData.isAutoSerialNumber"
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
      <form-item :label="field.displayName">
        <customer-tags 
          :field="field"
          :value="value.tags"
          @autoAssign="autoAssign"
          @input="update"
        />
      </form-item>
    </template> 
  </form-builder>
</template>

<script>
import * as CustomerApi from '@src/api/CustomerApi.ts';
import * as LinkmanApi from '@src/api/LinkmanApi';

import FormMixin from '@src/component/form/mixin/form';
import TeamMixin from '@src/mixins/teamMixin';

import _ from 'lodash'
import platform from '@src/platform'

export default {
  name: 'customer-edit-form',
  mixins: [TeamMixin],
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
      filterTeams: []
    }
  },
  computed: {
    /** 是否只显示 自己所在团队 */
    seeAllOrg() {
      return true; 
    },
    /** 当前用户的权限 */
    permission() {
      return this.initData.loginUser.authorities;
    },
    // 是否含有客户编辑全部权限
    hasEditCustomerAuth(){
      return this.initData?.loginUser?.authorities?.['CUSTOMER_EDIT'] === 3;
    },
    // 是否过滤团队
    isFilterTag() {
      return this.initData && this.initData.isDivideByTag && !this.hasEditCustomerAuth;
    },
  },
  methods: {
    buildValidation(){
      let {isAutoSerialNumber, isCustomerNameDuplicate, isPhoneUnique} = this.initData;
      
      let checkCustomerName = _.debounce(function(params, resolve, changeStatus){
        changeStatus(true);
        return CustomerApi.unique(params).then(res => {
          changeStatus(false);
          return resolve(res.error ? res.error : null);
        })
          .catch(err => console.error(err))
      }, 500);

      let checkCustomerSN = _.debounce(function(params, resolve, changeStatus){
        changeStatus(true);
        return CustomerApi.unique(params).then(res => {
          changeStatus(false);
          return resolve(res.error ? res.error : null);
        })
          .catch(err => console.error(err))
      }, 500);

      let checkLmPhone = _.debounce(function(params, resolve, changeStatus){
        changeStatus(true);
        return LinkmanApi.checkUnique4Phone(params).then(res => {
          changeStatus(false);
          return resolve(res.error ? res.error : null);
        })
          .catch(err => console.error(err))
      }, 500)
      
      const that = this;

      return Object.freeze({
        serialNumber: isAutoSerialNumber ? true : function(value, field, changeStatus){
          let params = {
            id: (that.initData && that.initData.id) || '',
            fieldName: 'serialNumber',
            value
          }

          return new Promise((resolve, reject) => checkCustomerName(params, resolve, changeStatus))
        },
        name: isCustomerNameDuplicate ? true : function(value, field, changeStatus){
          let params = {
            id: (that.initData && that.initData.id) || '',
            fieldName: 'name',
            value
          }

          return new Promise((resolve, reject) => checkCustomerSN(params, resolve, changeStatus))
        },
        lmPhone: !isPhoneUnique ? true : function(value, field, changeStatus){
          let params = {
            customerId: (that.initData && that.initData.id) || '',
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
    /** 自动匹配客户服务团队 */
    async autoAssign(){
      try {
        let adr = this.value.customerAddress;
        let {province, city, dist} = adr;
        if(!province || !city) return this.$platform.alert('请先补全客户地址');

        let result = await CustomerApi.matchTag({province, city, dist});

        if(result.status == 1){
          return platform.notification({
            type: 'error',
            title: '服务部门匹配失败',
            message: result.message
          })
        }

        let tags = result.data || [];
        if(tags.length == 0){
          return this.autoAssignFailNotification();
        }

        this.value.tags = tags.map(item => ({
          id: item.id,
          tagName: item.tagName
        }))

        if(this.value.tags.length <= 0) {
          return this.autoAssignFailNotification();
        }


        this.$emit('input', this.value)
      } catch (error) {
        console.error(error)
      }
    },
    autoAssignFailNotification() {
      platform.notification({
        type: 'error',
        title: '服务部门匹配失败',
        message: '未能按照规则分配成功，请到服务部门中设置负责区域'
      })
    },
    updateAddressBackup(ad) {
      this.addressBackup = ad;
    },
    validate(){
      return this.$refs.form.validate(false);
    }
  },
  components: {
    'customer-tags': {
      name: 'customer-tags',
      mixins: [FormMixin],
      props: {
        field: {
          type: Object,
          default: () => ({})
        },
        value: {
          type: Array,
          default: () => ([])
        }
      },
      render(h) {
        return (
          <div class="input-and-btn">
            <biz-team-select value={this.value} onInput={this.input} multiple />
            <el-button type="button" onClick={this.autoAssign}>自动分配</el-button>
          </div>
        )
      },
      methods: {
        autoAssign() {
          this.$emit('autoAssign');
        },
        input(value) {
          this.$emit('input', {
            field: this.field, 
            newValue: value,
            oldValue: [],
          });
        }
      }
    }
  }
}
</script>
