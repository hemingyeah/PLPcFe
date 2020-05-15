<template>
  <div class="transfer-detail-list-view" v-loading.fullscreen.lock="loadingListData">
    <div class="state-bar">
      <el-radio-group v-model="activeName" @change="stateChangeHandler" size="medium" id="v-step-0">
        <el-radio-button label="未完成事件" name="event"></el-radio-button>
        <el-radio-button label="未完成工单" name="task"></el-radio-button>
        <el-radio-button label="负责客户" name="customer"></el-radio-button>
        <el-radio-button label="个人备件库" name="stock"></el-radio-button>
      </el-radio-group>
      <base-button v-if="activeName!='个人备件库'" type="primary" @event="handleClick" id="v-step-1">转交</base-button>
    </div>

    <v-tour v-if="showTour" name="myTour" :steps="steps" :options="options">
      <template slot-scope="tour">
        <transition name="fade">
          <v-step
            v-if="tour.currentStep === index"
            v-for="(step, index) of tour.steps"
            :key="index"
            :step="step"
            :previous-step="tour.previousStep"
            :next-step="tour.nextStep"
            :stop="tour.stop"
            :is-first="tour.isFirst"
            :is-last="tour.isLast"
            :labels="tour.labels"
          >
            <template>
              <div slot="actions" class="option-btns">
                <button class="btn btn-transfer btn-disabled" disabled>« 上一步</button>
                <button class="btn btn-transfer btn-disabled" disabled>下一步 »</button>
                <button @click="stopStep" class="btn btn-transfer">好,知道了</button>
              </div>
            </template>
          </v-step>
        </transition>
      </template>
    </v-tour>

    <!-- start content -->
    <div class="transfer-detail-list-content">
      <div style="background: #fff;padding: 0 10px">
        <base-selection-bar :is-not-show-tooltip="true" ref="baseSelectionBar" v-model="multipleSelection" @toggle-selection="toggleSelection" @show-panel="() => multipleSelectionPanelShow = true" />
      </div>

      <!-- start 表格 -->
      <div class="table-container">
        <el-table :data="page.list" ref="multipleTable"
                  :row-key="getRowKey"
                  @select="handleSelection"
                  @select-all="handleSelection"
                  header-row-class-name="base-table-header"
                  stripe >
          <el-table-column type="selection" width="44"></el-table-column>

          <template v-if="tap === 'event'">
            <el-table-column
              v-for="column in columns"
              :key="column.field"
              :label="column.label"
              :prop="column.field"
              :width="column.width"
              :min-width="column.minWidth || '120px'"
              :show-overflow-tooltip="column.field !== 'eventNo'">
              <template slot-scope="scope">
                <template v-if="column.field === 'eventNo'">
                  <sample-tooltip :row="scope.row">
                    <template slot="content" slot-scope="{isContentTooltip}">
                      <el-tooltip :content="scope.row[column.field]" placement="top" :disabled="!isContentTooltip">
                        <a href="" class="view-detail-btn" @click.stop.prevent="createEventTab(scope.row.id)">
                          {{ scope.row[column.field] }}
                        </a>
                      </el-tooltip>
                    </template>
                  </sample-tooltip>
                </template>
                <template v-else-if="column.field === 'templateName'">
                  {{scope.row[column.field]}}
                </template>
                <template v-else-if="column.field === 'cusName'">
                  {{formatCustomerName(scope.row[column.field])}}
                </template>
                <template v-else-if="column.field === 'state'">
                  {{ formatState(scope.row[column.field])}}
                </template>
                <template v-else-if="column.field === 'createTime'">
                  {{scope.row.createTime | formatDate}}
                </template>
                <template v-else-if="column.field === 'updateTime'">
                  {{scope.row.updateTime | formatDate}}
                </template>
              </template>
            </el-table-column>
          </template>

          <template v-else-if="tap === 'task'">
            <el-table-column
              v-for="column in columns"
              :key="column.field"
              :label="column.label"
              :prop="column.field"
              :width="column.width"
              :min-width="column.minWidth || '120px'"
              :show-overflow-tooltip="column.field !== 'taskNo'">
              <template slot-scope="scope">
                <template v-if="column.field === 'taskNo'">
                  <sample-tooltip :row="scope.row">
                    <template slot="content" slot-scope="{isContentTooltip}">
                      <el-tooltip :content="scope.row[column.field]" placement="top" :disabled="!isContentTooltip">
                        <a href="" class="view-detail-btn" @click.stop.prevent="createTaskTab(scope.row.id)">
                          {{ scope.row[column.field] }}
                        </a>
                      </el-tooltip>
                    </template>
                  </sample-tooltip>
                </template>
                <template v-else-if="column.field === 'customer.name'">
                  {{scope.row.customer && scope.row.customer.name}}
                </template>
                <template v-else-if="column.field === 'product.name'">
                  {{scope.row.product && scope.row.product.name}}
                </template>
                <template v-else-if="column.field === 'state'">
                  {{formatState(scope.row[column.field])}}
                </template>
                <template v-else-if="column.field === 'createTime'">
                  {{scope.row.createTime | formatDate}}
                </template>
                <template v-else-if="column.field === 'updateTime'">
                  {{scope.row.updateTime | formatDate}}
                </template>
                <template v-else-if="column.field === 'startTime'">
                  {{scope.row.startTime | formatDate}}
                </template>
                <template v-else-if="column.isSystem === 0">
                  {{scope.row.attribute[column.field]}}
                </template>
                <template v-else>
                  {{scope.row[column.field]}}
                </template>
              </template>
            </el-table-column>
          </template>

          <template v-else-if="tap === 'customer'">
            <el-table-column
              v-for="column in columns"
              :key="column.field"
              :label="column.label"
              :prop="column.field"
              :width="column.width"
              :min-width="column.minWidth || '120px'"
              :show-overflow-tooltip="column.field !== 'name'">
              <template slot-scope="scope">
                <template v-if="column.field === 'name'">
                  <sample-tooltip :row="scope.row">
                    <template slot="content" slot-scope="{isContentTooltip}">
                      <el-tooltip :content="scope.row[column.field]" placement="top" :disabled="!isContentTooltip">
                        <a href="" class="view-detail-btn" @click.stop.prevent="createCustomerTab(scope.row.id)">
                          {{ scope.row[column.field] }}
                        </a>
                      </el-tooltip>
                    </template>
                  </sample-tooltip>
                </template>
                <template v-else-if="column.field === 'customerAddress'">
                  {{formatAddress(scope.row[column.field])}}
                </template>
                <template v-else-if="column.field === 'detailAddress'">
                  {{scope.row.customerAddress && scope.row.customerAddress.adAddress}}
                </template>
                <template v-else-if="column.field === 'tags' && scope.row.tags">
                  {{scope.row.tags | tagName}}
                </template>
                <template v-else-if="column.formType === 'location'">
                  {{ scope.row.attribute[column.field] && scope.row.attribute[column.field].address}}
                </template>
                <template v-else-if="column.formType === 'address'">
                  {{formatCustomizeAddress(scope.row.attribute[column.field])}}
                </template>
                <template v-else-if="column.isSystem === 0">
                  {{scope.row.attribute[column.field]}}
                </template>
                <template v-else>
                  {{scope.row[column.field]}}
                </template>
              </template>
            </el-table-column>
          </template>

          <template v-else-if="tap === 'stock'">
            <el-table-column
              v-for="column in columns"
              :key="column.field"
              :label="column.label"
              :prop="column.field"
              :width="column.width"
              :min-width="column.minWidth || '120px'"
              :show-overflow-tooltip="column.field !== 'operate'">
              <template slot-scope="scope">
                <template v-if="column.field === 'serialNumber'">
                  {{scope.row.sparepart && scope.row.sparepart.serialNumber}}
                </template>
                <template v-else-if="column.field === 'name'">
                  {{scope.row.sparepart && scope.row.sparepart.name}}
                </template>
                <template v-else-if="column.field === 'type'">
                  {{scope.row.sparepart && scope.row.sparepart.type}}
                </template>
                <template v-else-if="column.field === 'standard'">
                  {{scope.row.sparepart && scope.row.sparepart.standard}}
                </template>
                <template v-else-if="column.field === 'operate' && (scope.row.repertoryCount - scope.row.occupyNum) > 0 ">
                  <el-button type="text" class="no-padding" @click="partBack(scope.row)">退回</el-button>
                </template>
                <template v-else-if="column.isSystem === 0">
                  {{scope.row.attribute[column.field]}}
                </template>
                <template v-else>
                  {{scope.row[column.field]}}
                </template>
              </template>
            </el-table-column>
          </template>

        </el-table>

      </div>
      <!-- end 表格 -->

      <!-- start 表格底部 -->
      <div class="table-footer">
        <div class="list-info">
          共<span class="level-padding">{{ page.total || 0 }}</span>记录，
          已选中<span class="transfer-detail-selected-count" @click="multipleSelectionPanelShow = true">{{ multipleSelection.length }}</span>条
          <span class="transfer-detail-selected-count" @click="toggleSelection()">清空</span>
        </div>
        <el-pagination
          @current-change="jump"
          @size-change="handleSizeChange"
          :page-sizes="[10, 20, 50]"
          :page-size="model.pageSize"
          :current-page="model.pageNum"
          layout="prev, pager, next, sizes, jumper"
          :total="page.total">
        </el-pagination>
      </div>
      <!-- end 表格底部 -->

      <!-- 备件退回 -->
      <part-back-form ref="partBackForm" @success="init" :repertory="repertory" :user-id="userId"></part-back-form>
      
      <!-- 客户转交 -->
      <batch-editing-dialog
        ref="batchEditingDialog"
        :config="{fields}"
        :callback="init"
        :selected-ids="selectedIds"
        :module="activeName">
      </batch-editing-dialog>
    </div>
    <!-- end content -->
   
  </div>
</template>

<script>
import _ from 'lodash';
import Page from '@model/Page';
import platform from '@src/platform'
import { formatDate } from '@src/util/lang';
const TRANSFER_LIST_DATA = 'transfer-list-data';
import {parse} from '@src/util/querystring';
import BatchEditingDialog from '../component/BatchEditingDialog.vue';
import PartBackForm from '../component/PartBackForm.vue'; 
let query;
export default {
  name: 'transfer-detai-view',
  props: {
    initData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      showTour:true,
      options: {
        labels: {
          buttonPrevious: '« 上一步',
          buttonNext: '下一步 »',
          buttonStop: '好,知道了'
        }
      },
      steps: [
        {
          target: '#v-step-0',
          content: '点击tab查看不同资源的详细信息，并点击转交/退回按钮对资源进行转交。',
          header: {
            title: '温馨提示',
          },
        },
      ],
      activeName: '未完成事件',
      tap: '',
      columns: [], // 列
     
      loadingListData: false, // 加载列表数据
      multipleSelectionPanelShow: false,
      totalItems: 0,
      multipleSelection: [], // 已选择列表
      searchCustomizeFields: [], // 搜索自定义字段
      selectedLimit: 500, // 最大选择数量
      columnNum: 1,

      page: new Page(), // page 对象
  
      model: {
        keyword: '',
        pageSize: 10,
        pageNum: 1,
        orderDetail: {}
      },
      showPartBack:false,
      isTooltipShow: false,
      repertory:[],
      userId:'',
      applyBackingTask: {},

      fields:[{'fieldName':'manager',
        'displayName':'负责人',
        'formType':'user',
        'defaultValue':null,
        'isNull':1,
        'isSearch':1}],
    }
  },
  computed: {
    /* 已选择 id列表 */
    selectedIds() {
      return this.multipleSelection.map(item => item.id) || [];
    }
  },
  filters: {
    tagName (value) {
      if (!value || !Array.isArray(value) || !value.length) return '';
      return value
        .filter(tag => tag && tag.tagName)
        .map(tag => tag.tagName)
        .join('，');
    },
    displaySelect(value) {
      if (!value) return null;
      if (value && typeof value === 'string') {
        return value;
      }
      if (Array.isArray(value) && value.length) {
        return value.join('，');
      }
      return null;
    },
    formatDate(val) {
      if (!val) return '';
      // val如果是这样2019-01-04 15:36 不需要转换
      if(typeof val == 'string' && val.indexOf('-') > -1) return val;
      return formatDate(val, 'YYYY-MM-DD HH:mm:ss')
    },
  },
  mounted() {
    const detailTour = localStorage.getItem('user-del-detail-tour');
    if(!detailTour) {
      this.$tours['myTour'].start();
    }

    query = parse(window.location.search) || {};
    this.tap = query.type || 'event';
    this.userId = query.userId;
    // console.info('query:', query);
    this.getActiveName(query.type || 'event');  
    this.init();
  },
  methods: {
    stopStep(){
      localStorage.setItem('user-del-detail-tour', true);
      this.showTour = false;
    },
    init(){
      let url = '', method = 'get';
      let params = JSON.parse(JSON.stringify(this.model));
      switch (this.tap) {
      case 'event':
        this.columns = this.buildEventColumns();
        url = '/event/getIndexInfo';
        params.executor = this.userId;
        break;
      case 'task':
        this.columns = this.buildTaskColumns();
        url = '/task/getTaskList';
        method = 'post';
        params.executor = this.userId;
        params.stateList = ['created', 'allocated', 'taskPool', 'accepted', 'refused', 'processing'];
        break;
      case 'customer':
        this.columns = this.buildCustomerColumns();
        url = '/customer/list';
        method = 'post';
        params.customerManager = this.userId;
        break;
      case 'stock':
        this.columns = this.buildStockColumns();
        this.fetchRepertory();  
        url = '/partV2/repertory/person/list';
        // url = '/dd/partV2/repertory/personalStock';
        params.userId = this.userId;
        params.with_OOS = false;
        break;
      default:
        break;
      }
      this.toggleSelection();
      this.fetchData(url, method, params);  
    },
    async fetchData(url, method, params){
      let loading = this.$loading();
      try {
        let result = await this.$http.axios(method, url, params);
        if(this.activeName === '未完成工单') result = (result && result.data) || {}; 
        // console.info('list:', result);
        this.page = result || {};
        this.model.pageNum = this.page.pageNum;
        this.model.pageSize = this.page.pageSize;
      } catch (error) {
        console.info('e', error);
      }
      this.$nextTick(() => loading.close());
    },
    formatAddress(ad) {
      if (null == ad) return '';
      const {adProvince, adCity, adDist, } = ad;
      return [adProvince, adCity, adDist].filter(d => !!d).join('-');
    },
    formatCustomizeAddress(ad) {
      if (null == ad) return '';
      const {province, city, dist, address} = ad;
      return [province, city, dist, address].filter(d => !!d).join('-');
    },
    createCustomerTab(customerId) {
      let fromId = window.frameElement.getAttribute('id');
      this.$platform.openTab({
        id: `customer_view_${customerId}`,
        title: '客户详情',
        close: true,
        url: `/customer/view/${customerId}?noHistory=1`,
        fromId
      })
    },
    createTaskTab(id) {
      let fromId = window.frameElement.getAttribute('id');
      this.$platform.openTab({
        id: `task_view_${id}`,
        title: '工单详情',
        close: true,
        url: `/task/view/${id}?noHistory=1`,
        fromId
      })
    },
    createEventTab(id) {
      let fromId = window.frameElement.getAttribute('id');
      this.$platform.openTab({
        id: `event_view_${id}`,
        title: '事件详情',
        close: true,
        url: `/event/view/${id}?noHistory=1`,
        fromId
      })
    },
    handleClick(){
      // 处理事件 工单 客户转交
      this.$refs.batchEditingDialog.open();
    },
    // select
    handleSelection(selection) {
      let tv = this.computeSelection(selection);
      let original = this.multipleSelection
        .filter(ms => this.page.list.some(cs => cs.id === ms.id));
      let unSelected = this.page.list
        .filter(c => original.every(oc => oc.id !== c.id));

      if (tv.length > this.selectedLimit) {
        this.$nextTick(() => {
          original.length > 0
            ? unSelected.forEach(row => {
              this.$refs.multipleTable.toggleRowSelection(row, false);
            })
            : this.$refs.multipleTable.clearSelection();
        })
        return this.$platform.alert(`最多只能选择${this.selectedLimit}条数据`);
      }
      this.multipleSelection = tv;

      this.$refs.baseSelectionBar.openTooltip();
    },
    computeSelection(selection) {
      let tv = [];      
      tv = this.multipleSelection
        .filter(ms => this.page.list.every(c => c.id !== ms.id));
      tv = _.uniqWith([...tv, ...selection], _.isEqual);
      return tv;
    },
    toggleSelection(rows) {
      let isNotOnCurrentPage = false;
      let row = undefined;

      if (rows) {
        for(let i = 0; i < rows.length; i++) {
          row = rows[i];
          isNotOnCurrentPage = this.page.list.every(item => {
            return item.id !== row.id;
          })
          if(isNotOnCurrentPage) return
        }
        rows.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row);
        });
      } else {
        this.$refs.multipleTable.clearSelection();
        this.multipleSelection = [];
      }
    },
    getActiveName(state){
      switch (state) {
      case 'event':
        this.activeName = '未完成事件';
        break;
      case 'task':
        this.activeName = '未完成工单';
        break;
      case 'customer':
        this.activeName = '负责客户';
        break;
      case 'stock':
        this.activeName = '个人备件库';
        break;
      default:
        break;
      }
    },
    stateChangeHandler (state) {
      // console.info('state:', state); 
      // 切换tab
      this.model.pageNum = 1;
      this.activeName = state;     
      switch (state) {
      case '未完成事件':
        this.tap = 'event';
        this.columns = this.buildEventColumns();
        break;
      case '未完成工单':
        this.tap = 'task';
        this.columns = this.buildTaskColumns();
        break;
      case '负责客户':
        this.tap = 'customer';
        this.columns = this.buildCustomerColumns();
        break;
      case '个人备件库':
        this.tap = 'stock';
        this.columns = this.buildStockColumns();
        break;
      default:
        break;
      }
      this.init();   
    },
    showAdvancedSetting(){
      window.TDAPP.onEvent('pc：产品管理-选择列事件');

      this.$refs.advanced.open(this.columns);
    },
    buildParams() {
      const sm = Object.assign({}, this.model);
      let params = {
        keyword: sm.keyword,
        pageSize: sm.pageSize,
        pageNum: sm.pageNum,
      };

      if (Object.keys(sm.orderDetail || {}).length) {
        params.orderDetail = sm.orderDetail;
      }

      if (Object.keys(sm.moreConditions).length > 1 || sm.moreConditions.conditions.length) {
        params = {
          ...params,
          ...sm.moreConditions,
        }
      }

      if (params.createTime && params.createTime.length) {
        let createTime = params.createTime.split('-');

        params.createTimeStart = `${createTime[0]} 00:00:00`;
        params.createTimeEnd = `${createTime[1]} 23:59:59`;
        delete params.createTime;
      }

      return params
    },
    buildEventColumns() {
      return [{
        label: '事件编号',
        field: 'eventNo',
        show: true,
        minWidth: '150px',
      }, {
        label: '事件类型',
        field: 'templateName',
        show: true,
      }, {
        label: '客户',
        field: 'cusName',
        show: true,
      }, {
        label: '状态',
        field: 'state',
        show: true,
      }, {
        label: '创建时间',
        field: 'createTime',
        minWidth: '150px',
        show: true
      }, {
        label: '更新时间',
        field: 'updateTime',
        minWidth: '150px',
        show: true
      }]
    },
    buildTaskColumns() {
      return [{
        label: '工单编号',
        field: 'taskNo',
        show: true,
        minWidth: '150px',
      }, {
        label: '客户',
        field: 'customer.name',
        show: true,
      }, {
        label: '产品',
        field: 'product.name',
        show: true,
      }, {
        label: '服务类型',
        field: 'serviceType',
        show: true,
      }, {
        label: '服务类容',
        field: 'serviceContent',
        show: true
      },
      {
        label: '状态',
        field: 'state',
        show: true
      },
      {
        label: '创建时间',
        field: 'createTime',
        minWidth: '150px',
        show: true
      },
      {
        label: '开始时间',
        field: 'startTime',
        minWidth: '150px',
        show: true
      },
      {
        label: '更新时间',
        field: 'updateTime',
        minWidth: '150px',
        show: true
      }]
    },
    buildCustomerColumns() {
      return [{
        label: '客户',
        field: 'name',
        show: true,
        minWidth: '150px',
      }, {
        label: '客户编号',
        field: 'serialNumber',
        // width: '150px',
        fixed: true,
        show: true,
      }, {
        label: '联系人',
        field: 'lmName',
        // width: '100px',
        show: true,
      }, {
        label: '电话',
        field: 'lmPhone',
        // width: '130px',
        show: true,
      }, {
        label: '区域',
        field: 'customerAddress',
        // width: '180px',
        show: true,
      }, {
        label: '详细地址',
        field: 'detailAddress',
        // width: '160px',
        show: true,
      }, {
        label: '服务团队',
        field: 'tags',
        // width: '110px',
        show: true,
      }]
    },
    buildStockColumns() {
      return [
        {
          label: '编号',
          field: 'serialNumber',
          show: true
        },
        {
          label: '名称',
          field: 'name',
          show: true
        },
        {
          label: '备件类别',
          field: 'type',
          show: true,
          width: 150
        },
        {
          label: '备件规格',
          field: 'standard',
          show: true,
          width: 150
        },
        {
          label: '数量',
          field: 'repertoryCount',
          show: true,
          sortable: 'custom',
          width: 120
        },
        {
          label: '不可用数量',
          field: 'unavailableNum',
          show: true,
          width: 120
        },
        {
          field: 'userName',
          label: '个人库',
          show: true,
          width: 120
        },
        {
          label: '操作',
          field: 'operate',
          width: 80,
          show: true,
          export: false
        }
      ];
    },
    async partBack(stock){
      // this.trackEventHandler('listBack');
      this.$refs.partBackForm.open(stock)
    },
    async getApplyBackingTask (row) {
      let params = {
        sparepartUserId: row.id
      }
      let result = await this.$http.get('/partV2/repertory/getTaskBySparepartId', params);
      if(result.status == 0){
        this.applyBackingTask = result.data;
        this.isTooltipShow = true;
      }else{
        this.$platform.alert(result.message);
      }
    },
    fetchRepertory(){
      // 获取仓库类型
      return this.$http.get('/partV2/repertory/listForTeam').then(result => {
        this.repertory = result || [];
      })
    },
    repertoryCount(num1, num2) {
      return this.$math.format(this.$math.add(this.$math.bignumber(num1), this.$math.bignumber(num2)))
    }, 
    // 页码数切换
    handleSizeChange(pageSize) {
      this.model.pageSize = pageSize;
      this.model.pageNum = 1;
      this.localStorageSet('pageSize', pageSize, TRANSFER_LIST_DATA);
      this.init();
    },
    // 跳转
    jump(pageNum) {
      this.model.pageNum = pageNum;
      this.init();
    },
    /* 获取本地数据 */
    localStorageGet(key) {
      try {
        const dataStr = localStorage.getItem(key) || '{}'
        return JSON.parse(dataStr); 
      } catch (error) {
        console.info('error: ', error);
        return {}
      }
    },
    /* 设置本地数据 */
    localStorageSet(key, value, rootKey = null) {
      try {
        if(!rootKey) {
          localStorage.setItem(key, JSON.stringify(value));
        } else {
          const data = this.localStorageGet(rootKey);
  
          data[key] = value;
          localStorage.setItem(rootKey, JSON.stringify(data));
        }
      } catch(err) {
        console.info('localStorageSet err', err)
      } 
    },
    getRowKey(row) {
      return row.id
    },
    formatState (state) {
      // {"created":"待指派","allocated":"已指派","accepted":"已接受","refused":"已拒绝","processing":"进行中"}   
      let stateName = '';
      switch (state) {
      case 'created':
        stateName = '待指派';
        break;
      case 'allocated':
        stateName = '已指派';
        break;
      case 'accepted':
        stateName = '已接受';
        break;
      case 'refused':
        stateName = '已拒绝';
        break;
      case 'processing':
        stateName = '进行中';
        break;
      default:
        break;
      }
      return stateName;
    },
    formatCustomerName(cusName){
      if(!cusName) return '';
      return cusName.replace(/<[^>]+>/g, '');
    }
  },
  components: {
    [BatchEditingDialog.name]: BatchEditingDialog,
    [PartBackForm.name]: PartBackForm
  }
}
</script>

<style lang="scss">
.v-step[data-v-7c9c03f0] {
  background: #fff!important;
  color: #333!important;
}

.v-step .v-step__arrow--dark[data-v-7c9c03f0]{
  border-color: #55B7B4!important;
  border-left-color: transparent!important;
  border-right-color: transparent!important;
  border-top-color: transparent!important;
}

.v-step__header[data-v-7c9c03f0] {
  text-align: left;
  background: #55B7B4!important;
  color: #fff;
}

.v-step__content[data-v-7c9c03f0] {
  color: #333;
}

.nextSteps{
  left: 10;
  right: 0!important;
}

.btn-transfer{
  background-color: #fff;
  color: $text-color-primary;
  border: 1px solid #E2E2E2;
  border-radius: 2px;
  padding: 4px 15px;
  margin-left: -5px;
}

.btn-disabled{
  background: #eee;
  color: #999;
}

.state-bar{
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  height: 55px;
  padding: 0 10px;
  .el-radio-group label {
    margin-bottom: 0;
  }
}

.view-detail-btn{
  color: #55B7B4;
}

.transfer-detail-list-view {
  height: 100%;
  overflow: auto;
  padding: 10px;

  .panel-title {
    border-bottom: 1px solid rgb(242, 248, 247);
    color: rgb(132, 138, 147);

    font-size: 16px;
    font-weight: normal;
    line-height: 60px;

    display: flex;
    justify-content: space-between;

    padding: 0 25px;

    .iconfont:hover {
      cursor: pointer;
    }

  }
}

.transfer-detail-list-content {
  padding-top: 10px;

  .table-footer {
    background: #fff;
    border-radius: 0 0 3px 3px;

    display: flex;
    justify-content: space-between;

    padding: 10px ;

    .list-info {
      color: #767e89;

      font-size: 13px;
      line-height: 32px;

      margin: 0;

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

.transfer-detail-selected-count{
  cursor: pointer;
  color: $color-primary;

  font-size: 13px;

  padding: 0 3px;
  width: 15px;

  text-align: center;
}

.transfer-detail-list-content{
  .el-dialog__header{
    padding: 10px 20px;
  }
  .el-dialog__body{
    padding: 0px 20px;
    .el-form-item{
      margin-bottom: 15px;
    }
  }
  .el-dialog__footer{
    padding: 0px 20px 10px;
  }
}
</style>