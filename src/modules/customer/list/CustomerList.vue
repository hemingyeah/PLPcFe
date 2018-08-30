<template>
  <div class="customer-list-component">
    <operation-bar
      :selectedCustomer="multipleSelection"
      v-on:modify-columns-display="modifyColumnsDisplay"
      :columns="columns">
    </operation-bar>

    <el-table
      stripe
      :data="customers"
      @select="selectRow"
      @select-all="selectAll"
      @sort-change="sortChange"
      @selection-change="handleSelectionChange" ref="multipleTable" class="customer-table">
      <el-table-column type="selection" width="35"></el-table-column>
      <el-table-column
        v-for="column in columns"
        :key="column.field"
        :label="column.label"
        :width="column.width"
        :prop="column.field"
        v-if="column.show"
        :sortable="column.sortable"
        show-overflow-tooltip>

        <template slot-scope="scope">
          <template v-if="column.field === 'customerAddress'">
            {{scope.row[column.field].str}}
          </template>
          <template v-else-if="column.field === 'detailAddress'">
            {{scope.row.customerAddress.adAddress}}
          </template>
          <template v-else-if="column.field === 'tags'">
            {{scope.row.tagsStr}}
          </template>
          <template v-else-if="column.field === 'status'">
            <el-checkbox v-model="scope.row.status === 1"></el-checkbox>
          </template>
          <template v-else-if="column.field === 'createUser'">
            {{scope.row.createUserName}}
          </template>
          <template v-else-if="column.field === 'remindCount'">
            {{scope.row.attribute.remindCount}}
          </template>
          <template v-else-if="column.isSystem === 0">
            {{scope.row.attribute[column.field]}}
          </template>
          <template v-else>
            {{scope.row[column.field]}}
          </template>
        </template>

      </el-table-column>
    </el-table>

    <div class="table-footer">
      <div class="list-info">
        已选中 <span class="selectedCount">{{multipleSelection.length}}</span> 条 <a href="javasript:;" class="clearSelectedBtn" @click="toggleSelection()">清空</a>
        共 {{paginationInfo.totalItems}} 记录  共 {{paginationInfo.totalPages}} 页
      </div>
      <el-pagination
        class="customer-table-pagination"
        background
        @current-change="jump"
        @size-change="handleSizeChange"
        :page-size="paginationInfo.pageSize"
        :current-page="paginationInfo.pageNum"
        layout="prev, pager, next, sizes, jumper"
        :total="paginationInfo.totalItems">
      </el-pagination>
    </div>

  </div>
</template>

<script>
  import _ from 'lodash';

  import OperationBar from './OperationBar.vue';

  export default {
    name: "customer-list",
    data() {

      return {
        fixedColumns: this.buildTableColumn(),
        customers: [],
        paginationInfo: {
          pageSize: 10,
          pageNum: 1,
          totalItems: 0,
          totalPages: 0,
        },
        multipleSelection: []
      };
    },
    props: {
      customerConfig: {
        type: Object,
        default: () => ({}),
      }
    },
    computed: {
      columns() {
        let dynamicColumns = [];
        if (this.customerConfig.fieldInfo) {
          dynamicColumns = this.customerConfig.fieldInfo
            .filter(f => !f.isSystem)
            .map(field => ({
              label: field.displayName,
              field: field.fieldName,
              show: field.show,
              formType: field.formType,
              sortable: field.sortable,
              isSystem: 0,
            }));
        }
        return [...this.fixedColumns, ...dynamicColumns];
      }
    },
    watch: {
      multipleSelection: {
        handler: function (newValue) {
          console.log('newValue', newValue);
        },
        deep: true
      }

    },
    mounted() {
      const localStorageData = this.getLocalStorageData();
      if (localStorageData.pageSize) {
        this.paginationInfo.pageSize = Number(localStorageData.pageSize);
      }
    },
    methods: {
      sortChange(column, prop, order) {
        console.log('column, prop, order', column, prop, order);

      },
      modifyColumnsDisplay(newColumns) {
        const selectedColumns = newColumns.filter(f => f.show);
        this.$emit('modify-dynamic-columns-display', selectedColumns);
        this.fixedColumns.forEach(field => {
          if (selectedColumns.some(f => f.field === field.field)) {
            field.show = true;
          } else {
            field.show = false;
          }
        });

        let columnStatus = this.columns
          .filter(c => selectedColumns.some(sc => sc.field === c.field))
          .map(c => ({
            ...c,
            show: true,
          }));
        this.saveDataToStorage('columnStatus', columnStatus);
      },
      processRawData(cl) {
      //  cl is customer list.
        let temp = null;
        let nameTemp = null;
        let nameKey = null;

        return cl.map(c => {
          temp = c.customerAddress;
          c.customerAddress.str = `${temp.adProvince}-${temp.adCity}-${temp.adDist}`;
          c.tagsStr = c.tags.map(t => t.tagName).join(' ');

          Object.keys(c.attribute)
            .map(key => {
              if (typeof c.attribute[key] === "string") return key;

              if (Array.isArray(c.attribute[key]) && (typeof c.attribute[key][0] === "string")) {
                c.attribute[key] = JSON.stringify(c.attribute[key]);
                c.attribute[key] = c.attribute[key].replace(/"/g, '',);
                return key;
              }

              if (Array.isArray(c.attribute[key]) && (typeof c.attribute[key][0] === "object")) {
                c.attribute[key] = c.attribute[key].map(a => this.getNameFromObject(a)).join(',');
                return key;
              }

              if (typeof c.attribute[key] === "object") {
                c.attribute[key] = this.getNameFromObject(c.attribute[key]);
                return key;
              }
            });
          return c;
        })
      },
      getNameFromObject(obj) {
        if (!obj) return;
        let name = '';
        let objKeys = Object.keys(obj) || [];
        let nameKeys = [];

        nameKeys = objKeys
          .filter(aKey => /name/gi.test(aKey)) || [];

        if (!objKeys.length) return null;

        if (!nameKeys[0]) return obj[objKeys[0]];
        return obj[nameKeys[0]];
      },
      fetchCustomerData(params) {
        return this.$http.get('/v2/customer/list', params)
          .then(res => {
            this.customers = this.processRawData(res.list);

            const {pages, total, pageNum, } = res;
            this.paginationInfo.totalItems = total;
            this.paginationInfo.totalPages = pages;
            this.paginationInfo.pageNum = pageNum;

            return res;
          })
      },
      jump(pageNum) {
        this.$eventBridge.$emit('modifySearchParams', { pageNum, });
      },
      handleSizeChange(pageSize) {
        this.saveDataToStorage('pageSize', pageSize);
        this.paginationInfo.pageNum = 1;
        this.$eventBridge.$emit('modifySearchParams', { pageSize, });
      },
      selectRow(selection, row) {
        console.log('selectRow selection',selection);
        console.log('selectRow row',row);

        if (selection.length < this.multipleSelection.length) {
          this.multipleSelection = this.multipleSelection
            .filter(sRow => sRow.id !== row.id);
        }
      },
      selectAll(selection) {
        console.log('selectAll selection',selection);
        if (selection.length) return;
        this.multipleSelection = this.multipleSelection
          .filter(sR => this.customers.every(c => c.id !== sR.id));
      },
      toggleSelection(rows) {
        if (rows) {
          rows.forEach(row => {
            this.$refs.multipleTable.toggleRowSelection(row);
          });
        } else {
          this.$refs.multipleTable.clearSelection();
        }
      },
      handleSelectionChange(val) {
        this.multipleSelection = _.uniqWith([...this.multipleSelection, ...val], _.isEqual);
      },
      getLocalStorageData() {
        const dataStr = localStorage.getItem('customerListData') || '{}';
        return JSON.parse(dataStr);
      },
      saveDataToStorage(key, value) {
        const data = this.getLocalStorageData();
        data[key] = value;
        localStorage.setItem('customerListData', JSON.stringify(data));
      },

      buildTableColumn() {
        const localStorageData = this.getLocalStorageData();
        let baseColumns = [{
          label: '客户',
          field: 'name',
          show: true,
          // width: '100px',
        }, {
          label: '客户编号',
          field: 'serialNumber',
          show: true,
          // width: '100px',
        }, {
          label: '联系人',
          field: 'lmName',
          show: true,
          // width: '100px',
        }, {
          label: '电话',
          field: 'lmPhone',
          show: true,
          // width: '120px',
        }, {
          label: '区域',
          field: 'customerAddress',
          show: true,
          // width: '150px',
        }, {
          label: '详细地址',
          field: 'detailAddress',
          show: true,
          // width: '100px',
        }, {
          label: '服务团队',
          field: 'tags',
          show: true,
          // width: '100px',
        }, {
          label: '客户负责人',
          field: 'customerManagerName',
          show: true,
        }, {
          label: '启用/禁用',
          field: 'status',
          show: true,
        }, {
          label: '工单数(未完成数/总数)',
          field: 'sale3', //
          show: true,
        }, {
          label: '产品',
          field: 'sale4', //
          show: true,
        }, {
          label: '创建时间',
          field: 'createTime',
          show: true,
          sortable: 'custom',
          width: '100px',
        }
          , {
            label: '创建人',
            field: 'createUser',
            show: true,
          }, {
            label: '提醒数量',
            field: 'remindCount',
            show: true,
          }]
        let columnStatus = [];

        if (!localStorageData || !localStorageData.columnStatus || !localStorageData.columnStatus.length) {
          return baseColumns;
        }

        columnStatus = localStorageData.columnStatus;
        baseColumns = baseColumns.map(bc => {
          if (columnStatus.some(sc => sc.field === bc.field)) {
            bc.show = true;
          } else {
            bc.show = false;
          }
          return bc;
        });

        return baseColumns;
      }
    },
    components: {
      [OperationBar.name]: OperationBar,
    }
  }
</script>

<style lang="scss">

  .customer-list-component {
    padding-top: 10px;

    .customer-table {
      margin-top: 10px;
      border-radius: 3px;
    }

    .table-footer {
      display: flex;
      justify-content: space-between;
      padding: 10px;
      background: #fff;

      .list-info {
        font-size: 12px;
        line-height: 28px;
        margin: 0;
        color: #767e89;
        .selectedCount {
          color: #00ac97;
          padding: 0 3px;
        }
      }

      .el-pagination__jump {
        margin-left: 0;
      }

      /*.customer-table-pagination {*/
        /*!*padding-top: 14px;*!*/

      /*}*/
    }
  }


</style>