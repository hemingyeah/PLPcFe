<!-- 
  Author: sixgod 
  绩效报告
-->
<template>
<div class="page">
  <div class="report-wrapper" style="margin: 0;">
    <div class="report-panel info-panel">
      <h1 class="report-name">{{report.pname}}</h1>
      <table class="report-info">
        <tr>
          <th>规则名称</th>
          <td>{{report.ruleName}}</td>
        </tr>
        <tr>
          <th>创建时间</th>
          <td>{{ctTime}}</td>
        </tr>
        <tr>
          <th>统计范围</th>
          <td>{{report.totalSize}} 条</td>
        </tr>
        <tr>
          <th>规则命中</th>
          <td>{{report.hitSize}} 条</td>
        </tr>
        <tr>
          <th>统计方式</th>
          <td>{{report.ptype == 'jifen' ? '计分' : '奖金'}}</td>
        </tr>
        <tr>
          <th>统计状态</th>
          <td>{{report.taskType == "0" ? "已完成" : "已完成并结算"}}</td>
        </tr>
        <tr>
          <th>起止时间</th>
          <td>{{duration}} ({{report.timeType == 'balanceTime' ? '结算时间' : '完成时间'}})</td>
        </tr>
        <tr>
          <th>备注</th>
          <td>{{report.remark}}</td>
        </tr>
      </table>
    </div>
    <div class="table-wrapper">
      <div class="report-panel button-bar">
        <el-button  type="primary" @click="doExport" :loading="pending" :disabled="pending">导出</el-button>
      </div>
      <div class="report-panel">
        <el-table stripe :data="list">
          <el-table-column
            :prop="type=='团队' ? 'oName': 'uName'"
            label="对象">
          </el-table-column>
          <el-table-column
            prop="hitsize"
            label="命中规则">
          </el-table-column>
          <el-table-column
            label="绩效方式">
            <template slot-scope="scope">
              {{rewardType}}
            </template>
          </el-table-column>
          <el-table-column
            label="绩效结果">
            <template slot-scope="scope">
              {{rewardType == '计分' ? scope.row.score + '分' : scope.row.money + '元'}}
            </template>
          </el-table-column>
          <el-table-column
            label="明细">
            <template slot-scope="scope">
              <el-button
                size="mini"
                :disabled="scope.row.disabled"
                @click="showDetil(scope.row)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
  <report-detil ref="dialogDetil"></report-detil>
  <div ref="bridge" class="base-export-bridge"></div>
</div>
  
</template>

<script>
import queryString from '../../../util/QueryString';
import errorMsg from '../common/errorMsg';
import ReportDetil from './ReportDetil.vue';
import DateUtil from '../../../util/DateUtil';
import qs from '../../../util/QueryString';
export default {
  data(){
    return{
      report: {
        pname: '数据加载中...'
      },
      list:[],
      type: '个人',
      rewardType: '计分',
      pending: false
    }
  },
  computed: {
    duration(){
      if(!this.report.startTime) {
        return '';
      }
      return `${DateUtil.format(new Date(this.report.startTime), 'yyyy-MM-dd')}至${DateUtil.format(new Date(this.report.endTime), 'yyyy-MM-dd')}`
    },
    ctTime() {
      return this.report.createTime ? DateUtil.format(new Date(this.report.createTime), 'yyyy-MM-dd h:mm') : ''
    }
  },
  async created(){
    let url = window.location.href;
    if(url.indexOf('?') != -1){
      this.param = queryString.parse(url.split('?')[1]);
      try {
        this.loading = this.$loading();
        let res = await this.$http.get('/performance/detailsSort', this.param);
        if(res.succ) {
          this.normalizeData(res);
          this.mes = res.data.list[0].mes;
        }else {
          throw new Error(res.message)
        }
      }catch(e) {
        console.error(e)
        errorMsg(this, e)
      }finally {
        this.loading.close()
      }
    }
  },
  methods: {
    showDetil(row){
      let name = this.type == '团队' ? 'oName' : 'uName';
      let data = {
        type: this.rewardType,
        mes: this.mes[row.userId],
        target: row[name],
        mainId: row.mainId,
        uName: row.uName,
        oName: row.oName,
        oid: row.userId
      }
      this.$refs.dialogDetil.open(data)
    },
    addNoHit(res){
      let map = {};
      let key;
      let tagName;
      if(this.report.settleType == 'tuandui') {
        key = 'oName';
        tagName = 'tagName';
      }else {
        key = 'uName';
        tagName = 'loginName';
      }
      let list = res.data.list;
      for(let tag of res.data.tags){
        map[tag[tagName]] = false;
      }
      for(let item of list) {
        map[item[key]] = true;
      }
      for(let tName in map) {
        if(!map[tName]) {
          let noHit = {
            hitsize: 0,
            score: 0,
            money: 0,
            disabled: true,
          };
          noHit[key] = tName;
          list.push(noHit)
        }
      }
    },
    normalizeData(res){
      this.report = res.data.list[0].data;
      this.report.ruleName = res.data.list[0].ruleName;
      this.report.remark = res.data.list[0].remark;
      this.addNoHit(res);
      //
      for(let element of res.data.list){
        if(element.disabled) continue;
        let reps = element.mes[element.userId];
        let hit = 0;
        if(reps){
          reps.forEach(rep => {
            if(rep.userRole == 'wcr' || rep.userRole == 'xzr') hit++;
          })
        }

        element.hitsize = hit;
      }
     this.list = res.data.list;
      this.type = this.report.settleType == 'tuandui' ? '团队' : '个人';
      this.rewardType = res.data.list[0].type === 'jifen' ? '计分' : '奖金';
    },
    doExport(row) {
      this.pending = true;
      let fileName = `${DateUtil.format(new Date(),'yyyy-MM-dd')}绩效报告明细.xlsx`;
      let model = {
        ids: this.param.id
      }
      let ua = navigator.userAgent;
      if (ua.indexOf('Trident') >= 0){
        window.location.href = `/performance/outputDs?${qs.stringify(model)}`;
        this.visible = false;
        return
      }
    
      this.$http.get(`/performance/outputDs?${qs.stringify(model)}`, {}, {responseType: 'blob'}).then(blob => { 
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
    }
  },
  components: {
    ReportDetil
  }
}

</script>
<style lang='scss' scoped>
  .report-wrapper {
    display: flex;
    flex-flow: row nowrap;
    margin: 10px;
    color: #444;
    
    .report-panel {
      margin-bottom: 10px;
      padding: 10px;
      background-color: #FFF;
    }
    .info-panel{
      width: 320px;
      .report-name {
        margin: 0 0 10px;
        font-size: 16px;
        font-weight: 600;
        padding-bottom: 10px;
        border-bottom: 1px solid #F4F4F4;
      }
      .report-info {
        width: 100%;
        th {
          text-align: right;
          width: 80px;
          padding: 10px;
          vertical-align: top;
        }

        th,td{
          padding: 5px 10px;
        }
      }
    }
    .table-wrapper{
      flex: 1;
      margin-left: 10px;
      overflow: auto;
    }
    .button-bar {
      text-align: right;
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