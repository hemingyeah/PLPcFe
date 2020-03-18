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
          <div class="input-and-btn">
            <biz-form-remote-select
              v-model="value.customer"
              :field="customerField"
              :remote-method="searchCustomer"
              @input="updateCustomer"
              placeholder="请输入关键字搜索客户"
              :disabled="isCreateCustomer">
            </biz-form-remote-select>
            <el-button @click="openDialog('customer')" v-if="!isCreateCustomer">新建</el-button>
          </div>
        </form-item>
        <!-- end 客户 -->

        <!-- start 联系人 -->
        <form-item v-if="customerOption.linkman" label="联系人">
          <div class="input-and-btn">
            <biz-form-remote-select
              v-model="value.linkman"
              :remote-method="searchLinkman"
              @input="updateLinkman(value.linkman[0])"
              placeholder="请输入关键字搜索联系人"
              :disabled="isCreateCustomer">
            </biz-form-remote-select>
            <el-button @click="openDialog('contact')" v-if="!isCreateCustomer">新建</el-button>
          </div>
        </form-item>
        <!-- end 联系人 -->

        <!-- start 地址 -->
        <form-item v-if="customerOption.address" label="地址">
          <div class="input-and-btn">
            <biz-form-remote-select
              v-model="value.address"
              :remote-method="searchAddress"
              placeholder="请输入关键字搜索地址">
            </biz-form-remote-select>
            <el-button @click="openDialog('address')" v-if="!isCreateCustomer">新建</el-button>
          </div>
        </form-item>
        <!-- start 地址 -->

        <!-- start 产品 -->
        <form-item v-if="customerOption.product" label="产品">
          <div class="input-and-btn">
            <biz-form-remote-select
              ref="product"
              :field="productField"
              v-model="value.product"
              :remote-method="searchProduct"
              @input="updateProduct"
              placeholder="请输入关键字搜索产品"
              multiple>
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
            <el-button @click="openDialog('product')">新建</el-button>
          </div>
        </form-item>
        <!-- start 产品 -->
      </template>
      <!-- end 客户字段 -->

    </form-builder>

    <!-- start 新建客户弹窗 -->
    <base-modal title="新建客户" :show.sync="addCustomerDialog" class="add-dialog-container" width="800px" v-if="addCustomerDialog">
      <div id="createCustomerView">
        <customer-edit-view ref="CustomerCreateView" :remote-init-data="customerInitData"></customer-edit-view>
        <div class="dialog-footer" slot="footer">
          <el-button @click="addCustomerDialog = false">关闭</el-button>
          <el-button type="primary" @click="addCustomerSubmit">保存</el-button>
        </div>
      </div>
    </base-modal>
    <!-- end 新建客户弹窗 -->

    <!-- start 新建产品弹窗 -->
    <base-modal title="新建产品" :show.sync="addProductDialog" class="add-dialog-container" width="800px" v-if="addProductDialog">
      <product-edit ref="ProductCreateView" :remote-init-data="productInitData"></product-edit>
      <div class="dialog-footer" slot="footer">
        <el-button @click="addProductDialog = false">关闭</el-button>
        <el-button type="primary" @click="addProductSubmit">保存</el-button>
      </div>
    </base-modal>
    <!-- end 新建产品弹窗 -->

    <edit-contact-dialog ref="EditContactDialog" :customer="selectedCustomer" :is-phone-unique="customerInitData.isPhoneUnique"/>
    <edit-address-dialog ref="EditAddressDialog" :customer-id="selectedCustomer.id" :default-address="customerInitData.customerAddress"/>
  </div>
</template>

<script>
/* api */
import * as TaskApi from '@src/api/TaskApi';
/* util */
import _ from 'lodash';
import * as FormUtil from '@src/component/form/util';
import { findComponentDownward } from '@src/util/assist';

import CustomerEditView from '@src/modules/customer/editForModal/CustomerEditView.vue';
import EditAddressDialog from '@src/modules/customer/view/operationDialog/EditAddressDialog.vue';
import EditContactDialog from '@src/modules/customer/view/operationDialog/EditContactDialog.vue';
import EditModal from '@src/modules/product/EditModal.vue';

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
      isCreateCustomer: false,
      addCustomerDialog: false,
      addProductDialog: false,
      selectedType: {},
      taskFields: [],
      taskValue: {},
      taskType: '',
      customerInitData: {},
      productInitData: {}
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
    }
  },
  mounted () {
    this.taskFields = this.fields;
    this.taskValue = this.value;
    this.selectedType = this.taskTypes[0] || {};

    // 获取客户、产品数据
    this.getCustomerData();
    this.getProductData();

    this.$eventBus.$on('task_create_or_edit.update_linkman', this.updateLinkman);
    this.$eventBus.$on('task_create_or_edit.update_address', this.bindAddress);
  },
  beforeDestroy() {
    this.$eventBus.$off('task_create_or_edit.update_linkman', this.updateLinkman);
    this.$eventBus.$off('task_create_or_edit.update_address', this.bindAddress);
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
            value: customer.id,
            ...customer
          })
        )

        return result;

      } catch (error) {
        console.error(error);
      }
    },
    async updateCustomer(value = []) {

      try {
        const result = await TaskApi.getTaskDefaultInfo({ customerId: value[0].value });

        let { linkman, address } = result;

        // 重置联系人和地址
        this.$set(this.value, 'linkman', []);
        this.$set(this.value, 'address', []);

        // 绑定联系人和地址
        linkman && this.bindLinkman(linkman);
        address && this.bindAddress(address);

        if (this.value.product && this.value.product.length) {
          this.value.product = this.value.product.filter(item => item.customerId == value[0].value);
        }

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
    async updateLinkman(linkman) {
      this.bindLinkman(linkman);

      try {
        const result = await TaskApi.getLmBindAddress({ lmId: linkman.id });

        // 如果存在地址信息则绑定地址
        result.data.id && this.bindAddress(result.data);

      } catch (error) {
        console.log('task-edit-form: updateLinkmanByCreate -> error', error);
      }

    },
    bindLinkman(linkman) {
      this.$set(this.value, 'linkman', [{
        value: linkman.id,
        label: linkman.name + linkman.phone,
        ...linkman
      }]);
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
    bindAddress(address) {
      this.$set(this.value, 'address', [{
        value: address.id,
        label: address.province + address.city + address.dist + address.address,
        ...address
      }]);
    },
    async searchProduct(params) {
      const pms = params || {};
      pms.customerId = this.selectedCustomer.value;

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

      try {
        // 判断客户是否存在
        if (!this.value.customer || !this.value.customer.length) {
          // 客户不存在时则下拉框隐藏
          findComponentDownward(this.$refs.product, 'base-select').close();
          const result = await TaskApi.getCustomerByProduct({ id: value[value.length - 1].value });

          const customerData = [{
            label: result.customerName,
            value: result.customerId
          }];

          this.$set(this.value, 'customer', customerData);
          this.updateCustomer(customerData);
        }

        // 查询产品关联字段, 选一个产品才带入
        if (value.length === 1) {
          let forRelation = {
            module: 'product',
            id: value[0].value
          }

          this.$eventBus.$emit('es.Relation.Product', forRelation);
        } else {
          // 清空产品关联字段数据
          this.$eventBus.$emit('es.Relation.Product', {});
        }

      } catch (error) {
        console.log('task-edit-form: updateProduct -> error', error);
      }
    },
    async getCustomerData () {
      try {
        const result = await TaskApi.getCreateCustomerData();

        this.customerInitData = result.data;

      } catch (error) {
        console.error(error);
      }
    },
    async getProductData() {
      try {
        const result = await TaskApi.getCreateProductData();

        this.productInitData = result.data;

      } catch (error) {
        console.error(error);
      }
    },
    addCustomerSubmit() {
      this.$refs.CustomerCreateView.submit(data => {
        this.isCreateCustomer = true;
        
        // 绑定客户
        this.$set(this.value, 'customer', [{
          label: data.name,
          value: data.id
        }]);

        // 绑定联系人
        this.bindLinkman({
          id: data.lmId,
          name: data.lmName,
          phone: data.lmPhone
        })

        // 绑定地址
        data.addressId && this.bindAddress({
          id: data.addressId,
          country: data.country,
          province: data.province,
          city: data.city,
          dist: data.dist,
          address: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
        })

        this.addCustomerDialog = false;

      });
    },
    addProductSubmit() {
      this.$refs.ProductCreateView.submit(this.value.customer[0], data => {

        this.$set(this.value, 'product', [{
          value: data.productId,
          label: data.productName,
          id: data.productId,
          name: data.productName,
          ...data
        }])

        this.addProductDialog = false;

      });
    },
    openDialog(action) {
      if (!this.selectedCustomer.id && action != 'customer') {
        this.$platform.alert('请先选择客户');
        return;
      }
      if (action === 'address') {
        this.$refs.EditAddressDialog.openDialog();
      } else if (action === 'contact') {
        this.$refs.EditContactDialog.openDialog();
      } else if (action === 'customer') {
        this.addCustomerDialog = true;
      } else if (action === 'product') {
        this.addProductDialog = true;
      }
    }
  },
  components: {
    [CustomerEditView.name]: CustomerEditView,
    [EditAddressDialog.name]: EditAddressDialog,
    [EditContactDialog.name]: EditContactDialog,
    [EditModal.name]: EditModal
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

.add-dialog-container {
  .base-modal-body {
    height: 580px;

    .customer-modal-container {
      .form-builder {
        width: 100%;
      }
    }
  }

  .base-modal-footer {
    border-top: 1px solid #f4f4f4;
    padding: 6px;

    .dialog-footer {
      text-align: right;
    }
  }
}
</style>
