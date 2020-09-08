<!-- 
  Author: sixgod
  新增绩效报告表单，只进行信息的收集，提交动作在父组件中完成
 -->
<template>
  <el-dialog :visible.sync="dialogFormVisible" width="600px" :close-on-click-modal="false">
    <div class="dialog-title" slot="title">新增绩效报告</div>
    <div class="form-wrapper">
      <el-form label-width="130px" :model="formData" :rules="validates" ref="form">
        <el-form-item label="报告名称" prop="name" placeholder="请输入报告名称">
          <el-input v-model="formData.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="选择规则" prop="rule">
          <el-select v-model="formData.rule" placeholder="请选择规则" @change="ruleChange">
            <el-option v-for="rule in rules" :key="rule.prId" :label="rule.prName" :value="rule.prId"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="规则说明">
          <el-input type="textarea" autosize readonly v-model="formData.description"></el-input>
        </el-form-item>

        <h2 class="form-area-title">报告统计对象</h2>

        <el-form-item label="统计以下对象" prop="targets">
          <div class="performance-rule-row">
            <el-select :value="formData.target" @input="_getOptions" style="width:140px;">
              <el-option label="按部门" value="dept"></el-option>
              <el-option label="按人员" value="person"></el-option>
            </el-select>

            <el-select style="margin-left:5px;"
              v-model="formData.multiOps"
              multiple
              filterable
              collapse-tags
              :loading="selectLoading">
                <el-option
                  v-for="item in multiOps"
                  :key="item[multiValue]"
                  :label="item[multiDisplay]"
                  :value="item[multiValue]">
                </el-option>
            </el-select>
            <el-button style="margin-left:5px;height:32px;" 
              @click="chooseAll"
              :disabled="multiOps.length <= 0">选择全部</el-button>
          </div>
        </el-form-item>
       
        <el-form-item label="状态">
          <el-select v-model="formData.status" style="width:140px">
            <el-option label="已完成" value="finish"></el-option>
            <el-option label="已完成并结算" value="finishAndCacu"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="完成时间" prop="dur">
          <el-select v-model="formData.timeType" v-if="formData.status == 'finishAndCacu'" slot="label" style="width: calc(100% - 20px)">
            <el-option value="completeTime" label="完成时间"></el-option>
            <el-option value="balanceTime" label="结算时间"></el-option>
          </el-select>
          <el-date-picker
            v-model="formData.dur"
            style="width: 100%;"
            type="daterange"
            align="right"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :default-value="[new Date(),new Date()]"
            :picker-options="pickerOptions">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="备注">
          <el-input type="textarea" autosize v-model="formData.remarks" maxlength="500"></el-input>
        </el-form-item>
      </el-form>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogFormVisible = false">取 消</el-button>
      <el-button type="primary" :disabled="pending" @click="validateForm">运行绩效报告</el-button>
    </div>
  </el-dialog>
</template>

<script>
import errMsg from '../common/errorMsg'
import _ from 'lodash'
const INIT_FORM_DATA = {
  multiOps: [],
  status: 'finish',
  timeType: 'completeTime'
}
let cache = {};
export default {
  props:{
    rules:{
      type: Array,
      default: () => []
    }
  },
  data(){
    return {
      dialogFormVisible: false,
      formData: _.assign({}, INIT_FORM_DATA),
      multiOpsType: '',
      multiOps:[],
      selectLoading: false,
      pending: false,
      all: false,
      pickerOptions: {
        //不能选择今天之后的日期
        disabledDate(d){
          if(d > new Date()){
            return true
          }
          return false
        }
      },
      validates:{
        name: [
          { required: true, message:'请输入报告名称', trigger: 'blur' },
          { max: 50, message: '长度应在50个字以内', trigger: 'blur' }
        ],
        rule: [
          { required: true, message: '请选择绩效规则', trigger: 'blur'}
        ],
        dur:[
          { validator: this.durationVali, trigger: 'blur' }
        ],
        targets:[
          {validator: this.targetsVali}
        ],
        targetType: [
          {validator: this.targetTypeVali}
        ]
      }
    }
  },
  computed:{
    multiDisplay(){
      //根据统计对象为团队或个人来切换展示字段
      return this.multiOpsType == 'dept' ? 'tagName' : 'loginName'
    },
    multiValue() {
      //根据统计对象为团队或个人来切换值字段
      return this.multiOpsType == 'dept' ? 'id' : 'userId'
    }
  },
  watch:{
    // 'formData.multiOps':function(){
    //   //多选项发生改变时全选状态随之改变
    //   this.all = this.formData.multiOps.length && this.formData.multiOps.length == this.multiOps.length;
    // },
    'formData.rule':function(){
      //切换绩效规则清空选择项
     this.formData = _.assign({}, INIT_FORM_DATA, {
        name: this.formData.name,
        rule: this.formData.rule,
        description: this.formData.description

      })
    }
  },
  methods:{
    open(retain){
      //弹出表单方法，retain为是否保留表单中上次填写的信息
      if(!retain) {
        //清空多选下拉框
        this.multiOps = [];
        //清空多选项
        this.formData = _.assign({}, INIT_FORM_DATA)
      }
      this.all = false;

      this.$nextTick(() => {
        this.dialogFormVisible = true;
        this.$refs.form && this.$refs.form.clearValidate();
      })
    },
    close(){
      //关闭表单
      this.dialogFormVisible = false;
    },
    finished(){
      //请求处理完成 解禁提交按钮
      this.pending = false;
    },
    getData(){
      //用于父组件获取表单数据
      return this._nomalizeFormData()
    },
    validateForm(){
      //对表单进行验证
      this.$refs.form.validate((valid) => {
        if(!valid) return false;
        this._runPerfomanceReport()
      })
    },
    ruleChange(value){
      //回显规则描述
      for(let rule of this.rules){
        if(rule.prId == value) {
          this.formData.description = rule.description;
          break;
        }
      }
    },
    durationVali(rule, value, cb){
      //时间范围选择验证 
      let dur = this.formData.dur;
      let errs = [];
      if(!dur || dur.length < 2) {
        errs.push(new Error('请选择起始时间'));
      }else if(Math.abs(dur[0] - dur[1]) > 92 * 24 * 60 * 60 * 1000) {
        errs.push(new Error('时间跨度不能大于3个月'))
      }
      cb(errs);
    },
    async _getOptions(type) {
      this.formData.target = type;
      this.formData.multiOps = [];
      this.multiOpsType = type;

      if(cache[type]) {
        this.multiOps = cache[type]
        return;
      }

      this.selectLoading = true;
      let url = type == 'dept' ? '/performance/getTags' : '/performance/getUsers';
      try{
        let res = await this.$http.get(url);
        if(res.succ) {
          this.multiOps = res.data;
          cache[type] = res.data;
        }
      }catch(e){
        errMsg(this,e);
      }

      this.selectLoading = false;
    },
    _nomalizeFormData() {
      let data = {
        //报告名
        name: this.formData.name,
        //开始时间
        stime: this._dateTransfer(this.formData.dur[0]),
        //结束时间
        etime: this._dateTransfer(this.formData.dur[1]),
        //绩效规则
        rule: this.formData.rule,
        //备注
        remarks: this.formData.remarks,
        //结算方式 first: 结算 screen: 去重结算 continuation: 继续结算
        sign: 'first'
      }
      let targets;
      if(this.all) {
        targets = 'all'
      }else {
        //后端需要数据结尾带个逗号
        targets = this.formData.multiOps.join(',') + ',';
      }
      if(this.formData.target == 'dept') {
        data.oid = targets;
      }else {
        data.users = targets;
      }
      if(this.formData.status == 'finishAndCacu') {
        data.state = 1;
        data.timeType = this.formData.timeType
      }

      return data;
    },
    _dateTransfer(date) {
      //将时间处理成YYYY-MM-DD
      let year = date.getFullYear();
      let month = date.getMonth() + 1;
      month < 10 && (month = '0' + month);
      let day = date.getDate();
      day < 10 && (day = '0' + day);
      return year + '-' + month + '-' + day
    },
    async _runPerfomanceReport(data) {
      //通知父组件提交数据
      this.pending = true;
      this.$emit('submit');
    },
    chooseAll() {
      //全选
      this.all = !this.all;
      let list = [];
      if(this.all) {
        for(let item of this.multiOps) {
          list.push(item[this.multiValue])
        }
        this.formData.multiOps = list;
      }else {
        this.formData.multiOps = [];
      }

      this.$refs.form.validateField('targets')
    },
    targetsVali(rule, value, cb) {
      //统计对象必填
      if(!this.formData.multiOps.length){
        cb([new Error('请选择统计对象')])
      }else{
        cb()
      }
    },
    targetTypeVali(rule, value, cb) {
      //统计对象必填
      if(!this.formData.target){
        cb([new Error(' ')])
      }else{
        cb()
      }
    }
  }
}

</script>
<style lang='scss'>
  .el-select__tags-text {
    display: inline-block;
    vertical-align: middle;
    max-width: 70px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .el-input__inner {
    height: 32px !important;
  }
  .dialog-title {
    text-align: center;
    font-size: 18px;
  }
  .form-area-title {
    font-size: 16px;
    text-align: center;
    color: #333!important;
  }
  .select-all {
    background-color: #FFF!important;
  }
  .inline-item {
    display: inline-block;
  }
  .no-margin {
    margin: 10px;
    div {
      margin-left: 0 !important;
    }
  }

  .el-form-item{
    margin-bottom: 0px;
  }

  .el-form-item__error{
    position: relative;
  }

  .performance-rule-row{
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
  }
</style>