<template>
  <div class="call-center-stats-container">

    <div class="stats-station-header">
      <p>呼叫中心号码：<span>400-2404670</span></p>
      <p>坐席数：<span>4/3</span>
        <el-tooltip content="已购买/已使用">
          <i class="iconfont icon-info"></i>
        </el-tooltip>
      </p>
      <p>到期时间：<span>2002-02-18</span></p>
      <p>话费余额：<span class="money">100元</span></p>

    </div>
    <div class="stats-station-today-header">今日统计</div>
    <div class="stats-station-today-content">

      <div class="stats-station-card">
        <p>呼入已接通话量</p>
        <h3>1223</h3>
        <div class="card-bottom">未接来电：50 接通率：66.7%
        </div>
      </div>

      <div class="stats-station-card">
        <p>呼入已解决通话</p>
        <h3>1223</h3>
        <div class="card-bottom">解决率：66.7%</div>
      </div>

      <div class="stats-station-card">
        <p>呼入通话时长</p>
        <h3>1小时30分</h3>
        <div class="card-bottom">平均通话时长：90秒</div>
      </div>

      <div class="stats-station-card">
        <p>呼出通话量</p>
        <h3>1小时30分</h3>
        <div class="card-bottom">未接来电：50 接通率：66.7%</div>
      </div>

      <div class="stats-station-card">
        <p>呼出通话时长</p>
        <h3>1小时30分</h3>
        <div class="card-bottom">平均通话时长：1分30秒</div>
      </div>

    </div>

    <div class="customer-list-container" ref="customerListPage" v-loading.fullscreen.lock="loadingListData">
      <!--搜索-->
      <div class="customer-list-search-group-container">
        <form class="base-search" onsubmit="return false;">
          <div class="customer-list-base-search-group">
            <el-input v-model="params.keyword" placeholder="根据客户信息搜索">
              <i slot="prefix" class="el-input__icon el-icon-search"></i>
            </el-input>
            <base-button type="primary" @event="params.pageNum=1;search();trackEventHandler('search')" native-type="submit">搜索</base-button>
            <base-button type="ghost" @event="resetParams">重置</base-button>
          </div>
          <span class="advanced-search-visible-btn" @click.self="panelSearchAdvancedToggle">
            <i class="iconfont icon-add"></i>
            高级搜索
          </span>
        </form>
        <!--高级搜索-->
      </div>

      <!--list start-->
      <div class="customer-list-component">
        <!--operation bar start-->
        <div class="operation-bar-container">
          <div class="top-btn-group">
            <el-radio-group v-model="activeName" @change="stateChangeHandler" size="medium">
              <el-radio-button label="全部" name="all"></el-radio-button>
              <el-radio-button label="已接来电" name="task"></el-radio-button>
              <el-radio-button label="未接来电" name="customer"></el-radio-button>
              <el-radio-button label="呼出电话" name="stock"></el-radio-button>
            </el-radio-group>
          </div>
          <div class="action-button-group">
            <span class="el-dropdown-link el-dropdown-btn" @click="showAdvancedSetting">
              选择列
              <i class="iconfont icon-nav-down"></i>
            </span>
          </div>
        </div>
        <!--operation bar end-->

        <div style="background: #fff;padding: 0 10px">
          <base-selection-bar ref="baseSelectionBar" v-model="multipleSelection" @toggle-selection="toggleSelection" @show-panel="() => multipleSelectionPanelShow = true" />
        </div>

        <!-- <el-table :data="customers" stripe @select-all="handleSelection" :row-key="getRowKey" header-row-class-name="customer-table-header" ref="multipleTable" class="customer-table">
             
          <el-table-column v-for="column in columns" v-if="column.show" :key="column.field" :label="column.label" :prop="column.field" :width="column.width" :min-width="column.minWidth || '120px'"
                           :class-name="column.field == 'name' ? 'customer-name-superscript-td' : ''" :show-overflow-tooltip="column.field !== 'name'" :align="column.align">
            <template slot-scope="scope">
              <template v-if="column.field === 'name'">
                <sample-tooltip :row="scope.row">
                  <template slot="content" slot-scope="{isContentTooltip}">
                    <el-tooltip :content="scope.row[column.field]" placement="top" :disabled="!isContentTooltip">
                      <a href :class="scope.row.isGuideData ? column.className : ''" class="view-detail-btn" @click.stop.prevent="createCustomerTab(scope.row.id)">
                        <pre class="pre-text">{{ scope.row[column.field] }}</pre>
                      </a>
                    </el-tooltip>
                  </template>
                </sample-tooltip>
              </template>
              <template v-else-if="column.field === 'customerAddress'">
                {{formatAddress(scope.row[column.field])}}
              </template>
              <template v-else-if="column.field === 'detailAddress'">
                <pre class="pre-text">{{scope.row.customerAddress && scope.row.customerAddress.adAddress}}</pre>
              </template>
              <template v-else-if="column.field === 'tags' && scope.row.tags">
                {{scope.row.tags | tagName}}
              </template>
              <template v-else-if="column.field === 'status'">
                <el-switch :disabled="scope.row.pending" @change="toggleStatus(scope.row)" :value="Boolean(scope.row.status)"></el-switch>
              </template>
              <template v-else-if="column.field === 'updateTime'">
                <template v-if="scope.row.latesetUpdateRecord">
                  <el-tooltip class="item" effect="dark" :content="scope.row.latesetUpdateRecord" placement="top">
                    <div @mouseover="showLatestUpdateRecord(scope.row)">{{scope.row[column.field]}}</div>
                  </el-tooltip>
                </template>
                <template v-else>
                  <div @mouseover="showLatestUpdateRecord(scope.row)">{{scope.row[column.field]}}</div>
                </template>
              </template>
              <template v-else-if="column.field === 'createUser'">
                {{scope.row.createUserName}}
              </template>
              <template v-else-if="column.field === 'remindCount'">
                {{scope.row.attribute.remindCount || 0}}
              </template>
              <template v-else-if="column.formType === 'select' && scope.row.attribute[column.field]">
                {{scope.row.attribute[column.field] | displaySelect}}
              </template>
              <template v-else-if="column.formType === 'user' && scope.row.attribute[column.field]">
                {{scope.row.attribute[column.field].displayName || scope.row.attribute[column.field].name}}
              </template>
              <template v-else-if="column.formType === 'location'">
                {{ scope.row.attribute[column.field] && scope.row.attribute[column.field].address}}
              </template>

              <template v-else-if="column.formType === 'address'">
                {{formatCustomizeAddress(scope.row.attribute[column.field])}}
              </template>

              <div class="pre-text" v-else-if="column.formType === 'textarea'" v-html="buildTextarea(scope.row.attribute[column.field])" @click="openOutsideLink"></div>

              <template v-else-if="column.isSystem === 0">
                <pre class="pre-text">{{scope.row.attribute[column.field]}}</pre>
              </template>
              <template v-else>
                <pre class="pre-text">{{scope.row[column.field]}}</pre>
              </template>
            </template>
          </el-table-column>
        </el-table> -->

        <div class="table-footer">
          <el-pagination class="customer-table-pagination" background @current-change="jump" @size-change="handleSizeChange" :page-sizes="[10, 20, 50]" :page-size="params.pageSize" :current-page="params.pageNum"
                         layout="prev, pager, next, sizes, jumper" :total="totalItems"></el-pagination>
        </div>
      </div>
      <!--list end-->

      <base-table-advanced-setting ref="advanced" @save="modifyColumnStatus" />

      <search-panel :config="{fields: this.initData.fieldInfo}" ref="searchPanel">
        <div class="advanced-search-btn-group" slot="footer">
          <base-button type="ghost" @event="resetParams">重置</base-button>
          <base-button type="primary" @event="powerfulSearch" native-type="submit">搜索</base-button>
        </div>
      </search-panel>
    </div>
    <!-- 处理未接来电的对话框 -->
    <el-dialog title="处理未接来电" :visible.sync="missCallDialogVisible" width="30%" @close="missCallDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="missCallForm" ref="missCallFormRef" label-width="100px" label-position="left">
        <el-form-item label="呼叫电话">
          15700079887 <span><i class="iconfont el-icon-phone"></i> 拨打电话</span>
        </el-form-item>
        
        <el-form-item label="处理状态">
          <el-radio-group v-model="missCallForm.status">
            <el-radio :label="0">未处理</el-radio>
            <el-radio :label="1">已处理</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea"
                    placeholder="请输入备注"
                    v-model="missCallForm.remark"
                    maxlength="500"
                    show-word-limit></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="missCallDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="deal">确 认</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
import { formatDate } from '../../../util/lang'
import SearchPanel from '../component/SearchPanel'

export default {
  name: 'stage',
  props: {
    initData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      pending: false,
      loadingListData: false,
      activeName: '全部',
      
      params: {
        orderDetail: {},
        moreConditions: {
          conditions: []
        },
        keyword: '',
        pageNum: 1,
        pageSize: 10
      },
      totalItems: 0,
      multipleSelection: [],
      defaultAddress: [],
      // data from remote
      customers: [],
      columns: this.fixedColumns(),
      selectedLimit: 500,
      columnNum: 1,
      tableKey: (Math.random() * 1000) >> 2,
      missCallDialogVisible: false,
      missCallForm: {
        status: 0,
        remark: ''
      },
    
    }
  },

  computed: {
    panelWidth() {
      return `${420 * this.columnNum}px`
    }
  },

  mounted() {
    this.columns = this.buildTableColumn()
    this.search()
  },

  methods: {
    stateChangeHandler (state) {
      console.info('state:', state); 
      // 切换tab
      this.activeName = state;     
    },
    powerfulSearch() {
      this.params.pageNum = 1
      this.params.moreConditions = this.$refs.searchPanel.buildParams()

      this.search()
    },
    showAdvancedSetting() {
      window.TDAPP.onEvent('pc：通话记录-选择列事件')

      this.$refs.advanced.open(this.columns)
    },
    createCustomerTab(customerId) {
      let fromId = window.frameElement.getAttribute('id')

      this.$platform.openTab({
        id: `customer_view_${customerId}`,
        title: '客户详情',
        close: true,
        url: `/customer/view/${customerId}?noHistory=1`,
        fromId
      })
    },
    setAdvanceSearchColumn(command) {
      this.columnNum = Number(command)
      localStorage.setItem(
        'customer_list_advance_search_column_number',
        command
      )
    },
    formatAddress(ad) {
      if (null == ad) return ''

      const { adProvince, adCity, adDist } = ad
      return [adProvince, adCity, adDist].filter(d => !!d).join('-')
    },
    formatCustomizeAddress(ad) {
      if (null == ad) return ''

      const { province, city, dist, address } = ad
      return [province, city, dist, address].filter(d => !!d).join('-')
    },

    revertStorage() {
      const { pageSize, column_number } = this.getLocalStorageData()
      if (pageSize) {
        this.params.pageSize = pageSize
      }
      if (column_number) this.columnNum = Number(column_number)
    },
    search() {
      const params = this.buildParams()

      this.loadingListData = true

      return this.$http
        .post('/customer/list', params)
        .then(res => {
          if (!res || !res.list) {
            this.customers = []
            this.totalItems = 0
            this.params.pageNum = 1
          } else {
            const { total, pageNum, list } = res

            this.customers = list.map(c => {
              c.pending = false
              return c
            })

            this.totalItems = total
            this.params.pageNum = pageNum
            this.matchSelected() // 把选中的匹配出来
          }

          return res
        })
        .then(() => {
          this.$refs.customerListPage.scrollTop = 0
          this.loadingListData = false
        })
        .catch(err => {
          this.loadingListData = false
          console.error('err', err)
        })
    },
    buildParams() {
      const sm = Object.assign({}, this.params)
      let params = {
        keyword: sm.keyword,
        pageSize: sm.pageSize,
        pageNum: sm.pageNum
      }

      if (Object.keys(sm.orderDetail || {}).length) {
        params.orderDetail = sm.orderDetail
      }

      if (
        Object.keys(sm.moreConditions).length > 1 ||
        sm.moreConditions.conditions.length
      ) {
        params = {
          ...params,
          ...sm.moreConditions
        }
      }

      return params
    },

    jump(pageNum) {
      this.params.pageNum = pageNum
      this.search()
    },
    handleSizeChange(pageSize) {
      this.saveDataToStorage('pageSize', pageSize)
      this.params.pageNum = 1
      this.params.pageSize = pageSize
      this.search()
    },

    // columns
    modifyColumnStatus(event) {
      let columns = event.data || []
      let colMap = columns.reduce(
        (acc, col) => (acc[col.field] = col) && acc,
        {}
      )

      this.columns.forEach(col => {
        let newCol = colMap[col.field]
        if (null != newCol) {
          this.$set(col, 'show', newCol.show)
          this.$set(col, 'width', newCol.width)
        }
      })

      const showColumns = this.columns.map(c => ({
        field: c.field,
        show: c.show,
        width: c.width
      }))
      this.saveDataToStorage('columnStatus', showColumns)
    },
    // common methods
    getLocalStorageData() {
      const dataStr = localStorage.getItem('customerListData') || '{}'
      return JSON.parse(dataStr)
    },
    saveDataToStorage(key, value) {
      const data = this.getLocalStorageData()
      data[key] = value
      localStorage.setItem('customerListData', JSON.stringify(data))
    },
    buildTableColumn() {
      const localStorageData = this.getLocalStorageData()
      let columnStatus = localStorageData.columnStatus || []
      let localColumns = columnStatus
        .map(i => (typeof i == 'string' ? { field: i, show: true } : i))
        .reduce((acc, col) => (acc[col.field] = col) && acc, {})

      let baseColumns = this.fixedColumns()
      let dynamicColumns = this.customerConfig.fieldInfo
        .filter(
          f =>
            !f.isSystem &&
            f.formType !== 'attachment' &&
            f.formType !== 'separator' &&
            f.formType !== 'info'
        )
        .map(field => {
          let sortable = false
          let minWidth = null

          if (['date', 'datetime', 'number'].indexOf(field.formType) >= 0) {
            sortable = 'custom'
            minWidth = 100
          }

          if (field.displayName.length > 4) {
            minWidth = field.displayName.length * 20
          }

          if (sortable && field.displayName.length >= 4) {
            minWidth = 125
          }

          if (field.formType === 'datetime') {
            minWidth = 150
          }

          return {
            label: field.displayName,
            field: field.fieldName,
            formType: field.formType,
            minWidth: typeof minWidth == 'number' ? minWidth : `${minWidth}px`,
            sortable,
            isSystem: field.isSystem
          }
        })

      let columns = [...baseColumns, ...dynamicColumns].map(col => {
        let show = col.show === true
        let width = col.width
        let localField = localColumns[col.field]

        if (null != localField) {
          width =
            typeof localField.width == 'number' ? `${localField.width}px` : ''
          show = localField.show !== false
        }

        col.show = show
        col.width = width
        col.type = 'column'

        return col
      })

      return columns
    },
    resetParams() {
      window.TDAPP.onEvent('pc：客户管理-重置事件')
      this.$refs.searchPanel.resetParams()

      this.params = {
        keyword: '',
        pageNum: 1,
        pageSize: this.params.pageSize,
        orderDetail: {},
        moreConditions: {
          conditions: []
        }
      }

      this.search()
    },
    fixedColumns() {
      return [
        {
          label: '客户',
          field: 'name',
          show: true,
          fixed: true,
          minWidth: '150px'
        },
        {
          label: '客户编号',
          field: 'serialNumber',
          // width: '150px',
          fixed: true,
          show: true
        },
        {
          label: '联系人',
          field: 'lmName',
          // width: '100px',
          show: true
        },
        {
          label: '电话',
          field: 'lmPhone',
          // width: '130px',
          show: true
        },
        {
          label: '区域',
          field: 'customerAddress',
          // width: '180px',
          show: true
        },
        {
          label: '详细地址',
          field: 'detailAddress',
          // width: '160px',
          show: true
        },
        {
          label: '服务团队',
          field: 'tags',
          // width: '110px',
          show: true
        },
        {
          label: '客户负责人',
          field: 'customerManagerName',
          show: true,
          width: '110px'
        },
        {
          label: '启用/禁用',
          field: 'status',
          show: true,
          align: 'center',
          width: '100px'
        },
        {
          label: '创建时间',
          field: 'createTime',
          show: true,
          sortable: 'custom',
          width: '150px'
        },
        {
          label: '最近更新',
          field: 'updateTime',
          show: true,
          sortable: 'custom',
          width: '150px'
        },
        {
          label: '创建人',
          field: 'createUser',
          // width: '80px',
          show: true
        },
        {
          label: '提醒数量',
          field: 'remindCount',
          // width: '80px',
          show: true
        }
      ]
    },
    panelSearchAdvancedToggle() {
      window.TDAPP.onEvent('pc：客户管理-高级搜索事件')
      this.$refs.searchPanel.open()
      this.$nextTick(() => {
        let forms = document.getElementsByClassName('advanced-search-form')
        for (let i = 0; i < forms.length; i++) {
          let form = forms[i]
          form.setAttribute('novalidate', true)
        }
      })
    },
    // TalkingData事件埋点
    trackEventHandler(type) {
      if (type === 'search') {
        window.TDAPP.onEvent('pc：客户管理-搜索事件')
        return
      }
    },
    getRowKey(row) {
      return row.id
    },
    detail(){

    },
    missCallDialogClosed() {
      this.$refs.missCallFormRef.resetFields()
    },
    deal(){
      // this.missCallDialogVisible = false
      // this.missCallDialogClosed()  
      console.info('form::', this.missCallForm);
       
      
    }

  },

  components: {
    [SearchPanel.name]: SearchPanel
  }
}
</script>

<style lang="scss">
$color-primary-light-9: mix(#fff, $color-primary, 90%) !default;
.call-center-stats-container {
  margin: 12px;
  .stats-station-header {
    display: flex;
    border-radius: 2px;
    background-color: #fff;
    padding: 15px;
    align-items: center;
    p {
      flex: 1;
      margin: 0;
      text-align: center;
      font-size: 16px;
      color: #051a13;
      font-weight: 500;
      i {
        color: #b9bfbd;
        margin-left: 10px;
      }
      span {
        font-size: 14px;
        font-weight: 400;
      }
      .money {
        color: #fb602c;
      }
    }
  }

  .stats-station-today-header {
    border-radius: 2px;
    background-color: #fff;
    height: 48px;
    line-height: 48px;
    font-size: 16px;
    font-weight: 500;
    color: #051a13;
    align-items: center;
    margin-top: 12px;
    padding-left: 16px;
  }

  .stats-station-today-content {
    display: flex;
    flex-flow: row nowrap;
    padding: 1px 0px 10px 0;
    justify-content: flex-end;
    .stats-station-card {
      flex: 1;
      border-radius: 2px;
      background-color: #fff;
      text-align: center;
      .card-bottom {
        background: rgba(250, 251, 252, 1);
        border-radius: 0px 0px 0px 2px;
        height: 60px;
        line-height: 60px;
      }
      p {
        padding: 15px 0 8px;
        margin: 0;
        font-size: 14px;
      }

      h3 {
        font-weight: 400;
        font-size: 24px;
        line-height: 34px;
        margin: 0;
        padding: 5px 0 20px 0;
      }

      &:first-child {
        margin-left: 0;
      }
    }
  }

  .customer-list-container {
    height: 100%;
    overflow: auto;

    .panel-title {
      font-size: 16px;
      line-height: 60px;
      padding: 0 25px;
      color: rgb(132, 138, 147);
      border-bottom: 1px solid rgb(242, 248, 247);
      font-weight: normal;
      display: flex;
      justify-content: space-between;
      .iconfont:hover {
        cursor: pointer;
      }
    }
  }

  // search
  .customer-list-search-group-container {
    .advanced-search-function,
    .base-search {
      background: #fff;
      border-radius: 3px;
    }

    .base-search {
      font-size: 14px;
      display: flex;
      justify-content: space-between;
      padding: 12px 10px;

      .customer-list-base-search-group {
        display: flex;
        min-width: 440px;
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
        line-height: 32px;
        color: $color-primary;
        border-color: $color-primary;
        background: #fff;
        padding: 0 13px;

        &:hover {
          cursor: pointer;
        }

        .iconfont {
          font-size: 12px;
          font-weight: bolder;
        }
      }
    }

    .advanced-search-form {
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

    .advanced-search-function {
      margin-top: 10px;
      padding-bottom: 10px;

      h4 {
        border-bottom: 1px solid #f4f4f4;
        padding: 10px;
      }

      .el-row {
        padding: 5px 0;
      }
      .input-label {
        text-align: right;
        line-height: 32px;
        padding-right: 0;
      }
    }
  }

  // list
  .customer-list-component {
    padding-top: 10px;
    /*min-height: calc(100% - 100px);*/

    .customer-table {
      padding: 10px;

      &:before {
        height: 0;
      }

      .customer-table-header th {
        background: #f5f5f5;
        color: $text-color-primary;
        font-weight: normal;
      }

      .view-detail-btn {
        width: 100%;
        color: $color-primary;
      }

      .view-detail-btn {
        color: $color-primary;
      }

      .select-column .el-checkbox {
        position: relative;
        top: 3px;
      }
    }

    .table-footer {
      display: flex;
      justify-content: space-between;
      padding: 0px 10px 10px 10px;
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
      }

      .el-pagination__jump {
        margin-left: 0;
      }
    }
  }

  .customer-panel-btn {
    float: right;
    cursor: pointer;
    font-size: 14px;
    margin-right: 5px;

    &:hover {
      color: $color-primary;
    }
  }

  // -------- customer selected panel --------
  .customer-selected-count {
    color: $color-primary;
    padding: 0 3px;
    width: 15px;
    text-align: center;
    cursor: pointer;
    font-size: 13px;
  }

  .customer-selected-panel {
    font-size: 14px;
    height: calc(100% - 51px);

    .customer-selected-tip {
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

    .customer-selected-list {
      height: 100%;
      padding: 10px;
      overflow-y: auto;

      .customer-selected-row {
        display: flex;
        flex-flow: row nowrap;
        line-height: 36px;
        border-bottom: 1px solid #ebeef5;
        font-size: 13px;

        &:hover {
          background-color: #f5f7fa;

          .customer-selected-delete {
            visibility: visible;
          }
        }
      }

      .customer-selected-head {
        background-color: #f0f5f5;
        color: #333;
        font-size: 14px;
      }

      .customer-selected-sn {
        padding-left: 10px;
        width: 150px;
        @include text-ellipsis;
      }

      .customer-selected-name {
        padding-left: 10px;
        flex: 1;
        @include text-ellipsis;
      }

      .customer-selected-delete {
        width: 36px;
      }

      .customer-selected-row button.customer-selected-delete {
        padding: 0;
        width: 36px;
        height: 36px;
        border: none;
        background-color: transparent;
        outline: none;
        color: #646b78;
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

  // operation
  .customer-columns-dropdown-menu {
    max-height: 300px;
    overflow: auto;
    .el-dropdown-menu__item {
      padding: 0;
    }
    .el-checkbox {
      width: 100%;
      padding: 5px 15px;
      margin: 0;
    }
  }

  .operation-bar-container {
    background: #fff;
    border-radius: 3px 3px 0 0;
    display: flex;
    justify-content: space-between;
    padding: 10px;

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

  // superscript
  .customer-name-superscript-td {
    padding: 0 !important;
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
}
</style>
