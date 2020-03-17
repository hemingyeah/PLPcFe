<template>
  <div class="approve-list-view" v-loading.fullscreen.lock="ui.loadingListData">
    <!-- 搜索 view -->
    <div class="approve-search-view">
      <!-- 基础搜索 -->
      <form class="base-search" @submit.prevent="btnSearchHandler()">
        <div class="search-group">
          <el-input v-model="paramsBackup.keyword" placeholder="请输入编号、发起人等信息搜索">
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
          </el-input>
          <base-button type="primary" native-type="submit">
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

        <el-form class="advanced-search-form" novalidate @submit.native.prevent="btnSearchHandler()">
          <div class="form-item-container" :class="{'two-columns': columnNum === 2, }">
            <!-- 发起人 -->
            <el-form-item label-width="100px" label="发起人">
              <base-select v-model="paramsForSelector.proposer" :remote-method="inputSearchInitiator" placeholder="请选择" clearable>
                <template slot="option" slot-scope="{option}">
                  <div class="initiator-option-row">
                    <img :src="getInitiatorAvatar(option.head)" class="initiator-avatar"/><span class="initiator-display-name">{{option.label}}</span>
                  </div>
                </template>
              </base-select>
            </el-form-item>
            <!-- 发起时间 -->
            <el-form-item label-width="100px" label="发起时间">
              <el-date-picker
                v-model="params.createTime"
                type="daterange"
                align="right"
                unlink-panels
                range-separator="-"
                start-placeholder="请输入开始时间"
                end-placeholder="请输入结束时间"
                :picker-options="approveTimePickerOptions"
              ></el-date-picker>
            </el-form-item>
            <!-- 审批时间 -->
            <el-form-item label-width="100px" label="审批时间">
              <el-date-picker
                v-model="params.completeTime"
                type="daterange"
                align="right"
                unlink-panels
                range-separator="-"
                start-placeholder="请输入开始时间"
                end-placeholder="请输入结束时间"
                :picker-options="approveTimePickerOptions"
              ></el-date-picker>
            </el-form-item>
            <!-- 来源 -->
            <el-form-item label-width="100px" label="来源">
              <el-select v-model="params.source" clearable placeholder="请选择" @input="sourceChangeHandler">
                <el-option :value="item.value" :label="item.name" v-for="(item, idx) in sources" :key="idx"></el-option>
              </el-select>
            </el-form-item>
            <!-- 来源为事件Event时 -->
            <template v-if="params.source === 'event'">
              <!-- 类型 for Event-->
              <el-form-item label-width="100px" label="事件类型">
                <base-select v-model="paramsForSelector.eventType" :remote-method="searchEventType" clearable></base-select>
              </el-form-item>
              <!-- 流程节点 for Event -->
              <el-form-item label-width="100px" label="流程节点">
                <el-select v-model="params.action" clearable placeholder="请选择">
                  <el-option :value="item.value" :label="item.name" v-for="(item, idx) in processNodeForEvent" :key="idx"></el-option>
                </el-select>
              </el-form-item>
            </template>
            <!-- 来源为工单时 -->
            <template v-if="params.source === 'task'">
              <!-- 类型 for Task -->
              <el-form-item label-width="100px" label="工单类型">
                <base-select v-model="paramsForSelector.taskType" :remote-method="searchTaskType" clearable></base-select>
              </el-form-item>
              <!-- 流程节点 for Task -->
              <el-form-item label-width="100px" label="流程节点">
                <el-select v-model="params.action" clearable placeholder="请选择">
                  <el-option :value="item.value" :label="item.name" v-for="(item, idx) in processNodeForOrder" :key="idx"></el-option>
                </el-select>
              </el-form-item>
            </template>
            <!-- 审批人 -->
            <el-form-item label-width="100px" label="审批人">
              <base-select v-model="paramsForSelector.approvers" :remote-method="inputSearchInitiator" placeholder="请选择" clearable>
                <template slot="option" slot-scope="{option}">
                  <div class="initiator-option-row">
                    <img :src="getInitiatorAvatar(option.head)" class="initiator-avatar"/><span class="initiator-display-name">{{option.label}}</span>
                  </div>
                </template>
              </base-select>
            </el-form-item>

          </div>
          <div class="advanced-search-btn-group">
            <base-button type="ghost" @event="resetParams">重置</base-button>
            <base-button type="primary" native-type="submit">搜索</base-button>
          </div>
        </el-form>
      </base-panel>
    </div>

    <!-- 列表 view -->
    <div class="list-group-view">
      <el-form class="operation-bar-container">
        <div class="left-btn-group">

          <el-form-item label="按状态" class="state-btn-group">
            <el-radio-group :value="paramsForSelector.state" @input="stateChangeHandler" size="medium">
              <el-radio-button label="待审批"></el-radio-button>
              <el-radio-button label="已通过"></el-radio-button>
              <el-radio-button label="已拒绝"></el-radio-button>
              <el-radio-button label="已撤回"></el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-form-item label-width="100px" label="按角色">
            <el-select @change="roleChangeHandler" v-model="params.mySearch" placeholder="请选择">
              <el-option :value="item.value" :label="item.name" v-for="(item, idx) in role" :key="idx"></el-option>
            </el-select>
          </el-form-item>
        </div>

        <div class="right-btn-group">
          <el-dropdown v-if="exportPermission" trigger="click">
            <!-- <el-dropdown trigger="click"> -->
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
            <template v-if="column.field === 'objNo'">
              <a href="" class="view-detail-btn" @click.stop.prevent="showTaskOrEventDetail(scope.row, scope.row.source)">{{ scope.row[column.field] }}</a>
            </template>
            <template v-else-if="column.field === 'source'">
              {{ scope.row[column.field] | getEventName }}
            </template>
            <template v-else-if="column.field === 'proposerName'">
              <a :href="`/security/user/view/${scope.row.proposer}`" class="view-detail-btn">{{ scope.row[column.field] }}</a>
              <!-- <a href="" class="view-detail-btn" @click.stop.prevent="showProposerDetail(scope.row)">{{ scope.row[column.field] }}</a> -->
            </template>
            <template v-else-if="column.field === 'createTime'">
              {{ scope.row[column.field] | getFormatDate }}
            </template>
            <template v-else-if="column.field === 'completeTime'">
              {{ scope.row[column.field] | getFormatDate }}
            </template>
            <template v-else-if="column.field === 'approverName'">
              {{ getApproversNameList(scope.row.approvers) }}
            </template>
            <template v-else-if="column.field === 'approvalTime'">
              {{ scope.row[column.field] | getFormatApproveTime }}
            </template>
            <template v-else>
              {{ scope.row[column.field] }}
            </template>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120px" min-width="120px" v-if="params.state === 'unapproved'">
          <template slot-scope="scope" v-if="canApproveThis(scope.row)">
            <base-button type="primary" @event="approveHandler(scope.row)">审批</base-button>
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
    <approve-export
      ref="exportPanel"
      :columns="getExportColumns()"
      :build-params="buildExportParams"
      :validate="validateExport"
      method="post"
      action="/approve/export"
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
            </div>
            <div class="approve-selected-row" v-for="c in multipleSelection" :key="c.id">
              <span class="approve-selected-sn">{{c.objNo}}</span>
              <button type="button" class="approve-selected-delete" @click="cancelSelectApprove(c)">
                <i class="iconfont icon-fe-close"></i>
              </button>
            </div>
          </div>
        </template>
      </div>
    </base-panel>

  </div>
</template>

<script>

import _ from 'lodash';
import {formatDate} from '../../../util/lang';

import * as ApproveApi from '@src/api/ApproveApi';

import DEFAULT_INITIATOR_AVATAR from '../../../assets/img/avatar.png';
import ApproveExport from '../components/approveExport'
import platform from '../../../platform';


const KEY_MAP = {
  APPROVE_LIST_ADVANCE_SEARCH_COLUMN_NUMBER: 'approve_list_advance_search_column_number',
  APPROVE_LIST_VIEW: 'approve_list_view', // 本页vue中逻辑使用
  APPROVE_LIST_DATA: 'approve_list_data', // 兼容jsp中逻辑(用于点击审批按钮后跳转)
}


export default {
  name: 'approve-list-view',
  data () {
    return {
      approveDataList: [],
      columns: [],
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
        // approveConfirmPanelShow: false, // 审批弹框
        loadingApproveDetail: false, // 点击列表条目审批按钮时 获取详情
      },
      params: {
        keyword: '',
        proposerId: '', // 发起人Id
        createTime: '', 
        completeTime: '',
        source: '',
        state: 'unapproved',
        mySearch: 'approve',
        // mySearch: '', // 联调时数据
        typeId: '',
        action: '',
        pageNum: 1,
        pageSize: '',
        approversId: '',
      },
      paramsBackup: {
        keyword: '',
      },
      paramsForSelector: {
        proposer: [],
        eventType: [],
        taskType: [],
        state: '待审批',
        approvers: [],
      },
      proposer: [],
      sources: [
        { name: '全部', value: '' },
        { name: '事件', value: 'event' },
        { name: '工单', value: 'task' },
        { name: '绩效报告', value: '绩效报告' },
        { name: '知识库', value: 'wiki' },
      ],
      role: [
        { name: '由我审批', value: 'approve' },
        { name: '由我发起', value: 'propose' },
        // { name: '全部审批', value: 'all' }
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
      columnNum: 1,
      userId: '',
      approveTimePickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - (3600 * 1000 * 24 * 7));
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - (3600 * 1000 * 24 * 30));
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - (3600 * 1000 * 24 * 90));
            picker.$emit('pick', [start, end]);
          }
        }]
      },
      multipleSelection: [],
      auth: {},
      selectedLimit: 200,
    }
  },
  methods: {
    getDefaultParams () {
      return {
        keyword: '',
        proposerId: '',
        createTime: '',
        completeTime: '',
        source: '', // 来源搜索
        state: 'unapproved', // 审批状态搜索
        mySearch: 'approve', // 没有审批数据时可以传空字符串调试
        eventType: '',
        action: '',
        pageNum: 1,
        approversId: '',
      }
    },
    buildParams () {
      // 两个时间拆开
      if (this.params.createTime && this.params.createTime.length) {
        this.params.createTimeStart = formatDate(this.params.createTime[0])
        this.params.createTimeEnd = `${formatDate(this.params.createTime[1]).replace('00:00:00', '23:59:59')}`;
      } else {
        delete this.params.createTimeStart;
        delete this.params.createTimeEnd;
      }

      if (this.params.completeTime && this.params.completeTime.length) {
        this.params.completeTimeStart = formatDate(this.params.completeTime[0]);
        this.params.completeTimeEnd = `${formatDate(this.params.completeTime[1]).replace('00:00:00', '23:59:59')}`;
      } else {
        delete this.params.completeTimeStart;
        delete this.params.completeTimeEnd;
      }

      this.params.keyword = this.paramsBackup.keyword || '';
      this.params.pageNum = this.pageInfo.pageNum || 1;
      this.params.pageSize = this.pageInfo.pageSize || 10;
      
      // 获取发起人参数Id
      let proposers = this.paramsForSelector.proposer;
      this.params.proposerId = (proposers && proposers.length > 0) ? proposers[0].userId : '';

      // 获取事件类型参数id
      if (this.params.source === 'task') {
        let types = this.paramsForSelector.taskType;
        this.params.typeId = (types && types.length > 0) ? types[0].id : '';
      } else if (this.params.source === 'event') {
        let types = this.paramsForSelector.eventType;
        this.params.typeId = (types && types.length > 0) ? types[0].id : '';
      } else {
        this.params.typeId = '';
      }

      // 审批人
      let approvers = this.paramsForSelector.approvers;
      this.params.approversId = (approvers && approvers.length) ? approvers[0].userId : '';

    },
    btnSearchHandler () {
      this.pageInfo.pageNum = 1;
      // 
      this.buildParams();
      this.doSearch();
    },
    doSearch (params = this.params) {
      this.ui.loadingListData = true;
      // 字段转换 // todo 抽出方法
      params.page = params.pageNum;
      params.myId = this.userId;

      // 返回Promise供 '其他' 调用暴露方法时使用
      return ApproveApi.getApproveList(params).then((res) => {
        this.ui.loadingListData = false;
        if (!res || !res.data || !res.data.list) {
          this.approveDataList = [];
          this.pageInfo.totalItems = 0;
          this.pageInfo.totalPages = 0;
          this.pageInfo.pageNum = 1;

          return res && res.message && platform.alert(res.message);
        }
        const {data: {pages, total, pageNum}} = res;

        this.approveDataList = res.data.list;
        this.pageInfo.totalItems = total;
        this.pageInfo.totalPages = pages;
        this.pageInfo.pageNum = Number(pageNum);

        this.matchSelected();
      }).catch((e) => {
        this.ui.loadingListData = false;
        console.info('get approve list error', e);
      })
    },
    resetParams () {
      this.params = Object.assign({pageSize: this.pageInfo.pageSize}, this.getDefaultParams())
      // 重置带有缓存字段
      this.paramsForSelector = {
        initiator: [],
        eventType: [],
        taskType: [],
        state: '待审批'
      }
      this.pageInfo.pageNum = 1;
      this.paramsBackup.keyword = '';
      this.doSearch();
    },
    switchAdvanceSearch () {
      this.ui.advanceSearchPanel = !this.ui.advanceSearchPanel;
    },
    setAdvanceSearchColumn (command) {
      this.columnNum = Number(command);
      localStorage.setItem(KEY_MAP.APPROVE_LIST_ADVANCE_SEARCH_COLUMN_NUMBER, command);
    },
    exportApprove (exportAll) {
      let ids = [];
      let fileName = `${formatDate(new Date(), 'YYYY-MM-DD')}审批中心数据.xlsx`;
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
      // let columnIsShow = this.columns.filter(c => c.show);
      // let columnIsShowIds = columnIsShow.map(field => field.field)
      this.saveDataToStorage('columnStatus', this.columns);
      // this.saveDataToStorage('columnStatusIds', columnIsShowIds);
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
    /**
     * 存数据到当页储存中
     */
    saveDataToStorage (key, value) {
      const configDataStr = localStorage.getItem(KEY_MAP.APPROVE_LIST_VIEW) || '{}';
      const configData = JSON.parse(configDataStr);

      configData[key] = value;
      localStorage.setItem(KEY_MAP.APPROVE_LIST_VIEW, JSON.stringify(configData));
    },
    handleSelection (selection) {
      let tv = this.getComputeSelection(selection);
      let original = this.multipleSelection
        .filter(ms => this.approveDataList.some(cs => cs.objId === ms.objId));
      let unSelected = this.approveDataList
        .filter(c => original.every(oc => oc.objId !== c.objId));
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
        .filter(ms => this.approveDataList.every(c => c.objId !== ms.objId));
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
      if (!approve || !approve.objId) return;
      this.multipleSelection = this.multipleSelection.filter(ms => ms.objId !== approve.objId);
      this.toggleSelection([approve]);
    },
    matchSelected() {
      if (!this.multipleSelection.length) return;
      // 如果后台没返回id 会出异常
      const selected = this.approveDataList
        .filter(c => {
          if (this.multipleSelection.some(sc => sc.objId === c.objId)) {
            this.multipleSelection = this.multipleSelection.filter(sc => sc.objId !== c.objId);
            this.multipleSelection.push(c);
            return c;
          }
        }) || [];
      this.$nextTick(() => {
        this.toggleSelection(selected);
      });
    },
    sortChange (option) {
      const {prop, order} = option;
      if (order) {
        this.params.sorts = [{ property: prop, direction: order === 'ascending' ? 'ASC' : 'DESC' }]
        this.doSearch();
      }
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
      this.pageInfo.pageSize = pageSize;
      this.doSearch();
    },
    sourceChangeHandler (source) {
      // 流程节点重置
      this.params.action = '';
      // 事件类型重置
      this.paramsForSelector.taskType = [];
      this.paramsForSelector.eventType = [];
    },
    stateChangeHandler (state) {
      this.paramsForSelector.state = state;
      switch (state) {
      case '待审批':
        this.params.state = 'unapproved';
        break;
      case '已通过':
        this.params.state = 'success';
        break;
      case '已拒绝':
        this.params.state = 'fail';
        break;
      case '已撤回':
        this.params.state = 'offed';
        break;
      default:
        break;
      }

      this.pageInfo.pageNum = 1;
      this.params.pageNum = 1;
      this.doSearch();
    },
    inputSearchInitiator (e) {
      return ApproveApi.getInitiatorList({keyword: e.keyword, pageNum: e.pageNum, pageSize: e.pageSize})
        .then(res => {
          if (!res || !res.list) return;
          res.list = res.list.map(item => Object.freeze({
            label: item.displayName,
            value: item.userId,
            ...item
          }))
          return res;
        })
        .catch(err => console.info('searchInitiator function catch err', err))
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
        .catch(err => console.info('searchEventType function catch err', err))
    },
    searchTaskType (e = {}) {
      return ApproveApi.getTaskTypeList({keyword: e.keyword, pageNum: e.pageNum, pageSize: e.pageSize})
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
        .catch(err => console.info('searchEventType function catch err', err))
    },
    /**
     * 角色变更时处理方法 
     */
    roleChangeHandler (event) {
      this.pageInfo.pageNum = 1;
      this.params.mySearch = event;
      // this.params.mySearch = ''; // todo  不要提交      
      this.doSearch();
    },
    /**
     * 导出validate
     */
    validateExport (ids, max) {
      let exportAll = !ids || ids.length === 0;
      return exportAll && this.pageInfo.totalItems > max ? '为了保障响应速度，暂不支持超过5000条以上的数据导出，请您分段导出。' : null;
    },

    getFixedColumns () {
      return [
        { label: '编号', field: 'objNo', show: true, fixed: true, export: true, sortable: 'custom' },
        { label: '来源', field: 'source', show: true, fixed: true, export: true, sortable: 'custom' },
        { label: '类型', field: 'typeName', show: true, fixed: true, export: true, sortable: 'custom' },
        { label: '流程节点', field: 'action', show: true, fixed: true, export: true, sortable: 'custom' },
        { label: '发起人', field: 'proposerName', show: true, fixed: true, export: true, sortable: 'custom' },
        { label: '发起时间', field: 'createTime', show: true, fixed: true, export: true, sortable: 'custom' },
        { label: '发起人备注', field: 'applyRemark', show: true, fixed: true, export: true },
        // 注意导出时使用的字段是 approveName, 显示的时候列表item显示approvers(Array)的名称集合
        { label: '审批人', field: 'approverName', show: true, fixed: true, export: true, sortable: 'custom' },
        { label: '审批时间', field: 'completeTime', show: true, fixed: true, export: true, sortable: 'custom' },
        { label: '审批备注', field: 'approveRemark', show: true, fixed: true, export: true },
        { label: '审批用时', field: 'approvalTime', show: true, fixed: true, export: true, sortable: 'custom' }
      ]
    },
    /**
     * 保存approve(item)Id，用户点击列表中审批跳转后续操作
     */
    saveApproveId (id) {
      let storageKey = KEY_MAP.APPROVE_LIST_DATA;
      try {
        let storageData = localStorage.getItem(storageKey);

        if (!storageData) {
          localStorage.setItem(storageKey, JSON.stringify({}));
          storageData = localStorage.getItem(storageKey) || '{}';
        }

        storageData = JSON.parse(storageData);
        storageData[id] = id;

        localStorage.setItem(storageKey, JSON.stringify(storageData));
      } catch (e) {
        console.error('saveApproveId error', e);
      }
    },
    addTabs (id, url) {
      if (!window.frameElement) return;

      let fromId = window.frameElement.getAttribute('id');
      platform.openTab({
        id,
        title: '正在加载',
        close: true,
        url,
        fromId
      });
    },
    // todo clear
    approveHandlerTest () {
      let row = {
        objId: '3681',
        source: '绩效报告'
      }
      this.approveHandler(row);
    },
    approveHandler (row) {
      let type = row.source;
      let id = row.objId;

      let taskId = '';
      let taskUrl = '';
      let eventId = '';
      let eventUrl = '';
      let performanceId = '';
      let performanceUrl = '';
      let performanceQueryStr = '';
      
      // 两个工单事件jsp页面
      switch (type) {
      case 'task': 
        taskId = `taskView_${id}`;
        taskUrl = `/task/view/${id}`;
        this.saveApproveId(id);
        this.addTabs(taskId, taskUrl);
        break;
      case 'event':
        eventId = `eventView_${id}`;
        eventUrl = `/event/view/${id}`;
        this.saveApproveId(id);
        this.addTabs(eventId, eventUrl);
        break;
      case '绩效报告':
        console.info('#绩效报告条目数据#', row); // todo clear
        performanceQueryStr = 'from=approveList&action=approve';
        performanceId = `frame_tab_performanceReport${id}`;
        performanceUrl = `/performance/v2/report/desc/${id}?${performanceQueryStr}`;
        this.addTabs(performanceId, performanceUrl);
        break;
      case 'wiki': 
        taskId = `document_detail_${id}`;
        taskUrl = `/wiki/detail/page?objId=${id}&action=approve`;
        this.saveApproveId(id);
        this.addTabs(taskId, taskUrl);
        break;
      default: 
        break;
      }
    },
    /**
     * 点击列表中的编号字段，判断进入任务还是事件详情页
     */
    showTaskOrEventDetail (row, source) {
      let tabOptions = {};
      let fromId = window.frameElement.getAttribute('id');
      let objId = row.objId
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
      } else if (source === '绩效报告') {
        tabOptions = {
          id: `performanceReport${objId}`,
          title: '正在加载',
          close: true,
          url: `/performance/v2/report/desc/${objId}`,
          fromId
        } 
      } else if (source == 'wiki') {
        tabOptions = {
          id: `document_detail_${objId}`,
          title: '正在加载',
          close: true,
          url: `/wiki/detail/page?objId=${objId}`,
          fromId
        }
      }

      // /performance/v2/report/desc/3679
      platform.openTab(tabOptions)
    },

    /** 
     * 构建导出参数 
     * @params {Array} checkedArr
     * @params ids itemList(table)
     * */
    buildExportParams (checkedArr, ids) {
      let exportAll = !ids || ids.length === 0;
      return {
        approveChecked: checkedArr,
        selectedIds: exportAll ? '' : ids.map((elm) => elm.uuId).join(','),
        exportSearchModel: exportAll ? this.getExportParams() : ''
      }
    },
    /**
     * 字段名不同于列表字段名，且某些字段转换特殊，独立出来 
     * For 导出全部使用
     */
    getExportParams () {
      let completeTimeStart = '';
      let completeTimeEnd = '';
      let createTimeStart = '';
      let createTimeEnd = '';
      let sortBy = {};

      let dynamicData = {};

      if (this.params.createTime && this.params.createTime.length) {
        createTimeStart = formatDate(this.params.createTime[0], 'YYYY/MM/DD  HH:mm:ss')
        createTimeEnd = `${formatDate(this.params.createTime[1]).replace('00:00:00', '23:59:59')}`;
      }
      if (this.params.completeTime && this.params.completeTime.length) {
        completeTimeStart = formatDate(this.params.completeTime[0], 'YYYY/MM/DD  HH:mm:ss');
        completeTimeEnd = `${formatDate(this.params.completeTime[1]).replace('00:00:00', '23:59:59')}`;
      }
      
      if (this.params.sorts && this.params.sorts.length) {
        sortBy[this.params.sorts[0].property] = this.params.sorts[0].direction === 'ASC' ? true : false;
      }
      // 动态字段设置
      if (this.params.source === 'task') {
        dynamicData.taskAction = this.params.action;
        dynamicData.taskTypeId = this.params.typeId;
        dynamicData.typeId = this.params.typeId;
      }
      if (this.params.source === 'event') {
        dynamicData.eventAction = this.params.action;
        dynamicData.eventTypeId = this.params.typeId;
        dynamicData.typeId = this.params.typeId;
      }

      // eventTypeId
      let fixedData = {
        completeTimeStart,
        completeTimeEnd,
        createTimeStart,
        createTimeEnd,
        sortBy,
        pageSize: this.params.pageSize,
        pageNum: this.params.pageNum,
        keyword: this.params.keyword,
        proposerId: this.params.proposerId,
        source: this.params.source,
        myId: this.userId,
        state: this.params.state,
        mySearch: this.params.mySearch,
        action: this.params.action,
        // 下面三个字段目前不需要了
        isAdvanced: 0,
        ids: [],
        orderDetail: {}
      }

      return Object.assign(fixedData, dynamicData);
    },
    /**
     * 获取导出列数据
     */
    getExportColumns () {
      return this.getFixedColumns();
    },

    /**
     * 尝试从本地存储中恢复数据
     * - 列表列显隐藏配置
     * - 分页大小
     */
    recoverConfigByStorage () {
      try {
        const columns = this.getLocalStorageData('columnStatus');
        const pageSize = this.getLocalStorageData('pageSize');
        const advanceColumnNum = localStorage.getItem(KEY_MAP.APPROVE_LIST_ADVANCE_SEARCH_COLUMN_NUMBER);

        this.columns = (columns && columns.length) ? columns : this.getFixedColumns();
        this.pageInfo.pageSize = pageSize || 10;
        this.params.pageSize = pageSize || 10;
        this.columnNum = Number(advanceColumnNum || 1);
      } catch (e) {
        console.error('approveListRecoverStorageConfig error', e);
        this.columns = this.getFixedColumns();
      }
    },
    /**
     * 获取发起人头像信息
     */
    getInitiatorAvatar (avatar) {
      return avatar || DEFAULT_INITIATOR_AVATAR;
    },
    /**
     * 获取审批人名字列表
     * 原字段为直接显示approveName，现在显示approvers中的displayName 集合
     * @param {Array} value - 审批人列表集合 approveList.item.approvers
     * @return {String} - '张三,李四'
     */
    getApproversNameList (value) {
      if (!value || !value.length) return '';

      let arr = [];
      try {
        value.forEach(item => {
          let displayName = item.displayName;
          displayName && arr.push(displayName)
        })
      } catch (e) {
        return '';
      }

      return arr.join(',');
    },
    exportsRefreshUI (loading) {
      let title = loading ? ' 正在加载' : '审批中心'; 
      platform.setTabLoadingStatus({
        id: 'M_APPROVE_LIST',
        title,
        loading
      });
      // alert(`handleExport${loading}`)
    },
    
    /**
     * 设置权限
     */
    setPermission () {
      if (this.hasVIPApprovePermission) {
        this.role.push({ name: '全部审批', value: 'all' });
      }
    },

    /**
     * 是否可以审批此数据
     * - 控制审批按钮的显示隐藏
     * 必须是审批人才可以审批
     */
    canApproveThis (data) {
      if (!data) return false;
      if (data.state !== 'unapproved') return false;

      let approvers = data.approvers || [];
      let isApprover = approvers.some(approve => approve.userId === this.userId);

      return isApprover;
    }
  },
  computed: {
    panelWidth () {
      return `${420 * this.columnNum}px`;
    },
    exportPermission () {
      return this.auth.EXPORT_IN;
    },
    hasVIPApprovePermission () {
      return this.auth.VIP_APPROVE === 3;
    }
  },
  mounted () {
    this.recoverConfigByStorage();

    try { // 联调时 _init字段被声明
      let initData = JSON.parse(window._init || {});
      this.auth = initData.auth || {};
      this.userId = (initData.loginUser || {}).userId;
    } catch (e) {
      this.auth = {};
      this.userId = '';
    }

    // 根据auth设置不同权限
    this.setPermission();

    this.doSearch();
    // 注册暴露方法
    window.__exports__refresh = this.doSearch;
    window.__exports__refresh_ui = this.exportsRefreshUI;
  },
  filters: {
    getEventName (value) {
      if (!value) return '';
      return value === 'event' ? '事件' : value === 'task' ? '工单' : value === 'wiki' ? '知识库' : value;
    },
    getFormatDate (value) {
      if (!value) return '';
      try {
        // YYYY-MM-DD HH:mm:ss 这里方法的格式不同于普通格式化
        return formatDate(new Date(value), 'YYYY-MM-DD HH:mm'); // 这里的format fullYear是YYYY
      } catch (e) {
        return '';
      }
    },
    /**
     * 格式化的审批用时
     */
    getFormatApproveTime (value) {
      if (!value) return '';

      let day = Math.floor(value / (24 * 3600 * 1000));
  
      let l1 = value % (24 * 3600 * 1000);
      let hours = Math.floor(l1 / (3600 * 1000));
      
      let l2 = l1 % (3600 * 1000);
      let minute = Math.floor(l2 / (60 * 1000));
      
      let l3 = l2 % (60 * 1000);
      let second = Math.floor(l3 / 1000);
      
      
      day = day ? (`${day}天`) : '';
      hours = hours ? (`${hours}时`) : '';
      minute = minute ? (`${minute}分`) : '';
      second = second ? (`${second}秒`) : '';
      
      return day + hours + minute + second;
    }
  },
  components: {
    ApproveExport
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
        // padding: 10px 0 63px 0;
        padding: 10px 15px 63px;
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

        .el-form-item__label {
          text-align: left;
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
        align-items: center;
        padding: 10px;
        border-bottom: 1px solid #f2f2f2;

        .left-btn-group {
          display: flex;
          flex-wrap: nowrap;
          align-items: center;
          .el-form-item, .el-form-item--small, .el-form-item__label, .el-radio-button, .el-radio-button--medium {
            margin-bottom: 0;
          }
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
      .state-btn-group {
        display: flex;
        flex-wrap: nowrap;
        align-items: center;
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

  // 审批确认弹框
  .apply-approve-modal-content {
    padding: 27px 30px;
    .apply-modal-row {
      display: flex;
      flex-wrap: nowrap;
      .approve-modal-key {
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
  // 同page层级 结束
</style>
