<template>
  <div class="customer-address-table-container">
    <el-table
      stripe
      :data="addressList"
      :highlight-current-row="false"
      header-row-class-name="customer-address-table-header"
      row-class-name="customer-address-table-row"
      class="customer-address-table">
      <el-table-column
        v-for="column in columns"
        v-if="column.show"
        :key="column.field"
        :label="column.label"
        :prop="column.field"
        :width="column.width"
        :min-width="column.minWidth"
        :sortable="column.sortable"
        :show-overflow-tooltip="column.tooltip"
        :align="column.align">
        <template slot-scope="scope">
          <template v-if="column.field === 'area'">
            <a v-if="allowEditCustomer" href="javascript:;" @click="openDialog(scope.row)" class="edit-btn">{{scope.row[column.field] || '请补全'}}</a>
            <template v-else>{{scope.row[column.field]}}</template>
          </template>
          <div v-else-if="column.field === 'action'" class="action">
            <template>
              <span v-if="scope.row.isMain" style="line-height: 26px;padding: 1px">默认地址</span>
              <el-button v-else @click="setDefaultAddress(scope.row)" type="text" :disabled="pending[scope.row.id]">
                设为默认
              </el-button>
            </template>
            <el-button type="text" @click="deleteAddress(scope.row)" :disabled="pending[scope.row.id]" class="delete-address-btn"
                       size="mini">删除
            </el-button>
          </div>
          <div v-else-if="column.field === 'address'" :class="{'can-open-map': scope.row.longitude && scope.row.latitude, }" @click.stop="openMap(scope.row)">
            {{scope.row[column.field]}}
            <i class="iconfont icon-address customer-address-icon" @click.stop="openMap(scope.row)"
               v-if="scope.row.longitude && scope.row.latitude"></i>
          </div>
          <template v-else>
            {{scope.row[column.field]}}
          </template>
        </template>
      </el-table-column>
    </el-table>
    <div class="address-table-footer">
      <p class="total-count">共<span>{{paginationInfo.totalItems}}</span>条记录</p>
      <el-pagination
        class="customer-address-table-pagination"
        v-if="paginationInfo.totalItems"
        background
        @current-change="jump"
        :page-size="paginationInfo.pageSize"
        :current-page="paginationInfo.pageNum"
        layout="prev, pager, next"
        :total="paginationInfo.totalItems">
      </el-pagination>
    </div>

    <edit-address-dialog ref="addAddressDialog" :customer-id="customerId"
                         :login-user-id="shareData.loginUser.userId" action="edit" @submit-success="fetchData"
                         :default-address="selectedAddress"></edit-address-dialog>
  </div>
</template>

<script>
import {formatDate,} from '@src/util/lang';
import platform from '@src/platform'
import EditAddressDialog from '../operationDialog/EditAddressDialog.vue';
import _ from 'lodash';

export default {
  name: "customer-address-table",
  props: {
    shareData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      addressList: [],
      selectedAddress: {},
      pending: {},
      columns: [],
      paginationInfo: {
        pageSize: 10,
        pageNum: 1,
        totalItems: 0,
      }
    }
  },
  computed: {
    customerId() {
      return this.shareData.customer ? this.shareData.customer.id : '';
    },
    allowEditCustomer() {
      return !this.shareData.isDelete && !this.shareData.isDisable && this.shareData.allowEditCustomer;
    },
    isAddressAllowNull() {
      return this.shareData.isAddressAllowNull;
    },
  },
  mounted() {
    this.fetchData();
    this.columns = this.buildColumns();
    this.$eventBus.$on('customer_address_table.update_address_list', this.fetchData);
  },
  beforeDestroy() {
    this.$eventBus.$off('customer_address_table.update_address_list', this.fetchData);
  },
  methods: {
    openDialog(address) {
      if (!this.allowEditCustomer) return;
      this.selectedAddress = address;
      this.$nextTick(() => {
        this.$refs.addAddressDialog.openDialog();
      });

    },
    async deleteAddress(address) {
      if (address.isMain && !this.isAddressAllowNull) return platform.alert('默认地址不能删除');
      try {
        if (!await platform.confirm('确定要删除该地址？')) return;
        this.pending[address.id] = true;
        const reqRes = await this.$http.post('/customer/address/delete', {ids: address.id,}, false);
        delete this.pending[address.id];
        if (reqRes.status === 0) {
          this.fetchData();
        } else {
          platform.alert(reqRes.message);
        }
        this.$eventBus.$emit('customer_info_record.update_record_list');
        this.$eventBus.$emit('customer_detail_view.update_statistical_data');
        if (address.isMain) {
          this.$eventBus.$emit('customer_detail_view.update_customer_detail');
        }
      } catch (e) {
        console.error('err',);
      }
    },
    setDefaultAddress(address) {
      if (this.pending[address.id]) return;
      this.pending[address.id] = true;
      this.$http.post('/customer/address/setMain', {id: address.id}, false)
        .then(res => {
          if (res.status === 0) {
            this.fetchData();
          } else {
            platform.alert(res.message);
          }
          this.pending[address.id] = false;
          this.$eventBus.$emit('customer_detail_view.update_customer_detail');
        })
        .catch(e => console.error('caught e', e));
    },
    openMap(address) {
      if (!address.longitude && !address.latitude) return;

      const ad = {
        adLongitude: address.longitude,
        adLatitude: address.latitude,
      };

      this.$fast.map.display(ad, {title: '客户地址',})
        .catch(err => console.error('openMap catch an err: ', err));
    },

    jump(pN) {
      this.paginationInfo.pageNum = pN;
      this.fetchData();
    },
    fetchData() {
      const params = {
        customerId: this.customerId,
        pageNum: this.paginationInfo.pageNum,
        pageSize: this.paginationInfo.pageSize,
      };
      let adArr = [];
        
      this.$http.get('/customer/address/list', params)
        .then(res => {
          this.addressList = res.list
            .map(address => {
              this.$set(this.pending, address.id, !!address.isMain && !this.isAddressAllowNull);

              adArr = [address.province, address.city, address.dist]
                .filter(ad => ad);
              address.area = _.uniq(adArr).join('-');
              address.createTime = formatDate(new Date(address.createTime), 'YYYY-MM-DD HH:mm:ss');
              return Object.freeze(address);
            });

          this.paginationInfo.totalItems = res.total;
        })
        .catch(e => console.error('caught e', e))
    },
    buildColumns() {
      return [{
        label: '地址',
        field: 'area',
        show: true,
        minWidth: '200px',
        tooltip: true,
        // sortable: 'custom',
      }, {
        label: '详细地址',
        field: 'address',
        show: true,
        minWidth: '200px',
        tooltip: true
      }, {
        label: '操作',
        field: 'action',
        show: this.allowEditCustomer,
        tooltip: false,
        width: '120px',
      }]
    }
  },
  components: {
    EditAddressDialog,
    [EditAddressDialog.name]: EditAddressDialog,
  }
}
</script>

<style lang="scss">

  .customer-address-table-container {
    padding: 10px 10px 10px 5px;

    .customer-address-table-header th{
      background: #F5F5F5;
      color: $text-color-primary;
    }

    .can-open-map:hover {
      cursor: pointer;
    }

    .edit-btn {
      color: $color-primary;
    }

    .action {
      display: flex;
      justify-content: space-between;
    }

    .delete-address-btn {
      color: $color-danger;
    }

    .delete-address-btn.is-disabled,
    .delete-address-btn.is-disabled:hover,
    .el-button.delete-address-btn:focus {
      color: #c0c4cc;
      cursor: not-allowed;
      background-image: none;
    }

    .customer-address-table-pagination {
      text-align: right;
      margin-top: 7px;
    }

    .address-table-footer {
      display: flex;
      justify-content: space-between;

      .total-count {
        padding: 0 10px;
        font-size: 12px;
        margin: 0;
        line-height: 46px;
        span {
          padding: 0 5px;
          color: $color-primary;
        }
      }
    }
  }
</style>