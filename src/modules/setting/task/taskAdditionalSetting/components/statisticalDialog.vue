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
          <el-button type="primary" @click="onSearch">搜索</el-button>
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
          tooltip-effect="dark"
          @selection-change="handleSelectionChange">
          <el-table-column prop="taskNo" label="工单编号" width="150"></el-table-column>

          <!-- start 非工时记录列表数据 -->
          <template v-if="card.specialfrom != '工时记录'">
            <el-table-column  
              v-for="(column, index) in columns" 
              :key="`${column.field}_${index}`"
              :prop="column.fieldName" 
              :label="column.displayName"
              :min-width="column.minWidth || '120px'">
              <template slot-scope="scope">
              <!-- start 自定义字段 -->
                <template v-if="scope.row.taskCardInfo.attribute[column.fieldName]">
                  <template v-if="isMulti(column)">
                    {{ (scope.row.taskCardInfo.attribute[column.fieldName] || []).join('，') }}
                  </template>
                   <template v-else-if="column.formType == 'attachment'">
                    <span class="column-attachment" v-if="scope.row.taskCardInfo.attribute[column.fieldName] && scope.row.taskCardInfo.attribute[column.fieldName].length">
                    <i class="iconfont icon-attachment"></i>
                    共{{ scope.row.taskCardInfo.attribute[column.fieldName].length }}个附件
                  </span>
                  </template>
                  <template v-else>
                    {{scope.row.taskCardInfo.attribute[column.fieldName]}}
                  </template>
                </template>
                <!-- end 自定义字段 -->
                <template v-else>
                  {{ scope.row[column.fieldName] }}
                </template>
              </template>
            </el-table-column>
            <el-table-column prop="userName" label="操作人">
              <template slot-scope="scope">
                <template v-if="scope.row.taskCardInfo.attribute['userName']">
                  <template >
                    {{scope.row.taskCardInfo.attribute['userName']}}
                  </template>
                </template>
              </template>
            </el-table-column>
            <el-table-column prop="updateTime" label="操作时间" width="160" >
              <template slot-scope="scope">
                <template v-if="scope.row.taskCardInfo.attribute['updateTime']">
                  <template >
                    {{scope.row.taskCardInfo.attribute['updateTime'] | formatDate}}
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

                <!-- start 附件类型 -->
                <template v-if="column.formType === 'attachment'">
                  <span class="column-attachment" v-if="scope.row[column.fieldName] && scope.row[column.fieldName].length">
                    <i class="iconfont icon-attachment"></i>
                    共{{ scope.row[column.fieldName].length }}个附件
                  </span>
                </template>
                <!-- end 附件类型 -->

                <!-- start 多选 -->
                <template v-else-if="isMulti(column)">
                  {{ (scope.row[column.fieldName] || []).join('，') }}
                </template>
                <!-- end 多选 -->

                <!-- start 开始结速时间 -->
                <template v-else-if="column.fieldName === 'startTime' || column.fieldName === 'endTime' || column.fieldName === 'operateTime'">
                  {{scope.row[column.fieldName] | formatDate}}
                </template>
                <!-- end 开始结速时间 -->

                <template v-else>
                  {{ scope.row[column.fieldName] }}
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
import * as SettingTaskApi from "@src/api/SettingTaskApi";
// util
import { formatDate } from "@src/util/lang/index.js";
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
      visible: false,
      totalElements:100,
      form: {
        cardId: '6a4bde67-11ad-11eb-a442-00163e304a25',
        pageNum: 1,
        pageSize: 10,
        timeRange: [],//2020/11/11 - 2020/12/10
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
  filters: {
    formatDate(val) {
      if (!val) return '';
      return formatDate(val, 'YYYY-MM-DD HH:mm')
    }
  },
  computed: {
    /** 
    * @description 默认时间
    */
    timeArrRange() {
      let startDate = formatDate(new Date() - 29 * 24 * 60 * 60 * 1000,"YYYY-MM-DD");
      let endDate = formatDate(new Date(), "YYYY-MM-DD");
      
      this.form.timeRange = `${startDate.replace(/-/g, '/')} - ${endDate.replace(/-/g, '/')}`;
      return [startDate,endDate]
    },

    /** 
    * @description 表头设置
    */
    columns() {
      let cardFields = this.cardFieldsData.filter((item)=>item.cardId==this.card.id);
       if(cardFields.length>0){
        if(this.card.specialfrom == '工时记录'){
          let fields = fieldUtil.toTableFields(cardFields[0].fields, this.card.config);
          return fields.filter(field => field.enabled == 1);
        }else{
          cardFields[0].fields.forEach(item=>{
            if(item.formType == 'attachment'|| item.formType == 'datetime'){
              item.minWidth = '160' ;
            }
          })
          return cardFields[0].fields;
        }
       }
    }
  },
  methods: {
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
      if(this.card.id) {
        this.form.cardId = this.card.id;
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
        if(this.card.specialfrom != '工时记录'){  
          this.tableData = list.map(item=>{
            // if(JSON.stringify(item.taskCardInfo)!=='{}'&&item.taskCardInfo.inputType) return item
          })
        }else{
          this.tableData = list;
        }
        
      }).catch(error=>{

      })

    },
    isJOSN:function (value) {
      if (typeof Array.isArray === "function") {
        return Array.isArray(value);
      }else{
        return Object.prototype.toString.call(value) === "[object Array]";
      }
    },
    isAttachment:function (value) {
      console.log(value)
      if(value && value.length>0){
        for(var i=0;i<value.length;i++){
            if(value[i].id){
                return true
            }else{
                return false
            }
        }
      }else {
        return false
      }
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