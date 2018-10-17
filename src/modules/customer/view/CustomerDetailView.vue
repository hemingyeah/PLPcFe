<template>
  <div class="customer-detail-container">
    <div class="top-tool-bar">
      <div>
        <el-button type="primary" icon="el-icon-search">返回</el-button>
        <el-button type="primary" icon="el-icon-search" @click="jump">编辑</el-button>
        <el-button type="danger" icon="el-icon-search" @click="deleteCustomer">删除</el-button>
      </div>

      <div>
        <el-button type="primary" icon="el-icon-search" @click="openDialog('contact')">添加联系人</el-button>
        <el-button type="primary" icon="el-icon-search" @click="openDialog('address')">添加地址</el-button>
        <el-button type="primary" icon="el-icon-search">添加产品</el-button>
        <el-dropdown>
          <el-button type="primary">
            新建事件<i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>黄金糕</el-dropdown-item>
            <el-dropdown-item>狮子头</el-dropdown-item>
            <el-dropdown-item>螺蛳粉</el-dropdown-item>
            <el-dropdown-item>双皮奶</el-dropdown-item>
            <el-dropdown-item>蚵仔煎</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-dropdown>
          <el-button type="primary">
            新建工单<i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>黄金糕</el-dropdown-item>
            <el-dropdown-item>狮子头</el-dropdown-item>
            <el-dropdown-item>螺蛳粉</el-dropdown-item>
            <el-dropdown-item>双皮奶</el-dropdown-item>
            <el-dropdown-item>蚵仔煎</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-button type="primary" icon="el-icon-search" @click="openDialog('remark')">添加备注</el-button>
      </div>

    </div>
    <div class="main-content">
      <div class="customer-detail">

        <h3>
          {{customer.name}}
          <span class="remind-btn" @click="openDialog('remind')">添加提醒</span>
        </h3>
        <form-view :fields="allField" :value="originalCustomer">

          <template slot="address" slot-scope="{area, address}">
            <div class="app-row">
              <div class="app-row-left">区域：</div>
              <div class="app-row-right">
                {{area}}
              </div>
            </div>
            <div class="app-row">
              <div class="app-row-left">详细地址：</div>
              <div class="app-row-right">
                {{address}}
                <i v-if="customer.address.adLatitude && customer.address.adLongitude" @click="openMap" class="iconfont icon-guide"></i>
              </div>
            </div>
          </template>


        </form-view>

        <div>
          <!--<ul class="customer-info-list">-->
          <!--<li>-->
          <!--<label for="">客户编号：</label>-->
          <!--{{customer.serialNumber}}-->
          <!--</li>-->
          <!--<li>-->
          <!--<label for="">联系人：</label>-->
          <!--{{customer.lmName}}-->
          <!--</li>-->
          <!--<li>-->
          <!--<label for="">电话：</label>-->
          <!--{{customer.lmPhone}}-->
          <!--</li>-->
          <!--<li>-->
          <!--<label for="">区域：</label>-->
          <!--{{customer.address.area}}-->
          <!--</li>-->
          <!--<li>-->
          <!--<label for="">详细地址：</label>-->
          <!--<a href="javascript:;" @click="openMap">-->
          <!--{{customer.address.detail}}-->
          <!--</a>-->
          <!--</li>-->
          <!--<li>-->
          <!--<label for="">服务团队：</label>-->
          <!--{{customer.tag}}-->
          <!--</li>-->
          <!--<li>-->
          <!--<label for="">客户负责人：</label>-->
          <!--{{customer.customerManagerName}}-->
          <!--</li>-->
          <!--<li>-->
          <!--<label for="">创建人：</label>-->
          <!--{{customer.createUser.name}}-->
          <!--</li>-->
          <!--<li>-->
          <!--<label for="">创建时间：</label>-->
          <!--{{customer.createTime}}-->
          <!--</li>-->
          <!--<li v-if="customer.isDelete && customer.deleteRecord.id">-->
          <!--<label for="">删除人：</label>-->
          <!--{{customer.deleteRecord.operator.displayName}}-->
          <!--</li>-->
          <!--<li v-if="customer.isDelete && customer.deleteRecord.id">-->
          <!--<label for="">删除时间：</label>-->
          <!--{{customer.deleteRecord.operateTime}}-->
          <!--</li>-->
          <!--<li v-for="field in customer.attribute" :key="field.fieldName">-->
          <!--<template v-if="field.formType === 'attachment'">-->
          <!--<label for="">{{field.displayName}}：</label>-->
          <!--<base-file-item v-for="file in field.value" :file="file" :key="file.url" :del="false"></base-file-item>-->
          <!--</template>-->
          <!--<template v-else>-->
          <!--<label for="">{{field.displayName}}：</label>-->
          <!--{{field.value}}-->
          <!--</template>-->
          <!--</li>-->
          <!--</ul>-->
        </div>
      </div>
      <div class="customer-data">
        <div>
          关联数据
          <el-radio-group v-model="tab">
            <el-radio label="customer-info-record">信息动态</el-radio>
            <el-radio label="customer-event-table">事件</el-radio>
            <el-radio label="customer-address-table">客户地址</el-radio>
            <el-radio label="customer-contact-table">客户联系人</el-radio>
          </el-radio-group>
        </div>

        <keep-alive v-if="customer.id">
          <component :is="tab" :customer-id="customer.id"></component>
        </keep-alive>
      </div>
    </div>

    <ul>
      <li v-for="r in remindList" :key="r.id">
        <p style="display: flex;justify-content: space-between">提醒名称：{{r.remind.name}} <a @click="editRemind(r)"
                                                                                          href="javascript:;">编辑</a></p>
        <p style="display: flex;justify-content: space-between">预计发生时间：{{r.remindTime || '无'}} <a
          @click="deleteRemind(r.id, r.remind.name)" href="javascript:;">删除</a></p>
      </li>
    </ul>

    <add-address-dialog ref="addAddressDialog" :customer-id="customer.id"
                        :default-address="initData.customerAddress"></add-address-dialog>
    <add-contact-dialog ref="addContactDialog" :customer="originalCustomer"></add-contact-dialog>
    <add-remark-dialog ref="addRemarkDialog" :customer="customer" @reload-remark="reloadRemark"></add-remark-dialog>
    <remind-customer-dialog ref="addRemindDialog" :customer="originalCustomer" :edited-remind="selectedRemind"
                            @success-callback="selectedRemind = {}"></remind-customer-dialog>
  </div>
</template>

<script>
  import {convertCustomerForDisplay,} from '../util/customer';
  import CustomerInfoRecord from './components/CustomerInfoRecord.vue';
  import CustomerEventTable from './components/CustomerEventTable.vue';
  import CustomerContactTable from './components/CustomerContactTable.vue';
  import CustomerAddressTable from './components/CustomerAddressTable.vue';

  import AddAddressDialog from './operationDialog/AddAddressDialog.vue';
  import AddContactDialog from './operationDialog/AddContactDialog.vue';
  import AddRemarkDialog from './operationDialog/AddRemarkDialog.vue';
  import RemindCustomerDialog from './operationDialog/RemindCustomerDialog.vue';

  import FormView from '@src/component/form/FormView.js';

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
        tab: 'customer-info-record',
        originalCustomer: {},
        customerOption: {},
        remindList: [],
        selectedRemind: {},
        customer: {
          address: {},
          attribute: {},
          createUser: {},
        },
      }
    },
    computed: {
      allField() {
        const cf = [{
          id: null,
          formType: 'serialNumber',
          displayName: '客户编号',
          fieldName: 'serialNumber',
          isSystem: 1,
        }, {
          id: null,
          formType: 'lmName',
          displayName: '联系人',
          fieldName: 'lmName',
          isSystem: 1,
        }, {
          id: null,
          formType: 'lmPhone',
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
          formType: 'customerManagerName',
          displayName: '客户负责人',
          fieldName: 'customerManagerName',
          isSystem: 1,
        }];

        return [...cf, ...this.initData.fieldInfo];
      }
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
          console.log('result', result);
          if (!result.status) {
            window.location.href = '/customer';
          }
        } catch (e) {
          console.error('customer-detail-view deleteCustomer error', e);
        }
      },
      openMap() {
        this.$fast.map.display(this.originalCustomer.customerAddress, {title: this.customer.name,})
        .catch(err => console.error('openMap catch an err: ', err));

      },
      fetchCustomer(id) {
        this.$http.get(`/v2/customer/get`, {id})
        .then(res => {
          if (res.status) return;
          this.originalCustomer = res.data;
          let tv = convertCustomerForDisplay(res.data, this.initData.fieldInfo);
          this.customer = Object.freeze(tv);
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

      .el-button {
        margin-left: 0;
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

  }

</style>
