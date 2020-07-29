<template>
  <div class="page">

    <div class="base-search-group-container">
      <form class="base-search" onsubmit="return false;">
        <div class="customer-list-base-search-group">
          <el-input v-model="model.keyWord" placeholder="根据备件信息搜索">
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
          </el-input>
          <base-button type="primary" @event="model.pageNum=1;search();trackEventHandler('search')" native-type="submit">
            搜索
          </base-button>
          <base-button type="ghost" @event="reset();trackEventHandler('reset')">
            重置
          </base-button>
        </div>
        <span class="advanced-search-visible-btn" @click="isExpand = !isExpand;trackEventHandler('advSearch')">
          <i :class="`iconfont ${isExpand ? 'el-icon-minus' : 'el-icon-plus'}`" ></i>
          高级搜索
        </span>
      </form>
    </div>





    <form @submit.prevent="search();trackEventHandler('search');">
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
            <!-- <div class="form-item">
              <label>备件类别</label>
              <div class="form-item-content">
                <el-select placeholder="请选择备件类别" v-model="model.type">
                  <el-option label="全部" value=""></el-option>
                  <el-option :label="item" :value="item" v-for="item in types" :key="item"></el-option>
                </el-select>
              </div>
            </div> -->
            <div class="form-item">
              <label>备件名称</label>
              <div class="form-item-content">
                  <el-select popper-class="common-advance-popper" style="width: 100%;"
                      :value="sparepart.sparepartId"   
                      @input="chooseSparepart"
                      filterable
                      clearable
                      remote
                      placeholder="选择备件"
                      :remote-method="fetchSparepart"
                      :loading="sparepart.loading">

                      <el-option
                        v-for="item in sparepart.options"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id">
                        <div class="part-option">
                          <p>编号：{{item.serialNumber}}</p>
                          <p>名称：{{item.name}}</p>
                        </div>
                      </el-option>
                  </el-select>
                </div>
            </div>
            <div class="form-item">
              <label>类别</label>
              <div class="form-item-content">
                 <el-select placeholder="请选择操作类型" v-model="model.type">
                  <el-option label="全部" value=""></el-option>
                  <el-option label="出库" value="出库"></el-option>
                  <el-option label="入库" value="入库"></el-option>
                </el-select>
              </div>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-item">
              <label>日期筛选</label>
              <div class="form-item-content">
                 <el-date-picker @change="seeTime()" style="width:100%"
                v-model="timeValue"
                type="daterange"
                align="right"
                unlink-panels
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :picker-options="pickerOptions2">
              </el-date-picker>
              </div>
            </div>
            <div class="form-item">
              <label>出入库类型</label>
              <div class="form-item-content">
                <el-select  placeholder="请选择出入库类型" v-model="model.item">
                  <!-- <el-option label="全部" value=""></el-option> -->
                  <el-option-group v-for="group in sparepartConfig" :key="group.label" :label="group.label">
                    <el-option :label="item" :value="item" v-for="item in group.options" :key="item"></el-option>
                  </el-option-group>
                </el-select>
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-item">
              <label>办理人</label>
              <div class="form-item-content">
                  <el-select class="srp-list-form-item" style="width: 100%;"
                      :value="user.userId"   
                      @input="chooseUser"
                      filterable
                      clearable
                      remote
                      placeholder="选择人员"
                      :remote-method="fetchUser"
                      :loading="user.loading">

                      <el-option
                        v-for="item in user.options"
                        :key="item.userId"
                        :label="item.displayName"
                        :value="item.userId">

                        <div class="srp-user-item">
                          <img :src="item.head || '/resource/images/account_userhead.png'">
                          <p>{{item.displayName}}</p>
                        </div>
                      </el-option>
                  </el-select>
                </div>
              </div>

            <div class="form-item">
              
            </div>
          </div>
                  

          <div class="form-row">
            <div class="text-right" style="width:100%;">
              <!--<el-button @click="reset">重置</el-button>-->
              <base-button type="ghost" @event="reset">重置</base-button>
              <base-button type="primary" native-type="submit">确定</base-button>
              <!--<el-button type="primary" native-type="submit">确定</el-button>-->
            </div>
          </div>
        </div>
      </base-collapse-panel>
    </form>

    <div class="page-panel" style="margin: 0;">
      <div class="page-panel-body">
        
        <!-- 选择仓库（默认全部） -->
        <el-row class="block-col-2">
         <el-select  :value="repertoryName" @input="chooseRepertory" class="srp-list-form-item" style="width: 150px;">
             <el-option label="全部仓库" value=""></el-option>
             <el-option v-for="item in repertory" :key="item.id" :value="item.id" :label="item.name"></el-option>
        </el-select>
        <div class="pull-right">
          <el-button-group>
            <el-dropdown :hide-on-click="false" trigger="click" :show-timeout="150"> 
              <span class="el-dropdown-link el-dropdown-btn customize-el-dropdown-btn" >选择列<i class="iconfont icon-nav-down"></i></span>

              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-for="column in columns" :key="column.field"> 
                  <el-checkbox :value="column.show" @input="chooseColnum(column)">{{column.label}}</el-checkbox>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>  

          <el-dropdown :hide-on-click="false" trigger="click" :show-timeout="150" v-if="allowImportAndExport" @command="trackEventHandler('moreAction')"> 
            <span class="el-dropdown-link el-dropdown-btn customize-el-dropdown-btn" >更多操作<i class="iconfont icon-nav-down"></i></span>

            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item> 
                <span class="dropdown-item" @click="exportData(false)">导出</span>
              </el-dropdown-item>
               <el-dropdown-item> 
                <span class="dropdown-item" @click="exportData(true)">导出全部</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>  
          </el-button-group>  
        </div>
      
        </el-row>
      </div>
    </div>

    <div style="background: #fff;padding: 0 10px">
      <base-selection-bar ref="baseSelectionBar" v-model="selected" @toggle-selection="toggleSelection" @show-panel="() => multipleSelectionPanelShow = true" />
    </div>

    <div class="table-container">
      <el-table stripe
                ref="table"
                :data="page.list"
                header-row-class-name="base-table-header"
                @select="handleSelection"
                @select-all="handleSelection">

        <el-table-column
          type="selection"
          width="44">
        </el-table-column>

        <el-table-column v-for="column in columns" :key="column.field"
                         v-if="column.show"
                         :label="column.label"
                         :width="column.width"
                         :prop="column.field"
                         :min-width="column.minWidth"
                         :show-overflow-tooltip="column.showTip !== false">

          <template slot-scope="scope">
            <template v-if="column.field == 'sparepart.serialNumber'">
              <template v-if="scope.row.sparepart">{{scope.row.sparepart.serialNumber}}</template>
            </template>
            <template v-else-if="column.field == 'sparepart.name'">
              <template v-if="scope.row.sparepart">{{scope.row.sparepart && scope.row.sparepart.name}}</template>
            </template>
            <template v-else-if="column.field == 'sparepart.type'">
              <template v-if="scope.row.sparepart">{{scope.row.sparepart && scope.row.sparepart.type}}</template>
            </template>
            <template v-else-if="column.field == 'sparepart.standard'">
              <template v-if="scope.row.sparepart">{{scope.row.sparepart && scope.row.sparepart.standard}}</template>
            </template>
            <template v-else-if="column.field == 'repertory.name'">
              <template v-if="scope.row.repertory">{{scope.row.repertory.name}}</template>
            </template>
            <template v-else-if="column.field == 'createTime'">
              <template>{{scope.row.createTime}}</template>
            </template>
            <template v-else-if="column.field == 'remark'">
              <el-tooltip placement="top" popper-class="common-tooltip">
                <div slot="content" class="pre">{{scope.row[column.field]}}</div>
                <div class="text-overflow-hidden">{{scope.row[column.field]}}</div>
              </el-tooltip>
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

    <base-export ref="exportPanel"
      v-if="allowImportAndExport"
      :columns="columns"
      action="/partV2/repertory/exportRepoRecord"
      :method="'post'"></base-export>

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
              <span class="part-selected-sn">{{c.sparepart.serialNumber}}</span>
              <span class="part-selected-name">{{c.sparepart.name}}</span>
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
import _ from 'lodash';
import qs from '@src/util/QueryString';
import Page from "../../../model/Page";
import DateUtil from '@src/util/DateUtil';
import AuthUtil from '@src/util/AuthUtil';
import StorageUtil from '@src/util/StorageUtil';

const STORAGE_COLNUM_KEY = 'repe_record_list_column';
const STORAGE_PAGESIZE_KEY = 'repe_record_list_pagesize';

export default {
  name: 'repertory-record-view',
  data(){
    let pageSize = StorageUtil.get(STORAGE_PAGESIZE_KEY) || 10;

    let originModel = {
      keyWord: '',
      type: '',
      sparepartType: '',
      item: '',
      enable: '',
      pageNum: 1,
      pageSize: pageSize
    };

    return {
      multipleSelectionPanelShow: false,
      selectedLimit: 500,
      isPersonalRepertory: false,
      auths: [],
      columns: [],
      isExpand: false,
      pending: false,
      
      types: [],
      user: {
        userId: '',
        loading: false,
        options: []
      },
      sparepart: {
        sparepartId: '',
        loading: false,
        options: []
      },
      originModel: originModel,
      model: _.assign({}, originModel),

      page: new Page(),
      selected: [],
      instockDialog: false,
      outstockDialog: false,
      repertory:[],
      repertorySelected:'',
      sparepartConfig:{},
      outStoreType:'',
      inStoreType:'',
      repertoryName:'',
      pickerOptions2: {
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
      timeValue: '',

      exportIds: []
    }
  },
  computed: {
    //是否允许导入导出
    allowImportAndExport(){
      return AuthUtil.hasAuth(this.auths, 'EXPORT_IN')
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

    chooseColnum(column){
      this.trackEventHandler('selectColumn');

      column.show = !column.show;

      let data = {};
      this.columns.forEach(item => data[item.field] = item.show)
      StorageUtil.save(STORAGE_COLNUM_KEY, data);
    },
    seeTime(){
      if(!this.timeValue) {
        delete this.model.timeStart;
        delete this.model.timeEnd;
      } else {
        this.model.timeStart = DateUtil.format(this.timeValue[0])
        this.model.timeEnd = DateUtil.format(this.timeValue[1], 'yyyy-MM-dd 23:59:59')
      }
    },

    chooseUser(value){
      if(this.user.userId == value) return;

      this.user.userId = value;
      this.model.executor = value;

    },

    openDetail(row){
      this.$platform.openTab({
        id: `partV2_detail_${row.id}`,
        url:`/partV2/detail?id=${row.id}`,
        title: '备件品类详情'
      })
    },
    //导出库存记录
    exportData(exportAll){
      if(!this.allowImportAndExport) return;
      let ids = [];

      if(!exportAll){
        if(this.selected.length == 0) return this.$platform.alert('请选择要导出的数据');
        ids = this.selected.map(item => item.id);
      }
      
      this.$refs.exportPanel.open(ids, `${DateUtil.format(new Date(),'yyyy-MM-dd')}出入库记录.xlsx`);
    },
    select(data){
      this.selected = data;
    },
    
    initialize(){
      this.loadData();
      //this.fetchRepertory();
      this.fecthSparepartConfig()
      this.fetchUser();
      this.fetchSparepart();
    },
    jump(pageNum){
      this.model.pageNum = pageNum;
      this.loadData();
    },
    pageSizeChange(pageSize){
      this.model.pageSize = pageSize;
      this.originModel.pageSize = pageSize;

      this.loadData();
      StorageUtil.save(STORAGE_PAGESIZE_KEY, pageSize);
    },
    search(){
      this.model.pageNum = 1;
      this.loadData();
    },
    reset(){
      this.model = _.assign({},this.originModel);
      this.sparepart.sparepartId = '';
      this.timeValue = [];
      this.user.userId = '';
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
        console.log(error)
      }
      loading.close();
    },
    fecthSparepartConfig(){
      // 获取备件设置
      return this.$http.post('/partV2/repertory/sparepartConfig').then(result => {
        let sparepartConfig = []
        let outStoreType = {}
        let inStoreType = {}
        let outstock = ['申领到个人', '分配出库', '调拨出库']
        let instock = ['备件退回', '分配退回', '分配撤回', '调拨入库', '调拨退回', '调拨撤回']
        if (Array.isArray(result.outStoreType)) {
          outStoreType['options'] = outstock.concat(result.outStoreType)
        }else{
          outStoreType['options'] = outstock;
        }
        if (Array.isArray(result.inStoreType)) {
          inStoreType['options'] = instock.concat(result.inStoreType)
        }else{
          inStoreType['options'] = instock;
        }
        outStoreType['label'] = '出库类型'
        inStoreType['label'] = '入库类型'
        sparepartConfig.push(outStoreType)
        sparepartConfig.push(inStoreType)
        this.sparepartConfig = sparepartConfig;
      })
    },
    fetchData(){
      // 获取出入库记录列表
      return this.$http.get('/partV2/repertory/recordData', this.model).then(result => {
        let list = result.list || [];
        list.forEach(item => item.disabled = false);
        return result;
      })
    },
    fetchRepertory(){
      // 获取仓库类型
      return this.$http.get('/partV2/repertory/listForManager').then(result => {
        this.repertory = result || [];
      })
    },
    fetchUser(keyword){
      // 获取用户
      let model = {
        keyword: keyword,
        pageSize: 50
      }
      this.user.loading = true
      this.$http.get('/partV2/repertory/user/list',model)
        .then(result => this.user.options = result.list)
        .catch(err => console.log(err))
        .finally(() => this.user.loading = false);
    },
    fetchSparepart(keyword){
      // 获取备件
      let model = {
        keyWord: keyword,
        enable: 1,
        pageSize: 50
      }
      this.sparepart.loading = true
      this.$http.get('/partV2/repertory/sparepart/list',model)
        .then(result => this.sparepart.options = result.list)
        .catch(err => console.log(err))
        .finally(() => this.sparepart.loading = false);
    },
    chooseRepertory(value){
      this.trackEventHandler('chooseRepertory');

      this.repertoryName = value;
      if(value){
        this.model.repertoryId = value
      }else{
        delete this.model.repertoryId
      }
      this.model.pageNum = 1;
      this.loadData()
    },
    chooseSparepart(value){
      if(this.sparepart.sparepartId == value) return;
      this.sparepart.sparepartId = value;
      this.model.sparepartId = value;
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
          field: 'recordNo',
          label: '出入库编号',
          show: true,
          minWidth: 220
        },
        {
          field: 'sparepart.serialNumber',
          label: '备件编号',
          show: true,
          minWidth: 150
        },
        {
          field: 'sparepart.name',
          label: '备件名称',
          show: true,
          minWidth: 150
        },
        {
          field: 'sparepart.type',
          label: '备件类别',
          show: true,
          minWidth: 100
        },
        {
          field: 'sparepart.standard',
          label: '备件规格',
          show: true,
          minWidth: 100
        },
        {
          field: 'type',
          label: '类别',
          show: true,
          minWidth: 100
        },
        {
          field: 'item',
          label: '类型',
          show: true,
          minWidth: 100
        },
        {
          field: 'repertory.name',
          label: '仓库',
          show: true,
          minWidth: 120
        },
        {
          field: 'variation',
          label: '变化',
          show: true,
          minWidth: 80
        },
        {
          field: 'number',
          label: '结余',
          show: true,
          minWidth: 80
        },
        {
          field: 'taskNo',
          label: '工单编号',
          show: true,
          minWidth: 80,
          width: 150,
          isPersonalRepertory: false
        },
        {
          field: 'customerName',
          label: '客户姓名',
          show: true,
          minWidth: 80,
          width: 150,
          isPersonalRepertory: false
        },
        {
          field: 'customerNumber',
          label: '客户编号',
          show: true,
          minWidth: 80,
          width: 150,
          isPersonalRepertory: false
        },
        {
          field: 'propserName',
          label: '发起人',
          show: true,
          minWidth: 120
        },
        {
          field: 'executorName',
          label: '办理人',
          show: true,
          minWidth: 120
        },
        {
          field: 'remark',
          label: '备注',
          show: true,
          minWidth: 120,
          showTip: false
        },
        {
          field: 'createTime',
          label: '时间',
          show: true,
          width: 180
        }
      ]
      
      columns.forEach(column => {
        let isShow = localData[column.field];
        if(typeof isShow == 'boolean') column.show = isShow;
      })

      if(this.isPersonalRepertory){
        columns = columns.filter(item => item.isPersonalRepertory !== false)
      }

      return columns;
    },
    // TalkingData事件埋点
    trackEventHandler (type) {
      switch (type) {
        case 'search':
          this.$tdOnEvent('pc：出入库记录-搜索事件');
          break;
        case 'reset':
          this.$tdOnEvent('pc：出入库记录-重置事件');
          break;
        case 'advSearch':
          this.$tdOnEvent('pc：出入库记录-高级搜索事件');
          break;
        case 'chooseRepertory':
          this.$tdOnEvent('pc：出入库记录-仓库筛选下拉框事件');
          break;
        case 'selectColumn':
          this.$tdOnEvent('pc：出入库记录-选择列事件');
          break;
        case 'moreAction':
          this.$tdOnEvent('pc：出入库记录-更多操作事件');
          break;                                                  
        default:
          break;
      }
    }
  },
  async created(){
    let initData = JSON.parse(JSON.stringify(window._init_data || {}));

    this.types = initData.sparepartType || [];
    this.auths = initData.auths || [];
    this.isPersonalRepertory = initData.isPersonalRepertory;

    this.columns = this.buildColumns();
    let loading = this.$loading();
    try{
      await this.fetchRepertory();
    }catch(error){
      console.log(error)
    }
    loading.close();

    let urlParams = qs.parse(window.location.search);   

    if(urlParams.startTime && urlParams.endTime && urlParams.type) {
      this.isExpand = true;
      this.timeValue = [new Date(urlParams.startTime), new Date(urlParams.endTime)];
      this.model.timeStart = `${urlParams.startTime} 00:00:00`;
      this.model.timeEnd = `${urlParams.endTime} 23:59:59`;
      this.model.type = urlParams.type;             
    }
    if(urlParams.id){
      this.repertoryName = urlParams.id; 
      this.model.repertoryId = urlParams.id

      let flag = this.repertory.some((item) => {
        return item.id == urlParams.id;
      });
      if(!flag) {
        this.repertoryName = ''; 
        delete this.model.repertoryId; 
        this.$message.warning({message:'您没有该仓库的权限', duration:0, showClose:true});  
      }
    }else{
      delete this.model.repertoryId;
    }   
    this.initialize();  
  }   
}
</script>

<style lang="scss">
 $color-primary-light-9: mix(#fff, $color-primary, 90%) !default;
.no-padding{
  padding:0;
}
.srp-user-item{
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  padding: 2px 0;
  justify-content: space-between;

  &:last-child{
    margin: 0;
  }

  img{
    display: block;
    width: 28px;
    height: 28px;
    border-radius: 2px;
  }

  p{
    flex: 1;
    margin: 0;
    margin-left: 10px;
    font-weight: 500;
    font-size: 14px;
    overflow: hidden;
    line-height: 28px;
    width:0;
  }
}

.srp-list-form{
  width: 720px;
  display: inline-block;

  .srp-list-form-item{
    margin-right: 5px;
  }
}

.customize-el-dropdown-btn {
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

.part-option{
  margin: 5px 0;

  p{
    overflow: hidden;
    margin: 0;
    line-height: 24px;
    text-overflow: ellipsis;
    white-space: nowrap;
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
