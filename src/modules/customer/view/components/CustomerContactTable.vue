<template>
  <div class="customer-contact-table-container">
    <el-table
      stripe
      :data="contactList"
      :highlight-current-row="false"
      header-row-class-name="customer-contact-table-header"
      row-class-name="customer-contact-table-row"
      class="customer-contact-table">
      <el-table-column
        v-for="column in columns"
        v-if="column.show"
        :key="column.field"
        :label="column.label"
        :prop="column.field"
        :width="column.width"
        :sortable="column.sortable"
        show-overflow-tooltip
        :align="column.align">
        <template slot-scope="scope">
          <template v-if="column.field === 'state'">
            {{scope.row[column.field]}}
          </template>
          <template v-else-if="column.field === 'name'">
            <a href="javasript:;" @click="openDialog(scope.row)" class="edit-btn">{{scope.row[column.field]}}</a>
          </template>
          <div class="lm-action" v-else-if="column.field === 'action'">
            <template>
              <span v-if="scope.row.isMain" style="line-height: 26px;padding: 1px">默认联系人</span>
              <el-button v-else @click="setDefaultLinkman(scope.row)" type="text" :disabled="pending[scope.row.id]">
                设为默认
              </el-button>
            </template>
            <el-button type="text" @click="deleteLinkman(scope.row)" :disabled="pending[scope.row.id]" class="delete-contact-btn"
                       size="mini">删除
            </el-button>
          </div>

          <template v-else>
            {{scope.row[column.field]}}
          </template>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      class="customer-contact-table-pagination"
      background
      @current-change="jump"
      :page-size="paginationInfo.pageSize"
      :current-page="paginationInfo.pageNum"
      layout="prev, pager, next"
      :total="paginationInfo.totalItems">
    </el-pagination>
    <edit-contact-dialog ref="EditContactDialog" :customer="shareData.customer" :original-value="selectedContact"
                         @submit-success="selectedContact = {}"></edit-contact-dialog>
  </div>
</template>

<script>
import {formatDate,} from '@src/util/lang';
import platform from '@src/platform';
import EditContactDialog from '../operationDialog/EditContactDialog.vue';

export default {
  name: "customer-contact-table",
  props: {
    shareData: {
      type: Object,
      default: () => ({})
    },
  },
  data() {
    return {
      pending: {},
      selectedContact: {},
      contactList: [],
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
  },
  mounted() {
    this.fetchData();
    this.$eventBus.$on('customer_contact_table.update_linkman_list', this.fetchData);
  },
  beforeDestroy() {
    this.$eventBus.$off('customer_contact_table.update_linkman_list', this.fetchData);
  },
  methods: {
    openDialog(contact) {
      this.selectedContact = contact;
      this.$nextTick(this.$refs.EditContactDialog.openDialog);
    },
    setDefaultLinkman(lm) {
      if (this.pending[lm.id]) return;
      this.pending[lm.id] = true;
      this.$http.post('/linkman/setMain', {id: lm.id}, false)
        .then(res => {
          if (res.status === 0) {
            this.fetchData();
          } else {
            platform.alert(res.message);
          }
          this.pending[lm.id] = false;
          this.$eventBus.$emit('customer_detail_view.update_customer_detail');
        });
    },
    async deleteLinkman(lm) {
      if (lm.isMain) return platform.alert('默认联系人不能删除');
      try {
        const res = await platform.confirm('确定要删除该联系人？');
        if (!res) return;
        this.pending[lm.id] = true;
        const reqRes = await this.$http.post('/linkman/delete', {ids: lm.id,}, false);
        delete this.pending[lm.id];
        if (reqRes.status === 0) {
          this.fetchData();
        } else {
          platform.alert(res.message);
        }
        this.$eventBus.$emit('customer_info_record.update_record_list');
        this.$eventBus.$emit('customer_detail_view.update_statistical_data');
      } catch (e) {
        console.error('err',);
      }
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
        
      this.$http.get('/v2/customer/linkman/list', params)
        .then(res => {
          this.contactList = res.list
            .map(contact => {

              this.$set(this.pending, contact.id, !!contact.isMain);
              contact.createTime = formatDate(new Date(contact.createTime), 'YYYY-MM-DD HH:mm:ss');
              return Object.freeze(contact);
            });
          this.paginationInfo.totalItems = res.total;
        })
    },
    buildColumns() {
      return [{
        label: '姓名',
        field: 'name',
        show: true,
        // sortable: 'custom',
      }, {
        label: '部门',
        field: 'department',
        show: true,
      }, {
        label: '电话',
        field: 'phone',
        show: true,
        width: '150px',
      }, {
        label: '操作',
        field: 'action',
        show: true,
        width: '150px',
      }]
    }
  },
  components: {
    [EditContactDialog.name]: EditContactDialog,
  }
}
</script>

<style lang="scss">

  .customer-contact-table-container {
    padding: 10px 10px 10px 5px;

    .edit-btn {
      color: $color-primary;
    }

    .customer-contact-table-header th{
      background: #F5F5F5;
      color: $text-color-primary;
    }

    .lm-action {
      display: flex;
      justify-content: space-between;

      .delete-contact-btn {
        color: $color-danger;
      }

      .delete-contact-btn.is-disabled,
      .delete-contact-btn.is-disabled:hover,
      .el-button.delete-contact-btn:focus {
        color: #c0c4cc;
        cursor: not-allowed;
        background-image: none;
      }

    }

    .set-default-lm-btn {
      line-height: 34px;
      display: block;
      text-align: center;
      border-radius: 3px;

      &:hover {
        cursor: pointer;
        background-color: #e7e7e7;
      }
    }

    .customer-contact-table-pagination {
      text-align: right;
      margin-top: 7px;
    }
  }
</style>