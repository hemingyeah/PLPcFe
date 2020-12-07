<template>
  <div class="performance-list-container" v-loading.fullscreen="loading">
    <form class="base-search" onsubmit="return false;">
      <div class="search-group">
        <el-input v-model="params.keyword" placeholder="根据绩效名称搜索">
          <i slot="prefix" class="el-input__icon el-icon-search"></i>
        </el-input>
        <base-button type="primary" @event="search(true);trackEventHandler('search')" native-type="submit">搜索</base-button>
        <base-button type="ghost" @event="reSearch">重置</base-button>
      </div>
      <span class="advanced-search-visible-btn" @click="advancedSearchPanelShow = !advancedSearchPanelShow;trackEventHandler('advSearch')">
        <i class="iconfont icon-add"></i>
        高级搜索
      </span>
    </form>

    <!--高级搜索-->
    <base-panel :show.sync="advancedSearchPanelShow" width="420px">
      <h3 slot="title">
        <span>高级搜索</span>
      </h3>
      <el-form class="advanced-search-form" onsubmit="return false;">
        <el-form-item label-width="100px" label="绩效类型">
          <el-select v-model="secondaryParams.type" placeholder="请选择">
            <el-option
              v-for="item in rangeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label-width="100px" label="绩效状态">
          <el-select v-model="secondaryParams.status" placeholder="请选择">
            <el-option
              v-for="item in statusOptions"
              :key="item.label"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label-width="100px" label="规则名称">
          <el-select v-model="secondaryParams.ruleIds" placeholder="请选择">
            <el-option
              v-for="item in openRules"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label-width="100px" label="创建时间">
          <el-date-picker
            v-model="secondaryParams.time"
            type="daterange"
            align="right"
            unlink-panels
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="createTimePickerOptions">
          </el-date-picker>
        </el-form-item>
        <div class="advanced-search-btn-group">
          <base-button type="ghost" @event="reSearch">重置</base-button>
          <base-button type="primary" @event="search(true)" native-type="submit">搜索</base-button>
        </div>
      </el-form>
    </base-panel>

    <div class="performance-list">
      <div class="operation-bar-container">
        <div class="top-btn-group">
          <base-button type="primary" icon="icon-add" @event="openDialog">新建</base-button>
          <base-button type="ghost" icon="icon-qingkongshanchu" @event="deleteReport">删除</base-button>
          <a :href="performanceReportLink" target="_blank">如何通过绩效报告统计部门或个人数据？</a>
        </div>


        <div class="action-button-group">
          <el-dropdown trigger="click">
            <span class="el-dropdown-link el-dropdown-btn" @click="trackEventHandler('moreAction')">
              更多操作
              <i class="iconfont icon-nav-down"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>
                <div @click="exportReport(false)">导出</div>
              </el-dropdown-item>
              <el-dropdown-item>
                <div @click="exportReport(true)">导出全部</div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-dropdown :hide-on-click="false" :show-timeout="150" trigger="click">
            <span class="el-dropdown-link el-dropdown-btn" @click="trackEventHandler('selectColumn')">
              选择列
              <i class="iconfont icon-nav-down"></i>
            </span>
            <el-dropdown-menu slot="dropdown" class="customer-columns-dropdown-menu">
              <el-dropdown-item v-for="(item, index) in columns" :key="`${item.field}_${index}`">
                <el-checkbox :value="item.show" @input="modifyColumnStatus($event, item)" :label="item.label"/>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>


      </div>


      <el-table
        :data="reports"
        :row-key="getRowKey"
        stripe
        @select="handleSelection"
        @select-all="handleSelection"
        ref="multipleTable" class="report-table">

        <el-table-column type="selection" width="48" align="center"></el-table-column>
        <el-table-column
          v-for="(column, index) in columns"
          v-if="column.show"
          :key="`${column.field}_${index}`"
          :label="column.label"
          :prop="column.field"
          :width="column.width"
          show-overflow-tooltip
        >

          <template slot-scope="scope">
            <template v-if="column.field === 'cycle'">
              {{scope.row.startTime}} ~ {{scope.row.endTime}}
            </template>
            <template v-else-if="column.field === 'action'">
              <el-button plain @click="viewDetail(scope.row)" size="small">查看</el-button>
            </template>
            <template v-else-if="column.field === 'status'">
              <!--<el-button plain @click="viewDetail(scope.row)" size="small">查看</el-button>-->

              {{scope.row[column.field]}}
              <el-tag size="mini" v-if="scope.row.waitingForApprove">审批中</el-tag>
            </template>
            <template v-else>
              {{scope.row[column.field]}}
            </template>
          </template>
        </el-table-column>

      </el-table>
      
      <div class="performance-list-table-footer">
        <div class="list-info">
          共<span class="level-padding">{{ params.totalItems || 0 }}</span>记录，
          已选中<span class="performance-selected-count" @click="panelTheMultipleSelectionShow = true">{{ multipleSelection.length }}</span>条
          <span class="performance-selected-count" @click="selectionInit()">清空</span>
        </div>

        <el-pagination
          class="performance-report-table-pagination"
          background
          @current-change="jump"
          @size-change="handleSizeChange"
          :page-sizes="[10, 20, 50]"
          :page-size="params.pageSize"
          :current-page="params.pageNum"
          layout="sizes, prev, pager, next, jumper"
          :total="params.totalItems">
        </el-pagination>
      </div>

    </div>

    <!-- start 后台任务列表 -->
    <edit-performance-report-dialog 
      :init-data="initData" 
      @refresh-list="search" 
      ref="reportDialog" 
    />
    <!-- end 后台任务列表 -->

    <!-- start 已选择列表 -->
    <base-panel class="performance-panel" :show.sync="panelTheMultipleSelectionShow" width="420px">
      <h3 slot="title">
        <span>已选中绩效报告({{ multipleSelection.length }})</span>
        <i 
          v-if="multipleSelection.length > 0"
          class="iconfont icon-qingkongshanchu performance-panel-btn" 
          @click="selectionInit()" 
          title="清空已选中数据" data-placement="right" v-tooltip></i>
      </h3>

      <div class="performance-selected-panel">
        <div class="performance-selected-tip" v-if="multipleSelection.length <= 0">
          <img src="../../assets/img/no-data.png">
          <p>暂无选中的数据，请从列表中选择。</p>
        </div>
        <template v-else>
          <div class="performance-selected-list">
            <div class="performance-selected-row performance-selected-head">
              <span class="performance-selected-type">类型</span>
              <span class="performance-selected-name">名称</span>
            </div>
            <div class="performance-selected-row" v-for="item in multipleSelection" :key="item.id" >
              <span class="performance-selected-type">{{ item.type }}</span>
              <span class="performance-selected-name">{{ item.reportName }}</span>
              <button type="button" class="performance-selected-delete" @click="selectPerformanceCancel(item)">
                <i class="iconfont icon-fe-close"></i>
              </button>
            </div>
          </div>
        </template>
      </div>
    </base-panel>
    <!-- end 已选择列表 -->

    <base-export
      ref="exportPanel"
      :columns="columns"
      :build-params="buildExportParams"
      method="post"
      action="/performance/v2/export/report"/>
      <!--:validate="checkExportCount"-->

  </div>
</template>

<script>
import _ from 'lodash';
import { formatDate, } from '@src/util/lang';
import {getPerformanceReports, deletePerformanceReports, getApprovePersonList} from '@src/api/PerformanceApi';
import EditPerformanceReportDialog from './components/EditPerformanceReportDialog.vue';
import Platform from '@src/util/Platform'

export default {
  name: 'list-view',
  props: {
    initData: {
      type: Object,
      default: () => ({}),
    }
  },
  data() {
    return {
      advancedSearchPanelShow: false,
      createTimePickerOptions: {
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
      loading: false,
      columns: this.buildColumns(),
      multipleSelection: [],
      reports: [],
      rangeOptions: [
        {
          label: '全部',
          value: 995,
        },
        {
          label: '按人员',
          value: 0,
        },
        {
          label: '按部门',
          value: 1,
        },
      ],
      statusOptions: [
        {
          label: '全部',
          value: '',
        },
        {
          label: '已创建',
          value: [0],
        },
        {
          label: '已审批',
          value: [1, 3],
        },
        {
          label: '已发布',
          value: [4],
        },
      ],
      params: {
        keyword: '',
        time: '',
        type: 995,
        pageNum: 1,
        pageSize: 10,
        totalItems: 0,
        ruleIds: '',
      },
      secondaryParams: {
        time: '',
        type: 995,
        ruleIds: '',
      },
      selectedLimit: 200,
      userList: [],
      panelTheMultipleSelectionShow: false,
    }
  },
  computed: {
    openRules() {
      return (this.initData.AllOpenRules || [])
        .map(({id, ruleName, ruleDesc}) => ({
          label: ruleName,
          value: id,
          ruleDesc,
        }));
    },
    userId () {
      return this.initData.loginUserId;
    },
    // 是否在钉钉环境
    isDingTalk() {
      return Platform.isDingTalk()
    },
    // 绩效报告介绍链接
    performanceReportLink() {
      return this.isDingTalk ? 'https://www.yuque.com/shb/help/operating#IbBYe' : 'https://www.yuque.com/shb/help2/gbrdc7#IbBYe'
    }
  },
  mounted() {
    const localStorageData = this.getLocalStorageData();

    if (localStorageData.pageSize) {
      this.params.pageSize = Number(localStorageData.pageSize);
    }

    this.search();
  },
  methods: {
    exportReport(exportAll) {
      let ids = [];
      let fileName = `${formatDate(new Date(), 'YYYY-MM-DD')}结算数据.xlsx`;
      if (!exportAll) {
        if (!this.multipleSelection.length) return this.$platform.alert('请选择要导出的数据');
        ids = this.multipleSelection.map(({id}) => id);
      }

      let isExportDownloadNow = true;
      this.$refs.exportPanel.open(ids, fileName, isExportDownloadNow);
    },
    buildExportParams(checkedArr, ids) {
      let exportAll = !ids || !ids.length;

      if (exportAll) {
        return {
          checked: `${checkedArr.join(',') },`,
          // exportSearchModel: exportAll ? JSON.stringify(this.buildParams() || {}) : ''
        };
      }

      return {
        checked: `${checkedArr.join(',') },`,
        ids: `${ids.join(',') },`,
      };
    },

    search(fullSearch) {
      if (fullSearch) {
        this.params = {
          ...this.params,
          ...this.secondaryParams,
          pageNum: 1,
        }
      }

      let params = this.buildParams();
      this.loading = true;

      getPerformanceReports(params)
        .then(res => {
          this.loading = false;
          if (!res || res.status) {
            return this.$platform.notification({
              title: '失败',
              message: (h => (<div>{res.message || '获取绩效报告发生未知错误'}</div>))(this.$createElement),
              type: 'error',
            });
          }

          if (!res.data.reportList) {
            this.reports = [];
            this.params.totalItems = 0;
            return;
          }

          this.reports = res.data.reportList.list
            .map(({users, createUserName, createTime, startTime, endTime, type, reportName, ruleIds, id, carbonCopy, status, createUser}) => Object.freeze({
              reportName,
              ruleIds: ruleIds.replace(/\[|\]/g, ''),
              users: users.replace(/\[|\]/g, ''),
              createUser: createUserName,
              createUserId: createUser,
              createTime: formatDate(new Date(createTime), 'YYYY-MM-DD'),
              startTime: formatDate(new Date(startTime), 'YYYY-MM-DD'),
              endTime: formatDate(new Date(endTime), 'YYYY-MM-DD'),
              type: type ? '按部门' : '按个人',
              id,
              carbonCopy: carbonCopy ? carbonCopy.replace(/\[|\]|"/g, '') : '',
              waitingForApprove: status === 1,
              status: (() => {
                if (status === 0 || status === 1) {
                  return '已创建'
                }

                if (status === 3) {
                  return '已审批'
                }
                if (status === 4) {
                  return '已发布'
                }

              })()
            }));
          this.params.totalItems = res.data.reportList.total;
          // 把已选中的匹配出来
          this.matchSelected();
        })
        .catch(e => console.error('e', e));

    },
    buildParams() {
      const {keyword, pageNum, pageSize, time, type, ruleIds, status} = this.params;
      let params = {
        pageNum,
        pageSize,
      };

      if (ruleIds) {
        params.ruleIds = ruleIds;
      }

      if (keyword) {
        params.reportName = keyword;
      }

      if (time) {
        params.startTime = formatDate(new Date(time[0]), 'YYYY-MM-DD HH:mm:ss');
        params.endTime = `${formatDate(new Date(time[1]), 'YYYY-MM-DD') } 23:59:59`;
      }

      if (type !== 995) {
        params.type = type;
      }

      params.status = status ? status.join(',') : '';

      return params;
    },
    reSearch() {
      window.TDAPP.onEvent('pc：绩效报告-重置事件');
      this.resetParams();
      this.search();
    },
    viewDetail(row) {
      let fromId = window.frameElement.getAttribute('id');

      this.$platform.openTab({
        id: `performanceReport${row.id}`,
        title: '绩效报告详情',
        close: true,
        url: `/performance/v2/report/desc/${row.id}`,
        fromId
      })
    },
    openDialog() {
      window.TDAPP.onEvent('pc：绩效报告-新建事件');
      this.$refs.reportDialog.toggleDialog();
    },
    /**  
     * @description 操作选中
    */
    handleSelection(selection) {
      let selected = this.selectionComputed(selection);
      let currentPageSelected = this.multipleSelection.filter(ms => {
        return this.reports.some(report => report.id === ms.id)
      });
      let currentPageUnSelected = this.reports.filter(repost => {
        return currentPageSelected.every(currentPageItem => repost.id !== currentPageItem.id);
      })

      if (selected.length > this.selectedLimit) {
        this.$nextTick(() => {
          currentPageSelected.length > 0
          ? currentPageUnSelected.forEach(unSelected => {
              this.$refs.multipleTable.toggleRowSelection(unSelected, false);
            })
          : this.$refs.multipleTable.clearSelection();
        })

        return this.$platform.alert(`最多只能选择${this.selectedLimit}条数据`);
      }
      this.multipleSelection = selected;
    },
    /**  
     * @description 计算选中
    */
    selectionComputed(selection) {
      let preSelected = this.multipleSelection.filter(ms => {
        return this.reports.every(report => report.id !== ms.id);
      })

      preSelected = _.uniqWith([...preSelected, ...selection], _.isEqual);

      return preSelected;
    },
    jump(pageNum) {
      this.params.pageNum = pageNum;
      this.search();
    },
    handleSizeChange(pageSize) {
      this.saveDataToStorage('pageSize', pageSize);
      this.params.pageNum = 1;
      this.params.pageSize = pageSize;
      this.search();
    },
    async deleteReport() {
      window.TDAPP.onEvent('pc：绩效报告-删除事件');
      if (!this.multipleSelection.length) {
        return this.$platform.alert('请选择需要删除的绩效报告');
      }

      const pass = this.reports.filter(r => this.multipleSelection.some(item => item.id === r.id))
        .some(r => r.createUserId !== this.userId || r.waitingForApprove);

      if (pass) return this.$platform.alert('无法删除，请确认该绩效报告是由您创建且未在审批中');

      try {
        if (!await this.$platform.confirm('确定要删除选择的绩效报告？')) return;

        deletePerformanceReports({
          ids: `${this.multipleSelection.map(({id}) => id).join(',') },`,
        })
          .then(res => {
            if (res.status) {
              return this.$platform.notification({
                title: '失败',
                message: (h => (<div>{res.message || '发生未知错误'}</div>))(this.$createElement),
                type: 'error',
              });
            }

            this.multipleSelection = [];
            this.search();
          })
          .catch(err => console.error('deleteCustomer err', err));
      } catch (e) {
        console.error('catch error', e);
      }
    },
    resetParams() {
      this.params = {
        ...this.params,
        keyword: '',
        time: '',
        type: 995,
        pageNum: 1,
        totalItems: 0,
        ruleIds: '',
        status: '',
      }

      this.secondaryParams = {
        time: '',
        type: 995,
        ruleIds: '',
        status: '',
      }
    },
    modifyColumnStatus(val, column) {
      this.columns = this.columns
        .map(c => {
          if (c.field === column.field) {
            c.show = val;
          }
          return c;
        });
      let columnIsShow = this.columns.filter(c => c.show).map(c => c.field);
      this.saveDataToStorage('columnStatus', columnIsShow);
    },
    buildColumns() {
      let storage = this.getLocalStorageData();
      let columnIsShow = storage.columnStatus || [];

      return [
        {
          label: '类型',
          field: 'type',
          show: false,
          width: '70px',
          exportAlias: '',
          export: true
        },
        {
          label: '名称',
          field: 'reportName',
          show: true,
          width: '120px',
          export: true
        },
        {
          label: '创建时间',
          field: 'createTime',
          show: true,
          width: '100px',
          export: true
        },
        {
          label: '状态',
          field: 'status',
          show: true,
          width: '150px',
          export: true
        },
        {
          label: '对象',
          field: 'users',
          show: true,
          export: true
        },
        {
          label: '周期',
          field: 'cycle',
          show: true,
          export: true,
          width: '200px'
        },
        {
          label: '创建人',
          field: 'createUser',
          show: true,
          width: '100px',
          export: true
        },
        {
          label: '抄送人',
          field: 'carbonCopy',
          show: true,
          width: '100px',
          export: true
        },
        {
          label: '统计规则',
          field: 'ruleIds',
          show: true,
          exportAlias: 'ruleName',
          export: true
        },
        {
          label: '报告',
          field: 'action',
          show: true,
          width: '100px',
        }
      ].map(c => ({
        ...c,
        show: !columnIsShow.length || columnIsShow.some(key => key === c.field)
      }));
    },
    saveDataToStorage(key, value) {
      const data = this.getLocalStorageData();
      data[key] = value;
      localStorage.setItem('performance_storage_data_2019_02_28', JSON.stringify(data));
    },
    getLocalStorageData() {
      const dataStr = localStorage.getItem('performance_storage_data_2019_02_28') || '{}';
      return JSON.parse(dataStr);
    },
    // TalkingData事件埋点
    trackEventHandler(type) {
      if (type === 'search') {
        window.TDAPP.onEvent('pc：绩效报告-搜索事件');
        return;
      }
      if (type === 'advSearch') {
        window.TDAPP.onEvent('pc：绩效报告-高级搜索事件');
        return;
      }
      if (type === 'moreAction') {
        window.TDAPP.onEvent('pc：绩效报告-更多操作事件');
        return;
      }
      if (type === 'selectColumn') {
        window.TDAPP.onEvent('pc：绩效报告-选择列事件');
        return;
      }
    },
    performanceTeam() {
      let options = {
        isRepeatUser: true,
        isHideTeam: false,
        max: -1,
        selectType: '',
        selected: this.userList,
        showTeamCheckbox: true,
        // dataFunc(data) {
        //   let chosen = data.slice();
        //   let team = {};
        //   let group = [];

        //   chosen.forEach(c => {
        //     let tagId = c.tagId;

        //     if(!team.hasOwnProperty(tagId)) {
        //       team[tagId] = [];
        //     }
        //     team[tagId].push(c)
        //   });

        //   return team
        // }
      };

      this.$fast.contact.choose('team', options).then(res => {
        this.userList = res.data;
      })
        .catch(err => console.error(err))
    },
    selectionInit(rows) {
      let isNotOnCurrentPage = false;
      let report = undefined;
      let row = undefined;

      if (rows) {
        for(let i = 0; i < rows.length; i++) {
          row = rows[i];
          isNotOnCurrentPage = this.reports.every(report => {
            return report.id !== row.id;
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
    selectPerformanceCancel(item) {
      if (!item || !item.id) return;

      this.multipleSelection = this.multipleSelection.filter(ms => ms.id !== item.id);
      this.multipleSelection.length < 1 ? this.selectionInit() : this.selectionInit([item]);
    },
    // 批量匹配选中
    matchSelected() {
      if (!this.multipleSelection.length) return;

      const selected = this.reports
        .filter(c => {
          if (this.multipleSelection.some(sc => sc.id === c.id)) {

            this.multipleSelection = this.multipleSelection.filter(sc => sc.id !== c.id);
            this.multipleSelection.push(c);
            return c;
          }
        }) || [];

      this.$nextTick(() => {
        this.selectionInit(selected);
      });
    },
    getRowKey(row) {
      return row.id
    },
  },
  components: {
    [EditPerformanceReportDialog.name]: EditPerformanceReportDialog,
  }
}
</script>

<style lang="scss">
  $color-primary-light-9: mix(#fff, $color-primary, 90%) !default;

  html, body, .performance-list-container {
    height: 100%;
  }

  .performance-list-container {
    padding: 10px;

    .base-search {
      background: #fff;
      border-radius: 3px;
      padding: 12px 10px;
    }

    .base-search {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;

      .search-group {
        display: flex;
        justify-content: space-between;
        width: 440px;
        .el-input {
          width: 300px;
          input {
            height: 34px;
            line-height: 34px;
            width: 300px;
          }
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
      padding-top: 10px;

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


    .operation-bar-container {
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

    .report-table {
      padding: 10px;
      &::before {
        content: none;
      }
      th {
        background: #F5F5F5;
        color: $text-color-primary;
        font-weight: normal;
        font-size: 14px;
        line-height: 34px;
        color: #333;
      }
      td {
        font-size: 13px;
      }
    }

    .performance-list {
      background: #fff;
      .performance-report-table-pagination {
        text-align: right;
        padding: 10px;
      }
    }

    .customer-table-pagination {
      text-align: right;
      padding: 10px 5px;
    }
  }

  .performance-list-table-footer {
    background: #fff;
    border-radius: 0 0 3px 3px;

    display: flex;
    justify-content: space-between;

    padding: 0px 10px 10px 10px ;

    .list-info {
      color: #767e89;

      font-size: 13px;
      line-height: 48px;

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

  // performance selected panel
  .performance-selected-count{
    cursor: pointer;
    color: $color-primary;

    font-size: 13px;

    padding: 0 3px;
    width: 15px;

    text-align: center;
  }

  .performance-panel {
    .base-panel-title {
      h3 {
        display: flex;
        justify-content: space-between;
        i {
          cursor: pointer;
          display: inline-block;
          text-align: center;
          &:hover {
            color: $color-primary;
          }
        }
      }
    }
  }

  .performance-selected-panel{
    font-size: 14px;
    height: calc(100% - 51px);
  }

  .performance-selected-tip{
    padding-top: 80px;

    img{
      display: block;
      width: 240px;
      margin: 0 auto;
    }

    p{
      color: #9a9a9a;

      line-height: 20px;
      text-align: center;

      margin: 30px 0 0 0;
    }
  }

  .performance-selected-list{
    height: 100%;
    padding: 10px;
    overflow-y: auto;
  }

  .performance-selected-row{
    border-bottom: 1px solid #ebeef5;

    display: flex;
    flex-flow: row nowrap;

    font-size: 13px;
    line-height: 36px;


    &:hover{
      background-color: #f5f7fa;

      .performance-selected-delete{
        visibility: visible;
      }
    }
  }

  .performance-selected-head{
    background-color: #F0F5F5;
    color: #333;
    font-size: 14px;
  }

  .performance-selected-name{
    padding-left: 10px;
    flex: 1;
    @include text-ellipsis;
  }

  .performance-selected-type{
    padding-left: 10px;
    width: 150px;
    @include text-ellipsis;
  }

  .performance-selected-delete{
    width: 36px;
  }

  .performance-selected-row button.performance-selected-delete{
    background-color: transparent;
    color: #646B78;

    border: none;
    
    padding: 0;
    width: 36px;
    height: 36px;

    outline: none;
    visibility: hidden;

    i{
      font-size: 14px;
    }

    &:hover{
      color: #e84040;
    }
  }

</style>
