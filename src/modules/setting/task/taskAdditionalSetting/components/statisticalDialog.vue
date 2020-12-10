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
            v-model="form.timeRange"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
          <el-input v-model="form.taskNoStr" placeholder="请输入工单编号"></el-input>
          <el-input v-model="form.userNameStr" placeholder="请输入操作人"></el-input>
          <el-button type="primary" >搜索</el-button>
        </div>
        <div class="search-right">
           <el-button type="primary" plain @click="onSubmit('form')"  >导出</el-button>
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
          <el-table-column
            type="selection"
            width="55">
          </el-table-column>
          <el-table-column
            prop="name"
            label="工单编号"
            width="120">
            <template slot-scope="scope">{{ scope.row.date }}</template>
          </el-table-column>
          <el-table-column
            prop="name"
            label="礼品"
            width="120">
          </el-table-column>
          <el-table-column
            prop="name"
            label="收货人"
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
              v-if="this.tableData.length"
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
      <el-button @click="onClose('form')">取 消</el-button>
      <el-button type="primary" @click="onSubmit('form')" >确 定</el-button>
    </div>
  </base-modal>
</template>
<script>
// api
import * as SettingTaskApi from "@src/api/SettingTaskApi";

export default {
  name: 'statistical-dialog',
  data() {
    return {
      visible: true,
      totalElements:100,
      form: {
        cardId: '6a4bde67-11ad-11eb-a442-00163e304a25',
        pageNum: 1,
        pageSize: 10,
        timeRange: '',//2020/11/11 - 2020/12/10
        taskNoStr: '',
        userNameStr: ''
       
      },
      tableData:[{
        name:"测试111"

      }],
      multipleSelection:[],
      rules: {
        name: [{ required: true, message: "请输入名称", trigger: "blur" }],
      },
    };
  },
  methods: {
    openDialog() {
      this.visible = true;
      if(this.form.id) {
        this.getCardInfoReq()
      }
    },
    onClose(form) {
      this.visible = false;
      this.$refs[form].resetFields();
    },
    onSubmit(form) {
      this.$refs[form].validate((valid) => {
        if (valid) {
          alert("submit!");
        } else {
          console.log("error submit!!");
          return false;
        }
      });
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

      this.search("", false);
    },
    /**
     * @description 页码跳转
     * @param {Number} pageNum 页码
     */
    jumpPage(pageNum) {
      this.form.pageNum = pageNum;
      this.tableData = [];
      this.search(this.searchParams, false);
    },
    //获取附加组件的信息
    getCardInfoReq() {
      SettingTaskApi.getCardInfo({id:this.form.id}).then(res=>{
        const { status, message, data } = res;
        if( status == 0 ){
          this.form = data;
        }

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