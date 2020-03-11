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
            @input="updateCustomer"
            placeholder="请输入关键字搜索客户">
          </biz-form-remote-select>
        </form-item>
        <!-- end 客户 -->

        <!-- start 联系人 -->
        <form-item v-if="customerOption.linkman" label="联系人">
          <biz-form-remote-select
            v-model="value.linkman"
            :remote-method="searchLinkman"
            placeholder="请输入关键字搜索联系人">
          </biz-form-remote-select>
        </form-item>
        <!-- end 联系人 -->

        <!-- start 地址 -->
        <form-item v-if="customerOption.address" label="地址">
          <biz-form-remote-select
            v-model="value.address"
            :remote-method="searchAddress"
            placeholder="请输入关键字搜索地址">
          </biz-form-remote-select>
        </form-item>
        <!-- start 地址 -->

        <!-- start 产品 -->
        <form-item v-if="customerOption.product" label="产品">
          <biz-form-remote-select
            :field="productField"
            v-model="value.product"
            :remote-method="searchProduct"
            @input="updateProduct"
            placeholder="请输入关键字搜索产品">
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
          </biz-form-remote-select>
        </form-item>
        <!-- start 产品 -->
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
    selectedCustomer(){
      return (this.value.customer && this.value.customer[0]) || {};
    },
    productField(){
      return {
        displayName: '产品',
        fieldName: 'product',
        formType: 'select',
        isNull: this.customerOption.productNotNull ? 0 : 1
      }
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

      try {
        const result = await TaskApi.getTaskDefaultInfo({ customerId: value[0].value });

        let { linkman, address } = result;

        this.$set(this.value, 'linkman', [{
          value: linkman.id,
          label: linkman.name + linkman.phone,
          ...linkman
        }]);

        this.$set(this.value, 'address', [{
          value: address.id,
          label: address.province + address.city + address.dist + address.address,
          ...address
        }]);
        
      } catch (error) {
        console.log('task-edit-form: updateCustomer -> error', error);
      }

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

        if (!result || !result.list) return;

        result.list = result.list.map(customer =>
          Object.freeze({
            label: customer.name,
            value: customer.id
          })
        )

        return result;

      } catch (error) {
        console.error(error);
      }
    },
    async searchLinkman(params) {
      const pms = params || {};
      pms.customerId = this.selectedCustomer.value;

      try {
        const data = await TaskApi.getTaskCustomerLinkman(pms);
        
        let result = data.result;
        
        if (!result || !result.list) return;

        result.list = result.list.map(linkman =>
          Object.freeze({
            label: linkman.name + linkman.phone,
            value: linkman.id,
            ...linkman
          })
        );
        
        return result;  

      } catch (error) {
        console.log('task-edit-form: searchProduct -> error', error);
      }

    },
    async searchAddress(params) {
      const pms = params || {};
      pms.customerId = this.selectedCustomer.value;

      try {
        const result = await TaskApi.getTaskCustomerAddress(pms);

        if (!result || !result.data) return;

        result.list = result.data.map(address =>
          Object.freeze({
            label: address.province + address.city + address.dist + address.address,
            value: address.id,
            ...address
          })
        );
        
        return result;  

      } catch (error) {
        console.log('task-edit-form: searchAddress -> error', error)
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
    updateProduct(value) {

      // 查询产品关联字段
      let forRelation = {
        module: 'product',
        id: value[0].value
      }

      this.$eventBus.$emit('es.Relation.Product', forRelation);
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
