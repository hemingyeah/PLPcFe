<template>
  <div class="approve-list-view" v-loading.fullscreen.lock="ui.loadingListData">
    <!-- 搜索 view -->
    <div class="approve-search-view">
      <!-- 基础搜索 -->
      <form class="base-search" onsubmit="return false;">
        <div class="search-group">
          <el-input v-model="params.keyword" placeholder="根据客户信息搜索">
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
          </el-input>
          <base-button type="primary" @event="searchBtnHandler({ pageNum: 1, }, true)" native-type="submit">
            搜索
          </base-button>
          <base-button type="ghost" @event="resetParams">
            重置
          </base-button>
        </div>
        <span class="advanced-search-visible-btn" @click.self="switchAdvanceSearch">高级搜索</span>
      </form>
      <!--高级搜索-->
      <base-panel :show.sync="ui.advanceSearchPanel" :width="panelWidth">
        <h3 slot="title">
          <span>高级搜索</span>
          <el-dropdown class="pull-right" trigger="click" @command="setAdvanceSearchColumn">
            <i class="iconfont icon-xitongguanli approve-panel-btn" style="float: none;"></i>
            <el-dropdown-menu slot="dropdown" class="approve-advance-setting">
              <el-dropdown-item command="1">一栏</el-dropdown-item>
              <el-dropdown-item command="2">两栏</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </h3>

        <el-form class="advanced-search-form" onsubmit="return false;">
          <div class="form-item-container" :class="{'two-columns': columnNum === 2, }">
            <el-form-item label-width="100px" label="发起人">
              <base-select v-model="paramsForSelector.initiator" :remote-method="inputSearchInitiator">
                <template slot="option" slot-scope="{option}">
                  <div class="initiator-option-row">
                    <img :src="option.head || '/resource/images/account_userhead.png'" class="initiator-avatar"/><span class="initiator-display-name">{{option.label}}</span>
                  </div>
                </template>
              </base-select>
            </el-form-item>
            <el-form-item label-width="100px" label="发起时间">
              <el-date-picker
                v-model="params.createTime"
                type="daterange"
                align="right"
                unlink-panels
                range-separator="-"
                placeholder="请输入创建时间"
                :picker-options="approveTimePickerOptions"
              ></el-date-picker>
            </el-form-item>
            <el-form-item label-width="100px" label="审批时间">
              <el-date-picker
                v-model="params.approveTime"
                type="daterange"
                align="right"
                unlink-panels
                range-separator="-"
                placeholder="请输入审批时间"
                :picker-options="approveTimePickerOptions"
              ></el-date-picker>
            </el-form-item>
            <el-form-item label-width="100px" label="来源">
              <el-select v-model="params.source" clearable placeholder="请选择">
                <el-option :value="item.value" :label="item.name" v-for="(item, idx) in sources" :key="idx"></el-option>
              </el-select>
            </el-form-item>
            <!-- 事件类型 -->
            <el-form-item v-show="params.source !== ''" label-width="100px" label="事件类型">
              <base-select v-model="paramsForSelector.eventType" :remote-method="searchEventType"></base-select>
            </el-form-item>
            <!-- 流程节点 for Event -->
            <el-form-item v-show="params.source === 'event'" label-width="100px" label="流程节点">
              <el-select v-model="params.processNode" clearable placeholder="请选择">
                <el-option :value="item.value" :label="item.name" v-for="(item, idx) in processNodeForEvent" :key="idx"></el-option>
              </el-select>
            </el-form-item>
            <!-- 流程节点 for Task -->
            <el-form-item v-show="params.source === 'task'" label-width="100px" label="流程节点">
              <el-select v-model="params.processNode" clearable placeholder="请选择">
                <el-option :value="item.value" :label="item.name" v-for="(item, idx) in processNodeForOrder" :key="idx"></el-option>
              </el-select>
            </el-form-item>
          </div>
          <div class="advanced-search-btn-group">
            <base-button type="ghost" @event="resetParams">重置</base-button>
            <base-button type="primary" @event="searchBtnHandler({ pageNum: 1, }, true)" native-type="submit">搜索</base-button>
          </div>
        </el-form>
      </base-panel>
    </div>
    <!-- 列表 view -->
    <div class="list-group-view">
      <el-form class="operation-bar-container" onsubmit="return false;">
        <div class="left-btn-group">
          <el-form-item label="按状态" class="status-btn-group">
            <div class="status-btn-group">
              <base-button @event="changeStatus('unapproved')" class="status-btn" :class="params.status !== 'unapproved' &&'ghost-button'">待审批</base-button>
              <base-button @event="changeStatus('success')" class="status-btn" :class="params.status !== 'success' && 'ghost-button'">已审批</base-button>
              <base-button @event="changeStatus('fail')" class="status-btn" :class="params.status !== 'fail' && 'ghost-button'">已拒绝</base-button>
              <base-button @event="changeStatus('offed')" class="status-btn" :class="params.status !== 'offed' && 'ghost-button'">已撤回</base-button>
            </div>
          </el-form-item>
          <el-form-item label-width="100px" label="按角色">
            <el-select @change="roleChangeHandler" v-model="params.role" placeholder="请选择">
              <el-option :value="item.value" :label="item.name" v-for="(item, idx) in role" :key="idx"></el-option>
            </el-select>
          </el-form-item>
        </div>
        <div class="right-btn-group">
          <!-- <el-dropdown trigger="click" v-if="exportPermission"> -->
          <el-dropdown trigger="click">            
            <span class="el-dropdown-link el-dropdown-btn">
              更多操作
              <i class="iconfont icon-nav-down"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>
                <div @click="exportApprove(false)">导出</div>
              </el-dropdown-item>
              <el-dropdown-item>
                <div @click="exportApprove(true)">导出全部</div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-dropdown :hide-on-click="false" :show-timeout="150" trigger="click">
            <span class="el-dropdown-link el-dropdown-btn">
              选择列
              <i class="iconfont icon-nav-down"></i>
            </span>
            <el-dropdown-menu slot="dropdown" class="customer-columns-dropdown-menu">
              <el-dropdown-item v-for="item in columns" :key="item.field">
                <el-checkbox :value="item.show" @input="modifyColumnsShow($event, item)" :label="item.label"></el-checkbox>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <!-- <span class="el-dropdown-link el-dropdown-btn" @click="showColumnSetting">选择列<i class="iconfont icon-nav-down"></i></span> -->
        </div>
      </el-form>
      <el-table
        :data="approveDataList"
        stripe
        @select="handleSelection"
        @select-all="handleSelection"
        @sort-change="sortChange"
        :highlight-current-row="false"
        header-row-class-name="approve-table-header"
        ref="multipleTable" class="approve-table"
      >
        <el-table-column type="selection" align="center" class-name="select-column"></el-table-column>
        <el-table-column
          v-for="column in columns"
          v-if="column.show"
          :key="column.field"
          :label="column.label"
          :prop="column.field"
          :width="column.width"
          :min-width="column.minWidth || '120px'"
          :class-name="''"
          :sortable="column.sortable"
          :show-overflow-tooltip="column.field !== 'name'"
          :align="column.align"
        >
          <template slot-scope="scope">
            <template v-if="column.field === 'sn'">
              <a href="" class="view-detail-btn" @click.stop.prevent="showTaskOrEventDetail(scope.row, scope.row.source)">{{ scope.row[column.field] }}</a>
            </template>
            <template v-else-if="column.field === 'ini'">
              <a href="" class="view-detail-btn" @click.stop.prevent="showApproverDetail(scope.row)">{{ scope.row[column.field] }}</a>
            </template>
            <template v-else-if="column.field === 'operation'">
              <base-button type="primary" @event="approveHandler(scope.row)">审批</base-button>
            </template>
            <template v-else>
              {{ scope.row[column.field] }}
            </template>
          </template>
        </el-table-column>
      </el-table>
      <div class="table-footer">
        <div class="list-info">
          共<span class="level-padding">{{ pageInfo.totalItems }}</span>记录，
          已选中<span class="approve-selected-count" @click="ui.multipleSelectionPanelShow = true">{{ multipleSelection.length }}</span>条
          <span class="approve-selected-count" @click="clearSelection">清空</span>
        </div>
        <el-pagination
          class="approve-table-pagination"
          background
          @current-change="pageChangeHandler"
          @size-change="pageSizeChangeHandler"
          :page-sizes="[10, 20, 50]"
          :page-size="pageInfo.pageSize"
          :current-page="pageInfo.pageNum"
          layout="prev, pager, next, sizes, jumper"
          :total="pageInfo.totalItems"
        ></el-pagination>
      </div>
    </div>
    <!-- dialog views -->
    <!-- 列设置 -->
    <!-- <base-table-advanced-setting ref="columnSetting" @save="modifyColumnSetting" /> -->
    <!-- 导出数据 -->
    <base-export
      ref="exportPanel"
      :columns="getExportColumns()"
      :build-params="buildExportParams"
      :validate="validateExport"
      method="post"
      action="/todo/url"
    />
    <!-- 已选中数据面板 -->
    <base-panel :show.sync="ui.multipleSelectionPanelShow" width="420px" class="base-hah">
      <h3 slot="title">
        <span>已选中数据{{ multipleSelection.length }}</span>
        <i v-if="multipleSelection.length > 0"
          class="iconfont icon-qingkongshanchu approve-panel-btn"
          @click="toggleSelection()"
          title="清空已选中数据" data-placement="right" v-tooltip
        ></i>
      </h3>
      <div class="approve-selected-panel">
        <div v-if="multipleSelection.length <= 0" class="approve-selected-tip">
          <img src="../../../assets/img/no-data.png">
          <p>暂无选中的数据，请从列表中选择。</p>
        </div>
        <template v-else>
          <div class="approve-selected-list">
            <div class="approve-selected-row approve-selected-head">
              <span class="approve-selected-sn">编号</span>
              <span class="approve-selected-name">来源</span>
            </div>
            <!-- todo 字段更新 -->
            <div class="approve-selected-row" v-for="c in multipleSelection" :key="c.id">
              <span class="approve-selected-sn">{{c.sn}}</span>
              <span class="approve-selected-name">{{c.source}}</span>
              <button type="button" class="approve-selected-delete" @click="cancelSelectApprove(c)">
                <i class="iconfont icon-fe-close"></i>
              </button>
            </div>
          </div>
        </template>
      </div>
    </base-panel>
    <!-- 审批确认框 -->
    <base-modal 
      :show.sync="ui.approveConfirmPanelShow"
      title="审批"
      width="650px"
      @close="closeApproveModalHandler"
      @cancel="cancelApproveModalHandler"
    >
      <div class="apply-approve-modal-content">
        <div class="apply-modal-row">
          <span class="_key">来源：</span><span class="_value">{{ tempApprove.source }}</span>
        </div>
        <div class="apply-modal-row">
          <span class="_key">节点：</span><span class="_value">{{ tempApprove.processNode }}</span>
        </div>
        <div class="apply-modal-row">
          <span class="_key">内容：</span><span class="_value">{{ tempApprove.content }}</span>
        </div>
        <div class="apply-modal-row">
          <span class="_key">审批结果：</span><span class="_value">
            <el-radio-group v-model="tempApproveApply.result">
              <el-radio :label="'success'" style="width: 60px">同意</el-radio>
              <el-radio :label="'fail'" style="width: 60px">拒绝</el-radio>
            </el-radio-group>
          </span>
        </div>
        <div class="apply-modal-row">
          <span class="_key">审批备注：</span><span class="_textarea"><form-textarea v-model="tempApproveApply.remark"/></span>
        </div>
      </div>
      <div slot="footer" class="apply-modal-footer">
        <span class="apply-remark">备注：审批后不能修改审批结果</span>
        <button @click="closeApproveModalHandler()" class="btn btn-text">关闭</button>
        <button @click="applyApprove()" class="btn btn-primary">审批</button>
      </div>
    </base-modal>
  </div>
</template>

<script>

/**
 * TodoFinish
 * - window._init注入 ?
 * - 权限管理 是否随window._init返回
 * - 接口提供后字段确认，搜索相关功能更新
 * - 导出 +接口+导出字段(测试版本不能导出)
 * - 审批 +实际列表接口提供后 更新实际字段
 * - 跳转 +需要绑定实际字段
 */
import _ from 'lodash';

import * as ApproveApi from '@src/api/ApproveApi';


const KEY_MAP = {
  APPROVE_LIST_ADVANCE_SEARCH_COLUMN_NUMBER: 'approve_list_advance_search_column_number',
  APPROVE_LIST_VIEW: 'approve_list_view',
}


export default {
  name: 'approve-list-view',
  data () {
    return {
      approveDataList: [],
      columns: this.getFixedColumns(),
      pageInfo: {
        pageSize: 10,
        pageNum: 1,
        totalItems: 0,
        totalPages: 0
      },
      ui: {
        loadingListData: false,
        advanceSearchPanel: false,
        multipleSelectionPanelShow: false,
        approveConfirmPanelShow: false,
      },
      params: {
        keyword: '',
        faqiren: '', // 发起人
        initiaTime: '', // faqishijian
        appriveTime: '',
        source: '',
        proposerId: '',
        status: 'unapproved',
        role: 'approve',
      },
      paramsBackup: {
        keyword: '',
      },
      paramsForSelector: {
        initiator: [],
        eventType: []
      },
      proposer: [],
      sources: [
        { name: '全部', value: '' },
        { name: '事件', value: 'event' },
        { name: '工单', value: 'task' }
      ],
      role: [
        { name: '由我审批', value: 'approve' },
        { name: '由我发起', value: 'propose' }
      ],
      processNodeForEvent: [
        { value: '', name: '全部' },
        { value: '分配', name: '分配' },
        { value: '开始', name: '开始' },
        { value: '完成', name: '完成' },
        { value: '转为工单', name: '转为工单' }
      ],
      processNodeForOrder: [
        { value: '', name: '全部' },
        { value: '开始', name: '开始' },
        { value: '完成', name: '完成' }
      ],
      column: [
        { value: 'apprSource', name: '来源' },
        { value: 'apprType', name: '类型' },
        { value: 'apprAction', name: '流程节点' },
        { value: 'apprProposer', name: '发起人' },
        { value: 'apprCreateTime', name: '发起时间' },
        { value: 'apprApplyRemark', name: '发起人备注' },
        { value: 'apprApprover', name: '审批人' },
        { value: 'apprCompleteTime', name: '审批时间' },
        { value: 'apprApproveRemark', name: '审批备注' },
      ],
      columnNum: 1,
      approveTimePickerOptions: {
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
      pageInfo: {},
      multipleSelection: [],
      auth: {},
      selectedLimit: 200,
      tempApprove: {}, // 当前执行操作的审批条目（如 点击审批时）
      tempApproveApply: { // 执行审批操作确认模态框 绑定字段
        result: 'success',
        remark: ''
      }
    }
  },
  methods: {
    getDefaultParams () {
      return {
        source: '',
        status: 'unapproved',
        role: 'approve'
      }
    },
    searchBtnHandler () {

    },
    doSearch (params = this.params) {
      this.ui.loadingListData = true;
      ApproveApi.getApproveList(params).then((res) => {
        this.ui.loadingListData = false;
        if (!res || !res.list) {
          this.approveDataList = [];
          this.pageInfo.totalItems = 0;
          this.pageInfo.totalPages = 0;
          this.pageInfo.pageNum = 1;
          return res
        }
        const {pages, total, pageNum, list} = res;

        this.approveDataList = res.list;
        this.pageInfo.totalItems = total;
        this.pageInfo.totalPages = pages;
        this.pageInfo.pageNum = Number(pageNum);
        // todo 筛选selected
        this.matchSelected();
      }).catch((e) => {
        this.ui.loadingListData = false;
        console.log('get approve list error', e);
      })
    },
    resetParams () {
      // 直接绑定字段重置
      let params = {
        keyword: '',
        faqiren: '',
        initiaTime: '',
        appriveTime: '',
        source: '',
        status: '',
        role: '',
        eventType: '',
        processNode: '',
      }
      this.params = Object.assign(params, this.getDefaultParams())
      // 重置带有缓存字段
      this.paramsForSelector = {
        initiator: [],
        eventType: []
      }
    },
    switchAdvanceSearch () {
      this.ui.advanceSearchPanel = !this.ui.advanceSearchPanel;
      this.$nextTick(() => {
        let forms = document.getElementsByClassName('advanced-search-form');
        for(let i = 0; i < forms.length; i++) {
          let form = forms[i];
          form.setAttribute('novalidate', true)
        }
      })
    },
    setAdvanceSearchColumn (command) {
      this.columnNum = Number(command);
      localStorage.setItem(KEY_MAP.APPROVE_LIST_ADVANCE_SEARCH_COLUMN_NUMBER, command);
    },
    exportApprove (exportAll) {
      let ids = [];
      let fileName = '测试导出.xlsx';
      if (!exportAll) {
        if (!this.multipleSelection.length) return this.$platform.alert('请选择要导出的数据');
        ids = this.multipleSelection;
      }

      let isExportDownloadNow = true;
      this.$refs.exportPanel.open(ids, fileName, isExportDownloadNow);
    },
    showColumnSetting () {
      this.$refs.columnSetting.open(this.columns);
    },

    modifyColumnsShow (value, column) {
      this.columns = this.columns
        .map(c => {
          if (c.field === column.field) {
            c.show = value;
          }
          return c;
        });
      let columnIsShow = this.columns.filter(c => c.show).map(c => c.field);
      this.saveDataToStorage('columnStatus', columnIsShow);
    },
    /**
     * 获取审批页缓存数据
     * @param {String} key - 全部数据.key (approve_list_view.key)
     * @return {Any} value
     */
    getLocalStorageData (key) {
      const approveDataStr = localStorage.getItem(KEY_MAP.APPROVE_LIST_VIEW) || '{}';
      const approveData = JSON.parse(approveDataStr);
      return approveData[key];
    },
    getLocalStorageConfig () {
      const data = localStorage.getItem(KEY_MAP.APPROVE_LIST_VIEW) || '{}';
      return JSON.parse(data)
    },
    saveDataToStorage (key, value) {
      const data = this.getLocalStorageData(key) || {};
      data[key] = value;
      localStorage.setItem(KEY_MAP.APPROVE_LIST_VIEW, JSON.stringify(data));
    },
    handleSelection (selection) {
      // this.multipleSelection = selection.map(({id}) => id)
      let tv = this.getComputeSelection(selection);
      let original = this.multipleSelection
        .filter(ms => this.approveDataList.some(cs => cs.id === ms.id));
      let unSelected = this.approveDataList
        .filter(c => original.every(oc => oc.id !== c.id));

      if (tv.length > this.selectedLimit) {
        unSelected.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row, false);
        });
        return this.$platform.alert(`最多只能选择${this.selectedLimit}条数据`);
      }
      this.multipleSelection = tv;
    },
    getComputeSelection(selection) {
      let tv = [];
      
      tv = this.multipleSelection
        .filter(ms => this.approveDataList.every(c => c.id !== ms.id));
      tv = _.uniqWith([...tv, ...selection], _.isEqual);

      return tv;
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
    /**
     * 已选中面板点击取消按钮 事件处理
     */
    cancelSelectApprove (approve) {
      if (!approve || !approve.id) return;
      this.multipleSelection = this.multipleSelection.filter(ms => ms.id !== approve.id);
      this.toggleSelection([approve]);
    },
    matchSelected() {
      if (!this.multipleSelection.length) return;
      // 如果后台没返回id 会出异常
      const selected = this.approveDataList
        .filter(c => {
          if (this.multipleSelection.some(sc => sc.id === c.id)) {
            this.multipleSelection = this.multipleSelection.filter(sc => sc.id !== c.id);
            this.multipleSelection.push(c);
            return c;
          }
        }) || [];
      this.$nextTick(() => {
        this.toggleSelection(selected);
      });
    },
    sortChange () {

    },
    clearSelection () {
      this.toggleSelection();
    },
    pageChangeHandler (page) {
      this.params.pageNum = page;
      this.doSearch();
    },
    pageSizeChangeHandler (pageSize) {
      this.saveDataToStorage('pageSize', pageSize);
      this.params.pageNum = 1;
      this.params.pageSize = pageSize;
      this.doSearch();
    },
    changeStatus (status) {
      this.params.status = status;
      console.log('status change', status)
    },
    inputSearchInitiator (e) {
      return ApproveApi.getInitiatorList({keyword: e.keyword, pageNum: e.pageNum, pageSize: e.pageSize})
          .then(res => {
            if (!res || !res.list) return;
            res.list = res.list.map(item => Object.freeze({
              label: item.displayName,
              value: item.userId, // todo 联调时一定要注意字段是否不同, 如下
              ...item
            }))
            return res;
          })
          .catch(err => console.log('searchInitiator function catch err', err))
    },
    searchEventType (e = {}) {
      return ApproveApi.getEventTypeList({keyword: e.keyword, pageNum: e.pageNum, pageSize: e.pageSize})
          .then(res => {
            if (!res || !res.list) return;
            if (res.list) {
              res.list = res.list.map(eventType => Object.freeze({
                label: eventType.name,
                value: eventType.id,
                ...eventType
              }))
            }
            return res;
          })
          .catch(err => console.log('searchEventType function catch err', err))
    },
    /**
     * 角色变更时处理方法 
     */
    roleChangeHandler (event) {
      console.log('changeRole', event);
    },
    /**
     * 导出validate
     */
    validateExport (ids, max) {
      let exportAll = !ids || ids.length === 0;
      return exportAll && this.pageInfo.totalItems > max ? '为了保障响应速度，暂不支持超过5000条以上的数据导出，请您分段导出。' : null;
    },
    buildConfig () {
      const storageData = storage || {};
      
    },
    buildTableColumn () {
      const localStorageData = this.getLocalStorageData();
      let columnStatus = localStorageData.columnStatus || [];
      let localColumns = columnStatus
        .map(i => typeof i === 'string')
    },
    getFixedColumns () {
      return [
        { label: '编号', field: 'sn', show: true, fixed: true, export: true },
        { label: '来源', field: 'source', show: true, fixed: true, export: true },
        { label: '类型', field: 'type', show: true, fixed: true, export: true },
        { label: '流程节点', field: 'processNode', show: true, fixed: true, export: true },
        { label: '发起人', field: 'ini', show: true, fixed: true, export: true },
        { label: '发起时间', field: 'ini_time', show: true, fixed: true, export: true },
        { label: '发起人备注', field: 'ini_mark', show: true, fixed: true, export: true },
        { label: '审批人', field: 'approver', show: true, fixed: true, export: true },
        { label: '审批时间', field: 'approve_time', show: true, fixed: true, export: true },
        { label: '审批备注', field: 'approve_mark', show: true, fixed: true, export: true },
        { label: '操作', field: 'operation', show: true, fixed: true, export: true },
      ]
    },
    approveHandler (row) {
      this.tempApprove.source = row.source || '';
      this.tempApprove.processNode = row.source || '';
      this.tempApprove.content = row.content || '内容字段需要确认';

      this.tempApproveApply = {
        result: 'success',
        remark: '',
        id: row.id
      };

      this.ui.approveConfirmPanelShow = true;
    },
    /**
     * 点击列表中的编号子弹，判断进入任务还是事件详情页
     */
    showTaskOrEventDetail (row, source) {
      let tabOptions = {};
      let fromId = window.frameElement.getAttribute('id');
      let objId = 'appr.objId'
      if (source === 'event') {
        tabOptions = {
          id: `eventView_${objId}`,
          title: '正在加载',
          close: true,
          url: `/event/view/${objId}`,
          fromId
        }
      } else if (source === 'task') {
        tabOptions = {
          id: `taskView_${objId}`,
          title: '正在加载',
          close: true,
          url: `/task/view/${objId}`,
          fromId
        }
      }
      this.$platform.openTab(tabOptions)
    },
    showApproverDetail (row) {
      console.log('approver d', row)
      let fromId = window.frameElement.getAttribute('id');
      let testId = 'cf12d356-4130-11e7-a318-00163e304a25'
      this.$platform.openTab({
        id: `security_userView_${testId}`,
        close: false,
        title: '成员详情',
        url: `/security/user/view/${testId}`,
        fromId
      })
    },

    /** 构建导出参数 */
    buildExportParams(checkedArr, ids) {
      // let exportAll = !ids || ids.length == 0;
      return {};
    },
    /**
     * 获取导出列数据
     */
    getExportColumns() {
      return this.columns;
    },
    /**
     * 执行（确认）审批
     */
    applyApprove () {
      // ApproveApi.applyApprove()
    },
    closeApproveModalHandler () {
      this.cancelApproveModalHandler();
    },
    cancelApproveModalHandler () {
      if (this.ui.approveConfirmPanelShow) {
        this.ui.approveConfirmPanelShow = false;
      }
      this.tempApproveApply = {
        result: 'success',
        remark: '',
        id: row.id
      }
    }
  },
  computed: {
    panelWidth () {
      return `${420 * this.columnNum}px`;
    },
    exportPermission () {
      return this.auth.EXPORT_IN;
    }
  },
  mounted () {
    // let initData = JSON.parse(window._init || {});
    // this.auth = initData.auth || {};
    const localStorage = this.getLocalStorageConfig()
    console.log('localConfig', localStorage)

    console.log(window.frameElement)
    this.doSearch();
  }
}
</script>

<style lang="scss">

  $color-primary-light-9: mix(#fff, $color-primary, 90%) !default;

  html, body {
    height: 100%;
  }

  .level-padding {
    padding: 0 5px;
  }

  .approve-list-view {
    height: 100%;
    overflow: auto;
    padding: 10px;

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

    // search
    .approve-search-view {
      .advanced-search-function, .base-search {
        background: #fff;
        border-radius: 3px;
      }

      .base-search {
        font-size: 14px;
        display: flex;
        justify-content: space-between;
        padding: 12px 10px;
        .search-group {
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

      .advanced-search-form {
        overflow: auto;
        padding: 10px 0 63px 0;
        height: calc(100% - 51px);
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

      .initiator-option-row {
        display: flex;
        flex-wrap: nowrap;
        align-items: center;
        .initiator-avatar {
          width: 27px;
          height: 27px;
          margin-right: 10px;
        }
      }
    }
    // end of approve-search-view

    // list-group-view
    .list-group-view {
      padding-top: 10px;
      /*min-height: calc(100% - 100px);*/

      .operation-bar-container {
        background: #fff;
        border-radius: 3px 3px 0 0;
        display: flex;
        justify-content: space-between;
        padding: 10px;
        border-bottom: 1px solid #f2f2f2;

        .left-btn-group {
          display: flex;
          flex-wrap: nowrap;
          .status-btn {
          }
          .status-active {
          }
        }

        .right-btn-group {
        }

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
      .status-btn-group {
        display: flex;
        flex-wrap: nowrap;
      }

      .approve-table {
        padding: 10px;
        &:before {
          height: 0;
        }
        .approve-table-header th {
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
        .view-detail-btn {
          color: $color-primary;
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
          .approve-selected-count {
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

      // 审批确认弹框
      .apply-approve-modal-content {
        padding: 27px 30px;
        .apply-modal-row {
          display: flex;
          flex-wrap: nowrap;
          ._key {
            width: 80px;
            text-align: right;
            margin: 0 20px 16px 0;
          }
          ._textarea {
            flex: 1;
          }
        }
      }
      .apply-modal-footer {
        position: relative;
        display: flex;
        justify-content: flex-end;
        .apply-remark {
          position: absolute;
          left: 10px;
          top: 3px;
        }
      }
    }
    // end of list-gruop-view
  }
  // end of (page)approve-list-view

  // 同page层级 开始
  .approve-panel-btn {
    float: right;
    cursor: pointer;
    font-size: 14px;
    margin-right: 5px;
    &:hover {
      color: $color-primary;
    };
  }

  .approve-selected-panel {
    font-size: 14px;
    height: calc(100% - 51px);
    .approve-selected-tip {
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

    .approve-selected-list {
      height: 100%;
      padding: 10px;
      overflow-y: auto;

      .approve-selected-row {
        display: flex;
        flex-flow: row nowrap;
        line-height: 36px;
        border-bottom: 1px solid #ebeef5;
        font-size: 13px;

        &:hover {
          background-color: #f5f7fa;
          .approve-selected-delete {
            visibility: visible;
          }
        }
      }

      .approve-selected-head {
        background-color: #F0F5F5;
        color: #333;
        font-size: 14px;
      }

      .approve-selected-sn {
        padding-left: 10px;
        width: 150px;
        @include text-ellipsis;
      }

      .approve-selected-name {
        padding-left: 10px;
        flex: 1;
        @include text-ellipsis;
      }

      .approve-selected-delete {
        width: 36px;
      }

      .approve-selected-row button.approve-selected-delete {
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

  .approve-advance-setting .el-dropdown-menu__item {
    width: 80px;
    text-align: center;
  }

  .approve-panel-btn {
    float: right;
    cursor: pointer;
    font-size: 14px;
    margin-right: 5px;
    &:hover {
      color: $color-primary;
    }
  }
  // 同page层级 结束
</style>
