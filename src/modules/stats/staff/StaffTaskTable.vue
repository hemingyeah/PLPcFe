<template>
  <div class="stats-panel">
    <div class="stats-panel-head stats-form">
      <h3>工单统计

        <el-popover trigger="hover">
          <ul>
            <li>隐藏无数据人员：数据为空的用户不在此显示</li>
            <li>未完成：负责人为自己且未标记为完成的工单总和</li>
            <li>今日完成：负责人为自己且完成时间为今天的工单总和</li>
            <li>本周完成：负责人为自己且完成时间为本周的工单总和</li>
            <li>本月完成：负责人为自己且完成时间为本月的工单总和</li>
            <li>本月营收：负责人为自己且完成时间为本月的工单收入总和</li>
            <li>客户好评：客户回访好评总和</li>
            <li>客户差评：客户回访差评总和</li>
          </ul>
          <stats-popover-icon slot="reference"></stats-popover-icon>
        </el-popover>
      </h3>

      <div class="stats-form-group stats-checkbox">
        <base-checkbox :value="ignoreNull" @input="chooseIgnore">隐藏无数据人员</base-checkbox>
      </div>

      <biz-team-select class="stats-team-select" :value="tag" @input="chooseTeam" :fetchFunc="fetchTeam"/>

      <!-- <div class="stats-form-group">
        <select @change="chooseTeam">
          <option value="">全部</option>
          <option v-for="team in teams" :key="team.id" :value="team.id">{{team.name}}</option>
        </select>
      </div> -->


      <!-- <div class="stats-form-group">
        <select @change="chooseTemplate" style="height: 24px">
          <option value="">全部类型</option>
          <option v-for="item in templates" :key="item.taskTypeId" :value="item.taskTypeId">{{item.taskTypeName}}</option>
        </select>
      </div> -->


      <div class="stats-form-group">
        <input type="text" placeholder="请输入服务人员姓名..." v-model="keyword" @input="updateServerName" style="line-height: 20px;">
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
          <el-table-column label="服务人员" :key="col.field" v-if="col.field === 'displayName'">
            <template slot-scope="scope">
              <a :href="`/security/user/view/${scope.row.userId}`" :data-user-id="scope.row.userId" @click="openDetail">{{scope.row.displayName}}</a>
            </template> 
          </el-table-column>

          <el-table-column label="本月营收(元)" :key="col.field" v-else-if="col.field === 'monthCost'">
            <template slot-scope="scope">
              {{scope.row.monthCost.toFixed(2)}}
            </template>
          </el-table-column>

          <el-table-column :label="col.label" :prop="col.field" :key="col.field" sortable v-else></el-table-column>
        </template>
        <div class="stats-table-expand" slot="append" :class="{'stats-table-isExpand': expand}" v-if="rows.length > 10 && !keyword">
          <button type="button" @click="expand = !expand">
            <i class="iconfont icon-zhankaisanjiao"></i> {{expand ? '收起数据' : '展开数据'}}
          </button>
        </div>
      </el-table>

      <!-- <base-table class="stats-table"
        :rows="filterRows" 
        :columns="columns"
        :disable-select="true"
        :limit="10"
        ></base-table> -->
    </div>
  </div>
</template>

<script>
import http from 'src/util/HttpUtil';
import StorageUtil from 'src/util/StorageUtil';

import Loading from 'packages/BaseLoading';
import BaseTable from 'packages/BaseTable';
import BaseCheckbox from 'packages/BaseCheckbox.vue';
import _ from 'lodash';

const STATS_COLUMN_KEY = 'stats_staff_task_list_colnum';
let that;

export default {
  name: 'staff-task-table',
  // props: ['teams'],
  data(){
    return {
      tag: [],
      rows: [],
      ignoreNull: true,
      teamId: '',
      columns: this.buildColumns(),
      keyword: '',
      expand: false,
      templates: [],
      taskType: '',
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
  filters: {
    template(taskType) {
      if (!taskType || taskType == '全部类型') return '全部类型';
      let res = that.templates.filter(item => item.taskTypeId == taskType)[0]
      return res.taskTypeName
    }
  },
  methods: {
    chooseTemplate(val) {
      this.taskType = val.target.value;
      this.renderTable();
      this.$emit('trackEvent', 'chooseTaskType')
    },
    fetchTemplate() {
      return http.get('/stats/staff/taskType')
        .then(res => { 
          return new Promise((resolve, reject) => {
            for(let [key, value] of Object.entries(res.data)) {
              this.templates.push({
                taskTypeId: key,
                taskTypeName: value
              })
            }
            resolve();
          }) 
        })
        .catch(e => console.error('e', e));
    },

    fetchTeam(params){
      return http.post('/security/tag/list', {...params, ...{authKey: 'VIP_REPORT_VIEW'}})
    },
    chooseColnum(column){
      this.$emit('trackEvent', 'chooseColumn');

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
        // {
        //   label: '工单类型',
        //   field: 'template',
        //   show: true
        // },
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
          label: '本月营收(元)',
          field: 'monthCost',
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
        let instance = Loading.show(this.$el);
        let rows = await this.fetchData();
        instance.hide();
        this.rows = rows || [];  
      } catch (error) {
        console.log(error)
      }
    },
    chooseIgnore(value){
      this.ignoreNull = value;
      this.renderTable();
    },
    chooseTeam(value){
      this.$emit('trackEvent', 'chooseTeam');

      let tag = (Array.isArray(value) ? value[0] : value) || {};
      this.tag = value;
      this.teamId = tag.id;
      this.renderTable();
    },
    fetchData(){
      let params = {
        teamId: this.teamId,
        ignoreNull: this.ignoreNull,
        taskType: this.taskType
      };
      return http.get('/stats/staff/task', params);
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
        fromId:fromId
      });
      parent.window.resizeFrame();
    },
    // track TalkingData Event
    updateServerName: _.debounce(function () {
      this.$emit('trackEvent', 'updateServerName')
    }, 1000)
  },
  mounted(){
    // await this.fetchTemplate();
    this.renderTable();
  },
  beforeCreate () {
    that = this
  },
  components: {
    [BaseCheckbox.name]: BaseCheckbox,
    [BaseTable.name]: BaseTable
  }
}
</script>

