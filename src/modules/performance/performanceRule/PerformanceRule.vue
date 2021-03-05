<template>
  <div class="page clearfix container">
    <!-- 导航 -->
    <manage-nav :data="nav" :current="current"></manage-nav>

    <div class="setting-panel-wrapper">
      <div class="setting-panel" ref="loadingWrapper">
        <div class="setting-panel-header">
          <!-- 说明信息 -->
          <el-tooltip placement="bottom-start" effect="light" popper-class="tip-popper" :visible-arrow="false" content="绩效管理模块可以帮助企业管理针对服务部门和服务人员的定期绩效数据统一，根据您在这里配置的规则到绩效管理创建绩效统计报告。">
            <h3 class="title"><span>绩效规则</span> <i class="iconfont icon-tip"></i></h3>
          </el-tooltip>
          <!-- 添加按钮 -->
          <el-button icon="el-icon-plus" type="primary" @click="addRule">添加</el-button>
        </div>
        <div class="setting-table">
          <!-- 列表 -->
          <el-table stripe style="width: 100%" :data="tableData">
            <el-table-column prop="prName" show-overflow-tooltip label="规则名称" width="150"></el-table-column>
            <el-table-column prop="description" label="规则说明" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column prop="rewardType" label="类别" width="80">
              <template slot-scope="scope">{{scope.row.rewardType == 'jifen'? '计分':'奖金'}}</template>
            </el-table-column>
            <el-table-column prop="effect" label="启用/禁用" width="100">
              <template slot-scope="scope">
                <el-switch
                  active-value="1"
                  inactive-value="0"
                  v-model="scope.row.effect"
                  :disabled="pending"
                  @change="toggle(scope.row)">
                </el-switch>
                <span> {{scope.row.effect == 1 ? '启用' : '禁用'}}</span>
              </template>
            </el-table-column>
            <el-table-column prop="operate" label="操作" width="150px">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  @click="editRule(scope.$index, scope.row)">编辑</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  @click="deleteRule(scope.$index, scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <!-- 分页条 -->
        </div>
      </div>
    </div>
    <!-- 弹出表单 -->
    <rule-form-dialog ref="dialog" @success="_getRuleList"></rule-form-dialog>
  </div>
</template>
<script>
import manageNav from './components/ManageNav.vue';
import ruleFormDialog from './components/rule-form-dialog/RuleFormDialog.vue';
export default {
  data(){
    return {
      current: '绩效规则',
      tableData: [],
      pending: false,
      nav: {
        title: '绩效报告设置',
        list: [
          {
            title: '绩效规则'
          }
        ]
      }
    }
  },
  mounted(){
    this._getRuleList()
  },
  methods:{
    async _getRuleList(){
      this.tableLoading = this.$loading({
        target: this.$refs.loadingWrapper
      })
      try{
        let res = await this.$http.get('/performance/seAllRule');
        if(res.succ){
          this.tableData = res.data;
          this.tableLoading.close();
        }else {
          throw new Error('')
        }
      }catch(e){
        let message = '';
        if(e.response){
          message = e.response.status + ':' + e.response.statusText
        }else if(e.message) {
          message = e.message
        }
        this.$notify({
            title: '错误',
            message,
            type: 'error'
        });
        this.tableLoading.close()
      }
      
    },
    editRule(index){
      this.$refs.dialog.open(this.tableData[index])
    },
    async deleteRule(index){
      try {
        if(!await this.$platform.confirm('确定要删除该条规则吗?')) return;
        let parm = {id: this.tableData[index].prId}
        let res = await this.$http.post('/performance/deleteRule',parm,false)
        if(res.succ){
          this.$notify({
            title: '删除成功',
            type: 'success'
          });
          this._getRuleList()
        }else {
          throw new Error(res.message)
        }
      }catch(e){
        if(e == 'cancel') return;
        this.$notify({
          title: '删除失败',
          type: 'error'
        });
      }
    },
    addRule(){
      this.$refs.dialog.open()
    },
    async toggle(row){
      let url = row.effect == '0' ? 'stopRule' : 'startRule';
      try{
        this.pending = true;
        let res = await this.$http.post('/performance/' + url,{id: row.prId},false);
        if(!res.succ){
          throw new Error(res.message)
        }
      }catch(e){
        row.effect = Math.abs(row.effect - 1) + '';
        this.$notify({
          title: '错误',
          //message: e,
          type: 'error'
        })
      }finally {
        this.pending = false;
      }
    }
  },
  components: {
    manageNav,
    ruleFormDialog
  }
}
</script>
<style lang="scss">
  .container {
    min-width: 960px;
  }
  .clearfix::after {
    display: block;
    content: '';
    clear: both;
  }
  .tip-popper {
    border: none!important;
    width: 500px;
    font-size: 14px;
    letter-spacing:1px;
    font-weight: normal;
    color: #444;
    box-shadow: 0 0 4px #ddd;
  }
  .setting-panel-wrapper {
    width: 75%;
    padding-left: 10px;
    float: left;

    .setting-panel {
      padding: 10px;
      background-color: #FFF;
      border-radius: 4px;
    }
  }
  .setting-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .title {
      line-height: 28px;
      margin: 0;
      font-size: 16px;
      padding-left: 10px;

      cursor: pointer;
      &:hover {
        color: #76838f !important;
      }
    }
  }
</style>


