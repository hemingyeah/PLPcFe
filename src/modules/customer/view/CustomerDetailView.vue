<template>
  <div class="page-container">
    <div class="customer-tool-bar">
      <div class="customer-toolbar-left" v-if="allowBack || !isDelete">
        <button type="button" class="btn btn-text" @click="goBack" v-if="allowBack"><i class="iconfont icon-arrow-left"></i> 返回</button>
        <template v-if="!isDelete">
          <button type="button" class="btn btn-text" @click="jump" v-if="allowEditCustomer"><i class="iconfont icon-edit"></i> 编辑</button>
          <button type="button" class="btn btn-text" @click="deleteCustomer" v-if="allowDeleteCustomer"><i class="iconfont icon-yemianshanchu"></i> 删除</button>
          <button type="button" class="btn btn-text" @click="openDialog('remind')" v-if="!isDisable"><i class="iconfont icon-notification"></i> 添加提醒</button>
          
          <el-dropdown @command="execAttentionCommand" v-if="hasViewCustomerAuth">
            <span style="cursor: default;"><i class="iconfont icon-focus"></i> {{ isAttention ? '已关注' : '关注客户'}}</span>
            
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="toggle">{{ isAttention ? '取消关注' : '关注客户' }}</el-dropdown-item>
              <el-dropdown-item command="view" :disabled="!hasEditCustomerAuth">查看已关注</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </div>
      <div class="customer-toolbar-right action-btn" v-if="!isDelete">
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
        <base-button type="plain" icon="icon-add" @event="openDialog('contact')" v-if="allowEditCustomer">联系人</base-button>
        <base-button type="plain" icon="icon-add" @event="openDialog('address')" v-if="allowEditCustomer">地址</base-button>
        <base-button type="plain" icon="icon-add" @event="createProduct('address')" v-if="allowCreateProduct">产品</base-button>
      </div>
    </div>
    <div class="main-content" v-loading="loading">
      <div class="customer-detail" v-if="!loading">
        
        <sample-tooltip :row="customer">
          <template slot="content" slot-scope="{isContentTooltip}">
            <el-tooltip :content="customer.name" placement="top" :disabled="!isContentTooltip">
              <h3 
                class="customer-name" 
                :class="{
                  'customer-name-expand': showWholeName == 1,
                }"
              >
                <span class="customer-name-delete" v-if="isDelete" title="该客户已被删除，只能查看数据。" v-tooltip>已删除</span>
                <span class="customer-name-disable" v-if="isDisable" title="该客户已被禁用，无法添加提醒和新建工单、事件、计划任务。" v-tooltip>已禁用</span>
                <span ref="customerName">{{customer.name}}</span>
                <i v-if="showWholeName >= 0" @click="showWholeName = !showWholeName" class="iconfont icon-gongsimingchengxiala"></i>
              </h3>
            </el-tooltip>
          </template>
        </sample-tooltip>
        
        <form-view :fields="fields" :value="customer">
          <div slot="name"></div>

          <template slot="tags" slot-scope="{value}">
            <div class="form-view-row" v-if="isDivideByTag">
              <label>服务团队</label>
              <div class="form-view-row-content">{{value | fmt_tag}}</div>
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

    <edit-contact-dialog ref="EditContactDialog" :customer="customer" :is-phone-unique="isPhoneUnique"/>
    <edit-address-dialog ref="EditAddressDialog" :customer-id="customer.id" :default-address="initData.customerAddress"/>
    <remind-customer-dialog ref="addRemindDialog" :customer="customer" :edited-remind="selectedRemind" @success-callback="selectedRemind = {}"/>
    <customer-attention ref="customerAttention" @submit="updateAttentionUser"/>
  </div>
</template>

<script>
import Exception from '@model/Exception'
import * as CustomerApi from '@src/api/CustomerApi';
import Platform from '@src/platform';

import CustomerInfoRecord from './components/CustomerInfoRecord.vue';
import CustomerEventTable from './components/CustomerEventTable.vue';
import CustomerTaskTable from './components/CustomerTaskTable.vue';
import CustomerProductTable from './components/CustomerProductTable.vue';
import CustomerContactTable from './components/CustomerContactTable.vue';
import CustomerAddressTable from './components/CustomerAddressTable.vue';
import CustomerPlanTable from './components/CustomerPlanTable';
import CustomerRemindTable from './components/CustomerRemindTable';
import CustomerAttention from './components/CustomerAttention.vue'

import EditAddressDialog from './operationDialog/EditAddressDialog.vue';
import EditContactDialog from './operationDialog/EditContactDialog.vue';
import RemindCustomerDialog from './operationDialog/RemindCustomerDialog.vue';

import AuthUtil from '@src/util/auth';
import qs from '@src/util/querystring';

export default {
  name: 'customer-detail-view',
  props: {
    initData: {
      type: Object,
      default: () => ({}),
    }
  },
  data() {
    return {
      id: this.initData.id, // 当前客户的id
      tabs: [],
      // 当前选中的tab
      currTab: 'customer-info-record',
      customerOption: {},
      remindList: [],
      selectedRemind: {},
      customer: {},
      loading: false,
      showWholeName: -1, // -1代表不显示展开icon 0代表收起 1代表展开
      statisticalData: {},

      attentionUsers: [] // 该客户的关注用户
    }
  },
  computed: {
    /** 是否显示返回按钮 */
    allowBack(){
      let allow = true;

      // 如果带入noHistory参数，则不显示
      let query = qs.parse(window.location.search);
      if(query.noHistory) return false;

      // 验证路径
      let path = window.location.pathname;
      let disablePathReg = [/^\/customer\/view\/\S+$/];
      if(disablePathReg.some(reg => reg.test(path))) return false;

      return allow;
    },
    /** 当前登录的用户 */
    loginUser(){
      return this.initData.loginUser || {};
    },
    /** 
     * 客户是否被删除
     * 在客户删除时不允许做任何操作，只能查询 
     * 所有操作的权限应该以此为基础
     */
    isDelete(){
      return this.customer.isDelete == null || this.customer.isDelete === 1;
    },
    /** 客户是否被禁用 */
    isDisable(){
      return this.customer.status == null || this.customer.status === 0;
    },
    fields() {
      const fields = (this.initData.fieldInfo || []).sort((a, b) => a.orderId - b.orderId);
      return [...fields, {
        displayName: '',
        formType: 'separator'
      }, {
        displayName: '创建人',
        fieldName: 'createLoginUser',
        formType: 'user',
        isSystem: 1,
      }, {
        displayName: '创建时间',
        fieldName: 'createTime',
        formType: 'text',
        isSystem: 1,
      }];
    },
    eventTypes() {
      if (!this.initData || (this.initData && !this.initData.eventTypeList)) return [];
      return this.initData.eventTypeList.map(t => Object.freeze(t));
    },
    taskTypes() {
      if (!this.initData || (this.initData && !this.initData.taskTypeList)) return [];
      return this.initData.taskTypeList.map(t => Object.freeze(t));
    },
    /** 当前用户的权限 */
    permission() {
      console.log(this.initData.loginUser.authorities)
      return this.initData.loginUser.authorities;
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
     * 满足以下条件允许为客户添加产品
     * 1. 客户没有被删除
     * 2. 产品创建权限
     */
    allowCreateProduct() {
      return !this.isDelete && this.permission.PRODUCT_CREATE;
    },
    /** 
     * 是否有编辑客户权限，需要满足以下条件之一：
     * 
     * 1. 编辑客户全部权限： 全部客户
     * 2. 编辑客户团队权限： 没有团队的客户都可编辑，有团队的按团队匹配。 包含个人权限
     * 3. 编辑客户个人权限： 自己创建的 或 客户负责人
     */
    hasEditCustomerAuth(){
      let customer = this.customer;
      let loginUserId = this.loginUser.userId;
      return AuthUtil.hasAuthWithDataLevel(this.permission, 'CUSTOMER_EDIT',
        // 团队权限判断
        () => {
          let tags = Array.isArray(customer.tags) ? customer.tags : [];
          // 无团队则任何人都可编辑
          if(tags.length == 0) return true;

          let loginUserTagIds = this.initData.loginUser.tagIdsWithChildTag || [];
          return tags.some(tag => loginUserTagIds.indexOf(tag.id) >= 0);
        }, 
        // 个人权限判断
        () => {
          return customer.createUser == loginUserId || this.isCustomerManager
        }
      );
    },
    /** 
     * 是否有查看客户权限，需要满足以下条件之一：
     * 
     * 1. 查看客户全部权限： 全部客户
     * 2. 查看客户团队权限： 没有团队的客户都可查看，有团队的按团队匹配。 包含个人权限
     * 3. 查看客户个人权限： 自己创建的 或 客户负责人
     */
    hasViewCustomerAuth(){
      let customer = this.customer;
      let loginUserId = this.loginUser.userId;
      return AuthUtil.hasAuthWithDataLevel(this.permission, 'CUSTOMER_VIEW', 
        // 团队权限判断
        () => {
          let tags = Array.isArray(customer.tags) ? customer.tags : [];
          // 无团队则任何人都可编辑
          if(tags.length == 0) return true;

          let loginUserTagIds = this.initData.loginUser.tagIdsWithChildTag || [];
          return tags.some(tag => loginUserTagIds.indexOf(tag.id) >= 0);
        }, 
        // 个人权限判断
        () => {
          return customer.createUser == loginUserId || this.isCustomerManager
        }
      );
    },
    // permissionAccordingToTag() {
    //   const c = this.customer;
    //   let tags = Array.isArray(c.tags) ? c.tags : [];
    //   let loginUserTagIds = this.initData.loginUser.tagIds || [];
    //   //无团队则任何人都可编辑
    //   if (tags.length == 0) return true;

    //   //团队权限验证 return Boolean
    //   let result = tags.filter(tag => loginUserTagIds.some(tId => tId === tag.id));

    //   return result.length > 0;
    // },
    /**
     * 当前用户是否是该客户负责人
     * 客户负责人用于和客户创建人相同权限
     */
    isCustomerManager() {
      return this.loginUser.userId === this.customer.customerManager;
    },
    /** 子组件所需的数据 */
    propsForSubComponents() {
      return {
        customer: this.customer,
        loginUser: this.initData.loginUser,
        allowEditCustomer: this.allowEditCustomer,
        isAddressAllowNull: this.initData.isAddressAllowNull,
        isPhoneUnique: this.initData.isPhoneUnique,
        isDisable: this.isDisable,
        isDelete: this.isDelete,
      };
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
      return !this.isDelete && !this.isDisable && this.hasEditCustomerAuth && AuthUtil.hasAuth(this.permission, 'TASK_ADD');
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
      return !this.isDelete && !this.isDisable && this.hasEditCustomerAuth && AuthUtil.hasAuth(this.permission, 'CASE_ADD');
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
      return !this.isDelete && !this.isDisable && this.hasEditCustomerAuth && planTaskEnabled && AuthUtil.hasEveryAuth(this.permission, ['TASK_ADD', 'TASK_DISPATCH'])
    },
    isPhoneUnique() {
      return this.initData.isPhoneUnique;
    },
    isDivideByTag() {
      return this.initData.isDivideByTag;
    },
    /** 是否关注该客户 */
    isAttention(){
      return this.attentionUsers.some(u => u.userId == this.loginUser.userId);
    }
  },
  filters: {
    /** @deprecated */
    fmt_tag(value) {
      if (!Array.isArray(value) || !value || !value.length) return '';
      return value.map(t => t.tagName).join('， ');
    }
  },
  methods: {
    /** 抓取该客户的关注列表 */
    async fetchAttentionUsers(){
      try {
        let params = {customerId: this.id}
        let result = await CustomerApi.attentionList(params);

        if(result.status == 0){
          this.attentionUsers = result.data || [];
        }
      } catch (error) {
        console.error(error)
      }
    },
    execAttentionCommand(command){
      if(command == 'toggle') return this.toggleAttention();
      if(command == 'view') {
        return this.hasEditCustomerAuth && this.$refs.customerAttention.view(this.attentionUsers)
      }
    },
    /** 切换该客户的关注状态 */
    async toggleAttention(event){
      try{
        let params = {
          customerId: this.id,
          module: 'customer',
          action: this.isAttention ? '取消关注' : '关注'
        }

        let result = await CustomerApi.toggleAttention(params);
        // 这里推荐至直接throw Exception
        if(result.status == 1) throw new Exception(result.message);

        Platform.notification({
          type: 'success',
          title: this.isAttention ? '取消关注成功' : '关注客户成功',
          message: this.isAttention ? '您不会再接收该客户信息动态变更的通知' : '当该客户信息动态变更时，您会收到钉钉通知'
        });
        
        this.fetchAttentionUsers();
        this.fetchStatisticalData();
        this.$eventBus.$emit('customer_info_record.update_record_list');
      } catch(e){
        if(e instanceof Exception){
          Platform.notification({
            type: 'error',
            title: '失败',
            message: e.message
          })
        }
      }
    },
    /** 取消某些用户对该客户的关注 */
    async updateAttentionUser({removeUsers, userName}){
      try{
        let params = {
          customerId: this.id,
          userIds: removeUsers.map(u => u.userId).join(',')
        }

        let result = await CustomerApi.cancelAttention(params);
        // 这里推荐至直接throw Exception
        if(result.status == 1) throw new Exception(result.message);

        Platform.notification({
          type: 'success',
          title: '取消关注成功',
          message: `${userName}不会再接收该客户信息动态变更的通知`
        });

        this.fetchAttentionUsers();
        this.$eventBus.$emit('customer_info_record.update_record_list');
      } catch(e){
        if(e instanceof Exception){
          Platform.notification({
            type: 'error',
            title: '失败',
            message: e.message
          })
        }
      }
    },
    // 更新客户名称的样式
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
        fromId
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
        fromId
      })      
    },
    /** 从客户创建计划工单 */
    createPlanTask(typeId){
      let customer = this.customer || {};
      let fromId = window.frameElement.getAttribute('id');

      this.$platform.openTab({
        id: 'createPlan',
        title: '新建计划任务',
        close: true,
        url: `/task/planTask/create?defaultTypeId=${typeId}&customerId=${customer.id}`,
        fromId
      })
    },
    selectTab(tab) {
      this.currTab = tab;
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

      return [
        {
          displayName: `信息动态(${recordQuantity || 0})`,
          component: CustomerInfoRecord.name,
          slotName: 'record-tab',
          show: true,
        }, 
        {
          displayName: `联系人(${linkmanQuantity || 0})`,
          component: CustomerContactTable.name,
          show: !this.isDelete
        },
        {
          displayName: `客户地址(${addressQuantity || 0})`,
          component: CustomerAddressTable.name,
          show: !this.isDelete
        },
        {
          displayName: `客户产品(${productQuantity || 0})`,
          component: CustomerProductTable.name,
          show: !this.isDelete
        }, 
        {
          displayName: taskQuantity ? `工单(${unfinishedTaskQuantity || 0}/${taskQuantity >= 1000 ? '999+' : taskQuantity})` : '工单(0)',
          component: CustomerTaskTable.name,
          show: true,
        }, 
        {
          displayName: eventQuantity ? `事件(${unfinishedEventQuantity || 0}/${eventQuantity >= 1000 ? '999+' : eventQuantity})` : '事件(0)',
          component: CustomerEventTable.name,
          show: true,
        }, 
        {
          displayName: `计划任务(${plantaskQuantity || 0})`,
          component: CustomerPlanTable.name,
          show: this.allowCreatePlanTask
        }, 
        {
          displayName: `客户提醒(${remindQuantity || 0})`,
          component: CustomerRemindTable.name,
          show: !this.isDelete && !this.isDisable
        }, ]
        .filter(tab => tab.show);
    },
    async deleteCustomer() {
      try {
        if (!await this.$platform.confirm('确定要删除该客户？')) return;
        const result = await this.$http.get(`/customer/delete/${this.customer.id}`);
        if (!result.status) {
          let fromId = window.frameElement.getAttribute('fromid');
          this.$platform.refreshTab(fromId);

          window.location.reload();
        }
      } catch (e) {
        console.error('customer-detail-view deleteCustomer error', e);
      }
    },
    fetchCustomer() {
      const id = this.initData.id;
      this.$http.get('/customer/get', {id})
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
      window.location.href = `/customer/product/create?customerId=${id}`
    },
    goBack() {
      parent.frameHistoryBack(window);
    },
    updateRemind(remind) {
      this.selectedRemind = remind || {};
      this.$nextTick(() =>  {
        this.$refs.addRemindDialog.openDialog(this.selectedRemind.sendRoleSetting || {});
      });
    }
  },
  mounted() {
    this.loading = true;
    this.fetchCustomer();
    this.fetchStatisticalData();
    this.fetchAttentionUsers();

    let query = qs.parse(window.location.search);
    if (query && query.active === 'product') {
      this.currTab = 'customer-product-table';
    }

    this.$eventBus.$on('customer_detail_view.update_remind', this.updateRemind);
    this.$eventBus.$on('customer_detail_view.update_statistical_data', this.fetchStatisticalData);
    this.$eventBus.$on('customer_detail_view.update_customer_detail', this.fetchCustomer);
    this.$eventBus.$on('customer_detail_view.select_tab', this.selectTab);
  },
  beforeDestroy() {
    this.$eventBus.$off('customer_detail_view.update_remind', this.updateRemind);
    this.$eventBus.$off('customer_detail_view.update_statistical_data', this.fetchStatisticalData);
    this.$eventBus.$off('customer_detail_view.update_customer_detail', this.fetchCustomer);
    this.$eventBus.$off('customer_detail_view.select_tab', this.selectTab);
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
    [CustomerAttention.name]: CustomerAttention
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
    display: flex;
    flex-flow: column nowrap;
  }

  .customer-tool-bar {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    color: $text-color-regular;
    border-bottom: 1px solid #f2f2f2;

    .btn-text {
      padding: 5px 12px;
      .iconfont{
        font-size: 14px;
      }
    }
  }

  .customer-toolbar-left{
    padding: 10px 5px 10px 10px;
  }

  .customer-toolbar-right{
    padding: 10px 10px 10px 5px;
  }

  .main-content {
    display: flex;
    flex-flow: row nowrap;
    flex: 1;
    position: relative;
  }

  .customer-detail {
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

    .sample-tooltip-container {
      background-color: #eef8f8;;
    }

    .sample-tooltip-content {
      padding-left: 0;
    }

  }

  .customer-name{
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

    &.customer-name-expand{
      span{
        white-space: normal;
      }

      .iconfont{
        transform: rotateZ(-180deg);
      }
    }

    .customer-name-delete,
    .customer-name-disable{
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

    .customer-name-delete{
      background-color: $color-danger;
    }
    .customer-name-disable{
      background-color: #ffc107;
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

  .link-of-dropdown {
    color: $text-color-primary;
    display: block;
    &:hover {
      text-decoration: none;
    }
  }

  .customer-team-row .form-view-row-content p{
    margin: 0;
    & + p{
      margin-top: 10px;
    }
  }
</style>
