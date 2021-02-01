<template>
  <div class="page">
    <div class="base-search-group-container">
      <form class="base-search" onsubmit="return false;">
        <div class="customer-list-base-search-group">
          <el-input v-model="model.keyWord" placeholder="根据备件信息搜索" v-trim:blur>
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
          </el-input>
          <base-button type="primary" @event="model.pageNum=1;search();trackEventHandler('search')" native-type="submit">
            搜索
          </base-button>
          <base-button type="ghost" @event="reset();trackEventHandler('reset')">
            重置
          </base-button>
        </div>
        <span class="advanced-search-visible-btn" @click="isExpand = !isExpand;trackEventHandler('advSearch')" >
          <i :class="`iconfont ${isExpand ? 'el-icon-minus' : 'el-icon-plus'}`" ></i>
          高级搜索
        </span>
      </form>
    </div>

    <form @submit.prevent="search();trackEventHandler('search')">
      <!--<div class="page-panel">-->
      <!--<div class="page-panel-body search-form-nano">-->
      <!--<el-input v-model="model.keyWord" placeholder="根据备件信息搜索"></el-input>-->
      <!--<el-button-group>-->
      <!--<el-button type="primary" native-type="submit">搜索</el-button>-->
      <!--<el-button @click="reset();trackEventHandler('reset')">重置</el-button>-->
      <!--</el-button-group>-->
      <!--<el-button type="text" @click="isExpand = !isExpand;trackEventHandler('advSearch')" :icon="isExpand ? 'el-icon-minus' : 'el-icon-plus'">高级搜索</el-button>-->
      <!--</div>-->
      <!--</div>-->

      <base-collapse-panel :value="isExpand" class="page-panel">
        <div class="page-panel-head">
          <h5>高级搜索</h5>
        </div>
        <div class="page-panel-body">
          <div class="form-row">
            <div class="form-item">
              <label>备件类别</label>
              <div class="form-item-content">
                <el-select placeholder="请选择备件类别" v-model="model.type">
                  <el-option label="全部" value=""></el-option>
                  <el-option :label="item" :value="item" v-for="item in types" :key="item"></el-option>
                </el-select>
              </div>
            </div>
            <div class="form-item">
              <label>是否启用</label>
              <div class="form-item-content">
                <el-select placeholder="请选择备件类别" v-model="model.enable">
                  <el-option label="全部" value=""></el-option>
                  <el-option label="启用" value="1"></el-option>
                  <el-option label="禁用" value="0"></el-option>
                </el-select>
              </div>
            </div>
            
          </div>

          <div class="form-row">
            <div class="form-item">
              <label>创建时间</label>
              <div class="form-item-content">
                <el-date-picker style="width:100%;"
                                :value="dateRange"
                                @input="chooseDate"
                                type="daterange"
                                align="right"
                                unlink-panels
                                range-separator="-"
                                start-placeholder="开始日期"
                                end-placeholder="结束日期">
                </el-date-picker>
              </div>
            </div>
            
            <div class="form-item"></div>
          </div>

          <div class="form-row">
            <div class="text-right" style="width:100%;">

              <base-button type="ghost" @event="reset">重置</base-button>
              <base-button type="primary" native-type="submit">确定</base-button>

              <!--<el-button @click="reset">重置</el-button>-->
              <!--<el-button type="primary" native-type="submit">确定</el-button>-->
            </div>
          </div>
        </div>
      </base-collapse-panel>
    </form>



    <div class="base-operation-bar-container" style="border: none">
      <div class="top-btn-group">
        <base-button type="primary" icon="el-icon-plus" @event="create" v-if="allowCreate">新建</base-button>
        <base-button type="ghost" icon="el-icon-delete" v-if="allowEdit" @event="remove">删除</base-button>
      </div>
      <div class="action-button-group">

        <base-button type="plain" v-if="allowEdit" @event="openEditSparepartDialog">批量编辑</base-button>
        <el-dropdown :hide-on-click="false" trigger="click" :show-timeout="150">
          <span class="el-dropdown-link el-dropdown-btn" >选择列<i class="iconfont icon-nav-down"></i></span>

          <el-dropdown-menu slot="dropdown" class="dropdown-more">
            <el-dropdown-item v-for="column in columns" :key="column.field">
              <el-checkbox :value="column.show" @input="chooseColnum(column)" class="dropdown-item">{{column.label}}</el-checkbox>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>

        <el-dropdown trigger="click" :show-timeout="150" v-if="allowImportAndExport && allowEdit && allowInout" @command="trackEventHandler('moreAction')">
          <span class="el-dropdown-link el-dropdown-btn">
            更多操作<i class="iconfont icon-nav-down"></i>
          </span>

          <el-dropdown-menu slot="dropdown" class="dropdown-more">
            <el-dropdown-item v-if="!isExperienceEdition">
              <span class="dropdown-item" @click="importPart">导入</span>
            </el-dropdown-item>
            <el-dropdown-item>
              <span class="dropdown-item" @click="exportPart(false)">导出</span>
            </el-dropdown-item>
            <el-dropdown-item>
              <span class="dropdown-item" @click="exportPart(true)">导出全部</span>
            </el-dropdown-item>
            <el-dropdown-item v-if="!isExperienceEdition">
              <span class="dropdown-item" @click="importEditPart">批量更新</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>

      </div>
    </div>

    <div style="background: #fff;padding: 0 10px">
      <base-selection-bar ref="baseSelectionBar" v-model="selected" @toggle-selection="toggleSelection" @show-panel="() => multipleSelectionPanelShow = true" />
    </div>

    <div class="table-container">
      <el-table stripe ref="table"
                :data="page.list"
                @select="handleSelection"
                @select-all="handleSelection"
                header-row-class-name="base-table-header"
                @sort-change="sort">

        <el-table-column
          type="selection"
          width="44"
          fixed="left">
        </el-table-column>

        <el-table-column v-for="column in showColnums" :key="column.field"
                         :label="column.label"
                         :min-width="column.minWidth"
                         :width="column.width"
                         :prop="column.field"
                         :sortable="column.sortable"
                         :fixed="column.fixed"
                         :class-name="column.field == 'serialNumber' ? 'part-name-superscript-td' : ''"
                         :show-overflow-tooltip="column.showTip !== false && column.field !== 'serialNumber'">

          <template slot-scope="scope">

            <template v-if="column.field == 'serialNumber'">
              <sample-tooltip :row="scope.row">
                <template slot="content" slot-scope="{isContentTooltip}">
                  <el-tooltip :content="scope.row[column.field]" placement="top" :disabled="!isContentTooltip">
                    <a
                      class="no-padding el-button no-padding el-button--text"
                      :href="`/partV2/category/detail?id=${scope.row.id}`"
                      style="color: #55B7B4;text-decoration: none;"
                      @click.prevent="openDetail(scope.row)">
                      {{scope.row.serialNumber}}
                    </a>
                  </el-tooltip>
                </template>
              </sample-tooltip>
            </template>

            <template v-else-if="column.field == 'enable'">
              <el-switch
                v-if="allowEdit"
                v-model="scope.row.enable"
                :key="scope.row.id"
                :disabled="scope.row.disabled"
                :active-value="1" :inactive-value="0"
                @change="toggleEnable(scope.row)"></el-switch>
              <span> {{scope.row.enable == 1 ? '启用' : '禁用'}}</span>
            </template>

            <template v-else>
              {{scope.row[column.field]}}
            </template>
          </template>

        </el-table-column>
      </el-table>
    </div>


    <div class="table-footer">
      <div class="list-info">
        共<span class="level-padding">{{page.total}}</span>记录，
        已选中<span class="base-table-selected-count" @click="multipleSelectionPanelShow = true">{{selected.length}}</span>条
        <span class="base-table-selected-count" @click="toggleSelection()">清空</span>
      </div>
      <el-pagination
        class="customer-table-pagination"
        background
        @current-change="jump"
        @size-change="pageSizeChange"
        :page-sizes="[10, 20, 50]"
        :page-size="model.pageSize"
        :current-page="model.pageNum"
        layout="prev, pager, next, sizes, jumper"
        :total="page.total">
      </el-pagination>
    </div>


    <base-import ref="importPart"
                 v-if="allowImportAndExport"
                 template-url="/partV2/category/import/template" 
                 action="/partV2/category/import" @success="importSucc"></base-import>

    <base-export ref="exportPanel" 
                 v-if="allowImportAndExport"
                 :columns="exportColumns"
                 action="/partV2/category/export"
                 :method="'post'"></base-export>

    <part-import ref="importEditPart" 
                 v-if="allowEdit" title="备件" :selected="selected" :total="page.total"
                 :template-url="`/partV2/category/export/update/template`" 
                 :template-blank-url="'/partV2/category/export/exportBlankUpdateTemplate'"
                 :template-params="editPartPostParam"
                 action="/partV2/category/update/batch" @success="importSucc">
      <el-popover slot="explain" trigger="hover">
        <ul class="title-explain">
          <li>数据覆盖上传后无法恢复，请谨慎操作，保留好数据导出文件</li>
          <li>批量更新导出数据条数不限，导入最大支持1000条，如果导入数据超出1000条请分批次导入</li>
        </ul>
        <stats-popover-icon slot="reference"></stats-popover-icon>
      </el-popover>
    </part-import>

    <el-dialog title="批量编辑" :visible.sync="editBatchDialog" width="420px">
      <part-edit-batch-form :fields="fields" :types="types" :units="units" ref="editBatchForm" ></part-edit-batch-form>
      <div slot="footer" class="dialog-footer">
        <base-button type="ghost" @event="editBatchDialog = false" >取 消</base-button>
        <base-button type="primary" @event="editBatch" :disabled="pending">确 定</base-button>
        <!--<el-button @click="editBatchDialog = false">取 消</el-button>-->
        <!--<el-button type="primary" @click="editBatch" :disabled="pending">确 定</el-button>-->
      </div>
    </el-dialog>


    <base-panel :show.sync="multipleSelectionPanelShow" width="420px">
      <h3 slot="title" style="display: flex;justify-content: space-between;align-items: center">
        <span>已选中数据({{selected.length}})</span>
        <span v-if="selected.length" class="part-panel-btn" @click="toggleSelection()" title="清空已选中数据" data-placement="right" v-tooltip></span>
      </h3>

      <div class="part-selected-panel">
        <div class="part-selected-tip" v-if="!selected.length">
          <img src="../../../assets/img/no-data.png">
          <p>暂无选中的数据，请从列表中选择。</p>
        </div>
        <template v-else>
          <div class="part-selected-list">
            <div class="part-selected-row part-selected-head">
              <span class="part-selected-sn">编号</span>
              <span class="part-selected-name">备件</span>
            </div>
            <div class="part-selected-row" v-for="c in selected" :key="c.id">
              <span class="part-selected-sn">{{c.serialNumber}}</span>
              <span class="part-selected-name">{{c.name}}</span>
              <button type="button" class="part-selected-delete" @click="cancelSelectPart(c)">
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
import _ from "lodash";
import Page from "@src/model/Page";
import AuthUtil from "@src/util/auth";
import DateUtil from "@src/util/date";
import StorageUtil from "@src/util/storageUtil";
import PartEditBatchForm from "./form/PartEditBatchForm.vue";
import PartImport from "./components/PartImport.vue";

import SampleTooltip from 'packages/SampleTooltip/SampleTooltip'
import VersionMixin from '@src/mixins/versionMixin/index.ts'

const STORAGE_COLNUM_KEY = "category_list_column";
const STORAGE_PAGESIZE_KEY = "category_list_pagesize";

export default {
  name: 'part-list-view',
  inject: ['initData'],
  mixins: [VersionMixin],
  data(){
    let pageSize = StorageUtil.get(STORAGE_PAGESIZE_KEY) || 10;
    let originModel = {
      keyWord: "",
      type: "",
      enable: "",
      timeStart: "",
      timeEnd: "",
      pageNum: 1,
      pageSize,
      sortBy: {}
    };

    return {
      selectedLimit: 500,
      auths: {},
      columns: this.buildColumns(),
      exportColumns: this.buildExportColumns(),
      isExpand: false,
      pending: false,
      editBatchDialog: false,
      
      types: [],
      units: [],
      
      originModel,
      model: _.assign({}, originModel),

      page: new Page(),
      selected: [],
      dateRange: [],

      editPartParam:"",
      editPartPostParam: {},

      maxHeight: window.innerHeight - 180,
      multipleSelectionPanelShow: false,
      fields: [{
        name: "名称",
        field: "name"
      }, {
        name: "类别",
        field: "type"
      }, {
        name: "规格",
        field: "standard"
      }, {
        name: "单位",
        field: "unit"
      }, {
        name: "销售价",
        field: "salePrice"
      }, {
        name: "出库价",
        field: "costPrice"
      }]
    }
  },
  props: {
    initData: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    // 筛选可显示
    showColnums(){
      return this.columns.filter(item => item.show);
    },
    // 是否允许编辑、删除备件
    allowEdit(){
      return AuthUtil.hasAuth(this.auths, "VIP_SPAREPART_EDIT");
    },
    allowCreate() {
      return AuthUtil.hasAuth(this.auths, "VIP_SPAREPART_CREATE");
    },
    allowInout(){
      return AuthUtil.hasAuth(this.auths, "VIP_SPAREPART_INOUT");
    },
    // 是否允许导入导出
    allowImportAndExport(){
      return AuthUtil.hasAuth(this.auths, "EXPORT_IN")
    }
  },
  methods: {
    cancelSelectPart(part) {
      if (!part || !part.id) return;
      this.selected = this.selected.filter(ms => ms.id !== part.id);
      this.toggleSelection([part]);
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
          this.$refs.table.toggleRowSelection(row);
        });
      } else {
        this.$refs.table.clearSelection();
        this.selected = [];
      }
    },
    async editBatch() {
      let form = this.$refs.editBatchForm;
      // validate field
      let params = await form.pack();
      if (!params) return;
      params.ids = this.selected.map(part => part.id);
      this.pending = true;

      try {
        let result = await this.$http.post("/partV2/category/batchUpdateField", params);
        if(result.status == 0){
          this.$platform.toast("批量编辑成功");
          this.editBatchDialog = false;
          form.reset();
          // reload data
          this.loadData();
        }else{
          this.$platform.alert(result.message);
        }

      } catch (error) {
        console.log(error)
      }
      this.pending = false;
    },
    openEditSparepartDialog(value) {
      this.trackEventHandler("batchEdit");
      // 编辑的权限
      if (!this.selected.length) {
        return this.$platform.alert("请先勾选要编辑的备件");
      }
      this.editBatchDialog = true;
    },

    chooseColnum(column){
      this.trackEventHandler("selectColumn");

      column.show = !column.show;

      let data = {};
      this.columns.forEach(item => data[item.field] = item.show)
      StorageUtil.save(STORAGE_COLNUM_KEY, data);
    },
    chooseDate(range){
      this.dateRange = range;

      if(!range) {
        delete this.model.timeStart;
        delete this.model.timeEnd;
      } else {
        this.model.timeStart = DateUtil.format(range[0], "yyyy-MM-dd 00:00:00")
        this.model.timeEnd = DateUtil.format(range[1], "yyyy-MM-dd 23:59:59")
      }
    },
    exportPart(exportAll = false){
      if(!this.allowImportAndExport || !this.allowEdit || !this.allowInout) return;

      let ids = [];
      let fileName = `${DateUtil.format(new Date(), "yyyy-MM-dd")}备件数据.xlsx`;

      if(!exportAll){
        if(this.selected.length == 0) return this.$platform.alert("请选择要导出的数据");
        ids = this.selected.map(item => item.id);
      }

      this.$refs.exportPanel.open(ids, fileName);
    },
    importSucc(){
      this.loadData();
    },
    importPart(){ 
      if(!this.allowImportAndExport || !this.allowEdit || !this.allowInout) return;
      let instance = this.$refs.importPart;
      instance.open();
    },
    importEditPart(){ 
      if(!this.allowEdit) return;    
      let param = {
        ids: []
      };

      // if (!this.selected.length) {
      // return this.$platform.alert('您尚未选择数据，请选择数据后点击批量更新');
      // }

      if(this.selected.length > 0) param.ids = this.selected.map(item => item.id);
      param = _.assign(param, this.model);
      delete param.pageSize;
      delete param.pageNum;
      delete param.sortBy;
      let arr = [];
      
      this.editPartPostParam = param;
      for (let i in param) {
        arr.push(`${i }=${ param[i]}`);
      }
      this.editPartParam = arr.join("&");

      let instance = this.$refs.importEditPart;
      instance.open(param);
    },
    create(){
      this.trackEventHandler("create");
      if(!this.allowCreate) return;
      window.location.href = "/partV2/category/create"
    },
    openDetail(row){
      this.$platform.openTab({
        id: `partV2_category_detail_${row.id}`,
        url:`/partV2/category/detail?id=${row.id}`,
        title: "备件品类详情",
        close: true
      })
    },
    async remove(){
      this.trackEventHandler("remove");
      try {
        let selected = this.selected;

        if(!this.allowEdit) return;
        if(!selected || selected.length == 0) return this.$platform.alert("请选择要删除的备件")
        if(!await this.$platform.confirm("确定要删除选中的备件？")) return;

        this.pending = true;
        let ids = selected.map(item => item.id);
        let result = await this.$http.post("/partV2/category/batchRemove", ids);
        
        if(result.status == 0){
          this.selected = [];
          this.loadData();
        }else{
          this.$platform.alert(result.message || "选中的备件尚有库存，请先办理出库后再删除");
        }

        this.pending = false;
      } catch (error) {
        console.warn(error)
      }
    },
    toggleEnable(row){
      if(!this.allowEdit) return;

      let params = {
        id: row.id,
        enable: row.enable
      }

      row.disabled = true;
      this.$http.post("/partV2/category/toggleEnable", params, false).then(result => {
        if(result.status != 0){
          row.enable = !row.enable;
          this.$platform.alert(result.message);
        }
      })
        .catch(err => console.warn(err))
        .finally(() => {
          row.disabled = false;
        })
    },
    // select part
    handleSelection(selection) {
      let tv = this.computeSelection(selection);
      // 在需要限制最多选择500个备件时，取消function内部全部注释即可
      let original = this.selected
        .filter(ms => this.page.list.some(cs => cs.id === ms.id));
      let unSelected = this.page.list
        .filter(c => original.every(oc => oc.id !== c.id));

      if (tv.length > this.selectedLimit) {
        this.$nextTick(() => {
          original.length > 0
            ? unSelected.forEach(row => {
              this.$refs.table.toggleRowSelection(row, false);
            })
            : this.$refs.table.clearSelection();
        })
        return this.$platform.alert(`最多只能选择${this.selectedLimit}条数据`);
      }
      this.selected = tv;

      this.$refs.baseSelectionBar.openTooltip();
    },
    computeSelection(selection) {
      let tv = [];
      tv = this.selected
        .filter(ms => this.page.list.every(c => c.id !== ms.id));
      tv = _.uniqWith([...tv, ...selection], _.isEqual);
      return tv;
    },
    matchSelected() {
      if (!this.selected.length) return;
      const selected = this.page.list
        .filter(c => {
          if (this.selected.some(sc => sc.id === c.id)) {
            this.selected = this.selected.filter(sc => sc.id !== c.id);
            this.selected.push(c);
            return c;
          }
        }) || [];

      this.$nextTick(() => {
        this.toggleSelection(selected);
      });
    },
    initialize(){
      this.loadData();
    },
    jump(pageNum){
      this.model.pageNum = pageNum;
      this.loadData();
    },
    pageSizeChange(pageSize){
      this.model.pageSize = pageSize;
      this.originModel.pageSize = pageSize;
      
      this.loadData();

      // 存入localStorage
      StorageUtil.save(STORAGE_PAGESIZE_KEY, pageSize);
    },
    search(){
      this.model.pageNum = 1;
      this.loadData();
    },
    reset(){
      this.model = _.assign({}, this.originModel);
      this.dateRange = [];
      this.$refs.table.clearSort();
      this.loadData();
    },
    sort({column, prop, order}){
      let sortBy = {};
      
      if(prop){
        let tableName = "sparepart";
        let key = `${tableName}.${prop}`
        sortBy[key] = order == "ascending";
      }

      this.model.sortBy = sortBy;
      this.loadData();
    },
    async loadData(){
      let loading = this.$loading();
      try{
        this.page = await this.fetchData();
        this.model.pageNum = this.page.pageNum;
        this.model.pageSize = this.page.pageSize;

        this.matchSelected();
      }catch(error){
        console.warn(error)
      }
      loading.close();
    },
    fetchData(){
      return this.$http.get("/partV2/category/listData", this.model).then(result => {
        let list = result.list || [];
        list.forEach(item => {
          item.disabled = false;
          item.salePrice = item.salePrice.toFixed(2);
          item.costPrice = item.costPrice.toFixed(2);
        });
        return result;
      })
    },
    buildParams(pageNum, pageSize){
      return {
        ...this.model,
        pageNum,
        pageSize
      };
    },
    buildColumns(){
      let localData = StorageUtil.get(STORAGE_COLNUM_KEY) || {};

      let columns = [
        {
          label: "编号",
          field: "serialNumber",
          show: true,
          fixed: "left",
          sortable: "custom",
          minWidth: 150
        },
        {
          label: "名称",
          field: "name",
          show: true,
          minWidth: 150
        },
        {
          label: "类别",
          field: "type",
          show: true,
          minWidth: 100
        },
        {
          label: "规格",
          field: "standard",
          show: true,
          minWidth: 100
        },
        {
          label: "单位",
          field: "unit",
          show: true,
          minWidth: 100
        },
        {
          label: "销售价",
          field: "salePrice",
          show: true,
          minWidth: 80
        },
        {
          label: "出库价",
          field: "costPrice",
          show: true,
          minWidth: 80
        },
        {
          label: "说明",
          field: "description",
          show: true,
          minWidth: 120
        },
        {
          label: "启用/禁用",
          field: "enable",
          width: 100,
          show: true
        },
        {
          label: "创建时间",
          field: "createTime",
          show: true,
          width: 180,
          sortable: "custom"
        }
      ]

      columns.forEach(column => {
        let isShow = localData[column.field];
        if(typeof isShow == "boolean") column.show = isShow;
      })

      return columns;
    },
    buildExportColumns() {
      const fixedFields = [{
        label: "备件系统编号",
        field: "id",
        show: true,
      }];

      const buildColumns = this.buildColumns();

      return buildColumns.concat(fixedFields);
    },
    // TalkingData事件埋点
    trackEventHandler (type) {
      switch (type) {
      case "search":
        this.$tdOnEvent("pc：备件品类-搜索事件");
        break;
      case "reset":
        this.$tdOnEvent("pc：备件品类-重置事件");
        break;
      case "advSearch":
        this.$tdOnEvent("pc：备件品类-高级搜索事件");
        break;
      case "create":
        this.$tdOnEvent("pc：备件品类-新建事件");
        break;
      case "remove":
        this.$tdOnEvent("pc：备件品类-删除事件");
        break;
      case "batchEdit":
        this.$tdOnEvent("pc：备件品类-批量编辑事件");
        break;
      case "selectColumn":
        this.$tdOnEvent("pc：备件品类-选择列事件");
        break;
      case "moreAction":
        this.$tdOnEvent("pc：备件品类-更多操作事件");
        break;
      default:
        break;
      }
    }
  },
  mounted(){
    let initData = this.initData;

    this.types = initData.sparepartType || [];
    this.units = initData.units || [];
    this.auths = initData.auths || {};

    this.initialize();
  },
  components: {
    [PartEditBatchForm.name]: PartEditBatchForm,
    [PartImport.name]: PartImport,
    [SampleTooltip.name]: SampleTooltip,
  }
}
</script>


<style lang="scss">
.capp{
  max-width: 360px;
}
// superscript
.part-name-superscript-td {
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

// -------- part selected panel --------
.part-selected-count {
  color: $color-primary;
  padding: 0 3px;
  width: 15px;
  text-align: center;
  cursor: pointer;
  font-size: 13px;
}

.part-selected-panel {
  font-size: 14px;
  height: calc(100% - 51px);

  .part-selected-tip {
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

  .part-selected-list {
    height: 100%;
    padding: 10px;
    overflow-y: auto;

    .part-selected-row {
      display: flex;
      flex-flow: row nowrap;
      line-height: 36px;
      border-bottom: 1px solid #ebeef5;
      font-size: 13px;

      &:hover {
        background-color: #f5f7fa;

        .part-selected-delete {
          visibility: visible;
        }
      }
    }

    .part-selected-head {
      background-color: #F0F5F5;
      color: #333;
      font-size: 14px;
    }

    .part-selected-sn {
      padding-left: 10px;
      width: 150px;
      @include text-ellipsis;
    }

    .part-selected-name {
      padding-left: 10px;
      flex: 1;
      @include text-ellipsis;
    }

    .part-selected-delete {
      width: 36px;
    }

    .part-selected-row button.part-selected-delete {
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

.part-panel-btn {
  float: right;
  cursor: pointer;
  width: 16px;
  height: 16px;
  background: url("../../../assets/img/clear.png") no-repeat center;
  background-size: cover;

  &:hover {
    background: url("../../../assets/img/clear-hover.png") no-repeat center;
    background-size: cover;
  }
}


</style>
