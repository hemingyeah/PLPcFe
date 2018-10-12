<template>
  <div class="customer-detail-container">
    <div class="top-tool-bar">
      <div>
        <el-button type="primary" icon="el-icon-search">返回</el-button>
        <el-button type="primary" icon="el-icon-search">编辑</el-button>
        <el-button type="danger" icon="el-icon-search">删除</el-button>
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
          <span class="remind-btn">添加提醒</span>
        </h3>
        <ul class="customer-info-list">
          <li>
            <label for="">客户编号：</label>
            {{customer.serialNumber}}
          </li>
          <li>
            <label for="">联系人：</label>
            {{customer.lmName}}
          </li>
          <li>
            <label for="">电话：</label>
            {{customer.lmPhone}}
          </li>
          <li>
            <label for="">区域：</label>
            {{customer.address.area}}
          </li>
          <li>
            <label for="">详细地址：</label>
            {{customer.address.detail}}
          </li>
          <li>
            <label for="">服务团队：</label>
            {{customer.tag}}
          </li>
          <li>
            <label for="">客户负责人：</label>
            {{customer.customerManagerName}}
          </li>
          <li>
            <label for="">创建人：</label>
            {{customer.createUser}}
          </li>
          <li>
            <label for="">创建时间：</label>
            {{customer.createTime}}
          </li>
          <li v-if="customer.isDelete && customer.deleteRecord.id">
            <label for="">删除人：</label>
            {{customer.deleteRecord.operator.displayName}}
          </li>
          <li v-if="customer.isDelete && customer.deleteRecord.id">
            <label for="">删除时间：</label>
            {{customer.deleteRecord.operateTime}}
          </li>
          <li v-for="field in customer.attribute" :key="field.fieldName">
            <label for="">{{field.displayName}}：</label>
            {{field.value}}
          </li>
        </ul>
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

    <add-address-dialog ref="addAddressDialog"></add-address-dialog>
    <add-contact-dialog ref="addContactDialog"></add-contact-dialog>
    <add-remark-dialog ref="addRemarkDialog" :customer="customer" @reload-remark="reloadRemark"></add-remark-dialog>
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
        customer: {
          address: {},
          attribute: {},
        },
      }
    },
    mounted() {
      console.log('mounted', this.initData);
      this.fetchCustomer(this.initData.id);
    },
    methods: {
      fetchCustomer(id) {
        this.$http.get(`/v2/customer/getForEdit`, {id})
        .then(res => {
          if (res.status) return;
          let tv = convertCustomerForDisplay(res.data, this.initData.fieldInfo);
          this.customer = Object.freeze(tv);
          console.log('this.customer', this.customer);
        })
      },
      openDialog(action) {
        if (action === 'address') {
          this.$refs.addAddressDialog.openDialog();
        } else if (action === 'contact') {
          this.$refs.addContactDialog.openDialog();
        } else if (action === 'remark') {
          this.$refs.addRemarkDialog.openDialog();
        }

      },

      fetchRemind() {
        const params = {
          // modalId: 'cd4e8514-9285-11e8-8abd-7cd30abca02e',
          // modal: 'customer'
        };
        // /remind/list

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