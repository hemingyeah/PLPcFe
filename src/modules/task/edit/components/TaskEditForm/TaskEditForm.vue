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
          <form-select v-if="judegeSelectTaskType(value)" :field="field" :source="taskTypes" :value="selectedType.value" :clearable="false" @input="chooseTemplate"/>
          <div class="form-taskNo" v-else>{{ taskValue.templateName }}</div>
        </form-item>
        <!-- end 工单类型 -->
        
      </template>
      
      <!-- start 计划时间 -->
      <template slot="planTime" slot-scope="{ field, value }">
        <form-item :label="field.displayName" :validation="validation.planTime">
          <form-plantime :picker-options="isVilidatePlantime ? planTimeDatePickerOptions : {}" :field="field" :value="value" @update="update"></form-plantime>
          
          <!-- start 通知客户 checkbox -->
          <div class="task-notice-customer-block" v-if="isShowNoticeCustomer">
            <el-checkbox :value="value ? value.tick : false" @input="noticeCustomerCheckdChange">同时通知客户</el-checkbox>
            <el-tooltip placement="top" content="勾选后，将会向用户发送短信通知：尊敬的客户您好，{tenant}计划{time}安排{user}联系电话{umobile}为您提供服务，客服电话{phone}。">
              <i class="iconfont icon-info"></i>
            </el-tooltip>
          </div>
          <!-- end 通知客户 checkbox -->
          
        </form-item>
      </template>
      <!-- end 计划时间 -->
      
      <!-- start 客户字段 -->
      <template slot="customer" slot-scope="{ field }">
        
        <!-- start 客户 -->
        <form-item :label="field.displayName">
          <div class="input-and-btn">
            <biz-remote-select
              :value="value.customer"
              :field="customerField"
              :remote-method="searchCustomer"
              @input="updateCustomer"
              placeholder="请输入关键字搜索客户"
              :input-disabled="isCreateCustomer"
              :computed-width-keys="['name']"
            >
              <div class="customer-template-option" slot="option" slot-scope="{ option }">
                <h3>{{ option.name }}</h3>
                <p>
                  <span>
                    <label>电话：</label>
                    <span>{{ option.lmPhone }}</span>
                  </span>
                  <span>
                    <label>编号：</label>
                    <span>{{ option.serialNumber }}</span>
                  </span>
                </p>
              </div>
            </biz-remote-select>
            <el-button @click="dialogOpen('customer')" v-if="!isCreateCustomer">新建</el-button>
          </div>
          
          <el-tooltip v-if="isShowCustomerRelevanceTaskCountButton" placement="top">
            <div slot="content" v-html="`未完成工单：${customerRelevanceTaskCountData.unfinished} </br> 全部工单：${customerRelevanceTaskCountData.all}`"></div>
            <el-button class="task-count-button" @click="openCustomerView">
              {{ `${customerRelevanceTaskCountData.unfinished}/${customerRelevanceTaskCountData.all}` }}
            </el-button>
          </el-tooltip>
        
        </form-item>
        <!-- end 客户 -->
        
        <!-- start 联系人 -->
        <form-item v-if="customerOption.linkman" label="联系人">
          <div class="input-and-btn">
            <biz-remote-select
              ref="linkman"
              placeholder="请输入关键字搜索联系人"
              v-model="value.linkman"
              :cleared="true"
              :remote-method="searchLinkmanOuterHandler"
              :input-disabled="isCreateCustomer"
              @input="updateLinkman(value.linkman[0])"
              :computed-width-keys="['name']"
            >
            </biz-remote-select>
            <el-button @click="dialogOpen('contact')" v-if="!isCreateCustomer">新建</el-button>
          </div>
        </form-item>
        <!-- end 联系人 -->
        
        <!-- start 地址 -->
        <form-item v-if="customerOption.address" label="地址">
          <div class="input-and-btn">
            <biz-remote-select
              v-model="value.address"
              placeholder="请输入关键字搜索地址"
              :cleared="true"
              :remote-method="searchAddressOuterHandler"
              :computed-width-keys="['address']"
            >
            </biz-remote-select>
            <el-button @click="dialogOpen('address')" v-if="!isCreateCustomer">新建</el-button>
          </div>
        </form-item>
        <!-- end 地址 -->
        
        <!-- start 产品 -->
        <form-item v-if="customerOption.product" label="产品" :validation="validation.product">
          
          <div class="input-and-btn">
            <biz-remote-select
              ref="product"
              :field="productField"
              v-model="value.product"
              :remote-method="searchProductOuterHandler"
              @input="updateProductForProductSelect"
              placeholder="请输入关键字搜索产品"
              multiple
              :computed-width-keys="['name', 'serialNumber']"
            >
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
                  <span>
                    <label>联系人：</label>
                    <span>{{ option.linkman && option.linkman.name }}</span>
                  </span>
                </p>
                <p>
                  <span>
                    <label>产品地址：</label>
                    <span>{{ option.address | fmt_address }}</span>
                  </span>
                </p>
              </div>
            </biz-remote-select>
            <el-button @click="dialogOpen('product')">新建</el-button>
          </div>
          
          <el-tooltip v-if="isShowProductRelevanceTaskCountButton" placement="top">
            <div slot="content" v-html="`未完成工单：${productRelevanceTaskCountData.unfinished} </br> 全部工单：${productRelevanceTaskCountData.all}`"></div>
            <el-button class="task-count-button" @click="openProductView">
              {{ `${productRelevanceTaskCountData.unfinished}/${productRelevanceTaskCountData.all}` }}
            </el-button>
          </el-tooltip>
          
        </form-item>
        <!-- end 产品 -->
        
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
    
    <!-- start 联系人弹窗 -->
    <edit-contact-dialog ref="EditContactDialog" :customer="convertCustomerOfSelect(selectedCustomer)" :is-phone-unique="customerInitData.isPhoneUnique"/>
    <!-- end 联系人弹窗 -->
    
    <!-- start 地址弹窗 -->
    <edit-address-dialog ref="EditAddressDialog" :customer-id="selectedCustomer.id || selectedCustomer.value" :default-address="customerInitData.customerAddress"/>
    <!-- end 地址弹窗 -->
    
  </div>
</template>

<script>
import TaskEditForm from './TaskEditForm';
export default TaskEditForm;
</script>

<style lang="scss">
  @import './TaskEditForm.scss';
</style>
