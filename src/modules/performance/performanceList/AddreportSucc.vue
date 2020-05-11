<!-- Author: sixgod -->
<template>
  <el-dialog width="500" :visible.sync="dialogVisible" :close-on-click-modal="false">
    <div class="dialog-title" slot="title">统计成功</div>
    <table style="border-spacing: 30px 10px">
      <tr>
        <td>报告名称：</td><td>{{reportSummary.name}}</td>
        <td>起止时间：</td><td>{{reportSummary.time}}</td>
      </tr>
      <tr>
        <td>统计范围：</td><td>{{reportSummary.allsize + '条'}}</td>
        <td>规则命中：</td><td>{{reportSummary.hitsize + '条'}}</td>
      </tr>
    </table>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="showDetil">查看详情</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  data(){
    return {
      dialogVisible: false,
      reportSummary: {}
    }
  },
  methods:{
    open(data) {
      console.info(data)
      this.reportSummary = data;
      this.dialogVisible = true
    },
    showDetil() {
      this.dialogVisible = false;
      //查看绩效报告
      this.$platform.openView({
        id:'u_performanceReport_report' + '_' + this.reportSummary.mainId,
        title: '绩效报告',
        url: '/performance/report' + '?id=' + this.reportSummary.mainId,
        close: true
      })
    }
  }
}

</script>
<style lang='scss'>
  .dialog-footer {
    text-align: center;
  }
</style>