<template>
  <div class="page-container">
    <div class="customer-tool-bar">
      <div class="">
        <button type="button" class="btn btn-text" @click="goBack"><i class="iconfont icon-arrow-left"></i> 返回</button>
        <button type="button" class="btn btn-text" @click="jump" v-if="allowEditCustomer"><i class="iconfont icon-edit"></i> 编辑</button>
        <button type="button" class="btn btn-text" @click="deleteCustomer" v-if="allowDeleteCustomer"><i class="iconfont icon-yemianshanchu"></i> 删除</button>
        <button type="button" class="btn btn-text" @click="openDialog('remind')"><i class="iconfont icon-notification"></i> 添加提醒</button>

        <!-- <base-button type="only-text" icon="icon-arrow-left" @event="goBack">返回</base-button> -->
        <!-- <base-button type="only-text" icon="icon-edit" @event="jump" v-if="allowEditCustomer">编辑</base-button>
        <base-button type="only-text" icon="icon-yemianshanchu" @event="deleteCustomer" v-if="allowDeleteCustomer">删除</base-button>
        <base-button type="only-text" icon="icon-notification" @event="openDialog('remind')">添加提醒</base-button> -->
        <a :href="`/customer/oldView/${id}`">返回旧版</a>
      </div>
      <div class="action-btn">
        <el-dropdown trigger="click">
          <span class="el-dropdown-link el-dropdown-btn">
            <i class="iconfont icon-add"></i>工单
          </span>

          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-for="type in taskTypes" :key="type.id">
              <a class="link-of-dropdown" href="javascript:;" @click.prevent="createTask(type.id)">{{type.name}}</a>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-dropdown trigger="click">
          <span class="el-dropdown-link el-dropdown-btn">
            <i class="iconfont icon-add"></i>事件
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-for="event in eventTypes" :key="event.id">
              <a class="link-of-dropdown" href="javascript:;" @click.prevent="createEvent(event.id)">{{event.name}}</a>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-dropdown trigger="click">
          <span class="el-dropdown-link el-dropdown-btn">
            <i class="iconfont icon-add"></i>计划任务
          </span>

          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-for="task in taskTypes" :key="task.id">
              <a class="link-of-dropdown" :href="`/task/planTask/create?defaultTypeId=${task.id}&customerId=${id}`">
                {{task.name}}
              </a>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <base-button type="plain" icon="icon-add" @event="openDialog('contact')">联系人</base-button>
        <base-button type="plain" icon="icon-add" @event="openDialog('address')">地址</base-button>
        <base-button type="plain" icon="icon-add" @event="createProduct('address')">产品</base-button>
      </div>
    </div>
    <div class="main-content" v-loading="loading">
      <div class="customer-detail">
        <h3 class="customer-name" :class="{'customer-name-expand': showWholeName == 1}">
          <span ref="customerName">{{customer.name}}</span>
          <i v-if="showWholeName >= 0" @click="showWholeName = !showWholeName" class="iconfont icon-gongsimingchengxiala"></i>
        </h3>
        
        <form-view :fields="fields" :value="customer">
          <div slot="name"></div>

          <template slot="address" slot-scope="{value}">
            <div class="form-view-row" v-if="value">
              <label>地址：</label>
              <div class="form-view-row-content">
                <span>{{value | fmt_address}}</span>
                <i v-if="value.adLatitude && value.adLongitude" @click="openMap"
                   class="iconfont icon-address customer-address-icon"></i>
              </div>
            </div>
          </template>
        </form-view>

      </div>
      <div class="customer-relation" v-if="this.customer.id">
        <base-tabbar :tabs="tabs" v-model="currTab"></base-tabbar>
        <div class="customer-relation-content">
          <keep-alive>
            <component :is="currTab" :share-data="propsForSubComponents"></component>
          </keep-alive>
        </div>
      </div>
    </div>

    <edit-contact-dialog ref="EditContactDialog" :customer="customer"></edit-contact-dialog>
    <edit-address-dialog ref="EditAddressDialog" :customer-id="customer.id"
                         :default-address="initData.customerAddress"></edit-address-dialog>
    <remind-customer-dialog ref="addRemindDialog" :customer="customer" :edited-remind="selectedRemind"
                            @success-callback="selectedRemind = {}"></remind-customer-dialog>
  </div>
</template>

<script>
import CustomerInfoRecord from './components/CustomerInfoRecord.vue';
import CustomerEventTable from './components/CustomerEventTable.vue';
import CustomerTaskTable from './components/CustomerTaskTable.vue';
import CustomerProductTable from './components/CustomerProductTable.vue';
import CustomerContactTable from './components/CustomerContactTable.vue';
import CustomerAddressTable from './components/CustomerAddressTable.vue';
import CustomerPlanTable from './components/CustomerPlanTable';
import CustomerRemindTable from './components/CustomerRemindTable';

import EditAddressDialog from './operationDialog/EditAddressDialog.vue';
import EditContactDialog from './operationDialog/EditContactDialog.vue';
import RemindCustomerDialog from './operationDialog/RemindCustomerDialog.vue';

export default {
  name: "customer-detail-view",
  props: {
    initData: {
      type: Object,
      default: () => ({}),
    }
  },
  data() {
    return {
      id: this.initData.id, //当前客户的id
      // tabs: [],
      tabs: this.buildTabs(),
      //当前选中的tab
      currTab: 'customer-info-record',
      customerOption: {},
      remindList: [],
      selectedRemind: {},
      customer: {},
      loading: false,
      showWholeName: -1, //-1代表不显示展开icon 0代表收起 1代表展开
      statisticalData: {}
    }
  },
  computed: {
    /** 是否允许操作该客户，在客户删除时不允许做任何操作，只能查询 */
    allowOperate(){
      return this.customer.isDelete === 0;
    },
    fields() {
      return (this.initData.fieldInfo || []).sort((a, b) => a.orderId - b.orderId);
    },
    eventTypes() {
      if (!this.initData || (this.initData && !this.initData.eventTypeList)) return [];
      return this.initData.eventTypeList.map(t => Object.freeze(t));
    },
    taskTypes() {
      if (!this.initData || (this.initData && !this.initData.taskTypeList)) return [];
      return this.initData.taskTypeList.map(t => Object.freeze(t));
    },
    //permission
    permission() {
      return this.initData.loginUser.authorities;
    },
    allowDeleteCustomer() {
      return this.allowEditCustomer && this.permission.CUSTOMER_DELETE;
    },
    allowEditCustomer() {
      const c = this.customer;
      const loginUser = this.initData.loginUser;
      const CUSTOMER_EDIT = this.permission.CUSTOMER_EDIT;
      if (!CUSTOMER_EDIT) return false;
      let auth = false;
      if (CUSTOMER_EDIT === 1) {
        auth = c.createUser === loginUser.userId;
      } else if (CUSTOMER_EDIT === 2) {
        auth = c.createUser === loginUser.userId || this.permissionAccordingToTag();
      } else {
        auth = true;
      }

      return c.isDelete === 0 && (auth || this.isCustomerManager);
    },
    permissionAccordingToTag() {
      const c = this.customer;
      let tags = Array.isArray(c.tags) ? c.tags : [];
      let loginUserTagIds = this.initData.loginUser.tagIds || [];
      //无团队则任何人都可编辑
      if (tags.length == 0) return true;

      //团队权限验证 return Boolean
      let result = tags.filter(tag => loginUserTagIds.some(tId => tId === tag.id));

      return result.length > 0;
    },
    /**
       * 当前用户是否是该客户负责人
       * 客户负责人用于和客户创建人相同权限
       */
    isCustomerManager() {
      const {loginUser, customerManager,} = this.customer;
      return loginUser.userId === customerManager;
    },
    /** 子组件所需的数据 */
    propsForSubComponents() {
      return {
        customer: this.customer,
        loginUser: this.initData.loginUser,
      };
    },
    customerNameLong() {
      return (this.customer.name || '').length > 21;
    }
  },
  methods: {
    //更新客户名称的样式
    updateCustomerStyle(){
      let cnEl = this.$refs.customerName;
      let width = cnEl.offsetWidth;
      let maxWidth = cnEl.closest('h3').offsetWidth;
      
      this.showWholeName = maxWidth - 20 < width ? 0 : -1;
    },
    /** 从客户创建工单 */
    createTask(typeId){
      let customer = this.customer || {};
      let fromId = window.frameElement.getAttribute('id');
      
      this.$platform.openTab({
        id: 'createTask',
        title: '新建工单',
        close: true,
        url: `/task/createFromCustomer/${customer.id}?defaultTypeId=${typeId}`,
        fromId: fromId
      })      
    },
    /** 从客户创建事件 */
    createEvent(typeId){
      let customer = this.customer || {};
      let fromId = window.frameElement.getAttribute('id');
      
      this.$platform.openTab({
        id: 'createEvent',
        title: '新建事件',
        close: true,
        url: `/event/createFromCustomer/${customer.id}?defaultTypeId=${typeId}`,
        fromId: fromId
      })      
    },
    buildTabs() {
      const {
        addressQuantity,
        eventQuantity,
        linkmanQuantity,
        plantaskQuantity,
        productQuantity,
        remindQuantity,
        taskQuantity,
        unfinishedEventQuantity,
        unfinishedTaskQuantity,
        recordQuantity,
      } = this.StatisticalData || {};

      return [{
        displayName: recordQuantity ? `信息动态(${recordQuantity})` : '信息动态',
        component: CustomerInfoRecord.name,
        slotName: 'record-tab',
        show: true,
      }, {
        displayName: remindQuantity ? `客户提醒(${remindQuantity})` : '客户提醒',
        component: CustomerRemindTable.name,
        show: true,
      }, {
        displayName: eventQuantity ? `事件(${unfinishedEventQuantity || 0}/${eventQuantity})` : '事件',
        component: CustomerEventTable.name,
        show: true,
      }, {
        displayName: taskQuantity ? `工单(${unfinishedTaskQuantity || 0}/${taskQuantity})` : '工单',
        component: CustomerTaskTable.name,
        show: true,
      }, {
        displayName: plantaskQuantity ? `计划任务(${plantaskQuantity})` : '计划任务',
        component: CustomerPlanTable.name,
        show: this.initData.planTaskEnabled
      }, {
        displayName: productQuantity ? `客户产品(${productQuantity})` : '客户产品',
        component: CustomerProductTable.name,
        show: true,
      }, {
        displayName: addressQuantity ? `客户地址(${addressQuantity})` : '客户地址',
        component: CustomerAddressTable.name,
        show: true,
      }, {
        displayName: linkmanQuantity ? `联系人(${linkmanQuantity})` : '联系人',
        component: CustomerContactTable.name,
        show: true,
      }]
        .filter(tab => tab.show);
    },
    async deleteCustomer() {
      try {
        if (!await this.$platform.confirm('确定要删除该客户？')) return;
        const result = await this.$http.get(`/customer/delete/${this.customer.id}`);
        if (!result.status) {
          window.location.href = '/customer';
        }
      } catch (e) {
        console.error('customer-detail-view deleteCustomer error', e);
      }
    },
    openMap() {
      this.$fast.map.display(this.customer.customerAddress, {title: this.customer.name,})
        .catch(err => console.error('openMap catch an err: ', err));
    },
    fetchCustomer() {
      const id = this.initData.id;
      this.$http.get(`/customer/get`, {id})
        .then(res => {
          if (res.status) return;
          this.customer = Object.freeze(res.data);
          this.loading = false;
          this.$nextTick(this.updateCustomerStyle)
        })
        .catch(err => console.error('customer-detail-view fetchCustomer catch error /n', err));
    },
    fetchStatisticalData() {
      const params = {
        customerId: this.initData.id || this.customer.id
      };

      this.$http.get('/customer/statistics/init', params)
        .then(res => {
          if (Object.keys(res).every(key => key !== 'taskQuantity')) return;

          this.StatisticalData = res;
          this.tabs = this.buildTabs();
        })
        .catch(err => console.error('fetchStatisticalData', err))
    },
    openDialog(action) {
      if (action === 'address') {
        this.$refs.EditAddressDialog.openDialog();
      } else if (action === 'contact') {
        this.$refs.EditContactDialog.openDialog();
      } else if (action === 'remark') {
        this.$refs.addRemarkDialog.openDialog();
      } else if (action === 'remind') {
        this.$refs.addRemindDialog.openDialog();
      }
    },
    jump() {
      const id = this.id || this.initData.id;
      window.location.href = `/customer/edit/${id}`
    },
    createProduct() {
      const id = this.id || this.initData.id;
      window.location.href = `/customer/product/createNew?cid=${id}`
    },
    goBack() {
      parent.frameHistoryBack(window);
    },
    updateRemind(remind) {
      this.selectedRemind = remind || {};
      this.$nextTick(this.$refs.addRemindDialog.openDialog);
    }
  },
  mounted() {
    this.loading = true;
    this.fetchCustomer();
    // this.fetchStatisticalData();
    this.$eventBus.$on('customer_detail_view.update_remind', this.updateRemind);
    this.$eventBus.$on('customer_detail_view.update_statistical_data', this.fetchStatisticalData);
    this.$eventBus.$on('customer_detail_view.update_customer_detail', this.fetchCustomer);
  },
  beforeDestroy() {
    this.$eventBus.$off('customer_detail_view.update_remind', this.updateRemind);
    this.$eventBus.$off('customer_detail_view.update_statistical_data', this.fetchStatisticalData);
    this.$eventBus.$off('customer_detail_view.update_customer_detail', this.fetchCustomer);
  },
  components: {
    [CustomerInfoRecord.name]: CustomerInfoRecord,
    [CustomerEventTable.name]: CustomerEventTable,
    [CustomerTaskTable.name]: CustomerTaskTable,
    [CustomerProductTable.name]: CustomerProductTable,
    [CustomerContactTable.name]: CustomerContactTable,
    [CustomerAddressTable.name]: CustomerAddressTable,
    [CustomerPlanTable.name]: CustomerPlanTable,
    [CustomerRemindTable.name]: CustomerRemindTable,
    [EditAddressDialog.name]: EditAddressDialog,
    [EditContactDialog.name]: EditContactDialog,
    [RemindCustomerDialog.name]: RemindCustomerDialog,
  }
}
</script>

<style lang="scss">
  $color-primary-light-9: mix(#fff, $color-primary, 90%) !default;

  html, body, .page-container {
    height: 100%;
  }

  body {
    padding: 10px;
    min-width: 1100px;
    overflow-x: auto;
  }

  .page-container {
    background: #fff;
    border-radius: 3px;
    box-shadow: 0 1px 4px rgba(216,216,216, .65);
  }

  .customer-address-icon {
    color: $color-primary;
    cursor: pointer;
    font-size: 14px;
  }

  .customer-tool-bar {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    color: $text-color-regular;
    padding: 10px;
    border-bottom: 1px solid #f2f2f2;

    .btn-text .iconfont{
      font-size: 14px;
    }
  }

  .main-content {
    display: flex;
    flex-flow: row nowrap;
    height: calc(100% - 53px);
    position: relative;
  }

  .customer-detail {
    flex: 2;
    min-width: 420px;
    height: 100%;
    display: flex;
    flex-flow: column nowrap;
    border-right: 1px solid #f2f2f2;

    .form-view{
      flex: 1;
      padding-top: 5px;
      overflow-y: auto;
    }
  }

  .customer-name{
    min-height: 50px;
    position: relative;
    padding: 13px 20px;
    line-height: 24px;
    font-size: 16px;
    margin: 0;
    color: $text-color-primary;
    background: $color-primary-light-9;
    font-weight: 500;

    @include text-ellipsis();

    span{
      white-space: nowrap;
    }

    .iconfont {
      position: absolute;
      right: 5px;
      bottom: 10px;
      color: $color-primary;
      font-size: 12px;

      &:hover {
        cursor: pointer;
      }
    }

    &.customer-name-expand{
      span{
        white-space: normal;
      }

      .iconfont{
        transform: rotateZ(-180deg);
      }
    }
  }

  .customer-relation {
    height: 100%;
    flex: 7;
    background: #fff;
    min-width: 500px;
    //margin-left: 10px;
    border-radius: 2px;
  }

  .customer-relation-content {
    height: calc(100% - 50px);
    overflow: auto;
  }

  .action-btn {
    .el-dropdown-btn {
      padding: 0 15px;
      line-height: 32px;
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

  .link-of-dropdown {
    color: $text-color-primary;
    display: block;
    &:hover {
      text-decoration: none;
    }
  }

</style>
