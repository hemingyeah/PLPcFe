<template>
  <div class="stats-panel stats-station-panel">
    <div class="stats-panel-head stats-form">
      <h3>事件统计
        <el-popover trigger="hover">
          <ul>
            <li>隐藏无数据人员：数据为空的用户不在此显示</li>
            <li>未完成：负责人为自己且未标记为完成的事件总和</li>
            <li>今日完成：负责人为自己且完成时间为今天的事件总和</li>
            <li>本周完成：负责人为自己且完成时间为本周的事件总和</li>
            <li>本月完成：负责人为自己且完成时间为本月的事件总和</li>
            <li>客户好评：客户好评总和</li>
            <li>客户差评：客户差评总和</li>
          </ul>
          <stats-popover-icon slot="reference"></stats-popover-icon>
        </el-popover>
      </h3>
      <div class="stats-form-group stats-checkbox">
        <base-checkbox :value="ignoreNull" @input="chooseIgnore">隐藏无数据人员</base-checkbox>
      </div>

      <div class="stats-form-group">
        <input type="text" placeholder="请输入服务人员姓名..." v-model="keyword" @input="updateServerNameTrackEvent">
      </div>
      <div class="stats-form-group">
        <el-dropdown :hide-on-click="false" trigger="click" :show-timeout="150"> 
            <button type="button" class="stats-btn-text">选择列 <i class="el-icon-arrow-down el-icon--right"></i></button>

            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-for="column in columns" :key="column.field"> 
                <el-checkbox class="dropdown-item" :value="column.show" @input="chooseColnum(column)" :disabled="column.field == 'displayName'">{{column.label}}</el-checkbox>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown> 
      </div>
    </div>
    <div class="stats-panel-body">
      <el-table :data="filterRows" class="stats-table">
        <template v-for="col in showColumns" >
          <el-table-column label="服务人员" :key="col.field" v-if="col.field == 'displayName'">
            <template slot-scope="scope">
              <a :href="`/security/user/view/${scope.row.userId}`" :data-user-id="scope.row.userId" @click="openDetail">{{scope.row.displayName}}</a>
            </template> 
          </el-table-column>

          <el-table-column :label="col.label" :prop="col.field" :key="col.field" sortable v-else></el-table-column>
        </template>
        <div class="stats-table-expand" :class="{'stats-table-isExpand': expand}" slot="append" v-if="rows.length > 10 && !keyword">
          <button type="button" @click="expand = !expand; expand && $emit('trackEvent', 'expand')">
            <i class="iconfont icon-zhankaisanjiao"></i> {{expand ? '收起数据' : '展开数据'}}
          </button>
        </div>
      </el-table>
      <!--
      <base-table class="stats-table"
          :rows="filterRows" 
          :columns="columns"
          :disable-select="true"
          :limit="10"
          ></base-table>
          -->
    </div>
  </div>
</template>

<script>
import http from 'src/util/HttpUtil';
import StorageUtil from 'src/util/StorageUtil';

import BaseLoading from 'packages/BaseLoading';
import BaseTable from 'packages/BaseTable';
import BaseCheckbox from 'packages/BaseCheckbox.vue';
import _ from 'lodash';

const STATS_COLUMN_KEY = 'stats_station_event_list_colnum';

export default {
  name: 'station-table',
  data(){
    return {
      rows: [],
      ignoreNull: true,
      columns: this.buildColumns(),
      keyword: '',
      expand: false
    }
  },
  computed: {
    filterRows(){
      let rows = this.rows.filter(row => {
        return row.displayName.toLowerCase().indexOf(this.keyword.toLowerCase()) >= 0
      });
      
      if(!this.expand && rows.length > 10) rows = rows.splice(0, 10);
      return rows;
    },
    showColumns(){
      return this.columns.filter(col => col.show);
    }
  },
  methods: {
    chooseColnum(column){
      this.$emit('trackEvent', 'selectColumn')
      if(column.field == 'displayName') return;
      column.show = !column.show;

      let data = {};
      this.columns.forEach(item => data[item.field] = item.show)
      StorageUtil.save(STATS_COLUMN_KEY, data);
    },
    buildColumns(){
      let localData = StorageUtil.get(STATS_COLUMN_KEY) || {};

      let columns = [
        {
          label: '服务人员',
          field: 'displayName',
          show: true
        },
        {
          label: '未完成',
          field: 'allocatedCount',
          show: true
        },
        {
          label: '今日完成',
          field: 'todayFinish',
          show: true
        },
        {
          label: '本周完成',
          field: 'weekFinish',
          show: true
        },
        {
          label: '本月完成',
          field: 'monthFinish',
          show: true
        },
        {
          label: '客户好评',
          field: 'satisfication',
          show: true
        },
        {
          label: '客户差评',
          field: 'unSatisfication',
          show: true
        }
      ];

      columns.forEach(column => {
        let isShow = localData[column.field];
        if(typeof isShow == 'boolean') column.show = isShow;
      })

      return columns;
    },
    async renderTable(){
      try {
        let loading = BaseLoading.show(this.$el);
        let rows = await this.fetchData();
        this.rows = rows || [];  
        loading.hide();
      } catch (error) {
        console.log(error)
      }
    },
    chooseIgnore(value){
      this.ignoreNull = value;
      this.renderTable();
    },
    chooseTeam(event){
      this.teamId = event.target.value;
      this.renderTable();
    },
    fetchData(){
      let params = {
        ignoreNull: this.ignoreNull
      };
      return http.get('/stats/station/userEvent', params);
    },
    openDetail(event){
      event.preventDefault();

      let el = event.target;
      var fromId = window.frameElement.getAttribute('id');

      parent.window.addTabs({
        id: "userView_" + el.dataset.userId, 
        title: "正在加载", 
        close: true, 
        url: el.getAttribute('href'),
        fromId: fromId
      });
      parent.window.resizeFrame();
    },
    // track TakingData event
    updateServerNameTrackEvent: _.debounce(function() {
      this.$emit('trackEvent', 'updateServerName');
    }, 100)
  },
  mounted(){
    this.renderTable();
  },
  components: {
    [BaseTable.name]: BaseTable,
    [BaseCheckbox.name]: BaseCheckbox
  }
}
</script>

<style>

</style>

