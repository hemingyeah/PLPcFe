<template>
  <div class="page-container">
    <div class="customer-tool-bar">
      <div>
        <base-button type="only-text" button-text="返回" icon="icon-arrow-left" @event="goBack"></base-button>
        <base-button type="only-text" button-text="编辑" icon="icon-edit" @event="jump" v-if="allowEditCustomer"></base-button>
        <base-button type="only-text" button-text="删除" icon="icon-yemianshanchu" @event="deleteCustomer" v-if="allowDeleteCustomer"></base-button>
        <base-button type="only-text" button-text="添加提醒" icon="icon-notification" @event="openDialog('remind')"></base-button>
      </div>
      <div class="action-btn">
        <el-dropdown trigger="click">
          <span class="el-dropdown-link el-dropdown-btn">
            <i class="el-icon-arrow-down"></i>工单
          </span>

          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-for="task in taskTypes" :key="task.id">
              <a class="link-of-dropdown" :href="`/task/createFromCustomer/${id}?defaultTypeId=${task.id}`">
                {{task.name}}
              </a>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-dropdown trigger="click">
          <span class="el-dropdown-link el-dropdown-btn">
            <i class="el-icon-arrow-down"></i>事件
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-for="event in eventTypes" :key="event.id">
              <a class="link-of-dropdown" :href="`/event/createFromCustomer/${id}?defaultTypeId=${event.id}`">
                {{event.name}}
              </a>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-dropdown trigger="click">
          <span class="el-dropdown-link el-dropdown-btn">
            <i class="el-icon-arrow-down"></i>计划任务
          </span>

          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-for="task in taskTypes" :key="task.id">
              <a class="link-of-dropdown" :href="`/task/planTask/create?defaultTypeId=${task.id}&customerId=${id}`">
                {{task.name}}
              </a>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <base-button type="plain" icon="icon-add" button-text="联系人" @event="openDialog('contact')"></base-button>
        <base-button type="plain" icon="icon-add" button-text="地址" @event="openDialog('address')"></base-button>
        <base-button type="plain" icon="icon-add" button-text="产品" @event="createProduct('address')"></base-button>
      </div>
    </div>
    <div class="main-content">
      <div class="customer-detail">
        <h3>{{customer.name}}</h3>
        <form-view :fields="fields" :value="customer">
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
        <base-tabbar :tabs="tabs" v-model="currTab">
          <!--<div class="record-tab-label" slot="customer-info-record__tab"><i class="iconfont icon-timeline"></i>信息动态-->
          <!--</div>-->
        </base-tabbar>
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
        tabs: this.buildTabs(),
        //当前选中的tab
        currTab: 'customer-info-record',
        customerOption: {},
        remindList: [],
        selectedRemind: {},
        customer: {},
      }
    },
    computed: {
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
      }
    },
    methods: {
      buildTabs() {
        return [{
          displayName: '信息动态',
          component: CustomerInfoRecord.name,
          slotName: 'record-tab',
          show: true,
        }, {
          displayName: '客户提醒',
          component: CustomerRemindTable.name,
          show: true,
        }, {
          displayName: '事件',
          component: CustomerEventTable.name,
          show: true,
        }, {
          displayName: '工单',
          component: CustomerTaskTable.name,
          show: true,
        }, {
          displayName: '计划任务',
          component: CustomerPlanTable.name,
          show: this.initData.planTaskEnabled
        }, {
          displayName: '客户产品',
          component: CustomerProductTable.name,
          show: true,
        }, {
          displayName: '客户地址',
          component: CustomerAddressTable.name,
          show: true,
        }, {
          displayName: '联系人',
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
      fetchCustomer(id) {
        this.$http.get(`/v2/customer/get`, {id})
        .then(res => {
          if (res.status) return;
          this.customer = Object.freeze(res.data);
        })
        .catch(err => console.error('customer-detail-view fetchCustomer catch error /n', err));
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
        window.history.go(-1);
      },
      updateRemind(remind) {
        this.selectedRemind = remind || {};
        this.$nextTick(this.$refs.addRemindDialog.openDialog);
      }
    },
    mounted() {
      this.fetchCustomer(this.initData.id);
      this.$eventBus.$on('customer_detail_view.update_remind', this.updateRemind);
    },
    beforeDestroy() {
      this.$eventBus.$off('customer_detail_view.update_remind', this.updateRemind);
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

  body {
    padding: 10px;
  }

  .page-container {
    background: #fff;
    border-radius: 3px;
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
    padding: 12px 20px;
    border-bottom: 1px solid #f2f2f2;

  }

  .main-content {
    display: flex;
    flex-flow: row nowrap;
    height: calc(100% - 39px);
  }

  .customer-detail {
    height: 95%;
    background: #fff;
    width: 520px;
    border-right: 1px solid #f2f2f2;

    h3 {
      margin: 0;
      margin-bottom: 5px;
      padding: 0 20px;
      line-height: 50px;
      font-size: 22px;
      color: $text-color-primary;
      background: $color-primary-light-9;
      font-weight: normal;
      position: relative;
      &:after{
        content: '';
        display: block;
        position: absolute;
        width: 10px;
        right: -11px;
        top: 0;
        height: 100%;
        background: $color-primary-light-9;
      }
    }
  }

  .customer-relation {
    height: 100%;
    flex: 1;
    background: #fff;
    min-width: 500px;
    margin-left: 10px;
    border-radius: 2px;
  }

  .customer-relation-content {
    height: calc(100% - 46px);
  }

  .action-btn {
    .el-dropdown {
      line-height: 39px;
    }
    .el-dropdown-btn {
      padding: 0 15px;
      line-height: 34px;
      display: inline-block;
      background: $color-primary-light-9;
      color: $text-color-primary;
      .iconfont {
        margin-right: 3px;
      }

      &:hover {
        cursor: pointer;
        color: #fff;
        background: $color-primary;
      }
    }
  }

  .link-of-dropdown {
    color: $text-color-primary;
    &:hover {
      text-decoration: none;
    }
  }

</style>
