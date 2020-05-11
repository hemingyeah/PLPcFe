<!-- Author: sixgod -->
<template>
  <el-dialog :visible.sync="dialogVisiable" width="700px">
    <div class="dialog-title" slot="title">绩效明细</div>
    <div class="dialog-wrapper">
      <el-table class="table-body"  stripe :data="list">
        <el-table-column
          prop="taskNo"
          show-overflow-tooltip
          label="工单编号">
          <template slot-scope="scope">
            <a href="javascript:;" @click="showTaskView(scope.row)">{{scope.row.taskNo}}</a>
          </template>
        </el-table-column>
        <el-table-column
          prop="custName"
          show-overflow-tooltip
          label="客户">
        </el-table-column>
        <el-table-column
          prop="target"
          width="80"
          show-overflow-tooltip
          label="对象">
        </el-table-column>
        <el-table-column
          prop="role"
          width="80"
          label="角色">
        </el-table-column>
        <el-table-column
          prop="type"
          width="80"
          label="绩效方式">
        </el-table-column>
        <el-table-column
          prop="result"
          label="绩效结果">
        </el-table-column>
      </el-table>
      <div class="btn-bar">
        <el-button type="primary" @click="doExport" :loading="pending" :disabled="pending">导出</el-button>
      </div>
    </div>
    <div ref="bridge" class="base-export-bridge"></div>
  </el-dialog>
</template>

<script>
import qs from '../../../util/QueryString';
import DateUtil from '../../../util/DateUtil'
export default {
  data(){
    return {
      dialogVisiable: false,
      list:[],
      pending: false
    }
  },
  methods: {
    open(data){
      console.info(data)
      this.name = data.oName === undefined ? data.uName : data.oName;
      this.type = data.type;
      this.list = this.normalizeList(data.mes);
      this.mid = data.mainId;
      this.oid = data.oid;
      this.dialogVisiable = true;
    },
    normalizeList(mes) {
      let res = this.type == '计分' ? 'score' : 'money';
      let list = [];
      for(let item of mes) {
        list.push({
          taskNo: item.taskNo,
          taskId: item.taskId,
          custName: item.comstumer.name,
          target: item.userName,
          role: item.userRole == 'wcr' ? '负责人' : '协同人',
          type: this.type,
          result: item[res] + (res == 'score' ? '分' : '元')
        })

      }
      
      return list;
    },
    doExport(){
      this.pending = true;
      let url = '/performance/totalExport'
      let fileName = `${DateUtil.format(new Date(),'yyyy-MM-dd')}${this.name}绩效报告明细.xlsx`;
      let model = {
        mid: this.mid,
        oid: this.oid
      }

      let ua = navigator.userAgent;
      if (ua.indexOf('Trident') >= 0){
        window.location.href = `${url}?${qs.stringify(model)}`;
        this.visible = false;
        return
      }
      this.$http.get(`${url}?${qs.stringify(model)}`, {}, {responseType: 'blob'}).then(blob => { 
        let link = document.createElement('a');
        let url = URL.createObjectURL(blob);
        link.download = fileName;
        link.href = url;
        this.$refs.bridge.appendChild(link)
        link.click();
        this.visible = false;
        this.pending = false;
        setTimeout(() => {
          URL.revokeObjectURL(url);
          this.$refs.bridge.removeChild(link)
        }, 150);
      }).catch(err => {
        console.error(err);
         this.pending = false;
        })
    },
     showTaskView(row){
      //查看工单详情
      this.$platform.openView({
        id:'taskView_' + row.taskId,
        title: `工单${row.taskNo}`,
        url: `/task/view/${row.taskId}`,
        close: true
      })
    }
  }
}

</script>
<style lang='scss' scoped>
.dialog-wrapper {
  padding: 10px;
  .table-body {
    max-height: 450px;
    overflow: auto;
  }
  .btn-bar {
    text-align: right;
    margin-top: 10px;
  }
}
.base-export-bridge{
  position: absolute;
  top: -1000px;
  left: -1000px;

  a{
    display: block;
    border: none;
    outline: none;
    width: 0;
    height: 0;
  }
}
</style>