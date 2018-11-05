<template>
  <div class="customer-contact-table-container">
    <el-table
      stripe
      :data="contactList"
      :highlight-current-row="false"
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
            <a href="javasript:;" @click="openDialog(scope.row)">{{scope.row[column.field]}}</a>
          </template>
          <div class="lm-action" v-else-if="column.field === 'action'">
            <span v-if="scope.row.isMain">默认联系人</span>
            <span v-else @click="setDefaultLinkman(scope.row)" class="set-default-lm-btn">
              <i class="iconfont icon-part"></i>设为默认
            </span>
            <el-button type="danger" @click="deleteLinkman(scope.row)" :disabled="pending[scope.row.id]" icon="iconfont icon-shanchu">删除
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
    <edit-contact-dialog ref="EditContactDialog" :customer="shareData.customer" :original-value="selectedContact" @submit-success="updateSuccess"></edit-contact-dialog>
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
    mounted() {
      this.fetchData();
    },
    methods: {
      updateSuccess() {
        this.selectedContact = {};
      },
      openDialog(contact) {
        this.selectedContact = contact;
        // this.selectedAddress = address;
        this.$nextTick(() => {
          this.$refs.EditContactDialog.openDialog();
        });

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
          customerId: this.shareData.customerId,
          pageNum: this.paginationInfo.pageNum,
          pageSize: this.paginationInfo.pageSize,
        };
        
        this.$http.get('/v2/customer/linkman/list', params)
        .then(res => {
          this.contactList = res.list
          .map(contact => {

            this.$set(this.pending, contact.id, false);
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
        }, {
          label: '操作',
          field: 'action',
          show: true,
          width: '200px'
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

    .lm-action {
      display: flex;
      justify-content: space-between;
      .set-default-lm-btn {
        line-height: 34px;

        &:hover {
          cursor: pointer;
          background-color: #e7e7e7;
          text-align: center;
        }
      }
    }

    .customer-contact-table-pagination {
      text-align: right;
    }
  }
</style>