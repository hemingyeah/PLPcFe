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
            end-placeholder="结束日期">
          </el-date-picker>
          <el-input v-model="form.taskNoStr" placeholder="请输入工单编号"></el-input>
          <el-input v-model="form.userNameStr" placeholder="请输入操作人"></el-input>
          <el-button type="primary">搜索</el-button>
        </div>
        <div class="search-right">
          <el-button type="primary" plain @click="exportStatistics">导出</el-button>
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
          @selection-change="handleSelectionChange">
          <el-table-column prop="taskNo" label="工单编号" width="150"></el-table-column>
          <template v-if="specialfrom != '工时记录'">
            <el-table-column  
              v-for="(column, index) in columns" 
              :key="`${column.field}_${index}`"
              :prop="column.fieldName" 
              :label="column.displayName"
              width="120">
            </el-table-column>
          </template>
          <template v-else>
            <el-table-column  
              v-for="(column, index) in columns" 
              :key="`${column.field}_${index}`"
              :prop="column.fieldName" 
              :label="column.displayName"
              width="120">
              <template slot-scope="scope">{{ scope.row.date }}</template>
            </el-table-column>
          </template>    
          <el-table-column
            prop="name"
            label="操作人"
            show-overflow-tooltip>
          </el-table-column>
          <el-table-column
            prop="name"
            label="操作时间"
            show-overflow-tooltip>
          </el-table-column>
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
import * as SettingTaskApi from "@src/api/SettingTaskApi";
// util
import * as Lang from "@src/util/lang/index.js";

export default {
  name: 'statistical-dialog',
  props: {
    id:{
      type: String,
    },
    specialfrom:{
      type: String
    }
  },
  data() {
    let startDate = Lang.formatDate(new Date() - 29 * 24 * 60 * 60 * 1000,"YYYY-MM-DD");
    let endDate = Lang.formatDate(new Date(), "YYYY-MM-DD");
    return {
      visible: false,
      totalElements:100,
      form: {
        cardId: '6a4bde67-11ad-11eb-a442-00163e304a25',
        pageNum: 1,
        pageSize: 10,
        timeRange: [startDate,endDate],//2020/11/11 - 2020/12/10
        taskNoStr: '',
        userNameStr: ''    
      },
      tableData:[],
      multipleSelection:[],
      cardFieldsData:[],
      rules: {
        name: [{ required: true, message: "请输入名称", trigger: "blur" }],
      },
    };
  },
  computed: {
    timeArrRange() {
      let startDate = Lang.formatDate(new Date() - 29 * 24 * 60 * 60 * 1000,"YYYY-MM-DD");
      let endDate = Lang.formatDate(new Date(), "YYYY-MM-DD");
      
      this.form.timeRange = `${startDate.replace(/-/g, '/')} - ${endDate.replace(/-/g, '/')}`;
      return [startDate,endDate]
    },

    columns() {
      let cardFields = this.cardFieldsData.filter((item)=>item.cardId==this.id);

      if(cardFields.length) return cardFields[0].fields;
      return [];
    }
  },
  methods: {
    openDialog() {
      this.visible = true;
      if(this.id) {
        this.form.cardId = this.id;
        this.getCardFields()
        this.getCardCountReq();
      }
    },
    onClose(form) {
      this.visible = false;
    },
    //导出统计
    exportStatistics() {
    },

    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    /**
     * @description 页大小改变操作
     * @param {Number} pageSize 页大小
     */
    handleSizeChange(pageSize) {

      this.form.pageSize = pageSize;
      this.form.pageNum = 1;

    },
    /**
     * @description 页码跳转
     * @param {Number} pageNum 页码
     */
    jumpPage(pageNum) {
      this.form.pageNum = pageNum;
    },

    //获取统计Fields列表
    getCardFields() {
      SettingTaskApi.getCardFields().then(res=>{
        const { status, message, data } = res;
        if( status == 0 ){
          this.cardFieldsData = data;
        }
      }).catch(error=>{})
    },

    //获取统计列表
    getCardCountReq() {
      SettingTaskApi.getCardCount(this.form).then(res=>{
        const { status, message, list } = res;
        let cardList = list
        this.tableData = list;
      }).catch(error=>{

      })

    },
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
      }
      .statistical-table{
        padding: 0;
        margin-top: 17px;  
      }
      .table-footer{
        margin-top: 17px;
      }
    }
    

  }
}
</style>