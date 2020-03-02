<template>
  <div>
    <form-builder ref="form" :fields="task_fields" :value="task_value" @update="update">
      <template slot="taskNo" slot-scope="{ field, value }">
        <form-item :label="field.displayName" :validation="false">
          <div class="form-taskNo">{{ value || "工单编号将在创建后由系统生成" }}</div>
        </form-item>
        <form-item label="工单类型" :validation="false">
          <form-select
            :field="field"
            :source="taskTypes"
            :value="taskType"
            :clearable="false"
            @input="chooseTemplate"
          />
        </form-item>
      </template>
      <!-- 计划时间 -->
      <template slot="planTime" slot-scope="{ field, value }">
        <form-item :label="field.displayName">
          <form-plantime :field="field" :value="value" @update="update"></form-plantime>
        </form-item>
      </template>
      <!-- 客户 -->
      <template slot="customer" slot-scope="{ field }">
        <form-item :label="field.displayName" validation>
          <customer-select
            v-model="value.customer"
            :field="customerField"
            :remote-method="searchCustomer"
            :update-customer="updateCustomer"
            placeholder="请输入关键字搜索客户">
          </customer-select>
        </form-item>
        <form-item v-if="customerOption.linkman" label="联系人">
          <form-text :field="field" :value="selectCustomer.lmName" @update="update" />
        </form-item>
        <form-item v-if="customerOption.address" label="地址">
          <form-address :field="field" :value="customerAddress" @update="update" :task-disable-update="true"/>
        </form-item>
        <form-item v-if="customerOption.product" label="产品">
          <base-select
            v-model="value.template"
            :remote-method="searchProduct"
            @input="updateProduct">
            <div class="product-template-option" slot="option" slot-scope="{ option }">
              <h3>{{ option.name }}</h3>
              <p>
                <span>
                  <label>产品编号：</label>
                  <span>{{ option.serialNumber }}</span>
                </span>
                <span>
                  <label>产品类型：</label>
                  <span>{{ option.type }}</span>
                </span>
              </p>
            </div>
          </base-select>
        </form-item>
      </template>
    </form-builder>
  </div>
</template>

<script>
import * as TaskApi from '@src/api/TaskApi'
import * as FormUtil from '@src/component/form/util'
import FormMixin from '@src/component/form/mixin/form'
import EventBus from '@src/util/eventBus'
import _ from 'lodash'
export default {
  name: 'task-edit-form',
  props: {
    fields: {
      type: Array,
      default: () => []
    },
    value: {
      type: Object,
      required: true
    },
    types:{
      type: Array
    }
  },
  inject: ['initData'],
  data() {
    return {
      validation:false, // this.buildValidation(),
      template:[],
      taskType:'',
      task_fields:[],
      task_value:{}
    }
  },
  mounted () {
    this.task_fields = this.fields;
    this.task_value = this.value;
    this.taskType = this.types[0].name;
  },
  computed: {
    taskTypes(){
      return this.types.map(d => {
        return {
          text: d.name,
          value: d.id
        }
      }) || [];
    },
    customerField() {
      return this.fields.filter(f => f.fieldName === 'customer')[0]
    },
    customerOption(){
      return (this.customerField.setting && this.customerField.setting.customerOption) || {} ;
    },
    selectCustomer(){
      return (this.value.customer && this.value.customer[0]) || {};
    },
    customerAddress(){
      const address = (this.selectCustomer && this.selectCustomer.customerAddress ) || {};
      return {
        province:address.adProvince,
        city:address.adCity,
        dist:address.adDist,
        address:address.adAddress,
        latitude:address.adLongitude,
        longitude:address.adLatitude,
        addressType:address.addressType
      };
    },
  },
  methods: {
    async chooseTemplate(id) {
      let loading = this.$loading()
      try {
        this.templateId = id
        // 清空表单
        this.$emit('input', {})
        this.task_fields = await TaskApi.getTemplateFields(id)
        this.task_value = FormUtil.initialize(this.fields, this.value)    
        this.taskType = this.taskTypes[this.taskTypes.findIndex(item=>item.value == id)].text;
        this.$emit('updatetemplateId', this.taskTypes[this.taskTypes.findIndex(item=>item.value == id)]);
      } catch (error) {
        console.error(error)
      }
      loading.close()
    },

    update({ field, newValue, oldValue }) {
      let { fieldName, displayName } = field
      if (this.$appConfig.debug) {
        console.info(
          `[FormBuilder] ${displayName}(${fieldName}) : ${JSON.stringify(
            newValue
          )}`
        )
      }
      let value = this.value
      this.$set(value, fieldName, newValue)
      this.$emit('input', value)      
    },

    async updateCustomer(value) {
      const cf = this.fields.filter(f => f.fieldName === 'customer')[0]
      console.info('val===', cf, value);
      this.update({
        field: cf,
        newValue: value
      })
      // 查询客户关联字段
      let forRelation = {
        module: 'customer',
        id: value[0].value
      }
      console.info('forRelation: ', forRelation);
      
      EventBus.$emit('es.Relation.Customer', forRelation)
    },

    validate() {
      return this.$refs.form.validate().then(valid => {
        return valid
      })
    },

    async searchCustomer(params) {
      // params has three properties include keyword、pageSize、pageNum.
      const pms = params || {}
      try {
        const res = await this.$http.post('/customer/list', pms)
        if (!res || !res.list) return
        res.list = res.list.map(customer =>
          Object.freeze({
            label: customer.name,
            value: customer.id,
            serialNumber:customer.serialNumber,
            lmName:customer.lmName,
            lmPhone:customer.lmPhone,
            customerAddress:customer.customerAddress
          })
        )
        // console.log('customers : ', res);
        return res
      } catch (error) {
        console.error(error)
      }
    },

    searchProduct(params) {
      // params has three properties include keyword、pageSize、pageNum.
      const pms = params || {}
      // 这里判断是否有客户信息
      console.info(this.selectCustomer);
      if(this.selectCustomer && this.selectCustomer.value){
        pms.customerId = this.selectCustomer.value;
      }
      return this.$http
        .post('/product/list/data', pms)
        .then(res => {
          if (!res || !res.list) return
          res.list = res.list.map(template =>
            Object.freeze({
              label: template.name,
              value: template.id,
              ...template
            })
          )
          // console.info('product list:', res);          
          return res
        })
        .catch(e => console.error(e))
    },
    
    async updateProduct(value) {
      let nv = null;
      const template = value[0];
      console.info(template);     
      // 查询产品关联字段
      let forRelation = {
        module: 'product',
        id: value[0].value
      }
      console.info('forRelation: ', forRelation);
      EventBus.$emit('es.Relation.Product', forRelation)

      // 获取产品明细
      // let res = await getProductDetail({id: template.id});
      // console.log('product res:', res);
      
      // 产品说明信息 field_8pBY7AYs6W4axVzK
      // 产品多行文本 field_hQ47BtvO7WFKDA7y
      // 地址关联 field_AC7SqxMQEfVOP2G7
      // 产品类型 field_BgW8LzfV3yeDnlj7
      // 产品编号 field_JwYLcnHcAS9Z4lbY
    
      this.fields.forEach(f => {
        nv = f.isSystem ? template[f.fieldName] : template.attribute[f.fieldName];
        if (f.formType === 'address') {
          console.info('nv:', nv)
        }
        if (!!nv && f.fieldName != 'customer' && f.fieldName != 'template') { 
          this.update(({
            field: f,
            newValue: nv
          }))
        }
      });
    }
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
        placeholder: String
      },
      methods: {
        input(value) {
          this.$emit('input', value)
        }
      },
      render(h) {
        return (
          <base-select
            value={this.value}
            placeholder={this.placeholder}
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

    & > span {
      width: 50%;
      display: flex;
      justify-content: flex-start;
      font-size: 12px;
      color: #666666;
      padding-right: 10px;

      & > label {
        padding: 0;
        width: 70px;
      }
      & > span {
        @include text-ellipsis();
      }
    }
  }
}
</style>
