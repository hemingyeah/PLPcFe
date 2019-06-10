<template>
  <div class="">
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
          <customer-select v-model="value.customer" :field="customerField" :remote-method="searchCustomer" :update-customer="updateCustomer"></customer-select>
        </form-item>
      </template>
      <template slot="serialNumber" slot-scope="{field}">
        <form-item :label="field.displayName" :validation="validation.serialNumber">
          <form-text
            :field="field"
            :value="value.serialNumber" @update="update"
            :placeholder="genPlaceholder(field)"/>
        </form-item>
      </template>

      <!-- start 产品类型 -->
      <template slot="type" slot-scope="{field}">
        <form-item :label="field.displayName" validation>
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
  </div>
</template>CustomerEditView

<script>
import * as FormUtil from '@src/component/form/util';
import FormMixin from '@src/component/form/mixin/form'
import {checkSerialNumber} from '@src/api/ProductApi';
import _ from 'lodash'

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
    }
  },
  computed: {
    customerField() {
      return this.fields.filter(f => f.fieldName === 'customer')[0]
    },
  },
  methods: {
    updateTemplate(value) {
      let nv = null;
      const template = value[0];

      this.fields.forEach(f => {
        nv = f.isSystem ? template[f.fieldName] : template.attribute[f.fieldName];

        if (nv !== null && f.fieldName != 'customer' && f.fieldName != 'template') {
          this.update(({
            field: f,
            newValue: nv
          }))
        }
      });
    },
    buildValidation(){
      // TODO: 产品编号并入到产品表单后 是否从产品表单中取值
      let serialNumberUnique = false;
      try {
        serialNumberUnique = this.fields.filter(f => f.fieldName == 'serialNumber')?.[0]?.setting?.serialNumberUnique || false;
      } catch (error) {
        console.log(error);
      }
      // const serialNumberUnique = this.initData.productConfig.serialNumberUnique;

      let checkSerialNumberFn = _.debounce(function(params, resolve, changeStatus){

        if (!params.serialNumber) return resolve(null) ;

        changeStatus(true);
        return checkSerialNumber(params).then(res => {
          changeStatus(false);
          return resolve(res.error ? res.error : null);
        })
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
    },
    validate() {
      return this.$refs.form.validate()
        .then(valid => {
          return valid
        })
    },
    searchCustomer(params) {
      // params has three properties include keyword、pageSize、pageNum.
      const pms = params || {};

      return this.$http.post('/customer/list', pms)
        .then(res => {
          if (!res || !res.list) return;
          if (res.list) {
            res.list = res.list.map(customer => Object.freeze({
              label: customer.name,
              value: customer.id,
            }))
          }

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
  },
  components: {
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
            remoteMethod={this.remoteMethod}
            onInput={this.updateCustomer}
          />
        )
      }
    }

  }
}
</script>

<style lang="scss">

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

</style>
