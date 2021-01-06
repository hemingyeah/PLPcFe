<template>
  <base-modal
    :show.sync="visible"
    title="统计"
    width="1000px"
    class="statistical-dialog"
    @closed="onClose('form')"
  >
    <div class="base-modal-content">
      <div class="statistical-search">
        <div class="search-left">
          <el-date-picker
            v-model="timeArrRange"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="onTimeChange"
            value-format="yyyy/MM/dd"
          >
          </el-date-picker>
          <el-input v-model="form.taskNoStr" placeholder="请输入工单编号"></el-input>
          <el-input v-model="form.userNameStr" placeholder="请输入操作人"></el-input>
          <el-button type="primary" @click="onSearch">搜索</el-button>
        </div>
        <div class="search-right">       
          <a :href="`/setting/task/card/count/export?cardId=${card.id}`">导出</a>
        </div>
      </div>
      <el-table
        ref="multipleTable"
        :data="tableData"
        style="width: 100%"
        class="page-table statistical-table"
        :highlight-current-row="false"
        border
        header-row-class-name="page-table-header" 
        stripe
        tooltip-effect="dark"
        v-loading="loading">
        <el-table-column prop="taskNo" label="工单编号" width="150">
          <template slot-scope="scope">
            <a @click="openTaskView(scope.row.taskId)">{{scope.row.taskNo}}</a>
          </template>
        </el-table-column>

        <!-- start 非工时记录列表数据 -->
        <template v-if="card.specialfrom != '工时记录'">
          <el-table-column  
            v-for="(column, index) in columns" 
            :key="`${column.field}_${index}`"
            :prop="column.fieldName" 
            :label="column.displayName"
            :show-overflow-tooltip="column.showTooltip"
            :min-width="column.minWidth || '120px'">
            <template slot-scope="scope">
              <!-- start 自定义字段 -->
                <!-- start 多选 -->
                <template v-if="isMulti(column)">
                  {{ (scope.row.taskCardInfo[column.fieldName] || []).join('，') }}
                </template>
                <!-- end 多选 -->
                <template v-else>
                  {{scope.row.taskCardInfo[column.fieldName] | fmt_form_field(column.formType, column.fieldName, scope.row.taskCardInfo)}}
                </template>
              <!-- end 自定义字段 -->
            </template>
          </el-table-column>
          <el-table-column prop="userName" label="操作人">
            <template slot-scope="scope">
              <template v-if="scope.row.taskCardInfo['userName']">
                <template>
                  {{scope.row.taskCardInfo['userName']}}
                </template>
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="updateTime" label="操作时间" width="160" >
            <template slot-scope="scope">
              <template v-if="scope.row.taskCardInfo['updateTime']">
                <template >
                  {{scope.row.taskCardInfo['updateTime'] | formatDate}}
                </template>
              </template>
            </template>
          </el-table-column>
        </template>
        <!-- start 非工时记录列表数据 -->

        <!-- start 工时记录统计列表数据-->
        <template v-else>
          <el-table-column  
            v-for="(column, index) in columns" 
            :key="`${column.field}_${index}`"
            :prop="column.fieldName" 
            :label="column.displayName"
            :show-overflow-tooltip="column.showTooltip"
            :min-width="column.minWidth || '120px'">
            <template slot-scope="scope">
              <!-- start 多选 -->
              <template v-if="isMulti(column)">
                {{ (scope.row[column.fieldName] || []).join('，') }}
              </template>
              <!-- end 多选 -->

              <!-- start 开始结速时间 -->
              <template v-else-if="column.fieldName === 'startTime' || column.fieldName === 'endTime' || column.fieldName === 'operateTime'">
                {{scope.row[column.fieldName] | formatDate}}
              </template>
              <!-- end 开始结速时间 -->

              <template v-else>
                {{ scope.row[column.fieldName] | fmt_form_field(column.formType, column.fieldName, scope.row) }}
              </template>
            </template>
          </el-table-column>
        </template>  
        <!-- end 工时记录统计列表数据-->  
      </el-table>
      <div class="table-footer comment-list-table-footer">
        <div class="comment-list-table-footer-info task-flex task-ai">
          共<span class="level-padding">{{totalElements || 0}}</span>条
          <div class="task-font14 task-c6 task-ml12">
            每页
            <el-select
              v-model="form.pageSize"
              placeholder="请选择"
              @change="handleSizeChange(form.pageSize)"
              class="table-footer-select"
            >
              <el-option :label="10" :value="10"></el-option>
              <el-option :label="20" :value="20"></el-option>
              <el-option :label="50" :value="50"></el-option>
            </el-select>
            条
          </div>
        </div>
        <el-pagination
          v-if="this.tableData"
          class="comment-list-table-footer-pagination"
          background
          @current-change="jumpPage"
          @size-change="handleSizeChange"
          :page-size="form.pageSize"
          :current-page="form.pageNum"
          layout="prev, pager, next, jumper"
          :total="totalElements"
        >
        </el-pagination>
      </div>

    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="onClose">取 消</el-button>
      <el-button type="primary" @click="onClose" >确 定</el-button>
    </div>
  </base-modal>
</template>
<script>
// api
import * as SettingTaskApi from '@src/api/SettingTaskApi';
// util
import { formatDate } from '@src/util/lang/index.js';
import fieldUtil from './cardField';

export default {
  name: 'statistical-dialog',
  props: {
    card:{
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      loading: true,
      visible: false,
      totalElements: 0,
      form: {
        cardId: '',
        pageNum: 1,
        pageSize: 10,
        timeRange: '', // 2020/11/11 - 2020/12/10
        taskNoStr: '',
        userNameStr: ''
      },
      tableData:[],
      cardFieldsData:[],
      timeArrRange:[],
    };
  },
  filters: {
    formatDate(val) {
      if (!val) return '';
      return formatDate(val, 'YYYY-MM-DD HH:mm')
    }
  },
  computed: {
    /** 
    * @description 表头设置
    */
    columns() {
      let cardFields = this.cardFieldsData.filter(field=>field.cardId == this.card.id);
      if(cardFields.length > 0){
        if(this.card.specialfrom == '工时记录'){
          let fields = fieldUtil.toTableFields(cardFields[0].fields, this.card.config);
          return fields.filter(field => field.enabled == 1);
        }else{
          return fieldUtil.packCustomFields(cardFields[0].fields)
        }
        return newCard 
      }
    }
  },
  mounted() {
    this.timeRange();
  },
  methods: {
    valueAtt_href(field) {
      return JSON.parse(field)
    },
    /** 
    * @description 默认时间
    */
    timeRange() {
      this.timeArrRange = [formatDate(new Date() - (29 * 24 * 60 * 60 * 1000), 'YYYY/MM/DD'), formatDate(new Date(), 'YYYY/MM/DD')];
      this.form.timeRange = this.timeArrRange.join(' - ')
    },

    onTimeChange(e) {
      if(e){
        this.form.timeRange = this.timeArrRange.join(' - ')
      }else{
        this.form.timeRange = [];
      }
    },

    /** 
    * @description 查看工单详情
    */
    openTaskView(taskId) {
      let fromId = window.frameElement.getAttribute('id');
      this.$platform.openTab({
        id: `task_view_${taskId}`,
        title: '工单详情',
        close: true,
        url: `/task/view/${taskId}`,
        fromId
      });

    },

    /** 
    * @description 字段是否是多选类型
    */
    isMulti(field) {
      let { formType, setting = {}} = field;
      if (formType === 'selectMulti') return true;
      if (formType === 'select' && setting.isMulti) return true;
      return false;
    },
    /** 
    * @description 打开统计弹窗
    */
    openDialog() {
      this.visible = true;
      this.timeRange();

      if(this.card.id) {
        this.form.cardId = this.card.id;
        this.getCardFields()
        this.getCardCountReq();
      }
    },
    onClose(form) {
      this.visible = false;
      this.form = {
        pageNum: 1,
        pageSize: 10,
        timeRange: [],
        taskNoStr: '',
        userNameStr: ''    
      }
    },
    /** 
    * @description 搜索
    */
    onSearch() {
      this.getCardCountReq()
    },

    /**
     * @description 页大小改变操作
     * @param {Number} pageSize 页大小
     */
    handleSizeChange(pageSize) {
      this.form.pageSize = pageSize;
      this.form.pageNum = 1;
      this.getCardCountReq();

    },
    /**
     * @description 页码跳转
     * @param {Number} pageNum 页码
     */
    jumpPage(pageNum) {
      this.form.pageNum = pageNum;
      this.getCardCountReq();
    },

    // 获取统计Fields列表
    getCardFields() {
      SettingTaskApi.getCardFields().then(res=>{
        const { status, message, data } = res;
        if( status == 0 ){
          this.cardFieldsData = data;
        }
      }).catch(error=>({}))
    },

    // 获取统计列表
    getCardCountReq() {
      SettingTaskApi.getCardCount(this.form).then(res=>{
        const { status, message, list } = res;

        this.totalElements = res.total;
        if(this.card.specialfrom != '工时记录'){  
          list.forEach(item=>{
            item.taskCardInfo = item.taskCardInfo ? JSON.parse(item.taskCardInfo) : {}
          })
          this.tableData = list;
        }else{
          this.tableData = list;
        }

        this.loading = false;
        
      }).catch(error=>({ }))

    }
  },
};
</script>
<style lang="scss">
.statistical-dialog {
  .base-modal-header {
    display: flex;
    justify-content: space-between;
    .el-dialog__title {
      font-size: 18px;
    }
    .el-tooltip {
      color: #999;
    }
  }
  .base-modal-body {
    padding: 20px;
    .base-modal-content{
      .statistical-search{
        display: flex;
        justify-content: space-between;
        .search-left{
          display: flex;
          justify-content: flex-start;
          .el-date-editor{
            margin-right: 12px;
            width: 256px !important;
          }
          .el-input{
            margin-right: 12px;
            width: 168px;
          }
        }
        .search-right{
          a{
            width: 58px;
            height: 32px;
            background: #E9F9F9;
            border-radius: 4px;
            border: 1px solid #D0F3F4;
            color: #13C2C2;
            text-decoration: none;
            padding: 6px 10px;
          }
        }
      }
      .statistical-table{
        padding: 0;
        margin-top: 17px;  
        a{
          width: 100%;
          color: #13C2C2;
          cursor: pointer;
          display: block;
          @include text-ellipsis();
        }
      }
      .table-footer{
        margin-top: 17px;
      }
    }
    

  }
}
</style>