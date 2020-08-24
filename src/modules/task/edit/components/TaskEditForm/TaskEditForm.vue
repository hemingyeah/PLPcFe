<template>
  <div v-loading.fullscreen.lock="loading">
    <form-builder ref="form" :fields="taskFields" :value="taskValue" @update="update">

      <template slot="taskNo" slot-scope="{ field, value }">

        <!-- start 工单编号 -->
        <form-item :label="field.displayName" :validation="false">
          <div class="form-taskNo">{{ value || "工单编号将在创建后由系统生成" }}</div>
        </form-item>
        <!-- end 工单编号 -->

        <!-- start 工单类型 -->
        <form-item label="工单类型" :validation="false">
          <form-select v-if="!value" :field="field" :source="taskTypes" :value="selectedType.value" :clearable="false" @input="chooseTemplate"/>
          <div class="form-taskNo" v-else>{{ taskValue.templateName }}</div>
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
              :value="value.customer"
              :field="customerField"
              :remote-method="searchCustomer"
              @input="updateCustomer"
              placeholder="请输入关键字搜索客户"
              :disabled="isCreateCustomer">
            </biz-form-remote-select>
            <el-button @click="dialogOpen('customer')" v-if="!isCreateCustomer">新建</el-button>
          </div>
        </form-item>
        <!-- end 客户 -->

        <!-- start 联系人 -->
        <form-item v-if="customerOption.linkman" label="联系人">
          <div class="input-and-btn">
            <biz-form-remote-select
              ref="linkman"
              v-model="value.linkman"
              :remote-method="searchLinkmanOuterHandler"
              @input="updateLinkman(value.linkman[0])"
              placeholder="请输入关键字搜索联系人"
              :disabled="isCreateCustomer"
            >
            </biz-form-remote-select>
            <el-button @click="dialogOpen('contact')" v-if="!isCreateCustomer">新建</el-button>
          </div>
        </form-item>
        <!-- end 联系人 -->

        <!-- start 地址 -->
        <form-item v-if="customerOption.address" label="地址">
          <div class="input-and-btn">
            <biz-form-remote-select
              v-model="value.address"
              :remote-method="searchAddressOuterHandler"
              placeholder="请输入关键字搜索地址">
            </biz-form-remote-select>
            <el-button @click="dialogOpen('address')" v-if="!isCreateCustomer">新建</el-button>
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
              :remote-method="searchProductOuterHandler"
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
            <el-button @click="dialogOpen('product')">新建</el-button>
          </div>
        </form-item>
        <!-- start 产品 -->

      </template>
      <!-- end 客户字段 -->

    </form-builder>

    <!-- start 新建客户弹窗 -->
    <base-modal title="新建客户" :show.sync="addCustomerDialog" class="add-dialog-container" width="800px" @closed="dislogClose('customer')">
      <div id="createCustomerView"></div>
      <div class="dialog-footer" slot="footer">
        <el-button @click="addCustomerDialog = false">关闭</el-button>
        <el-button type="primary" @click="addCustomerSubmit">保存</el-button>
      </div>
    </base-modal>
    <!-- end 新建客户弹窗 -->

    <!-- start 新建产品弹窗 -->
    <base-modal title="新建产品" :show.sync="addProductDialog" class="add-dialog-container" width="800px" @closed="dislogClose('product')">
      <div id="createProductView"></div>
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
import TaskEditForm from './TaskEditForm';
export default TaskEditForm;
</script>

<style lang="scss">
  @import './TaskEditForm.scss';
</style>
