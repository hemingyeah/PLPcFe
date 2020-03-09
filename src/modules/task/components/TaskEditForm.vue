<template>
  <div>
    <form-builder ref="form" :fields="taskFields" :value="taskValue" @update="update">

      <template slot="taskNo" slot-scope="{ field, value }">

        <!-- start 工单编号 -->
        <form-item :label="field.displayName" :validation="false">
          <div class="form-taskNo">{{ value || "工单编号将在创建后由系统生成" }}</div>
        </form-item>
        <!-- end 工单编号 -->

        <!-- start 工单类型 -->
        <form-item label="工单类型" :validation="false">
          <form-select :field="field" :source="taskTypes" :value="selectedType.value" :clearable="false" @input="chooseTemplate"/>
        </form-item>
        <!-- end 工单类型 -->

      </template>

      <!-- start 计划时间 -->
      <template slot="planTime" slot-scope="{ field, value }">
        <form-item :label="field.displayName">
          <form-plantime :field="field" :value="value" @update="update"></form-plantime>
        </form-item>
      </template>
      <!-- end 计划时间 -->

      <!-- start 客户字段 -->
      <template slot="customer" slot-scope="{ field }">
        
        <!-- start 客户 -->
        <form-item :label="field.displayName">
          <biz-form-remote-select
            v-model="value.customer"
            :field="customerField"
            :remote-method="searchCustomer"
            :choose="updateCustomer"
            placeholder="请输入关键字搜索客户">
          </biz-form-remote-select>
        </form-item>
        <!-- end 客户 -->

        <!-- start 联系人 -->
        <form-item v-if="customerOption.linkman" label="联系人">
          <form-text :field="field" :value="selectedCustomer.lmName" @update="update" />
        </form-item>
        <!-- end 联系人 -->

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
      <!-- end 客户字段 -->

    </form-builder>
  </div>
</template>

<script>
/* api */
import * as TaskApi from '@src/api/TaskApi';
/* util */
import _ from 'lodash';
import * as FormUtil from '@src/component/form/util';
/* mixin */
import FormMixin from '@src/component/form/mixin/form';

export default {
  name: 'task-edit-form',
  props: {
    fields: {
      type: Array,
      default: () => []
    },
    types:{
      type: Array,
      default: () => []
    },
    value: {
      type: Object,
      required: true,
      default: () => ({})
    },
  },
  data() {
    return {
      selectedType: {},
      taskFields: [],
      taskValue: {},
      taskType: '',
      validation: false, // this.buildValidation(),
    }
  },
  computed: {
    /* 客户字段 */
    customerField() {
      return this.fields.filter(f => f.fieldName === 'customer')[0];
    },
    /* 客户字段配置 */
    customerOption(){
      return (this.customerField.setting && this.customerField.setting.customerOption) || {} ;
    },
    /* 客户地址 */
    customerAddress(){
      const address = (this.selectedCustomer && this.selectedCustomer.customerAddress ) || {};
      return {
        province: address.adProvince,
        city: address.adCity,
        dist: address.adDist,
        address: address.adAddress,
        latitude: address.adLongitude,
        longitude: address.adLatitude,
        addressType: address.addressType
      };
    },
    selectedCustomer(){
      return (this.value.customer && this.value.customer[0]) || {};
    },
    /* 工单类型 */
    taskTypes(){
      return this.types.map(d => {
        return {
          text: d.name,
          value: d.id
        }
      }) || [];
    },
    /* 工单类型对象 */
    taskTypesMap() {
      return _.reduce(this.taskTypes, (result, value) => {
        result[value.value] = value;
        return result;
      }, {})
    },
  },
  mounted () {
    this.taskFields = this.fields;
    this.taskValue = this.value;
    this.selectedType = this.taskTypes[0] || {};
  },
  methods: {
    // TODO: 切换工单类型 数据清除问题
    async chooseTemplate(id) {
      let loading = this.$loading();
      try {
        this.templateId = id
        // 清空表单
        this.$emit('input', {});

        this.taskFields = await TaskApi.getTaskTemplateFields({ templateId: id, tableName: 'task' })
        this.taskValue = FormUtil.initialize(this.fields, this.value);

        this.selectedType = this.taskTypesMap[id];
        this.$emit('updatetemplateId', this.selectedType);
      } catch (error) {
        console.error(error)
      }

      loading.close();
    },
    update({ field, newValue, oldValue }) {
      let { fieldName, displayName } = field;

      if (this.$appConfig.debug) {
        console.info(
          `[FormBuilder] ${displayName}(${fieldName}) : ${JSON.stringify(
            newValue
          )}`
        )
      }

      let value = this.value;
      this.$set(value, fieldName, newValue);
      this.$emit('input', value);
    },
    async updateCustomer(value = []) {
      const customerField = this.customerField;

      this.update({
        field: customerField,
        newValue: value
      });

      // 查询客户关联字段
      let forRelation = {
        module: 'customer',
        id: value[0].value
      };

      this.$eventBus.$emit('es.Relation.Customer', forRelation)
    },
    validate() {
      return this.$refs.form.validate();
    },
    async searchCustomer(params = {}) {

      try {
        const result = await TaskApi.getTaskCustomerList(params);

        if (!result || !result.list) return

        result.list = result.list.map(customer =>
          Object.freeze({
            label: customer.name,
            value: customer.id,
            serialNumber: customer.serialNumber,
            lmName: customer.lmName,
            lmPhone: customer.lmPhone,
            customerAddress: customer.customerAddress
          })
        )

        return result;

      } catch (error) {
        console.error(error)
      }
    },
    async searchProduct(params) {
      const pms = params || {}

      // 这里判断是否有客户信息
      if(this.selectedCustomer && this.selectedCustomer.value){
        pms.customerId = this.selectedCustomer.value;
      }

      try {
        const result = await TaskApi.getTaskCustomerProduct(pms);

        if (!result || !result.list) return;

        result.list = result.list.map(template =>
          Object.freeze({
            label: template.name,
            value: template.id,
            ...template
          })
        );
        
        return result;  

      } catch (error) {
        console.log('task-edit-form: searchProduct -> error', error)
      }

    },
    async updateProduct(value) {
      let nv = null;
      const template = value[0];   
      // 查询产品关联字段
      let forRelation = {
        module: 'product',
        id: value[0].value
      }

      this.$eventBus.$emit('es.Relation.Product', forRelation)
  
      this.fields.forEach(f => {
        nv = f.isSystem ? template[f.fieldName] : template.attribute[f.fieldName];
        if (f.formType === 'address') {
          // console.info('nv:', nv)
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
            scopedSlots={{
              option: slotProps => {
                let option = slotProps.option;
                return (
                  <div>
                    { option.label }
                  </div>
                );
              }
            }}
          >
          </base-select>
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
.input-and-btn .base-select-container{
  flex: 1;
}
</style>
