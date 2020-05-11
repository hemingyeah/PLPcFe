<template>
  <el-dialog :visible.sync="dialogFormVisible" width="720px" :close-on-click-modal="false" >
    <div class="dialog-title" slot="title">{{title}}</div>
    <div class="form-wrapper" v-loading="loading">
      <el-form label-width="100px" :model="formData" :rules="rules" ref="form">
        <el-form-item label="规则名称" prop="prName">
          <el-input v-model="formData.prName" auto-complete="off" placeholder="[最多6个字]"></el-input>
        </el-form-item>
        <el-form-item label="规则说明" prop="description">
          <el-input type="textarea" autosize v-model="formData.description" placeholder="[最多500字]" maxlength="500"></el-input>
        </el-form-item>
        <el-form-item label="类别">
          <el-radio-group :value="formData.rewardType" @input="changeRewardType">
            <el-radio label="jifen">计分制</el-radio>
            <el-radio label="jiangjin">奖金制</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="规则内容" v-if="formData.rewardType=='jifen'">
          <el-form-item class="inline-item error-right" prop="comPerson">
            按照工单完成数量：负责人每个计
            <el-popover
              placement="top-start"
              width="200"
              trigger="focus"
              content="请输入数字，可以有一位小数，最大9999">
              <el-input slot="reference" style="width:100px" v-model="formData.comPerson"></el-input>
            </el-popover>
            分
          </el-form-item>
          <el-form-item class="inline-item error-right" prop="assPerson">
            按照工单完成数量：协同人每个计
            <el-popover
              placement="top-start"
              width="200"
              trigger="focus"
              content="请输入数字，可以有一位小数，最大9999">
              <el-input slot="reference" style="width:100px" v-model="formData.assPerson"></el-input>
            </el-popover>
            分
          </el-form-item>
        </el-form-item>
        <el-form-item label="规则内容" v-else >
          <el-form-item class="inline-item error-top" prop="comPerson">
            按照工单完成数量：每单的负责人按照
            <el-form-item class="inline-item error-right" prop="comType">
              <el-select v-model="formData.moneyType" placeholder="请选择" style="width: 100px">
                <el-option
                  v-for="item in rewardType"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            {{formData.moneyType == 'geshu' ? '每个得' : '的'}}
            <el-popover
              placement="top-start"
              width="200"
              trigger="focus"
              :content="`请输入数字，可以有一位小数，最大${this.formData.moneyType == 'geshu' ? 9999: 100}`">
                <el-input slot="reference" style="width:80px" v-model="formData.comPerson"></el-input>
            </el-popover>
            {{formData.moneyType == 'geshu' ? '元' : '%计算'}}
          </el-form-item>

          <el-form-item class="inline-item" prop="assPerson">
            按照工单完成数量：每单的协同人按照
            <el-form-item class="inline-item error-right" prop="assType">
              <el-select v-model="formData.moneyType" placeholder="请选择" style="width: 100px">
                <el-option
                  v-for="item in rewardType"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            {{formData.moneyType == 'geshu' ? '每个得' : '的'}}
            <el-popover
              placement="top-start"
              width="200"
              trigger="focus"
              :content="`请输入数字，可以有一位小数，最大${this.formData.moneyType == 'geshu' ? 9999: 100}`">
              <el-input slot="reference" style="width:80px" v-model="formData.assPerson"></el-input>
            </el-popover>
            {{formData.moneyType == 'geshu' ? '元' : '%计算'}}
          </el-form-item>
        </el-form-item>
        <el-form-item label="生效条件" prop="termType">
          <div>
              <el-select v-model="formData.screenType" placeholder="请选择" style="width: 110px" @change="screenTypeChange">
              <el-option
                v-for="item in effectiveTerm"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
            <span v-show="formData.screenType !== 'all'">以下条件</span>
          </div>
        
          <template v-if="formData.screenType !== 'all'">
            <el-form-item class="inline-item" prop="screenMsg" style="display:block;">
              <div class="performance-rule-condition">
                <el-form-item class="inline-item" prop="settleType">
                  <el-select v-model="formData.settleType" @change="settleTypeChange" placeholder="请选择" style="width: 110px">
                    <el-option
                      v-for="item in term"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                    </el-option>
                  </el-select>
                </el-form-item>

                <template v-if="formData.settleType == 'customField'">
                  <el-select placeholder="请选择工单类型" class="performance-rule-condition-template" style="margin-left:5px;"
                    :value="formData.taskType" @input="chooseTaskType" key="customField_taskType">
                    <el-option
                      v-for="item in taskType"
                      :key="item.templateId"
                      :label="item.templateName"
                      :value="item.templateId"></el-option>
                  </el-select>

                  <el-select :value="formData.fieldName" @input="chooseField"
                    collapse-tags filterable placeholder="请选择字段" key="customField_field"
                    :loading="screenMsgLoading" class="performance-rule-select" style="margin-left:5px;">
                    <el-option
                      v-for="item in allowFields"
                      :key="item.fieldName"
                      :label="item.displayName"
                      :value="item.fieldName"></el-option>
                  </el-select>

                  <el-select v-model="formData.fieldValue"
                    collapse-tags filterable placeholder="请选择值" key="customField_value"
                    class="performance-rule-select" style="margin-left:5px;">
                    <el-option
                      v-for="item in dataSource"
                      :key="item"
                      :label="item"
                      :value="item">
                    </el-option>
                  </el-select>
                </template>

                <template v-else>
                  <span class="performance-rule-condition-include">包含</span>
                  <el-select v-model="formData.screenMsg" @visible-change="getScreenMsg" 
                    collapse-tags filterable multiple placeholder="请选择" key="other"
                    :loading="screenMsgLoading" class="performance-rule-select">
                    <el-option
                      v-for="item in screenMsg"
                      :key="formData.settleType == 'templateId'? item.templateId : item"
                      :label="formData.settleType == 'templateId'? item.templateName : item"
                      :value="formData.settleType == 'templateId'? item.templateId : item">
                    </el-option>
                  </el-select>
                </template>
              </div>
            </el-form-item>
          </template>
        </el-form-item>
      </el-form>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button type="text" @click="dialogFormVisible = false">取 消</el-button>
      <el-button type="primary" :disabled="pending" @click="validateForm">确 定</el-button>
    </div>
  </el-dialog>
</template>
<script>
import opData from './js/data.js';
import _ from 'lodash';
let screenMsgCache = {};

export default {
  data(){
    
    return {
      loading: false,

      allowFields: [],
      dataSource: [],

      title:'',
      dialogFormVisible: false,
      dialogFormType: 'add',
      formData:_.assign({},opData.INIT_FORM_DATA),
      effectiveTerm: opData.EFFECTIVE_TERM,
      rewardType: opData.REWARD_TYPE,
      term: opData.TERM,
      screenMsgLoading: false,
      screenMsg: [],
      taskType: [],
      taskTypeLoading: false,
      pending: false,
      rules: {
        prName: [
          { required: true, message: '请填写规则名称', trigger: 'blur' },
          { validator: this.repeatVali, trigger: 'blur'},
          { max: 6, message: '长度应在6个字以内', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '请填写规则说明', trigger: 'blur' },
          { max: 500, message: '长度应在500字以内', trigger: 'blur' }
        ],
        comPerson: [
          { required: true, message: ' ', trigger: 'blur' },
          { validator: this.numVali, trigger: 'blur' }
        ],
        assPerson: [
          { required: true, message: ' ', trigger: 'blur' },
          { validator: this.numVali, trigger: 'blur' }
        ],
        settleType: [
          { validator: this.needSelect }
        ],
        screenMsg: [
          { validator: this.needSelectMuti }
        ]
      }
    }
  },
  created(){
    this.getTaskType()
  },
  methods: {
    changeRewardType(value){
      this.formData.rewardType = value;
      this.formData.moneyType = 'lirun';
      this.formData.assPerson = '0';
      this.formData.comPerson = '0';
      this.$refs.form && this.$refs.form.clearValidate();
    },
    chooseField(value){
      this.dataSource = [];
      this.formData.fieldValue = '';
      this.formData.fieldName = '';
      this.formData.filedDisplayName = '';

      let field = null;
      for(let i = 0; i < this.allowFields.length; i++){
        if(this.allowFields[i].fieldName == value){
          field = this.allowFields[i]
          break;
        }
      }

      if(field){
        let setting = field.setting || {};
        this.dataSource = setting.dataSource || [];

        this.formData.fieldName = field.fieldName;
        this.formData.filedDisplayName = field.displayName;
      }
    },
    async chooseTaskType(value){
      this.formData.taskType = value;
      this.formData.fieldName = '';
      this.formData.filedDisplayName = '';
      this.formData.fieldValue = '';
      
      this.allowFields = [];
      this.dataSource = [];
      
      try{
        this.allowFields = await this.$http.get('/performance/getEnabledFields', {typeId: this.formData.taskType});
      }catch(e){
        console.log(e)
        this.allowFields = [];
      }
    },
    screenTypeChange(){
      //切换生效条件时清空条件相关选项
      this.formData.taskType = '';
      this.formData.fieldName = '';
      this.formData.filedDisplayName = '';
      this.formData.fieldValue = '';
      this.formData.settleType = '';
      this.formData.screenMsg = [];
      this.screenMsg = [];
    },
    _dataTransfer(){
      let formData = this.formData;
      let data = {};

      data.prName = formData.prName;
      data.description = formData.description;
      data.rewardType = formData.rewardType;
      data.moneyType = formData.moneyType;
      data.comPerson = formData.comPerson;
      data.assPerson = formData.assPerson;
      data.screenType = formData.screenType;
      data.settleType = formData.settleType;
      data.screenMsg = (formData.screenMsg || []).join(",");

      if(data.settleType == 'customField'){
        data.screenMsg = formData.fieldName;

        let condition = {};
        condition.taskType = formData.taskType;
        condition.fieldName = formData.fieldName;
        condition.displayName = formData.filedDisplayName;
        condition.value = formData.fieldValue;

        data.field = [condition];
      }else{
        data.field = [];
      }

      if(formData.prId) data.prId = formData.prId;

      return data;
    },
    async getTaskType(){
      if(this.taskType.length) return;
      this.taskTypeLoading = true;
      try{
        let res = await this.$http.get('/performance/getDistinct', {settleType: 'templateId'})
        if(res.succ) {
          this.taskTypeLoading = false;
          this.taskType = res.data || [];
          screenMsgCache.templateId = this.taskType;
        }
      }catch(e){
        this.taskTypeLoading = false;
      }
    },
    async open(data){
      //清除验证信息
      this.$refs.form && this.$refs.form.clearValidate();
      this.dialogFormVisible = true;

      if(data){
        //编辑
        this.dialogFormType = 'edit';
        this.title = '编辑绩效规则';

        this.formData = _.assign({}, this.formData, data);
        this.formData.screenMsg = data.screenMsg ? data.screenMsg.split(',') : [];

        if(this.formData.settleType == 'customField'){
          let field = data.field || [];
          let condition = field[0] || {};
          this.loading = true;
          this.pending = true;
          await this.chooseTaskType(condition.taskType);
          this.$nextTick(() => {
            this.chooseField(condition.fieldName);
            this.formData.fieldValue = condition.value;

            this.loading = false;
            this.pending = false;
          })
        }

        //工单类型是对象 服务类型服务内容是字符串 后台返回值全部是字符串 要正确显示工单类型必须先获取工单类型的内容
        if(data.settleType == 'templateId') { 
          this.screenMsg = this.taskType;
        }else {
          this.screenMsg = [];
        }
      }else {
        //新增
        this.title = '新增绩效规则';
        this.dialogFormType = 'add';
        this.formData = _.assign({},opData.INIT_FORM_DATA);
        this.screenMsg = [];
      }
      
    },
    validateForm(){
      this.pending = true;
      this.$refs.form.validate((valid) => {
        if(!valid) {
          this.pending = false;
          return false;
        }
        this.ruleSubmit()
      })
    },
    async ruleSubmit(){
      this.pending = true;
      let res;
      try{
        if(this.dialogFormType == 'add') {
          //添加规则
          res = await this.$http.post('/performance/addRule',this._dataTransfer())
        }else if(this.dialogFormType == 'edit') {
          //修改规则
          res = await this.$http.post('/performance/updateRule',this._dataTransfer())
        }
        //操作成功显示提示信息并关闭对话框
        if(res.succ) {
          this.dialogFormVisible = false;
          let title = this.dialogFormType == 'add' ? '添加' : '修改';
          this.$notify({
            title: title + '成功',
            type: 'success'
          });
          this.$emit('success')
        }
      }catch(e){
        this.$notify({
          title: '操作失败',
          type: 'error'
        });
      }
      this.pending = false;
    },
    async repeatVali(rule, value, callback){
      //规则名重复验证
      let params = {
        prName: this.formData.prName
      }
      //修改时参数添加id
      this.formData.prId && (params.prId = this.formData.prId)
      let errors = [];
      
      try {
        let res = await this.$http.get('/performance/verification', params)
        if(res.succ && res.message != '规则名可用'){
          errors.push(new Error('规则名已存在'))
        }
      }catch(e){
        errors.push(e)
      }
      callback(errors)
    },
    numVali(rule, value, callback) {
      if(!value) return;
      let errors = [];
      if(!value.match(/^[0-9]+(\.[0-9])?$/)){
        errors.push(new Error('请输入数字且最多只能有一位小数'))
      }
      if(this.formData.rewardType != 'jifen' && this.formData.moneyType != 'geshu') {
        if(value - 0 > 100) errors.push(new Error('不能大于100'))
      }else {
        if(value - 0 > 9999) errors.push(new Error('不能大于9999'))
      }
      callback(errors);
    },
    settleTypeChange(){
      //切换条件类型时 清除已选条件获取条件
      this.screenMsg = [];
      this.formData.screenMsg = [];

      this.formData.taskType = '';
      this.formData.fieldName = '';
      this.formData.filedDisplayName = '';
      this.formData.fieldValue = '';
    },
    async getScreenMsg(show){
      if(!show || !this.formData.settleType) return;
      if(screenMsgCache[this.formData.settleType]){
        this.screenMsg = screenMsgCache[this.formData.settleType];
        return;
      }
      this.screenMsgLoading = true;
      try{
        let res = await this.$http.get('/performance/getDistinct', {settleType: this.formData.settleType})
        if(res.succ) {
          this.screenMsgLoading = false;
          screenMsgCache[this.formData.settleType] = res.data || []
          this.screenMsg = res.data;
        }
      }catch(e){
        this.screenMsgLoading = false;
      }
    },
    needSelect(rule, value, callback){
      if(this.formData.screenType == 'all') {
        callback();
        return;
      }
      if(!this.formData.settleType) {
        callback([new Error(' ')])
        return;
      }
      callback()
    },
    needSelectMuti(rule, value, callback){
      if(this.formData.screenType == 'all') {
        callback();
        return;
      }

      if(this.formData.settleType == 'customField' && this.formData.fieldValue){
        callback();
        return;
      }

      if(!this.formData.screenMsg || !this.formData.screenMsg.length) {
        let term = opData.TERM;
        let name = '生效条件';
        for(let i = 0; i < term.length; i++){
          if(term[i].value == this.formData.settleType){
            name = term[i].label;
            break;
          }
        }

        let message = `请填写${name}`;
        callback([new Error(message)])
        return;
      }
      callback();
    }
  }
}
</script>
<style lang="scss">
  .el-form-item{
    margin-bottom: 0px;
  }

  .el-form-item__error{
    position: relative;
  }

  .el-select__tags-text {
    display: inline-block;
    vertical-align: middle;
    max-width: 70px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .dialog-title {
    text-align: center;
    font-size: 18px;
  }

  .inline-item {
    display: inline-block;
  }

  .el-form-item:not(.is-required)>label::before{
    content: '*';
    color: #FFF;
    margin-right: 4px;
    user-select: none;
  }
  .performance-rule-select{
    flex: 1;
    
    .el-input__inner{
      height: 32px !important;
    }

    .el-tag--small{
      margin: 2px 0 2px 6px;
      height: 22px;
      line-height: 20px;
    }
  }

  .performance-rule-condition{
    display: flex;
    flex-flow: row nowrap;
  }

  .performance-rule-condition-include{
    display: block;
    width: 40px;
    text-align: center;
  }

  .performance-rule-condition-template{
    width: 150px;
  }
</style>
