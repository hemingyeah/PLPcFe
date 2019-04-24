<template>
  <div class="product-list-container" v-loading.fullscreen.lock="loading">

    <div class="product-list-search-group-container">
      <form class="base-search" onsubmit="return false;">
        <div class="product-list-base-search-group">
          <el-input v-model="searchModel.keyword" placeholder="根据产品信息搜索">
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
          </el-input>
          <base-button type="primary" @event="search({resetPageNum: true})" native-type="submit">搜索</base-button>
          <base-button type="ghost" @event="resetParams">重置</base-button>
        </div>
        <span class="advanced-search-visible-btn" @click.self="advancedSearchPanelShow = !advancedSearchPanelShow">高级搜索</span>
      </form>
    </div>

    <div class="product-list-section">
      <!--operation bar start-->
      <div class="operation-bar-container">
        <div class="top-btn-group">
          <base-button type="primary" icon="icon-add" @click="goToCreate">新建</base-button>
          <base-button type="ghost" icon="icon-yemianshanchu">删除</base-button>
        </div>

        <div class="action-button-group">
          <base-button type="plain" @event="openDialog('sendMessage')">发送短信</base-button>
          <base-button type="plain" @event="openDialog('edit')" >批量编辑</base-button>
          <base-button type="plain" @event="openDialog('remind')">批量提醒</base-button>
          <el-dropdown trigger="click">
            <span class="el-dropdown-link el-dropdown-btn">
              更多操作
              <i class="iconfont icon-nav-down"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>
                <div @click="openDialog('importCustomer')">导入产品</div>
              </el-dropdown-item>
              <el-dropdown-item>
                <div @click="exportCustomer(false)">导出</div>
              </el-dropdown-item>
              <el-dropdown-item>
                <div @click="exportCustomer(true)">导出全部</div>
              </el-dropdown-item>
              <el-dropdown-item>
                <div @click="openDialog('update')">批量更新</div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-dropdown :hide-on-click="false" :show-timeout="150" trigger="click">
            <span class="el-dropdown-link el-dropdown-btn">
              选择列
              <i class="iconfont icon-nav-down"></i>
            </span>
            <el-dropdown-menu slot="dropdown" class="product-columns-dropdown-menu">
              <el-dropdown-item v-for="item in columns" :key="item.field">
                <el-checkbox :value="item.show" @input="modifyColumnStatus($event, item)" :label="item.label" :disabled="item.field == 'name'"/>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>


      <el-table
        :data="page.list"
        stripe
        @select="handleSelection"
        @select-all="handleSelection"
        @sort-change="sortChange"
        :highlight-current-row="false"
        header-row-class-name="product-table-header"
        ref="multipleTable" class="product-table">

        <el-table-column type="selection" width="48" align="center" class-name="select-column"></el-table-column>

        <el-table-column
          v-for="column in columns"
          v-if="column.show"
          :key="column.field"
          :label="column.label"
          :prop="column.field"
          :width="column.width"
          :min-width="column.minWidth || '120px'"
          :sortable="column.sortable"
          show-overflow-tooltip
          :align="column.align">

        </el-table-column>
      </el-table>

      <div class="table-footer">
        <div class="list-info">
          共<span class="level-padding">{{page.total}}</span>记录，
          已选中<span class="product-selected-count" @click="multipleSelectionPanelShow = true">{{multipleSelection.length}}</span>条
          <span class="product-selected-count" @click="toggleSelection()">清空</span>
        </div>
        <el-pagination
          class="product-table-pagination"
          background
          @current-change="jump"
          @size-change="handleSizeChange"
          :page-sizes="[10, 20, 50]"
          :page-size="page.pageSize"
          :current-page="page.pageNum"
          layout="prev, pager, next, sizes, jumper"
          :total="page.total">
        </el-pagination>
      </div>
    </div>

    <base-panel :show.sync="multipleSelectionPanelShow" width="420px">
      <h3 slot="title">
        <span>已选中数据({{multipleSelection.length}})</span>
        <i
          v-if="multipleSelection.length"
          class="iconfont icon-qingkongshanchu product-panel-btn"
          @click="toggleSelection()"
          title="清空已选中数据" data-placement="right" v-tooltip></i>
      </h3>

      <div class="product-selected-panel">
        <div class="product-selected-tip" v-if="!multipleSelection.length">
          <img src="../../assets/img/no-data.png">
          <p>暂无选中的数据，请从列表中选择。</p>
        </div>
        <template v-else>
          <div class="product-selected-list">
            <div class="product-selected-row product-selected-head">
              <span class="product-selected-sn">编号</span>
              <span class="product-selected-name">客户</span>
            </div>
            <div class="product-selected-row" v-for="c in multipleSelection" :key="c.id" >
              <span class="product-selected-sn">{{c.serialNumber}}</span>
              <span class="product-selected-name">{{c.name}}</span>
              <button type="button" class="product-selected-delete" @click="removeFromSelection(c)">
                <i class="iconfont icon-fe-close"></i>
              </button>
            </div>
          </div>
        </template>
      </div>
    </base-panel>

    <base-panel :show.sync="advancedSearchPanelShow" :width="panelWidth">
      <h3 slot="title">
        <span>高级搜索</span>
        <el-dropdown class="pull-right" trigger="click" @command="setAdvanceSearchColumn">
          <i class="iconfont icon-xitongguanli customer-panel-btn" style="float: none;"></i>

          <el-dropdown-menu slot="dropdown" class="customer-advance-setting">
            <el-dropdown-item command="1">一栏</el-dropdown-item>
            <el-dropdown-item command="2">两栏</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </h3>
      <el-form class="advanced-search-form" onsubmit="return false;">
        <div class="form-item-container" :class="{'two-columns': columnNum === 2, }">

          <!-- 动态搜索框 -->
          <el-form-item label-width="100px" :label="field.displayName" v-for="field in searchFields"
                        :key="field.fieldName">
            <template v-if="field.formType === 'text' || field.formType === 'code'">
              <el-input v-model="searchModel[field.fieldName]"
                        :placeholder="field.placeHolder" type="text"></el-input>
            </template>
            <template v-else-if="field.formType === 'select' || field.formType === 'selectMulti'">
              <el-select v-model="searchModel[field.fieldName]" clearable
                         :placeholder="field.placeHolder">
                <el-option
                  v-for="item in field.setting.dataSource"
                  :key="item"
                  :label="item"
                  :value="item"
                  :disabled="item.disabled">
                </el-option>
              </el-select>
            </template>

            <template v-else-if="field.formType === 'date' || field.formType === 'datetime'">
              <el-date-picker
                v-model="searchModel[field.fieldName]"
                type="daterange"
                align="right"
                unlink-panels
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :picker-options="datePickerOptions">
              </el-date-picker>
            </template>

            <template v-else>
              <el-input v-model="searchModel[field.fieldName]"
                        :placeholder="field.placeHolder"></el-input>
            </template>
          </el-form-item>
        </div>
        <div class="advanced-search-btn-group">
          <base-button type="ghost" @event="resetParams">重置</base-button>
          <base-button type="primary" @event="search({resetPageNum: true, moreConditions: true})" native-type="submit">搜索</base-button>
        </div>
      </el-form>
    </base-panel>
  </div>
</template>

<script>

import Page from '@model/Page';
import { getProduct } from '@src/api/ProductApi';
import {formatDate} from '@src/util/lang';


/**
 * todo
 * 1. 部分数据还原（选择列，分页数目）
 * 2. 字段对接
 * 3. 列表排序
 * 4. 操作
 *
 */
export default {
  name: 'product-list',
  props: {
    initData: {
      type: Object,
      default: () => ({}),
    }
  },
  data() {
    return {
      advancedSearchPanelShow: false,
      multipleSelectionPanelShow: false,
      page: new Page(),
      columns: [],
      multipleSelection: [],
      columnNum: 1,
      loading: false,
      searchIncludeMoreConditions: false,
      searchModel: {
        keyword: '',
        pageSize: 10,
        pageNum: 1,
      },
  
      datePickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
            picker.$emit('pick', [start, end]);
          }
        }]
      },
    }
  },
  computed: {
    productFields() {
      return this.initData.productFields || [];
    },
    searchFields() {
      return this.productFields
        .filter(f => f.isSearch);
    },
    panelWidth() {
      return `${420 * this.columnNum}px`;
    }
  },
  mounted() {

    console.log('initData', this.initData);
    this.buildColumns();
    this.addCustomizedFieldToSearchModel();
    this.search();

  },
  methods: {
    search({ resetPageNum = false, moreConditions = false } = {}) {
      if (resetPageNum) {
        this.searchModel.pageNum = 1;
      }
      if (moreConditions) {
        this.searchIncludeMoreConditions = true;
      }

      const params = this.buildParams();
      this.loading = true;

      return getProduct(params)
        .then(res => {
          this.loading = false;
          return this.page = Page.as(Object.freeze(res));
        })
        .catch(e => console.error('fetch product catch an error', e));
    },
    buildParams() {
      const { searchModel, searchIncludeMoreConditions, searchFields } = this;
      let params = {
        keyword: searchModel.keyword,
        pageSize: searchModel.pageSize,
        pageNum: searchModel.pageNum,
      };
      let conditions = [];
      let key = '';

      if (searchIncludeMoreConditions) {
        searchFields
          .forEach(field => {
            key = field.fieldName;
            if (searchModel[key] && field.formType === 'date') {
              return conditions.push({
                property: key,
                operator: field.operator,
                betweenValue1: formatDate(searchModel[key][0], 'YYYY-MM-DD'),
                betweenValue2: formatDate(searchModel[key][1], 'YYYY-MM-DD'),
              });
            }
            if (searchModel[key] && field.formType === 'datetime') {
              return conditions.push({
                property: key,
                operator: field.operator,
                betweenValue1: formatDate(searchModel[key][0], 'YYYY-MM-DD HH:mm:ss'),
                betweenValue2: `${formatDate(searchModel[key][1], 'YYYY-MM-DD')} 23:59:59`,
              });
            }

            if (searchModel[key]) {
              conditions.push({
                property: key,
                operator: field.operator,
                value: searchModel[key],
              });
            }
          });
        params.conditions = conditions;
      }

      return params
    },
    jump(pageNum) {
      this.searchModel.pageNum = pageNum;
      this.search();
    },
    resetParams() {
      this.searchIncludeMoreConditions = false;
      this.searchModel = {
        keyword: '',
        pageNum: 1,
        pageSize: this.page.pageSize
      };

      this.addCustomizedFieldToSearchModel();
      this.search();
    },
    openDialog() {

    },
    // table method
    handleSelection(selection) {
      this.multipleSelection = selection;
    },
    sortChange() {

    },
    handleSizeChange(pageSize) {
      this.saveDataToStorage('pageSize', pageSize);
      this.searchModel.pageSize = pageSize;
      this.search({resetPageNum: true});
    },
    toggleSelection(rows) {
      if (rows) {
        rows.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row);
        });
      } else {
        this.$refs.multipleTable.clearSelection();
        this.multipleSelection = [];
      }
    },

    removeFromSelection(c) {
      this.multipleSelection = this.multipleSelection
        .filter(ms => ms.id !== c.id);
    },
    modifyColumnStatus(val, column) {
      this.columns = this.columns
        .map(c => {
          if (c.field === column.field) {
            c.show = val;
          }
          return c;
        });
      const showColumns = this.columns.filter(c => c.show).map(c => c.field);
      this.saveDataToStorage('columnStatus', showColumns);
    },
    buildColumns() {
      let sortable = false;

      return this.columns = this.productFields
        .map(field => {

          if (field.formType === 'date' || field.formType === 'datetime') {
            sortable = true;
          }

          return {
            label: field.displayName,
            field: field.fieldName,
            formType: field.formType,
            show: true,
            // width: `${minWidth}px`,
            sortable,
            isSystem: field.isSystem,
          }
        })
    },
    addCustomizedFieldToSearchModel() {

      this.searchFields.forEach(field => {
        this.$set(this.searchModel, field.fieldName)
      })
    },
    setAdvanceSearchColumn(command) {
      this.columnNum = Number(command);
      this.saveDataToStorage('column_number', command);
    },

    goToCreate() {
      window.location = '/product/create';
    },
    getLocalStorageData() {
      const dataStr = localStorage.getItem('product_list_localStorage_19_4_24') || '{}';
      return JSON.parse(dataStr);
    },
    saveDataToStorage(key, value) {
      const data = this.getLocalStorageData();
      data[key] = value;
      localStorage.setItem('product_list_localStorage_19_4_24', JSON.stringify(data));
    },
  },
}
</script>

<style lang="scss">
  $color-primary-light-9: mix(#fff, $color-primary, 90%) !default;
  .product-list-container {
    padding: 10px;
  }

  // search
  .product-list-container .product-list-search-group-container {

    .base-search {
      background: #fff;
      border-radius: 3px;
      font-size: 14px;
      display: flex;
      justify-content: space-between;
      padding: 12px 10px;

      .product-list-base-search-group {
        display: flex;
        width: 440px;
        justify-content: space-between;

        .el-input {
          width: 300px;
          input {
            height: 34px;
            line-height: 34px;
            width: 300px;
          }
        }

        a {
          line-height: 33px;
        }

      }

      .advanced-search-visible-btn {
        font-size: 14px;
        font-weight: lighter;
        line-height: 32px;
        color: $color-primary;
        border-color: $color-primary;
        background: #fff;
        padding: 0 13px;
        &:hover {
          cursor: pointer;
        }
      }
    }
  }

  .product-list-container .product-list-section {
    padding-top: 10px;
  }

  // operation
  .product-list-container .product-list-section .operation-bar-container {
    background: #fff;
    border-radius: 3px 3px 0 0;
    display: flex;
    justify-content: space-between;
    padding: 10px;
    border-bottom: 1px solid #f2f2f2;

    .top-btn-group .base-button {
      margin-right: 5px;
    }

    .action-button-group {
      .base-button {
        margin-left: 5px;
      }
    }

    .el-dropdown-btn {
      padding: 0 15px;
      line-height: 32px;
      display: inline-block;
      background: $color-primary-light-9;
      color: $text-color-primary;
      outline: none;
      margin-left: 5px;
      .iconfont {
        margin-left: 5px;
        font-size: 12px;
      }

      &:hover {
        cursor: pointer;
        color: #fff;
        background: $color-primary;
      }
    }
  }


  // table
  .product-list-container .product-table {
    padding: 10px;

    &:before {
      height: 0;
    }

    .product-table-header th {
      background: #F5F5F5;
      color: $text-color-primary;
      font-weight: normal;
    }

    th {
      color: #606266;
      font-size: 14px;
    }
    td {
      color: #909399;
      font-size: 13px;
    }

    .view-detail-btn {
      color: $color-primary;
    }

    .select-column .el-checkbox {
      position: relative;
      top: 3px;
    }
  }

  .product-list-container .table-footer {
    display: flex;
    justify-content: space-between;
    padding: 0px 10px 10px 10px ;
    background: #fff;
    border-radius: 0 0 3px 3px;

    .list-info {
      font-size: 13px;
      line-height: 32px;
      margin: 0;
      color: #767e89;

      .iconfont {
        position: relative;
        top: 1px;
      }

      .product-selected-count{
        color: $color-primary;
        padding: 0 3px;
        width: 15px;
        text-align: center;
        cursor: pointer;
        font-size: 13px;
      }

    }

    .el-pagination__jump {
      margin-left: 0;
    }
  }
  
  // select panel
  .product-list-container .product-selected-panel {
    font-size: 14px;
    height: calc(100% - 51px);

    .product-selected-tip {
      padding-top: 80px;

      img {
        display: block;
        width: 240px;
        margin: 0 auto;
      }

      p {
        text-align: center;
        color: #9a9a9a;
        margin: 30px 0 0 0;
        line-height: 20px;
      }
    }

    .product-selected-list {
      height: 100%;
      padding: 10px;
      overflow-y: auto;

      .product-selected-row {
        display: flex;
        flex-flow: row nowrap;
        line-height: 36px;
        border-bottom: 1px solid #ebeef5;
        font-size: 13px;

        &:hover {
          background-color: #f5f7fa;

          .product-selected-delete {
            visibility: visible;
          }
        }
      }

      .product-selected-head {
        background-color: #F0F5F5;
        color: #333;
        font-size: 14px;
      }

      .product-selected-sn {
        padding-left: 10px;
        width: 150px;
        @include text-ellipsis;
      }

      .product-selected-name {
        padding-left: 10px;
        flex: 1;
        @include text-ellipsis;
      }

      .product-selected-delete {
        width: 36px;
      }

      .product-selected-row button.product-selected-delete {
        padding: 0;
        width: 36px;
        height: 36px;
        border: none;
        background-color: transparent;
        outline: none;
        color: #646B78;
        visibility: hidden;

        i {
          font-size: 14px;
        }

        &:hover {
          color: #e84040;
        }
      }
    }
  }

  // advanced search form
  .product-list-container .advanced-search-form {
    overflow: auto;
    padding: 10px 0 63px 0;
    height: calc(100% - 51px);

    .form-item-container {

    }

    .two-columns {
      display: flex;
      flex-wrap: wrap;
      .el-form-item {
        width: 50%;
      }
    }

    .el-form-item {
      .el-form-item__content,
      .el-select,
      .base-dist-picker,
      .el-cascader,
      .el-date-editor {
        width: 290px;
      }
    }

    .advanced-search-btn-group {
      display: flex;
      justify-content: flex-end;
      width: 100%;
      position: absolute;
      bottom: 0px;
      background: #fff;
      padding: 15px 20px;

      .base-button {
        margin: 0 10px;
      }
    }
  }


</style>