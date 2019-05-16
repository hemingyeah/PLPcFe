<template>
  <div class="product-view-container">
    <div class="product-tool-bar">
      <div class="product-toolbar-left" v-if="allowBack || !isDelete">
        <!-- <button type="button" class="btn btn-text" @click="goBack" v-if="allowBack"><i class="iconfont icon-arrow-left"></i> 返回</button> -->
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

        <h3 class="product-name" :class="{'product-name-expand': showWholeName == 1}">
          <span class="product-name-delete" v-if="isDelete" title="该产品已被删除，只能查看数据。" v-tooltip>已删除</span>
          <span ref="customerName">{{product.name}}</span>
          <i v-if="showWholeName >= 0" @click="showWholeName = !showWholeName" class="iconfont icon-gongsimingchengxiala"></i>
        </h3>


        <form-view :fields="fields" :value="product">
          <div slot="name"></div>
          <template slot="customer" slot-scope="{value}">
            <div class="form-view-row" v-if="value">
              <label>客户</label>
              <div class="form-view-row-content link" @click="openCustomer">
                {{product.customerName}}
              </div>
            </div>
          </template>

          <div slot="qrcodeId" slot-scope="{value}">
            <div class="form-view-row">
              <label>产品二维码</label>
              <div class="form-view-row-content" v-show="value">
                <span>{{value}}</span>
                <div ref="qrcode" style="margin: 10px 0;"></div>
                <a href="javascript:;" class="link" @click="openDownloadCodeDialog">下载</a>
                <a href="javascript:;" class="link" @click="unbindQrcodeFromProduct">删除</a>
              </div>
              <div class="form-view-row-content" v-show="!value">
                <a href="javascript:;" class="link" @click="openBindCodeDialog">关联二维码</a>

              </div>
            </div>
          </div>

          <template slot="createTime" slot-scope="{value}">
            <div class="form-view-row" v-if="value">
              <label>创建时间</label>
              <div class="form-view-row-content">
                <span>{{ value | fmt_datetime }}</span>
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

    <bind-code :product-id="productId" ref="bindCodeDialog"></bind-code>
    <download-code :code-data="downloadCodeData" ref="downloadCodeDialog"></download-code>

  </div>
</template>

<script>

import {
  getProductDetail,
  deleteProductByIds,
  unbindQrcode,
  productStatisticsInit
} from '@src/api/ProductApi';

import EventTable from './components/EventTable.vue';
import TaskTable from './components/TaskTable.vue';
import PlanTable from './components/PlanTable.vue';
import RemindTable from './components/RemindTable.vue';
import InfoRecord from './components/InfoRecord.vue';
import RemindDialog from './components/RemindDialog.vue';
import BindCodeDialog from './components/BindCodeDialog.vue';
import DownloadCodeDialog from './components/DownloadCodeDialog.vue';


import qs from '@src/util/querystring';
import AuthUtil from '@src/util/auth';

import QRCode from 'qrcodejs2';
/**
 * todo
 * 1. 只判断是否开启了产品二维码功能，如果开启则启用显示二维码、关联等功能，如果没有则不显示产品二维码相关信息，不再判断自助门户设置✅
 * 2. 二维码字段处理
 * 3. 同步记录更新
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
      showWholeName: -1, // -1代表不显示展开icon 0代表收起 1代表展开
      newestProduct: null,
      tabs: [],
      statisticalData: {}, // tab统计数据
    }
  },
  computed: {
    product() {
      return this.newestProduct || this.initData.product || {};
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
      let fixedFields = [
        {
          displayName: '',
          formType: 'separator'
        },
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
    downloadCodeData() {
      return {
        qrcodeId: this.product.qrcodeId,
        nickName: this.initData.nickName,
        domain: this.initData.domain,
      }
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
    this.updateProductNameStyle();
    this.createCode();
    this.fetchStatisticalData();
    // this.refreshProduct();

    this.$eventBus.$on('product_view.open_remind_dialog', this.openRemindDialog); // 打开提醒弹窗
    this.$eventBus.$on('product_view.update_detail', this.refreshProduct); // 更新详情
    this.$eventBus.$on('product_view_record_update', this.fetchStatisticalData); // 更新动态
    this.$eventBus.$on('product_view_remind_update', this.fetchStatisticalData); // 更新提醒
  },
  beforeDestroy() {
    this.$eventBus.$off('product_view.open_remind_dialog', this.openRemindDialog);
    this.$eventBus.$off('product_view.update_detail', this.refreshProduct);
    this.$eventBus.$off('product_view_record_update', this.fetchStatisticalData);
    this.$eventBus.$off('product_view_remind_update', this.fetchStatisticalData);
  },
  methods: {
    openBindCodeDialog() {
      this.$refs.bindCodeDialog.open();
    },
    openDownloadCodeDialog() {
      this.$refs.downloadCodeDialog.open();
    },
    async unbindQrcodeFromProduct() {
      if (!await this.$platform.confirm('删除后，该二维码将会失效，确定删除该二维码？')) return;

      unbindQrcode({
        productId: this.product.id,
      })
        .then(res => {
          if (res.status) return this.$platform.notification({
            title: '失败',
            message: (h => (<div>{res.message || '发生未知错误'}</div>))(this.$createElement),
            type: 'error',
          });

          this.refreshProduct();
          this.$eventBus.$emit('product_info_record.update_record_list');

          this.$platform.notification({
            title: '删除成功',
            type: 'success',
          });

        })
        .catch(e => {

          console.error('e', e)
        })

    },
    createCode() {
      if(!this.product.qrcodeId) return;
      if(!this.$refs.qrcode) return 
      
      let url = `${window.location.origin}/qrcode/${this.initData.domain}?qrcodeId=${this.product.qrcodeId}`;

      this.$refs.qrcode.innerHTML = '';
      this.$nextTick(() => {
        let qrcode = new QRCode(this.$refs.qrcode, {
          text: url,
          width: 120,
          height: 120,
          colorDark: '#000000',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.H
        });
      })
    },

    // 更新客户名称的样式
    updateProductNameStyle(){
      let cnEl = this.$refs.customerName;
      let width = cnEl.offsetWidth;
      let maxWidth = cnEl.closest('h3').offsetWidth;

      this.showWholeName = maxWidth - 20 < width ? 0 : -1;
    },
    refreshProduct() {

      getProductDetail({
        id: this.productId,
      })
        .then(res => {
          if (!res) return;
          this.newestProduct = res;

          if (this.newestProduct.qrcodeId) {
            this.createCode();
          }
        })
        .catch(e => console.error('e', e));
    },
    editProduct() {
      window.location.href = `/customer/product/edit/${this.productId}`
    },
    openRemindDialog(remind) {
      this.$refs.addRemindDialog.openDialog(remind);
    },
    async deleteProduct() {
      try {
        if (!await this.$platform.confirm('确定要删除该产品？')) return;

        const result = await deleteProductByIds(this.productId);
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
    // 打开客户新tab
    openCustomer() {
      if(this.product.customer && !this.product.customer.id) return 

      const customerId = this.product.customer.id;

      this.$platform.openTab({
        id: `customer_view_${customerId}`,
        title: '客户详情',
        close: true,
        url: `/customer/view/${customerId}?noHistory=1`,
      })
    },
    // 获取统计数量
    fetchStatisticalData() {
      let params = {
        productId: this.product.id
      }
      productStatisticsInit(params).then(result => {
        if(!result) return 
        this.statisticalData = result;
        this.tabs = this.buildTabs();
      })
    },
    // 构建tab
    buildTabs() {
      return [
        {
          displayName: `信息动态(${this.statisticalData.recordQuantity || 0})`,
          component: InfoRecord.name,
          slotName: 'record-tab',
          show: true,
        }, {
          displayName: `工单(${this.statisticalData.unfinishedTaskQuantity || 0}/${this.statisticalData.taskQuantity || 0})`,
          component: TaskTable.name,
          show: true,
        }, {
          displayName: `事件(${this.statisticalData.unfinishedEventQuantity || 0}/${this.statisticalData.eventQuantity || 0})`,
          component: EventTable.name,
          show: true,
        }, {
          displayName: `计划任务(${this.statisticalData.plantaskQuantity || 0})`,
          component: PlanTable.name,
          show: true,
        }, {
          displayName: `产品提醒(${this.statisticalData.remindQuantity || 0})`,
          component: RemindTable.name,
          show: true,
        }
      ].filter(tab => tab.show)
    }
  },
  components: {
    [EventTable.name]: EventTable,
    [TaskTable.name]: TaskTable,
    [PlanTable.name]: PlanTable,
    [RemindTable.name]: RemindTable,
    [InfoRecord.name]: InfoRecord,
    [RemindDialog.name]: RemindDialog,
    [BindCodeDialog.name]: BindCodeDialog,
    [DownloadCodeDialog.name]: DownloadCodeDialog,
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


  .product-name{
    min-height: 50px;
    position: relative;
    padding: 13px 20px;
    font-size: 16px;
    margin: 0;
    color: $text-color-primary;
    background: $color-primary-light-9;
    font-weight: 500;

    @include text-ellipsis();

    span{
      white-space: nowrap;
      vertical-align: middle;
    }

    .iconfont {
      position: absolute;
      right: 5px;
      bottom: 15px;
      color: $color-primary;
      font-size: 12px;

      &:hover {
        cursor: pointer;
      }
    }

    &.product-name-expand{
      span{
        white-space: normal;
      }

      .iconfont{
        transform: rotateZ(-180deg);
      }
    }

    .product-name-delete,
    .product-name-disable{
      color: #fff;
      display: inline-block;
      border-radius: 4px;
      font-size: 12px;
      line-height: 18px;
      height: 18px;
      padding: 0 5px;
      font-weight: 400;
      vertical-align: middle;
      cursor: default;
    }

    .product-name-delete{
      background-color: $color-danger;
    }
    .product-name-disable{
      background-color: #ffc107;
    }
  }

  .form-view{
    flex: 1;
    padding-top: 5px;
    overflow-y: auto;
    border-right: 1px solid #f2f2f2;


    .link {
      color: $color-primary;
      cursor: pointer;
    }

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
