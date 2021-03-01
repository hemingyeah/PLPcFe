<template>
  <div class="customer-product-table-container">
    <el-button style="float: right; margin-bottom: 10px" type="primary" @click="showAdvancedSetting">选择列</el-button>
    <el-table
      stripe
      :data="productList"
      :highlight-current-row="false"
      header-row-class-name="customer-product-table-header"
      row-class-name="customer-product-table-row"
      class="customer-product-table">
      <el-table-column
        v-for="(column, index) in columns"
        v-if="column.show"
        :key="`${column.field}_${index}`"
        :label="column.label"
        :prop="column.field"
        :width="column.width"
        :class-name="column.field == 'name' ? 'customer-product-name-superscript-td' : ''"
        :sortable="column.sortable"
        :show-overflow-tooltip="column.field !== 'name'"
        :align="column.align">
        <template slot-scope="scope">
          <template v-if="column.field === 'state'">
            {{scope.row[column.field]}}
          </template>
          <template v-else-if="column.field === 'name'">

            <sample-tooltip :row="scope.row">
                <template slot="content" slot-scope="{isContentTooltip}">
                  <el-tooltip :content="scope.row[column.field]" placement="top" :disabled="!isContentTooltip">
                    <a 
                        href="" 
                        :data-id="scope.row.id" 
                        @click.prevent="createProductTab(scope.row.id)" 
                        class="product-link"
                      >
                      {{scope.row[column.field]}}
                    </a>
                  </el-tooltip>
                </template>
              </sample-tooltip>
            
          </template>
          <template v-else-if="column.field === 'updateTime'">
            <template v-if="scope.row.latesetUpdateRecord">
              <el-tooltip class="item" effect="dark" :content="scope.row.latesetUpdateRecord" placement="top">
                <div @mouseover="showLatestUpdateRecord(scope.row)">
                  {{scope.row.updateTime | formatDate}}
                </div>
              </el-tooltip>
            </template>
            <template v-else>
              <div @mouseover="showLatestUpdateRecord(scope.row)">
                {{scope.row.updateTime | formatDate}}
              </div>
            </template>
          </template>
          <template v-else-if="column.formType === 'address'">
            {{formatCustomizeAddress(scope.row.attribute[column.field])}}
          </template>
          <template v-else-if="column.formType === 'location'">
            {{ scope.row.attribute[column.field] && scope.row.attribute[column.field].address}}
          </template>
          <template v-else-if="column.field === 'createUser'">
            {{ scope.row.createUser && scope.row.createUser.displayName }}
          </template>
          <template v-else-if="column.field === 'createTime'">
            {{ scope.row.createTime | formatDate }}
          </template>
          <div v-else-if="column.formType === 'textarea'" v-html="buildTextarea(scope.row.attribute[column.field])" @click="openOutsideLink">
          </div>

          <template v-else-if="column.fieldName == 'linkmanName'">
            {{ scope.row.linkman.name }}
          </template>
          <template v-else-if="column.fieldName == 'phone'">
            {{ scope.row.linkman.phone }}
          </template>

          
          <template v-else-if="column.field == 'address' && scope.row[column.field]">
            {{getAddress(scope.row[column.field])}}
          </template>
          <template v-else-if="column.field == 'linkman' && scope.row[column.field]">
            {{scope.row[column.field].name}}
          </template>
          <template v-else-if="!column.isSystem && column.isSystem != null">
            {{scope.row.attribute[column.field]}}
          </template>
          <template v-else>
            {{scope.row[column.field] | fmt_form_field(column.formType, column.fieldName, scope.row.attribute)}}
          </template>
        </template>
      </el-table-column>
      <!-- <el-table-column
        fixed="right"
        width="80px">
        <template slot="header" slot-scope="scope">
          <el-button type="primary" @click="showAdvancedSetting">选择列</el-button>
        </template>
      </el-table-column> -->
    </el-table>
    <div class="product-table-footer">
      <p class="total-count">共<span>{{paginationInfo.totalItems}}</span>条记录</p>
      <el-pagination
        v-if="paginationInfo.totalItems"
        class="customer-product-table-pagination"
        background
        @current-change="jump"
        :page-size="paginationInfo.pageSize"
        :current-page="paginationInfo.pageNum"
        layout="prev, pager, next"
        :total="paginationInfo.totalItems">
      </el-pagination>
    </div>

    <base-table-advanced-setting ref="advanced" @save="modifyColumnStatus" />
  </div>
</template>

<script>
import {
  getProductFields
} from '@src/api/ProductApi'

import {formatDate} from '@src/util/lang';

const link_reg = /((((https?|ftp?):(?:\/\/)?)(?:[-;:&=\+\$]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\?\+=&;:%!\/@.\w_]*)#?(?:[-\+=&;%!\?\/@.\w_]*))?)/g

export default {
  name: "customer-product-table",
  props: {
    shareData: {
      type: Object,
      default: () => ({})
    },
    initData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      productList: [],
      columns: this.fixedColumns(),
      paginationInfo: {
        pageSize: 10,
        pageNum: 1,
        totalItems: 0,
      },
      dynamicProductFields: []
    }
  },
  computed: {
    customerId() {
      return this.shareData.customer ? this.shareData.customer.id : '';
    },
    customerConfig() {
      let initData = this.initData;
      return {
        fieldInfo: this.dynamicProductFields.sort(
          (a, b) => a.orderId - b.orderId
        )
      };
    },
  },
  filters: {
    formatTags({customer}) {
      if (!customer) return '';
      if (!customer.tags || !customer.tags.length) return '';
      return customer.tags.map(t => t.tagName).join(' ')
    },
    formatDate(val) {
      if (!val) return '';
      return formatDate(val, 'YYYY-MM-DD HH:mm:ss')
    }
  },
  async mounted() {
    try {
      // 获取产品自定义字段
      let res = await getProductFields({isFromSetting: false});
      this.dynamicProductFields = res.data || [];
    } catch (error) {
      console.error('customer-product-table fetch product fields error',error);
    }
    this.revertStorage();
    this.columns = this.buildTableColumn();
    this.fetchData();
  },
  methods: {
    getRelatedTask(field) {
      return Array.isArray(field) ? field.map(item => item.taskNo).join(',') : '';
    },
    // 处理人员显示
    getUserName(field, value) {
      // 多选
      if(Array.isArray(value)) {
        return value.map(i => i.displayName || i.name).join(',');
      }
      
      let user = value || {};
      return user.displayName || user.name;
    },
    getAddress(field) {
      return field.province + field.city + field.dist + field.address || ''
    },
    createProductTab(productId){
      let fromId = window.frameElement.getAttribute('id');

      this.$platform.openTab({
        id: `product_view_${productId}`,
        title: '产品信息',
        close: true,
        url: `/customer/product/view/${productId}?noHistory=1`,
        fromId: fromId
      })
    },
    jump(pN) {
      this.paginationInfo.pageNum = pN;
      this.fetchData();
    },
    revertStorage() {
      const { pageSize, column_number } = this.getLocalStorageData();
      if (pageSize) {
        this.params.pageSize = pageSize;
      }
    },
    fetchData() {
      const params = {
        customerId: this.customerId,
        pageNum: this.paginationInfo.pageNum,
        pageSize: this.paginationInfo.pageSize,
      };

      this.$http.get('/customer/product/list', params)
        .then(res => {
          this.productList = res.list
            .map(product => {
              product.createTime = formatDate(new Date(product.createTime), 'YYYY-MM-DD HH:mm:ss');
              return Object.freeze(product);
            });
          this.paginationInfo.totalItems = res.total;

          // if(!this.productList[0].linkmanName) this.columns[3].show = false;
          // if(!this.productList[0].addressName) this.columns[4].show = false;
          
        })
        .catch(e => console.error('fetchData product caught e', e));
    },
    showAdvancedSetting() {
      console.log(this.columns);
      this.$refs.advanced.open(this.columns);
    },
    // columns
    modifyColumnStatus(event) {
      let columns = event.data || [];
      let colMap = columns.reduce(
        (acc, col) => (acc[col.field] = col) && acc,
        {}
      );

      this.columns.forEach(col => {
        let newCol = colMap[col.field];
        if (null != newCol) {
          this.$set(col, 'show', newCol.show);
          this.$set(col, 'width', newCol.width);
        }
      });

      const showColumns = this.columns.map(c => ({
        field: c.field,
        show: c.show,
        width: c.width
      }));
      this.saveDataToStorage('columnStatus', showColumns);
    },
    // common methods
    getLocalStorageData() {
      const dataStr = localStorage.getItem('customerProductListData') || '{}';
      return JSON.parse(dataStr);
    },
    saveDataToStorage(key, value) {
      const data = this.getLocalStorageData();
      data[key] = value;
      localStorage.setItem('customerProductListData', JSON.stringify(data));
    },
    showLatestUpdateRecord(row) {
      if (row.latesetUpdateRecord) return;
      getUpdateRecord({
        productId: row.id
      })
        .then(res => {
          if (!res || res.status) return;

          this.page.list = this.page.list
            .map(c => {
              if (c.id === row.id) {
                c.latesetUpdateRecord = res.data;
              }
              return c;
            });

          this.matchSelected();
        })
        .catch(e => console.error('e', e));
    },
    formatCustomizeAddress(ad) {
      if (null == ad) return '';

      const {province, city, dist, address} = ad;
      return [province, city, dist, address]
        .filter(d => !!d).join('-');
    },
    buildTextarea(value) {
      return value
        ? value.replace(link_reg, (match) => {
          return `<a href="javascript:;" target="_blank" url="${match}">${match}</a>`
        })
        : '';
    },
    openOutsideLink(e) {
      let url = e.target.getAttribute('url');
      if (!url) return;
      if (!/http/gi.test(url)) return this.$platform.alert('请确保输入的链接以http或者https开始');
      this.$platform.openLink(url)
    },
    buildTableColumn() {
      const localStorageData = this.getLocalStorageData();
      let columnStatus = localStorageData.columnStatus || [];
      let localColumns = columnStatus
        .map(i => (typeof i == 'string' ? { field: i, show: true } : i))
        .reduce((acc, col) => (acc[col.field] = col) && acc, {});

      let baseColumns = this.fixedColumns();
      // todo： 后端需要提供“客户产品”的动态列
      let dynamicColumns = this.customerConfig.fieldInfo
        .filter(
          f =>
            !f.isSystem
            && f.formType !== 'attachment'
            && f.formType !== 'separator'
            && f.formType !== 'info'
            && f.formType !== 'autograph'
        )
        .map(field => {
          let sortable = false;
          let minWidth = null;

          if (['date', 'datetime', 'number'].indexOf(field.formType) >= 0) {
            sortable = 'custom';
            minWidth = 100;
          }

          if (field.displayName.length > 4) {
            minWidth = field.displayName.length * 20;
          }

          if (sortable && field.displayName.length >= 4) {
            minWidth = 125;
          }

          if (field.formType === 'datetime') {
            minWidth = 150;
          }

          return {
            label: field.displayName,
            field: field.fieldName,
            formType: field.formType,
            minWidth: typeof minWidth == 'number' ? minWidth : `${minWidth}px`,
            sortable,
            isSystem: field.isSystem
          };
        });

      let columns = [...baseColumns, ...dynamicColumns].map(col => {
        let show = col.show === true;
        let width = col.width;
        let localField = localColumns[col.field];

        if (null != localField) {
          width = typeof localField.width == 'number' ? `${localField.width}px` : '';
          show = localField.show !== false;
        }

        col.show = show;
        col.width = width;
        col.type = 'column';

        return col;
      });

      return columns;
    },
    fixedColumns() {
      return [{
        label: '名称',
        field: 'name',
        show: true,
      }, {
        label: '产品编号',
        field: 'serialNumber',
        show: true,
      }, {
        label: '类型',
        field: 'type',
        show: true,
      }, {
        label: '默认联系人',
        field: 'linkman',
        show: true,
      }, {
        label: '产品地址',
        field: 'address',
        show: true,
      }, {
        label: '创建时间',
        field: 'createTime',
        show: true,
        width: '150px'
      }];
    }
  },
}
</script>

<style lang="scss">

  .customer-product-table-container {
    padding: 10px 10px 10px 5px;

    .product-link {
      color: $color-primary;
    }

    .customer-product-table-header th{
      background: #F5F5F5;
      color: $text-color-primary;
    }

    .customer-product-table-pagination {
      text-align: right;
      margin-top: 7px;
    }

    .product-table-footer {
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

  td.customer-product-name-superscript-td {
    padding: 0 !important;

    & > .cell {
      padding-left: 0 !important;
    }

    & > div {
      height: 43px;
      line-height: 43px !important;
      a {
        display: inline-block;
        height: 43px;
        line-height: 43px;
      }
    }

  }
</style>