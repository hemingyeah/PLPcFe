<template>
  <div class="call-center-stats-container">

    <div class="stats-station-header">
      <p>呼叫中心号码：<span>{{callState.hotLine}}</span></p>
      <p>坐席数：<span>{{callState.agentNum}}</span>
        <el-tooltip content="已配置坐席数/购买坐席数">
          <i class="iconfont icon-info"></i>
        </el-tooltip>
      </p>
      <p>到期时间：<span>{{callState.endTime}}</span></p>
      <p>话费余额：<span class="money">{{callState.cost}}元</span></p>

    </div>
    <div class="stats-station-today-header">今日统计</div>
    <div class="stats-station-today-content">

      <div class="stats-station-card">
        <div class="card-content">
          <p><i class="iconfont icon-huru"></i> 呼入已接通话量</p>
          <h3> {{statisticsRecord.normalDealingCount}}</h3>
          <div class="card-bottom">未接来电：{{statisticsRecord.normalNotDealCount}}&nbsp;&nbsp;&nbsp;&nbsp;接通率：{{parseFloat((statisticsRecord.normalDealingRate*100).toFixed(2)) }}%
          </div>
        </div>
      </div>

      <div class="stats-station-card">
        <div class="card-content">
          <p><i class="iconfont icon-huru"></i> 呼入已解决通话</p>
          <h3>{{statisticsRecord.normalSolvedCount}}</h3>
          <div class="card-bottom">解决率：{{ parseFloat((statisticsRecord.normalSolvedRate*100).toFixed(2)) }}%</div>
        </div>
      </div>

      <div class="stats-station-card">
        <div class="card-content">
          <p><i class="iconfont icon-huru"></i> 呼入通话时长</p>
          <h3>{{statisticsRecord.totalNormalDealings|fmt_h_m_s}}</h3>
          <div class="card-bottom">平均通话时长：{{statisticsRecord.avgNormalDealings|fmt_h_m_s}}</div>
        </div>
      </div>

      <div class="stats-station-card">
        <div class="card-content">
          <p><i class="iconfont icon-huchu"></i> 呼出通话量</p>
          <h3>{{statisticsRecord.dialoutDealingCount}}</h3>
          <div class="card-bottom">未接来电：{{statisticsRecord.dialoutNotDealCount}}&nbsp;&nbsp;&nbsp;&nbsp;接通率：{{ parseFloat((statisticsRecord.dialoutDealingRate*100).toFixed(2)) }}%</div>
        </div>
      </div>

      <div class="stats-station-card">
        <div class="card-content">
          <p><i class="iconfont icon-huchu"></i> 呼出通话时长</p>
          <h3>{{statisticsRecord.totalDialoutDealings|fmt_h_m_s}}</h3>
          <div class="card-bottom">平均通话时长：{{statisticsRecord.avgDialoutDealings|fmt_h_m_s}}</div>
        </div>
      </div>
    </div>

    <div class="customer-list-container" ref="customerListPage" v-loading.fullscreen.lock="loadingListData">
      <!--搜索-->
      <div class="customer-list-search-group-container">
        <form class="base-search" onsubmit="return false;">
          <div class="customer-list-base-search-group">
            <el-input v-model="params.keyword" placeholder="请输入要查询的坐席、客户、联系人或呼叫电话">
              <i slot="prefix" class="el-input__icon el-icon-search"></i>
            </el-input>
            <base-button type="primary" @event="params.pageNum=1;getRecordList();trackEventHandler('search')" native-type="submit">搜索</base-button>
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
              <el-radio-button label="全部"></el-radio-button>
              <el-radio-button label="已接来电"></el-radio-button>
              <el-radio-button label="未接来电"></el-radio-button>
              <el-radio-button label="呼出已接"></el-radio-button>
              <el-radio-button label="呼出未接"></el-radio-button>
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

        <el-table :data="recordList" stripe @select-all="handleSelection" :row-key="getRowKey" header-row-class-name="customer-table-header" ref="multipleTable" class="customer-table">
          
          <el-table-column v-for="column in columns" v-if="column.show" 
                           :fixed="column.fixed" :key="column.field" :label="column.label" :prop="column.field" :width="column.width" :min-width="column.minWidth || '120px'"
                           :class-name="column.field == 'name' ? 'customer-name-superscript-td' : ''" :show-overflow-tooltip="column.field !== 'name'" :align="column.align">
            <template slot-scope="scope">
              <template v-if="column.field === 'callType'">
                {{fmt_callType(scope.row)}}
              </template>
              <template v-else-if="column.field === 'customerName'">
                <span v-if="scope.row[column.field]">{{scope.row[column.field]}}</span>
                <span v-else>--</span>                
              </template>
              <template v-else-if="column.field === 'sortName'">
                <span v-if="scope.row[column.field]">{{scope.row[column.field]}}</span>
                <span v-else>--</span>
              </template>
              <template v-else-if="column.field === 'linkmanName'">
                <span v-if="scope.row[column.field]">{{scope.row[column.field]}}</span>
                <span v-else>--</span>
              </template>
              <template v-else-if="column.field === 'status'">
                <span v-if="scope.row[column.field] == 0" style="color:#FB602C">未解决</span>
                <span v-else-if="scope.row[column.field] == 1">已解决</span>
                <span v-else>--</span>
              </template>
              <template v-else-if="column.field === 'handleStatus'">
                <span v-if="scope.row[column.field] == 0" style="color:#FB602C">未处理</span>
                <span v-else-if="scope.row[column.field] == 1">已处理</span>
                <span v-else>--</span>
              </template>
              <template v-else-if="column.field === 'operation'" slot-scope="scope">
                <!-- 处理未接来电 -->
                <el-button type="text" v-if="scope.row.state=='notDeal'" @click="dealDialog(scope.row)">处理</el-button>
                <el-button type="text" v-else @click="detail(scope.row)">详情</el-button>
              </template>
             
              <template v-else>
                <pre class="pre-text">{{scope.row[column.field]}}</pre>
              </template>
            </template>
          </el-table-column>
        </el-table>

        <div class="table-footer">
          <el-pagination class="customer-table-pagination" background @current-change="jump" @size-change="handleSizeChange" :page-sizes="[10, 20, 50]" :page-size="params.pageSize" :current-page="params.pageNum"
                         layout="prev, pager, next, sizes, jumper" :total="totalItems"></el-pagination>
        </div>
      </div>
      <!--list end-->

      <base-table-advanced-setting ref="advanced" @save="modifyColumnStatus" />

      <search-panel ref="searchPanel">
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
          {{missCallForm.dialPhone}} <span class="make-phone-call" @click="makePhoneCall(missCallForm.dialPhone)">拨打电话<i class="iconfont icon-dianhua1"></i></span>
        </el-form-item>
        
        <el-form-item label="处理状态">
          <el-radio-group v-model="missCallForm.handleStatus">
            <el-radio :label="0">未处理</el-radio>
            <el-radio :label="1">已处理</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="handleRemark">
          <el-input type="textarea"
                    placeholder="请输入备注"
                    v-model="missCallForm.handleRemark"
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
import SearchPanel from '../component/SearchPanel'
import * as CallCenterApi from '@src/api/CallCenterApi'
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
      callState: {},
      statisticsRecord: {},
      params: {
        // orderDetail: {},
        // moreConditions: {
        //   conditions: []
        // },
        keyword: '',
        pageNum: 1,
        pageSize: 10
      },
      totalItems: 0,
      multipleSelection: [],
      defaultAddress: [],
    
      recordList: [],
      columns: this.fixedColumns(),
      selectedLimit: 500,
      columnNum: 1,
      tableKey: (Math.random() * 1000) >> 2,
      missCallDialogVisible: false,
      missCallForm: {
        id:'',
        dialPhone:'',
        handleStatus: 0,
        handleRemark: ''
      },
    
    }
  },

  computed: {
    panelWidth() {
      return `${420 * this.columnNum}px`
    }
  },

  mounted() {
    this.getTodayCallState()
    this.getTodayStatisticsRecord()
    this.columns = this.buildTableColumn()
    this.getRecordList()
  
    // this.search()
  },

  methods: {
    // 处理未接来电打电话
    async makePhoneCall(tel){
      if(!tel) return
      try {
        await this.$http.post('/outside/callcenter/api/dialout', {phone:tel, taskType:'handle'}, false)
      } catch (error) {
        console.error(error);
      }
    },
    async getRecordList(){
      this.loadingListData = true
      try {
        let {code, message, result} = await CallCenterApi.getRecordList(this.params)
        if (code != 0) return this.$message.error(message || '内部错误')
        this.loadingListData = false
        if (!result || !result.list) {
          this.recordList = [];
          this.totalItems = 0;
          this.params.pageNum = 1;
        } else {
          const { total, pageNum, list } = result;
          this.recordList = list.map(c => {
            c.pending = false;
            return c;
          });
          this.totalItems = total;
          this.params.pageNum = pageNum;
          this.matchSelected(); // 把选中的匹配出来
        }
      } catch (error) {
        this.loadingListData = false
        console.error(error)
      }
    },

    getTodayCallState(){
      CallCenterApi.getTodayCallState().then(({code, message, result}) => {
        if (code != 0) return this.$message.error(message || '内部错误')
        this.callState = result || {}
      }).catch((err) => {
        console.error(err)
      })
    },

    getTodayStatisticsRecord(){
      CallCenterApi.getTodayStatisticsRecord().then(({code, message, result}) => {
        if (code != 0) return this.$message.error(message || '内部错误')
        this.statisticsRecord = result || {}
      }).catch((err) => {
        console.error(err)
      });
    },

    stateChangeHandler (state) {
      console.info('state:', state); 
      // 切换tab
      this.activeName = state; 
      this.columns.forEach(col => {
        if (col.field == 'handleStatus') {
          this.$set(col, 'show', this.activeName === '全部' || this.activeName === '未接来电');
        } else if (col.field == 'status') {
          this.$set(col, 'show', this.activeName != '未接来电');
        }
      })
      switch (state) {
      case '全部':
        this.params.callType = ''
        this.params.state = ''
        break;
      case '已接来电':
        this.params.callType = 'normal'
        this.params.state = 'dealing'
        break;
      case '未接来电':
        this.params.callType = 'normal'
        this.params.state = 'notDeal'
        break;
      case '呼出已接':
        this.params.callType = 'dialout'
        this.params.state = 'dealing'
        break;
      case '呼出未接':
        this.params.callType = 'dialout'
        this.params.state = 'notDeal'
        break;
      default:
        break;
      }
      this.getRecordList()
    },

    powerfulSearch() {
      // 高级搜索
      let keyword = this.params.keyword
      this.params = {
        keyword,
        pageNum: 1,
        pageSize: 10
      }
      // this.params.pageNum = 1
      // this.params.moreConditions = this.$refs.searchPanel.buildParams()
      const moreConditions = this.$refs.searchPanel.buildParams().conditions || []
      
      moreConditions.forEach(item=>{
        if(item.property == 'sortId') {
          // 咨询分类
          this.params.sortId = item.value[0].id || ''
        }else if(item.property == 'ringTime') {
          this.params.ringStartTime = item.betweenValue1 || ''
          this.params.beginTimeStart = item.betweenValue2 || ''
        } else if(item.property == 'beginTime') {
          this.params.beginTimeStart = item.betweenValue1 || ''
          this.params.beginTimeEnd = item.betweenValue2 || ''
        } else if(item.property == 'endTime') { 
          this.params.endTimeStart = item.betweenValue1 || ''
          this.params.endTimeEnd = item.betweenValue2 || ''
        } else {
          this.params[item.property] = item.value || ''
        }
      })
      // console.log(this.params); 
      this.getRecordList() 
      // this.search()
    },
    showAdvancedSetting() {
      // window.TDAPP.onEvent('pc：通话记录-选择列事件')
      
      console.info('open;', this.columns);
       
      this.$refs.advanced.open(this.columns)
    },
    // createCustomerTab(customerId) {
    //   let fromId = window.frameElement.getAttribute('id')

    //   this.$platform.openTab({
    //     id: `customer_view_${customerId}`,
    //     title: '客户详情',
    //     close: true,
    //     url: `/customer/view/${customerId}?noHistory=1`,
    //     fromId
    //   })
    // },
    
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
    // search() {
    //   const params = this.buildParams()

    //   this.loadingListData = true

    //   return this.$http
    //     .post('/customer/list', params)
    //     .then(res => {
    //       if (!res || !res.list) {
    //         this.customers = []
    //         this.totalItems = 0
    //         this.params.pageNum = 1
    //       } else {
    //         const { total, pageNum, list } = res

    //         this.customers = list.map(c => {
    //           c.pending = false
    //           return c
    //         })

    //         this.totalItems = total
    //         this.params.pageNum = pageNum
    //         this.matchSelected() // 把选中的匹配出来
    //       }

    //       return res
    //     })
    //     .then(() => {
    //       this.$refs.customerListPage.scrollTop = 0
    //       this.loadingListData = false
    //     })
    //     .catch(err => {
    //       this.loadingListData = false
    //       console.error('err', err)
    //     })
    // },
    buildParams() {
      const sm = Object.assign({}, this.params)
      let params = {
        keyword: sm.keyword,
        pageSize: sm.pageSize,
        pageNum: sm.pageNum
      }

      // if (Object.keys(sm.orderDetail || {}).length) {
      //   params.orderDetail = sm.orderDetail
      // }

      // if (
      //   Object.keys(sm.moreConditions).length > 1 ||
      //   sm.moreConditions.conditions.length
      // ) {
      //   params = {
      //     ...params,
      //     ...sm.moreConditions
      //   }
      // }

      return params
    },

    jump(pageNum) {
      this.params.pageNum = pageNum
      // this.search()
      this.getRecordList()
    },
    handleSizeChange(pageSize) {
      this.saveDataToStorage('pageSize', pageSize)
      this.params.pageNum = 1
      this.params.pageSize = pageSize
      // this.search()
      this.getRecordList()
    },
    handleSelection(selection) {
      let tv = this.computeSelection(selection);
      let original = this.multipleSelection.filter(ms =>
        this.customers.some(cs => cs.id === ms.id)
      );
      let unSelected = this.customers.filter(c =>
        original.every(oc => oc.id !== c.id)
      );

      if (tv.length > this.selectedLimit) {
        this.$nextTick(() => {
          original.length > 0
            ? unSelected.forEach(row => {
              this.$refs.multipleTable.toggleRowSelection(row, false);
            })
            : this.$refs.multipleTable.clearSelection();
        });
        return this.$platform.alert(`最多只能选择${this.selectedLimit}条数据`);
      }
      this.multipleSelection = tv;

      this.$refs.baseSelectionBar.openTooltip();
    },
    computeSelection(selection) {
      let tv = [];
      tv = this.multipleSelection.filter(ms =>
        this.customers.every(c => c.id !== ms.id)
      );
      tv = _.uniqWith([...tv, ...selection], _.isEqual);
      return tv;
    },
    toggleSelection(rows) {
      let isNotOnCurrentPage = false;
      let row = undefined;

      if (rows) {
        for (let i = 0; i < rows.length; i++) {
          row = rows[i];
          isNotOnCurrentPage = this.recordList.every(item => {
            return item.id !== row.id;
          });
          if (isNotOnCurrentPage) return;
        }
        rows.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row);
        });
      } else {
        this.$refs.multipleTable.clearSelection();
        this.multipleSelection = [];
      }
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
      const dataStr = localStorage.getItem('callCenterListData') || '{}'
      return JSON.parse(dataStr)
    },
    saveDataToStorage(key, value) {
      const data = this.getLocalStorageData()
      data[key] = value
      localStorage.setItem('callCenterListData', JSON.stringify(data))
    },
    buildTableColumn() {
      const localStorageData = this.getLocalStorageData()
      let columnStatus = localStorageData.columnStatus || []
      let localColumns = columnStatus
        .map(i => (typeof i == 'string' ? { field: i, show: true } : i))
        .reduce((acc, col) => (acc[col.field] = col) && acc, {})

      let baseColumns = this.fixedColumns()
      let dynamicColumns = this.getDynamicColumns()
        .map(field => {
          let sortable = false
          let minWidth = null

          if (['date', 'datetime', 'number'].indexOf(field.formType) >= 0) {
            sortable = 'custom'
            minWidth = 100
          }

          if (field.displayName && field.displayName.length > 4) {
            minWidth = field.displayName.length * 20
          }

          // if (sortable && field.displayName.length >= 4) {
          //   minWidth = 125
          // }

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
          width = typeof localField.width == 'number' ? `${localField.width}px` : ''
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
      // window.TDAPP.onEvent('pc：客户管理-重置事件')
      this.$refs.searchPanel.resetParams()

      this.params = {
        keyword: '',
        pageNum: 1,
        pageSize: this.params.pageSize,
        // orderDetail: {},
        // moreConditions: {
        //   conditions: []
        // }
      }
      this.getRecordList()
      // this.search()
    },
    // match data
    matchSelected() {
      if (!this.multipleSelection.length) return;
      const selected = this.recordList.filter(c => {
        if (this.multipleSelection.some(sc => sc.id === c.id)) {
          this.multipleSelection = this.multipleSelection.filter(
            sc => sc.id !== c.id
          );
          this.multipleSelection.push(c);
          return c;
        }
      }) || [];

      this.$nextTick(() => {
        this.toggleSelection(selected);
      });
    },
    fmt_callType(row){
      // 呼叫类型
      let res = ''
      if(row.callType === 'normal') {
        res = row.state === 'dealing' ? '已接来电' : '未接来电'
      } else if(row.callType === 'dialout'){
        res = row.state === 'dealing' ? '呼出已接' : '呼出未接'
      }
      return res
    },
    fixedColumns() {
      console.info('activeName:', this.activeName);
      return [
        {
          label: '通话ID',
          field: 'recordId',
          show: true,
          minWidth: '150px'
        },
        {
          label: '接待坐席',
          field: 'agentName',
          // width: '150px',
          show: true
        },
        {
          label: '呼叫类型',
          field: 'callType',
          // width: '100px',
          show: true
        },
        {
          label: '来去电时间',
          field: 'ring',
          minWidth: '180px',
          show: true
        },
        {
          label: '咨询分类',
          field: 'sortName',
          // width: '180px',
          show: true
        },
        {
          label: '解决状态',
          field: 'status',
          // width: '160px',
          show: true
        },
        {
          label: '处理状态',
          field: 'handleStatus',
          // width: '160px',
          show: true
        },
        {
          label: '呼叫电话',
          field: 'dialPhone',
          show: true,
          // width: '110px'
        },
        {
          label: '客户',
          field: 'customerName',
          show: true,
          // width: '100px'
        },
        {
          label: '联系人',
          field: 'linkmanName',
          show: true,
          // width: '150px'
        },
        {
          label: '消耗话费(元)',
          field: 'cost',
          show: true,
          // width: '150px'
        },
        {
          label: '操作',
          field: 'operation',
          // width: '80px',
          show: true,
          fixed: 'right'
        }
      ]
    },
    getDynamicColumns(){
      return [
        {
          displayName: '归属地',
          label: '归属地',
          fieldName: 'attribution',
          // width: '150px',
          show: false
        },
        {
          displayName: '通话开始时间',
          label: '通话开始时间',
          fieldName: 'beginTime',
          width: '180px',
          show: false
        },
        {
          displayName: '通话结束时间',
          label: '通话结束时间',
          fieldName: 'endTime',
          width: '180px',
          show: false
        },
        {
          displayName: '通话时长',
          label: '通话时长',
          fieldName: 'talkTime',
          // width: '150px',
          show: false
        },
        {
          displayName: '关联工单',
          label: '关联工单',
          fieldName: 'taskId',
          // width: '150px',
          show: false
        },
        {
          displayName: '关联事件',
          label: '关联事件',
          fieldName: 'eventId',
          // width: '150px',
          show: false
        },
      ]
    },
    panelSearchAdvancedToggle() {
      // window.TDAPP.onEvent('pc：客户管理-高级搜索事件')
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
      // if (type === 'search') {
      //   window.TDAPP.onEvent('pc：呼叫工作台-搜索事件')
      //   return
      // }
    },
    getRowKey(row) {
      return row.id
    },
    detail(row){
      // let fromId = window.frameElement.getAttribute('id');
      this.$platform.openTab({
        id: `callcenter_view_${row.id}`,
        title: '通话详情',
        close: true,
        url: `/setting/callcenter/view?id=${row.id}&phone=${row.dialPhone}`,
        fromId: 'M_CASE'
      }); 
    },
    missCallDialogClosed() {
      this.$refs.missCallFormRef.resetFields()
    },
    dealDialog(item){
      this.missCallDialogVisible = true
      this.missCallForm.id = item.id  
      this.missCallForm.dialPhone = item.dialPhone  
    },
    async deal(row){
      // 处理未接来电
      // console.info('form::', this.missCallForm);
      try {
        this.pending = true;
        const params = this.missCallForm
        delete params.dialPhone
        const { code, message } = await CallCenterApi.updateHandleStatus(params)
        if (code !== 0) return this.$platform.notification({
          title: '处理失败',
          message: message || '',
          type: 'error',
        })
        this.pending = false;
        this.missCallDialogVisible = false
        this.missCallDialogClosed()    
        this.$platform.notification({
          title: '处理成功',
          type: 'success',
        })
        this.getRecordList() 
      } catch (error) {
        this.pending = false;
        console.error(error)
      } 
    },
    
  },

  components: {
    [SearchPanel.name]: SearchPanel
  }
}
</script>

<style lang="scss">
$color-primary-light-9: mix(#fff, $color-primary, 90%) !default;
.make-phone-call {
  color: #ffffff;
  background: #55b7b4;
  border-color: #55b7b4;
  padding: 3px 5px;
  border-radius: 2px;
  height: 24px;
  line-height: 24px;
  margin-left: 5px;
  i {
    cursor:pointer;
  }
}
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
    margin-top: 10px;
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
      border-right: 1px solid #eee;
      .card-content {
       
        p {
          display: flex;
           padding-left: 20px;
        }
        h3 {
           padding-left: 20px;
        }
        .icon-huru{
          color: #6ECF40;
          margin-right: 8px;
        }
        .icon-huchu{
          color: #FFAE00;
          margin-right: 8px;
        }
      }
      .card-bottom {
        background: rgba(250, 251, 252, 1);
        border-radius: 0px 0px 0px 2px;
        height: 40px;
        line-height: 40px;
        padding-left: 20px;
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
    // padding-top: 10px;
    /*min-height: calc(100% - 100px);*/
    .el-table__fixed-right {
      // 操作栏固定到最右侧
      top: 10px;
    }
    
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
    border-radius: 0;
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
