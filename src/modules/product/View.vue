<template>
  <div class="product-view-container">
    <div class="product-tool-bar">
      <div class="product-toolbar-left" v-if="allowBack || !isDelete">
        <button type="button" class="btn btn-text" @click="goBack" v-if="allowBack"><i class="iconfont icon-arrow-left"></i> 返回</button>
        <template>
          <button type="button" class="btn btn-text" @click="editProduct" v-if="allowEditCustomer"><i class="iconfont icon-edit"></i> 编辑</button>
          <button type="button" class="btn btn-text" @click="deleteProduct" v-if="allowDeleteCustomer"><i class="iconfont icon-yemianshanchu"></i> 删除</button>
          <button type="button" class="btn btn-text" @click="openRemindDialog('remind')"><i class="iconfont icon-notification"></i> 添加提醒</button>
        </template>
      </div>
      <div class="product-toolbar-right action-btn" v-if="!isDelete">
        <el-dropdown trigger="click" v-if="allowCreateTask">
          <span class="el-dropdown-link el-dropdown-btn">
            <i class="iconfont icon-add"></i>工单
          </span>

          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-for="type in taskTypes" :key="type.id">
              <a class="link-of-dropdown" href="javascript:;" @click.prevent="createTask(type.id)">{{type.name}}</a>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>

        <el-dropdown trigger="click" v-if="allowCreateEvent">
          <span class="el-dropdown-link el-dropdown-btn">
            <i class="iconfont icon-add"></i>事件
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-for="event in eventTypes" :key="event.id">
              <a class="link-of-dropdown" href="javascript:;" @click.prevent="createEvent(event.id)">{{event.name}}</a>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>

        <el-dropdown trigger="click" v-if="allowCreatePlanTask">
          <span class="el-dropdown-link el-dropdown-btn">
            <i class="iconfont icon-add"></i>计划任务
          </span>

          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-for="task in taskTypes" :key="task.id">
              <a class="link-of-dropdown" href="javascript:;" @click.prevent="createPlanTask(task.id)">
                {{task.name}}
              </a>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>

    <div class="main-content" v-loading="loading">
      <div class="product-detail">
        <form-view :fields="fields" :value="product">
          <template slot="customer" slot-scope="{value}">
            <div class="form-view-row" v-if="value">
              <label>客户</label>
              <div class="form-view-row-content">
                {{product.customerName}}
              </div>
            </div>
          </template>


        </form-view>
      </div>
      <div class="product-relation">
        <base-tabbar :tabs="tabs" v-model="currTab"></base-tabbar>
        <div class="product-relation-content">
          <component :is="currTab" :share-data="propsForSubComponents"></component>
        </div>
      </div>
    </div>

    <remind-dialog ref="addRemindDialog" :product="product"></remind-dialog>

  </div>
</template>

<script>

import {
  getProductDetail,
  deleteProduct,
} from '@src/api/ProductApi';

import EventTable from './components/EventTable.vue';
import TaskTable from './components/TaskTable.vue';
import PlanTable from './components/PlanTable.vue';
import RemindTable from './components/RemindTable.vue';
import InfoRecord from './components/InfoRecord.vue';
import RemindDialog from './components/RemindDialog.vue';

import qs from '@src/util/querystring';
import AuthUtil from '@src/util/auth';
/**
 * todo
 * 1. 只判断是否开启了产品二维码功能，如果开启则启用显示二维码、关联等功能，如果没有则不显示产品二维码相关信息，不再判断自助门户设置
 * 2. 二维码字段处理
 * 3. 同步记录更新
 * 4. 新开窗口统一
 * 5. 弹窗提示统一
 */


export default {
  name: 'product-view',
  props: {
    initData: {
      type: Object,
      default: () => ({}),
    }
  },
  data() {
    return {
      loading: false,
      currTab: 'info-record',
      tabs: [{
        displayName: '信息动态',
        component: InfoRecord.name,
        slotName: 'record-tab',
        show: true,
      }, {
        displayName: '相关工单',
        component: TaskTable.name,
        show: true,
      }, {
        displayName: '相关事件',
        component: EventTable.name,
        show: true,
      }, {
        displayName: '计划工单',
        component: PlanTable.name,
        show: true,
      }, {
        displayName: '产品提醒',
        component: RemindTable.name,
        show: true,
      }]
    }
  },
  computed: {
    product() {
      return this.initData.product;
    },
    eventTypes() {
      if (!this.initData || (this.initData && !this.initData.eventTypeInfo)) return [];
      return this.initData.eventTypeInfo.map(t => Object.freeze(t));
    },
    taskTypes() {
      if (!this.initData || (this.initData && !this.initData.taskTypeInfo)) return [];
      return this.initData.taskTypeInfo.map(t => Object.freeze(t));
    },
    fields() {


      //产品二维码 创建人： 创建时间：系统编号：
      let fixedFields = [
        {
          displayName: '创建人',
          fieldName: 'createUser',
          formType: 'user',
          isSystem: 1,
          orderId: 10001
        },
        {
          displayName: '创建时间',
          fieldName: 'createTime',
          formType: 'datetime',
          isSystem: 1,
          orderId: 10002
        },
        {
          displayName: '系统编号',
          fieldName: 'id',
          formType: 'text',
          isSystem: 1,
          orderId: 10003
        },
      ];

      if (this.initData.productConfig.qrcodeEnabled) {
        fixedFields.push({
          displayName: '二维码编号',
          fieldName: 'qrcodeId',
          isSystem: 1,
          formType: 'text',
          orderId: 10000
        })
      }



      return this.initData.productFields
        .concat(fixedFields)
        .map(f => {
          console.log('f', f);
          if (f.fieldName === 'name') {
            f.orderId = -10;
          }

          if (f.fieldName === 'customer') {
            f.orderId = -7;
          }

          if (f.fieldName === 'serialNumber') {
            f.orderId = -9;
          }

          if (f.fieldName === 'type') {
            f.orderId = -8;
          }

          return f;
        })
        .sort((a, b) => a.orderId - b.orderId)
    },
    productId() {
      return this.product.id;
    },
    /** 子组件所需的数据 */
    propsForSubComponents() {
      return {
        product: this.product,
        loginUser: this.initData.loginUser,
        allowEditCustomer: this.allowEditCustomer,
        isDelete: this.isDelete,
      };
    },
    /** 当前登录的用户 */
    loginUser(){
      return this.initData.loginUser || {};
    },
    /** 当前用户的权限 */
    permission() {
      return this.initData.loginUser.authorities;
    },
    /** 是否显示返回按钮 */
    allowBack(){
      let allow = true;
      // 如果带入noHistory参数，则不显示
      let query = qs.parse(window.location.search);
      if(query.noHistory) return false;

      return allow;
    },
    isDelete(){
      return this.product.isDelete == null || this.product.isDelete === 1;
    },

    allowDeleteCustomer() {
      return this.allowEditCustomer && this.permission.CUSTOMER_DELETE;
    },
    /**
     * 满足以下条件允许编辑客户
     * 1. 客户没有被删除
     * 2. 有客户编辑权限
     */
    allowEditCustomer() {
      return !this.isDelete && this.hasEditCustomerAuth;
    },
    /**
     * 满足以下提交见允许创建工单
     *
     * 1. 客户没被删除
     * 2. 客户没被禁用
     * 3. 客户编辑权限
     * 4. 创建工单权限
     */
    allowCreateTask(){
      return !this.isDelete && this.hasEditCustomerAuth && AuthUtil.hasAuth(this.permission, 'TASK_ADD');
    },
    /**
     * 满足以下提交可以创建事件
     *
     * 1. 客户没有被删除
     * 2. 客户没有被禁用
     * 3. 客户编辑权限
     * 4. 新建事件权限
     */
    allowCreateEvent(){
      return !this.isDelete && this.hasEditCustomerAuth && AuthUtil.hasAuth(this.permission, 'CASE_ADD');
    },
    /**
     * 满足以下条件可以创建计划任务
     *
     * 1. 客户没有被删除
     * 2. 客户没有被禁用
     * 3. 启用计划任务
     * 4. 客户编辑权限
     * 5. 工单新建权限和工单指派权限
     */
    allowCreatePlanTask(){
      let planTaskEnabled = this.initData.planTaskEnabled;
      return !this.isDelete && this.hasEditCustomerAuth && planTaskEnabled && AuthUtil.hasEveryAuth(this.permission, ['TASK_ADD', 'TASK_DISPATCH'])
    },
    /**
     * 当前用户是否是该客户负责人
     * 客户负责人用于和客户创建人相同权限
     */
    isCustomerManager() {
      return this.loginUser.userId === this.product.customer.customerManager;
    },
    /**
     * 是否有编辑客户权限，需要满足以下条件之一：
     *
     * 1. 编辑客户全部权限： 全部客户
     * 2. 编辑客户团队权限： 没有团队的客户都可编辑，有团队的按团队匹配。 包含个人权限
     * 3. 编辑客户个人权限： 自己创建的 或 客户负责人
     */
    hasEditCustomerAuth(){
      let customer = this.product.customer;
      let loginUserId = this.loginUser.userId;
      return AuthUtil.hasAuthWithDataLevel(this.permission, 'CUSTOMER_EDIT',
        // 团队权限判断
        () => {
          let tags = Array.isArray(customer.tags) ? customer.tags : [];
          // 无团队则任何人都可编辑
          if(!tags.length) return true;

          let loginUserTagIds = this.initData.loginUser.tagIds || [];
          return tags.some(tag => loginUserTagIds.indexOf(tag.id) >= 0);
        },
        // 个人权限判断
        () => {
          return customer.createUser === loginUserId || this.isCustomerManager
        }
      );
    },
  },
  mounted() {
    console.log('product-view mounted', this.initData);
    this.$eventBus.$on('product_view.open_remind_dialog', this.openRemindDialog);
  },
  beforeDestroy() {
    this.$eventBus.$off('product_view.open_remind_dialog', this.openRemindDialog);
  },
  methods: {
    editProduct() {
      window.location.href = `/customer/product/edit/${this.productId}`
    },
    openRemindDialog(remind) {
      this.$refs.addRemindDialog.openDialog(remind);
    },
    async deleteProduct() {
      try {
        if (!await this.$platform.confirm('确定要删除该产品？')) return;

        const result = await deleteProduct(this.productId);
        if (!result.status) {
          let fromId = window.frameElement.getAttribute('fromid');
          this.$platform.refreshTab(fromId);

          window.location.reload();
        }
      } catch (e) {
        console.error('product-view delete product error', e);
      }
    },
    goBack() {
      parent.frameHistoryBack(window);
    },
    /** 从客户创建工单 */
    createTask(typeId){
      let fromId = window.frameElement.getAttribute('id');

      this.$platform.openTab({
        id: 'createTask',
        title: '新建工单',
        close: true,
        url: `/task/createFromProduct/${this.productId}?defaultTypeId=${typeId}`,
        fromId
      })
    },
    /** 从客户创建事件 */
    createEvent(typeId){
      let fromId = window.frameElement.getAttribute('id');

      this.$platform.openTab({
        id: 'createEvent',
        title: '新建事件',
        close: true,
        url: `/event/createFromProduct/${this.productId}?defaultTypeId=${typeId}`,
        fromId
      })
    },
    /** 从客户创建计划工单 */
    createPlanTask(typeId){
      let fromId = window.frameElement.getAttribute('id');

      this.$platform.openTab({
        id: 'createPlan',
        title: '新建计划任务',
        close: true,
        url: `/task/planTask/create?defaultTypeId=${typeId}&productId=${this.productId}`,
        fromId
      })
    },
  },
  components: {
    [EventTable.name]: EventTable,
    [TaskTable.name]: TaskTable,
    [PlanTable.name]: PlanTable,
    [RemindTable.name]: RemindTable,
    [InfoRecord.name]: InfoRecord,
    [RemindDialog.name]: RemindDialog,
  }
}
</script>

<style lang="scss">
$color-primary-light-9: mix(#fff, $color-primary, 90%) !default;

html, body, .product-view-container {
  height: 100%;
}

body {
  padding: 10px;
  min-width: 1100px;
  overflow-x: auto;
}

.product-view-container {
  background: #fff;
  border-radius: 3px;
  box-shadow: 0 1px 4px rgba(216,216,216, .65);
  display: flex;
  flex-flow: column nowrap;
}

.product-view-container .product-tool-bar {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    color: $text-color-regular;
    border-bottom: 1px solid #f2f2f2;

    .product-toolbar-left{
      padding: 10px 5px 10px 10px;
    }

    .product-toolbar-right{
      padding: 10px 10px 10px 5px;
    }

    .btn-text {
      padding: 5px 12px;
      .iconfont{
        font-size: 14px;
      }
    }

    .action-btn {
      .el-dropdown-btn {
        padding: 0 15px;
        line-height: 34px;
        display: inline-block;
        background: $color-primary-light-9;
        color: $text-color-primary;
        margin-left: 10px;
        border-radius: 2px;
        .iconfont {
          line-height: 12px;
          margin-right: 3px;
          font-size: 12px;
        }

        &:hover {
          cursor: pointer;
          color: #fff;
          background: $color-primary;
        }
      }

      .base-button {
        margin-left: 10px;
      }
    }
  }

.link-of-dropdown {
  color: $text-color-primary;
  display: block;
  &:hover {
    text-decoration: none;
  }
}

.product-view-container .main-content {
  display: flex;
  flex-flow: row nowrap;
  flex: 1;
  position: relative;
}


.product-view-container .main-content .product-detail {
  flex: 3;
  min-width: 420px;
  height: 100%;
  display: flex;
  flex-flow: column nowrap;

  .form-view{
    flex: 1;
    padding-top: 5px;
    overflow-y: auto;
    border-right: 1px solid #f2f2f2;
  }
}


.product-view-container .main-content .product-relation {
  height: 100%;
  flex: 7;
  background: #fff;
  min-width: 500px;
  //margin-left: 10px;
  border-radius: 2px;
  .product-relation-content {
    height: calc(100% - 50px);
    overflow: auto;
  }
}



</style>