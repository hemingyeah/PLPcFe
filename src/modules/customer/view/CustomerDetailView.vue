<template>
  <div class="customer-detail-container">
    <div class="top-tool-bar">
      <el-button icon="el-icon-search">返回</el-button>

      <div class="action-btn">
        <el-dropdown trigger="click">
          <span class="el-dropdown-link el-dropdown-btn">
            新建事件<i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>黄金糕</el-dropdown-item>
            <el-dropdown-item>狮子头</el-dropdown-item>
            <el-dropdown-item>螺蛳粉</el-dropdown-item>
            <el-dropdown-item>双皮奶</el-dropdown-item>
            <el-dropdown-item>蚵仔煎</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-dropdown trigger="click">
          <span class="el-dropdown-link el-dropdown-btn">
            新建工单<i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>黄金糕</el-dropdown-item>
            <el-dropdown-item>狮子头</el-dropdown-item>
            <el-dropdown-item>螺蛳粉</el-dropdown-item>
            <el-dropdown-item>双皮奶</el-dropdown-item>
            <el-dropdown-item>蚵仔煎</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <span @click="openDialog('contact')" class="el-dropdown-btn add-contact">添加联系人</span>
        <span @click="openDialog('address')" class="el-dropdown-btn">添加地址</span>
        <span class="el-dropdown-btn add-production">添加产品</span>
        <el-dropdown trigger="click">
          <span class="el-dropdown-link el-dropdown-btn">
            更多<i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-if="allowEditCustomer">
              <div @click="openDialog('remark')">添加备注</div>
            </el-dropdown-item>
            <el-dropdown-item @click="jump" v-if="allowEditCustomer">编辑</el-dropdown-item>
            <el-dropdown-item v-if="allowDeleteCustomer">
              <div @click="deleteCustomer">删除</div>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>

    </div>
    <div class="main-content">
      <div class="customer-detail">
        <h3>
          {{customer.name}}
          <span class="remind-btn" @click="openDialog('remind')">添加提醒</span>
        </h3>
        <form-view :fields="allField" :value="customer">
          <template slot="address" slot-scope="{value}">
            <div class="app-row" v-if="value">
              <div class="app-row-left">区域：</div>
              <div class="app-row-right">
                {{`${value.adProvince} ${value.adCity} ${value.adDist}`}}
              </div>
            </div>
            <div class="app-row" v-if="value">
              <div class="app-row-left">详细地址：</div>
              <div class="app-row-right">
                {{value.adAddress}}
                <i v-if="value.adLatitude && value.adLongitude" @click="openMap" class="iconfont icon-guide"></i>
              </div>
            </div>
          </template>
        </form-view>
      </div>
      <div class="customer-data">
        关联数据
        <base-tab-pane :tabs="tabs">
          <div class="record-tab-label" slot="record-tab">
            信息动态
            <div class="point"></div>
          </div>
        </base-tab-pane>
      </div>
    </div>
    <ul>
      <li v-for="r in remindList" :key="r.id">
        <p style="display: flex;justify-content: space-between">
          提醒名称：{{r.remind.name}}
          <a @click="editRemind(r)" href="javascript:;">编辑</a>
        </p>
        <p style="display: flex;justify-content: space-between">
          预计发生时间：{{r.remindTime || '无'}}
          <a @click="deleteRemind(r.id, r.remind.name)" href="javascript:;">删除</a>
        </p>
      </li>
    </ul>

    <add-contact-dialog ref="addContactDialog" :customer="customer"></add-contact-dialog>
    <add-remark-dialog ref="addRemarkDialog" :customer="customer" @reload-remark="reloadRemark"></add-remark-dialog>
    <add-address-dialog ref="addAddressDialog" :customer-id="customer.id"
                        :default-address="initData.customerAddress"></add-address-dialog>
    <remind-customer-dialog ref="addRemindDialog" :customer="customer" :edited-remind="selectedRemind"
                            @success-callback="selectedRemind = {}"></remind-customer-dialog>
  </div>
</template>

<script>
  import CustomerInfoRecord from './components/CustomerInfoRecord.vue';
  import CustomerEventTable from './components/CustomerEventTable.vue';
  import CustomerContactTable from './components/CustomerContactTable.vue';
  import CustomerAddressTable from './components/CustomerAddressTable.vue';

  import AddAddressDialog from './operationDialog/AddAddressDialog.vue';
  import AddContactDialog from './operationDialog/AddContactDialog.vue';
  import AddRemarkDialog from './operationDialog/AddRemarkDialog.vue';
  import RemindCustomerDialog from './operationDialog/RemindCustomerDialog.vue';
  import BaseTabPane from '../../../component/common/BaseTabPane'

  import FormView from '@src/component/form/FormView';

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
        tabs: [{
          displayName: '信息动态',
          component: CustomerInfoRecord,
          componentName: 'customer-info-record',
          props: {
            'customer-id': '26654253-d2a6-11e8-b3c6-00163e304a25'
          },
          slotName: 'record-tab',
        }, {
          displayName: '事件',
          component: CustomerEventTable,
          componentName: 'customer-event-table',
          props: {
            'customer-id': '26654253-d2a6-11e8-b3c6-00163e304a25'
          }
        }, {
          displayName: '客户地址',
          component: CustomerAddressTable,
          componentName: 'customer-address-table',
          props: {
            'customer-id': '26654253-d2a6-11e8-b3c6-00163e304a25'
          }
        }, {
          displayName: '客户联系人',
          component: CustomerContactTable,
          componentName: 'customer-contact-table',
          props: {
            'customer-id': '26654253-d2a6-11e8-b3c6-00163e304a25'
          }
        }],
        tab: 'customer-info-record',
        customerOption: {},
        remindList: [],
        selectedRemind: {},
        customer: {},
      }
    },
    computed: {
      allField() {
        const cf = [{
          id: null,
          formType: 'text',
          displayName: '客户编号',
          fieldName: 'serialNumber',
          isSystem: 1,
        }, {
          id: null,
          formType: 'text',
          displayName: '联系人',
          fieldName: 'lmName',
          isSystem: 1,
        }, {
          id: null,
          formType: 'phone',
          displayName: '电话',
          fieldName: 'lmPhone',
          isSystem: 1,
        }, {
          id: null,
          formType: 'address',
          displayName: '区域',
          fieldName: 'customerAddress',
          isSystem: 1,
        }, {
          id: null,
          formType: 'tags',
          displayName: '服务团队',
          fieldName: 'tags',
          isSystem: 1,
        }, {
          id: null,
          formType: 'text',
          displayName: '客户负责人',
          fieldName: 'customerManagerName',
          isSystem: 1,
        }];

        return [...cf, ...this.initData.fieldInfo];
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

    },
    mounted() {
      this.fetchCustomer(this.initData.id);
      this.fetchRemind();
    },
    methods: {
      async deleteCustomer() {
        try {
          const action = await this.$platform.confirm('确定要删除该客户？');
          if (!action) return;

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
          this.$refs.addAddressDialog.openDialog();
        } else if (action === 'contact') {
          this.$refs.addContactDialog.openDialog();
        } else if (action === 'remark') {
          this.$refs.addRemarkDialog.openDialog();
        } else if (action === 'remind') {
          this.$refs.addRemindDialog.openDialog();
        }
      },
      // remind func
      editRemind(remind) {
        this.selectedRemind = remind;
        this.$nextTick(this.$refs.addRemindDialog.openDialog);
      },
      fetchRemind() {
        const params = {
          modalId: this.customer.id,
          modal: 'customer'
        };
        this.$http.get('/customer/remind/list', params)
        .then(res => {
          this.remindList = res;
        })
      },
      async deleteRemind(id, name) {
        try {
          const action = await this.$platform.confirm(`确定删除 ${name}`);

          if (!action) return
        } catch (e) {
          console.error('deleteRemind catch err', e);
        }

        this.$http.get(`/scheduler/delete/${id}`)
        .catch(err => console.error('deleteRemind err', err));

      },
      jump() {
        window.location.href = `/customer/edit/${this.initData.id}`
      },
      reloadRemark() {

      },
    },
    components: {
      CustomerInfoRecord,
      CustomerEventTable,
      CustomerContactTable,
      CustomerAddressTable,
      AddAddressDialog,
      AddContactDialog,
      AddRemarkDialog,
      FormView,
      BaseTabPane,
      [RemindCustomerDialog.name]: RemindCustomerDialog,
    }
  }
</script>

<style lang="scss">

  .customer-detail-container {
    padding: 10px 15px;
    background: #f4f7f5;

    .top-tool-bar {
      display: flex;
      justify-content: space-between;
      background: #fff;
      padding: 10px;
      margin-bottom: 10px;
      font-size: 14px;
      color: #666;

      .el-button {
        margin-left: 0;
        height: 32px;
        align-self: center;
      }
    }

    .action-btn {
      .el-dropdown {
        line-height: 39px;
      }
      .el-dropdown-btn {
        padding: 0 10px;
        line-height: 16px;
        &:hover {
          cursor: pointer;
          color: #00ac97;
        }
      }

      .add-contact {
        border-left: 1px solid #ccc;
      }
      .add-production {
        border-right: 1px solid #ccc;
      }

    }

    .app-row {
      display: flex;
      justify-content: flex-start;
      .app-row-left {
        width: 100px;
      }
      .app-row-right {
        width: 300px;
      }
    }
  }

  .customer-detail-container .main-content {
    display: flex;

    .customer-detail {
      background: #fff;
      padding: 0 10px 10px;
      min-width: 500px;

      h3 {
        display: flex;
        justify-content: space-between;
        line-height: 40px;
        border-bottom: 1px dashed #ccc;

        .remind-btn {
          font-weight: normal;
          font-size: 14px;
        }
      }

      .customer-info-list {
        list-style: none;
        padding: 0;

        li {
          color: #333;
          line-height: 26px;
          font-size: 12px;
          display: flex;

          label {
            font-size: 12px;
            width: 120px;
            padding-right: 10px;
            text-align: right;
            font-weight: 500;
            margin: 0;
          }
        }
      }
    }
  }

  .customer-detail-container .main-content .customer-data {
    background: #fff;
    padding: 0 10px 10px;
    min-width: 500px;
    margin-left: 15px;

    .record-tab-label {
      position: relative;

      .point {
        width: 8px;
        height: 8px;
        background: #FF6C60;
        border-radius: 50%;
        position: absolute;
        top: 10px;
        right: 10px;
      }
    }

  }

</style>
