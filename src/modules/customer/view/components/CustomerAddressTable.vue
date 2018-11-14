<template>
  <div class="customer-address-table-container">
    <el-table
      stripe
      :data="addressList"
      :highlight-current-row="false"
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
            <a href="javasript:;" @click="openDialog(scope.row)" class="edit-btn">{{scope.row[column.field]}}</a>
          </template>
          <div v-else-if="column.field === 'action'">
            <el-button type="danger" @click="deleteAddress(scope.row)" :disabled="pending[scope.row.id]" class="delete-address-btn"
                       size="mini" icon="iconfont icon-shanchu">删除
            </el-button>
          </div>
          <template v-else-if="column.field === 'type'">
            <span v-if="scope.row.isMain" style="text-align: center;display: block;">默认地址</span>
            <span v-else @click="setDefaultAddress(scope.row)" class="set-default-address-btn">
              <i class="iconfont icon-part"></i>设为默认
            </span>
          </template>

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
    <el-pagination
      class="customer-address-table-pagination"
      background
      @current-change="jump"
      :page-size="paginationInfo.pageSize"
      :current-page="paginationInfo.pageNum"
      layout="prev, pager, next"
      :total="paginationInfo.totalItems">
    </el-pagination>

    <edit-address-dialog ref="addAddressDialog" :customer-id="customerId"
                         :login-user-id="shareData.loginUser.userId" action="edit" @submit-success="fetchData"
                         :default-address="formatSelectedAddress"></edit-address-dialog>
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
        columns: this.buildColumns(),
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
      formatSelectedAddress() {
        const {province, city, dist, address, longitude, latitude, addressType, id} = this.selectedAddress;
        if (!province || !city) return {};
        return {
          adAddress: [province, city, dist],
          detail: address,
          adLongitude: longitude || '',
          adLatitude: latitude || '',
          addressType: addressType || 0,
          id
        }
      }
    },
    mounted() {
      this.fetchData();
      this.$eventBus.$on('customer_address_table.update_address_list', this.fetchData);
    },
    beforeDestroy() {
      this.$eventBus.$off('customer_address_table.update_address_list', this.fetchData);
    },
    methods: {
      openDialog(address) {
        this.selectedAddress = address;
        this.$nextTick(() => {
          this.$refs.addAddressDialog.openDialog();
        });

      },
      async deleteAddress(address) {
        if (address.isMain) return platform.alert('默认地址不能删除');
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
        });
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
        
        this.$http.get('/v2/customer/address/list', params)
        .then(res => {
          this.addressList = res.list
          .map(address => {
            this.$set(this.pending, address.id, false);

            adArr = [address.province, address.city, address.dist]
            .filter(ad => ad);
            address.area = _.uniq(adArr).join('-');
            address.createTime = formatDate(new Date(address.createTime), 'YYYY-MM-DD HH:mm:ss');
            return Object.freeze(address);
          });

          this.paginationInfo.totalItems = res.total;
        })
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
          label: '',
          field: 'type',
          show: true,
          width: '110px',
          tooltip: true
        }, {
          label: '操作',
          field: 'action',
          show: true,
          tooltip: false
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

    .can-open-map:hover {
      cursor: pointer;
    }

    .edit-btn {
      color: #2F93C0
    }

    .delete-address-btn {
      .iconfont {
        position: relative;
        top: 1px;
      }
    }

    .set-default-address-btn {
      line-height: 34px;
      display: block;
      text-align: center;
      border-radius: 3px;

      &:hover {
        cursor: pointer;
        background-color: #e7e7e7;
      }
    }

    .address-action .iconfont {
      font-size: 12px;
    }

    .customer-address-table-pagination {
      text-align: right;
      margin-top: 7px;
    }
  }
</style>