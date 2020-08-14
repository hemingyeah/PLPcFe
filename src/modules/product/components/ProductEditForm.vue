<template>
  <div class="product-edit-form">
    <form-builder ref="form" :fields="fields" :value="value" @update="update" >
      <template slot="template" slot-scope="{field}">
        <form-item :label="field.displayName">
          <base-select
            v-model="value.template"
            :remote-method="searchTemplate"
            @input="updateTemplate"
          >

            <div class="product-template-option" slot="option" slot-scope="{option}">
              <h3>{{option.name}}</h3>
              <p>
                <span><label>产品编号：</label><span>{{option.serialNumber}}</span></span>
                <span><label>产品类型：</label><span>{{option.type}}</span></span>
              </p>
            </div>

          </base-select>

        </form-item>
      </template>
      <template slot="customer" slot-scope="{field}" v-if="!customerIsReadonly">
        <form-item :label="field.displayName" validation>
          <customer-select v-model="value.customer" :field="customerField" :remote-method="searchCustomer" :update-customer="updateCustomer" placeholder="请输入关键字搜索客户"></customer-select>
        </form-item>
        <form-item label="联系人" :is-not-null="field.setting.customerOption.linkmanNotNull" v-if="field.setting.customerOption && field.setting.customerOption.linkman">
          <form-customer-select v-model="value.linkman" :field="getField('linkman', customerField)" :remote-method="searchCustomerLinkman" :update-linkman="updateLinkman" @createInfo="createInfo" type="linkman" placeholder="请先选择客户"></form-customer-select>
        </form-item>
        <form-item label="地址" :is-not-null="field.setting.customerOption.addressNotNull" v-if="field.setting.customerOption && field.setting.customerOption.address">
          <form-customer-select-address v-model="value.customerAddress" :field="getField('productAddress', customerField)" :remote-method="searchCustomerAddress" :update-customer-address="updateCustomerAddress" @createInfo="createInfo" type="address" placeholder="请先选择客户"></form-customer-select-address>
        </form-item>
      </template>

      <template slot="serialNumber" slot-scope="{field}">
        <form-item :label="field.displayName">
          <form-text
            :field="field"
            :value="value.serialNumber" @update="update"
            :placeholder="genPlaceholder(field)"/>
        </form-item>
        <span style="color:red;margin:0 0 5px 135px;display:inline-block;" v-if="serialNumberExist">产品编号已存在</span>
      </template>

      <!-- start 产品类型 -->
      <template slot="type" slot-scope="{field}">
        <form-item :label="field.displayName">
          <div class="input-and-btn">
            <form-select
              :field="field" 
              :source="field.setting.dataSource.map(d => {
                return {
                  text: d,
                  value: d
                }
              }) || []"
              v-model="value.type"
              :clearable="false"
              :placeholder="genPlaceholder(field)"/>
          </div>
        </form-item>
      </template>
      <!-- end 产品类型 -->

    </form-builder>
    <edit-contact-dialog ref="EditContactDialog" :customer="customer" @updateLinkman="updateLinkman" />
    <edit-address-dialog ref="EditAddressDialog" :customer-id="customerId" @updateCustomerAddress="updateCustomerAddress" />
    <!-- :default-address="selectedAddress" -->
  </div>
</template>

<script>
import * as FormUtil from '@src/component/form/util';
import FormMixin from '@src/component/form/mixin/form'

// import {searchCustomer} from '@src/api/EcSearchApi.js';
import {checkSerialNumber} from '@src/api/ProductApi';
import _ from 'lodash'

import EditContactDialog from './EditContactDialog.vue';
import EditAddressDialog from './EditAddressDialog.vue'

export default {
  name: 'product-edit-form',
  props: {
    fields: {
      type: Array,
      default: () => ([]),
    },
    value: {
      type: Object,
      required: true
    },
    productId: {
      type: String,
      default: ''
    },
    customerIsReadonly: {
      type: Boolean,
      default: false,
    }
  },
  inject: ['initData'],
  data() {
    return {
      validation: this.buildValidation(),
      template: [],
      serialNumberExist:false
    }
  },
  computed: {
    customerField() {
      return this.fields.filter(f => f.fieldName === 'customer')[0]
    },

    isPhoneUnique() {
      return this.initData.isPhoneUnique || false;
    },
    customer() {
      let customer = (this.value.customer && this.value.customer[0]) || {};
      if(!customer.id && customer.value) {
        customer.id = customer.value;
      }
      return customer || {};
    },
    customerId() {
      return (this.customer && (this.customer.id || this.customer.value)) || '';
    }
  },
  methods: {
    getField(tag, field) {
      let tv = Object.assign({}, field);
      tv.fieldName = tag;
      tv.formType = 'extend';
      tv.displayName = tag == 'linkman' ? '联系人' : '地址';
      tv.isNull = tag == 'linkman' ? !tv.setting.customerOption.linkmanNotNull : !tv.setting.customerOption.addressNotNull

      return tv;
    },
    updateTemplate(value) {
      let nv = null;
      const template = value[0];

      this.fields.forEach(f => {
        nv = f.isSystem ? template[f.fieldName] : template.attribute[f.fieldName];

        if (f.formType === 'address') {
          console.log(nv)
        }

        if (!!nv && f.fieldName != 'customer' && f.fieldName != 'template') {
          this.update(({
            field: f,
            newValue: nv
          }))
        }
      });
    },
    buildValidation(){
      const serialNumberUnique = this.initData.productConfig.serialNumberUnique;

      let checkSerialNumberFn = _.debounce(function(params, resolve, changeStatus){

        if (!params.serialNumber) return resolve(null) ;

        changeStatus(true);
        return checkSerialNumber(params).then(res => {
          changeStatus(false);
          return resolve(res.error ? res.error : null);
        })
          .catch(err => console.error(err))
      }, 500)

      const that = this;

      return Object.freeze({

        serialNumber: !serialNumberUnique ? true : function(value, field, changeStatus){
          let params = {
            id: that.productId || '',
            serialNumber: value
          }

          return new Promise((resolve, reject) => checkSerialNumberFn(params, resolve, changeStatus))
        }
      });
    },

    genPlaceholder(field){
      return FormUtil.genPlaceholder(field)
    },

    update({field, newValue, oldValue}){
      let {fieldName, displayName} = field;
      if (this.$appConfig.debug) {
        console.info(`[FormBuilder] ${displayName}(${fieldName}) : ${JSON.stringify(newValue)}`);
      }
      if(fieldName==='serialNumber'){
        if(newValue){
          this.$http.post(`/customer/product/checkUniqueForSerialNumber`,{id:this.productId,serialNumber:newValue},false).then(res=>{
            if(res.hasOwnProperty('ok')){
              this.serialNumberExist=false;
            }else{
              this.serialNumberExist=true;
            }
          })
        }else{
          this.serialNumberExist=false;
        }
      }
      let value = this.value;

      this.$set(value, fieldName, newValue);
      this.$emit('input', value);
    },
    updateCustomer(value) {
      const cf = this.fields.filter(f => f.fieldName === 'customer')[0];
      this.update({
        field: cf,
        newValue: value
      })
      this.fetchCustomer(value);
    },
    updateLinkman(value) {      
      let field = {
        fieldName: 'linkman',
        displayName: '联系人'
      }
      this.update({
        field,
        newValue: value
      })
      this.fetchLinkmanAddress(value);
    },
    updateCustomerAddress(value) {
      let field = {
        fieldName: 'customerAddress',
        displayName: '地址'
      }
      this.update({
        field,
        newValue: value
      })
    },
    clearLinkman() {
      let field = {
        fieldName: 'linkman',
        displayName: '联系人'
      }
      this.update({
        field,
        newValue: []
      })
    },
    clearCustomerAddress() {
      let field = {
        fieldName: 'customerAddress',
        displayName: '地址'
      }
      this.update({
        field,
        newValue: []
      })
    },
    validate() {
      return this.$refs.form.validate()
        .then(valid => {
          return valid
        })
        .catch(err => console.error(err))
    },
    searchCustomer(params) {
      // params has three properties include keyword、pageSize、pageNum.
      const pms = params || {};

      return this.$http.post('/customer/list', pms)
        .then(res => {
          if (!res || !res.list) return;
          if (res.list) {
            res.list = res.list.map(customer => Object.freeze({
              id: customer.id,
              label: customer.name,
              value: customer.id,
              lmPhone: customer.lmPhone,
              lmName: customer.lmName,
              serialNumber: customer.serialNumber,
              customerAddress: customer.customerAddress
            }))
          }

          return res;
        })
        .catch(e => console.error(e));
    },
    fetchCustomer(params) {
      const pms = {
        customerId: params[0].id,
        notNull: true,
        productId: ''
      };
      
      this.clearLinkman();
      this.clearCustomerAddress();
      return this.$http.get('/task/defaultInfo', pms)
        .then(res => {
          if (!res) return;
          let linkman = [
            {
              label: res.linkman.name,
              value: res.linkman.id,
              phone: res.linkman.phone
            }
          ]
          this.updateLinkman(linkman);

          let address = [
            {
              label: res.address && ((res.address.province || '') + (res.address.city || '') + (res.address.dist || '') + (res.address.address || '')),
              value: res.address && res.address.id
            }
          ]
          res.address ? this.updateCustomerAddress(address) : '';

          return res;
        })
        .catch(e => console.error(e));
    },
    fetchLinkmanAddress(value) {
      let linkman = value[0];
      if (!linkman) return;
      const pms = {
        lmId: linkman.value
      };
      this.clearCustomerAddress();
      return this.$http.get('/task/getLmBindAddress', pms)
        .then(res => {
          if (!res) return;
          let address = [
            {
              label: res.data && `${res.data.province || ''}${res.data.city || ''}${res.data.dist || ''}${res.data.address || ''}`,
              value: res.data && res.data.id
            }
          ]
          res.data && res.data.id ? this.updateCustomerAddress(address) : '';
          return res;
        })
        .catch(e => console.error(e));
    },
    searchTemplate(params) {
      // params has three properties include keyword、pageSize、pageNum.
      const pms = params || {};

      return this.$http.post('/product/list/data', pms)
        .then(res => {
          if (!res || !res.list) return;
          if (res.list) {
            res.list = res.list.map(template => Object.freeze({
              label: template.name,
              value: template.id,
              ...template
            }))
          }

          return res;
        })
        .catch(e => console.error(e));
    },
    searchCustomerLinkman (params) {
      if(!this.value.customer.length) {
        return new Promise((resolve, reject) => {
          resolve(null)
        })
      }

      const pms = params || {};
      let customer = this.value.customer[0];
      pms.customerId = customer.value;

      return this.$http.get('/customer/linkman/list', pms)
        .then(res => {
          if (!res || !res.list) return;
          if (res.list) {
            res.list = res.list.map(linkman => Object.freeze({
              label: linkman.name,
              value: linkman.id,
              phone: linkman.phone
            }))
          }

          return res;
        })
        .catch(e => console.error(e));
    },
    searchCustomerAddress (params) {
      if(!this.value.customer.length) {
        return new Promise((resolve, reject) => {
          resolve(null)
        })
      }

      const pms = params || {};
      let customer = this.value.customer[0];
      let linkman = this.value.linkman[0];
      pms.customerId = customer.value;
      // pms.linkmanId = linkman.value;

      return this.$http.get('/product/address', pms)
        .then(res => {
          if (!res || !res.data) return;
          if (res.data.list) {
            res.data.list = res.data.list.map(address => Object.freeze({
              label: `${ address.province } ${ address.city } ${ address.dist } ${ address.address }`,
              value: address.id,
            }))
          }

          return res.data;
        })
        .catch(e => console.error(e));
    },
    createInfo(type) {
      if(!this.value.customer.length) {
        this.$platform.alert('请先选择客户');
        return;
      }
      if(type == 'linkman') this.$refs.EditContactDialog.openDialog();
      if(type == 'address') this.$refs.EditAddressDialog.openDialog();
    }
  },
  components: {
    [EditContactDialog.name]: EditContactDialog,
    [EditAddressDialog.name]: EditAddressDialog,

    'customer-select': {
      name: 'customer-select',
      mixins: [FormMixin],
      props: {
        value: {
          type: Array,
          default: () => []
        },
        remoteMethod: Function,
        updateCustomer: Function,
        placeholder: String,
      },
      methods: {
        input(value){
          this.$emit('input', value)
        },
      },
      
      render(h){

        return (
          <base-select
            value={this.value}
            placeholder={this.placeholder}
            remoteMethod={this.remoteMethod}
            onInput={this.updateCustomer}

            {...{
              scopedSlots: {
                option: props => {
                  return (
                    <div class="customer-item">
                      <h3>{props.option.label}</h3>
                      <p>
                        <span><label>电话：</label><span>{props.option.lmPhone}</span></span>
                        <span><label>编号：</label><span>{props.option.serialNumber}</span></span>
                        <span><label>联系人：</label><span>{props.option.lmName}</span></span>
                      </p>
                    </div>
                  );
                }
              }
            }}
          >
          </base-select>
        )
      }
    },

    'form-customer-select': {
      name: 'form-customer-select',
      mixins: [FormMixin],
      inject: ['initData'],
      props: {
        value: {
          type: Array,
          default: () => []
        },
        remoteMethod: Function,
        updateLinkman: Function,
        placeholder: String,
        type: String,
      },
      computed: {
        auth() {          
          return this.initData?.loginUser?.authorities || this.initData?.authorities;
        },
        createdPermission() {
          return this.auth.CUSTOMER_CREATE == 3;
        }
      },
      methods: {
        input(value){
          this.$emit('input', value)
        },

        createInfo(type, event) {
          this.$emit('createInfo', type);
        },

        renderBtn() {
          if(!this.createdPermission) return null;
          return (
            <el-button type="button" onClick={e => this.createInfo(this.type, e)} class="action-btn margin-left-10">新建</el-button>
          )
        }
      },
      render(h){        
        return (
          <div class="form-customer-select">
            <base-select
              value={this.value}
              placeholder={this.placeholder}
              remoteMethod={this.remoteMethod}
              onInput={this.updateLinkman}
              clearable

              {...{
                scopedSlots: {
                  label: props => {
                    let value = props.value || [];
                    let linkman = value[0] || {};
                    let nameAndPhone = `${linkman.label || ''} ${linkman.phone || ''}`
                    return (
                      <span>{ nameAndPhone }</span>
                    )
                  },
                  option: props => {
                    return (
                      <p class="customer-linkman">
                        <span><label>姓名：</label><span>{props.option.label}</span></span>
                        <span><label>电话：</label><span>{props.option.phone}</span></span>
                      </p>
                    );
                  }
                }
              }}
            />
            { this.renderBtn(h) }
          </div>
        )
      }
    },

    'form-customer-select-address': {
      name: 'form-customer-select-address',
      mixins: [FormMixin],
      inject: ['initData'],
      props: {
        value: {
          type: Array,
          default: () => []
        },
        remoteMethod: Function,
        updateCustomerAddress: Function,
        placeholder: String,
        type: String
      },
      computed: {
        auth() {          
          return this.initData?.loginUser?.authorities || this.initData?.authorities;
        },

        createdPermission() {
          return this.auth.CUSTOMER_CREATE == 3;
        },
      },
      methods: {
        input(value){
          this.$emit('input', value)
        },

        createInfo(type, event) {
          this.$emit('createInfo', type);
        },

        renderBtn() {
          if(!this.createdPermission) return null;
          return (
            <el-button type="button" onClick={e => this.createInfo(this.type, e)} class="action-btn margin-left-10">新建</el-button>
          )
        }
      },
      render(h){
        return (
          <div class="form-customer-select">
            <base-select
              value={this.value}
              placeholder={this.placeholder}
              remoteMethod={this.remoteMethod}
              onInput={this.updateCustomerAddress}
              clearable
            />
            { this.renderBtn(h) }
          </div>
        )
      }
    }

  }
}
</script>

<style lang="scss">
  .margin-left-10{
    margin-left: 10px;
  }
  .product-template-option {
    * {
      margin: 0;
    }
    padding: 10px 0;
    h3 {
      font-size: 14px;
      font-weight: 500;
      line-height: 24px;
    }


    p {
      display: flex;
      justify-content: space-between;
      line-height: 24px;

      &>span {
        width: 50%;
        display: flex;
        justify-content: flex-start;
        font-size: 12px;
        color: #666666;
        padding-right: 10px;

        &>label {
          padding: 0;
          width: 70px;
        }
        &>span {
          @include text-ellipsis();
        }
      }
    }
  }

  .form-item-control {
    .form-customer-select {
      display: flex;

      .base-select-container {
        flex: 1;
      }

      .btn {
        width: 60px;
        height: 32px;
        line-height: 22px;
      }
    }
  }

  .base-modal-body {
    .form-builder {
      width: 540px;
    }
  }

  .customer-item {
    h3 {
      font-size: 14px;
      margin: 0;
      padding-left: 10px;
    }

    p {
      display: flex;
      margin: 0;

      span {
        label {
          display: inline-block;
          width: auto;
        }

        span {
          margin-right: 10px;
        }
      }
    }
  }

  .customer-linkman {
    display: flex;
    margin: 0;

    span {
      label {
        display: inline-block;
        width: auto;
      }

      span {
        margin-right: 10px;
      }
    }
  }

</style>
