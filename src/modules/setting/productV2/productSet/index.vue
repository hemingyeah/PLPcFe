<!--  -->
<template>
  <div
    id="normal-setting-components-box"
    v-loading.fullscreen.lock="fullscreenLoading"
  >
    <div class="flex-x box-12 bg-w mar-btm-10">
      <div class="flex-1">
        <div class="font-16 font-w-600">产品自定义字段</div>
        <div class="font-12 mar-top-5">产品页面中的字段内容可以在这里配置</div>
      </div>
      <el-button type="primary" @click="openTab">配置自定义字段</el-button>
    </div>
    <div class="flex-x box-12 bg-w mar-btm-10">
      <div class="flex-1">
        <div class="font-16 font-w-600 border-btm">产品功能设置</div>
        <div class="font-w-600">移动端查询</div>
        <div class="font-12 mar-top-5">是否允许在移动端查询产品</div>
      </div>
      <div class="mar-top-52">
        <el-switch
          v-model="productSearchOnMobile"
          @change="saveFunc($event, 'productSearchOnMobile')"
        ></el-switch>
        {{ productSearchOnMobile ? "启用" : "禁用" }}
      </div>
    </div>
    <div class="flex-x box-12 bg-w">
      <div class="flex-1">
        <div class="font-16 font-w-600 border-btm">产品二维码管理</div>
        <div class="font-w-600">启用产品二维码功能</div>
        <div class="font-12 mar-top-5">
          通过二维码标识唯一信息，并支持客户扫码提交服务事件
        </div>
      </div>
      <div class="mar-top-52">
        <el-switch
          v-model="qrcodeEnabled"
          @change="saveFunc($event, 'qrcodeEnabled')"
        ></el-switch>
        {{ qrcodeEnabled ? "启用" : "禁用" }}
      </div>
    </div>

    <div class="flex-x box-12 bg-w">
      <div class="flex-1">
        <div class="font-w-600">产品二维码管理</div>
        <div class="font-12 mar-top-5">生成并管理二维码</div>
      </div>
      <el-button type="primary" @click="openQrcodeList">前往</el-button>
    </div>

    <div class="flex-x box-12 bg-w mar-btm-10">
      <el-button type="primary" @click="goSuperqrcodeSet">修改产品二维码设置</el-button>
    </div>

    <div class="flex-x box-12 bg-w" v-if="qrcodeEnabled">
      <div class="flex-1">
        <div class="font-w-600">分配规则</div>
      </div>
      <el-button type="primary" @click="addRule">新建</el-button>
    </div>
    <div class="flex-x box-12 bg-w" v-if="qrcodeEnabled">
      <el-table border stripe :data="list">
        <el-table-column
          prop="level"
          width="100"
          label="优先级"
        ></el-table-column>
        <el-table-column prop="ruleName" label="规则名称"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <i class="iconfont icon-bianji pointer" @click="editRule(scope.row.id)"></i>
            <i
              class="iconfont icon-qingkongshanchu-copy pointer"
              @click="deleteRule(scope.row.id, scope.row.isSystem)"
            ></i>
            <i
              class="iconfont icon-long-arrow-up pointer"
              @click="moveRule(scope.$index, 'top')"
            ></i>
            <i
              class="iconfont icon-long-arrow-down pointer"
              @click="moveRule(scope.$index, 'down')"
            ></i>
          </template>
        </el-table-column>
        <el-table-column label="启用/禁用">
          <template slot-scope="scope">
            <el-switch
              :disabled="scope.row.isSystem === 1"
              @change="switchEnable($event, scope.row)"
              v-model="scope.row.checked"
            ></el-switch>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
    >
      <el-form :model="form" label-position="left" :rules="rules" label-width="140px" ref="form">
        <el-form-item label="名称" prop="ruleName">
          <el-input
            type="text"
            size="mini"
            maxlength="10"
            v-model="form.ruleName"
            placeholder="规则的名称（最多10个字）"
          ></el-input>
        </el-form-item>
        <el-form-item label="规则类型" required>
          <el-radio-group v-model="form.ruleType" @change="ruleTypeChange">
            <el-radio :label="1">唯一属性</el-radio>
            <el-radio :label="2">按照客户所在区域</el-radio>
            <el-radio :label="3">按照特定条件</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="当客户默认地址" required v-if="form.ruleType == 2">
          <el-col :span="11">
            <el-form-item>
              <el-select
                size="mini"
                v-model="form.include"
                :popper-append-to-body="false"
                popper-class="select-popper"
              >
                <el-option label="包含" :value="1"></el-option>
                <el-option label="不包含" :value="0"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item prop="address">
              <el-select
                size="mini"
                multiple
                collapse-tags
                v-model="form.address"
                :popper-append-to-body="false"
                popper-class="select-popper"
              >
                <el-option
                  v-for="item in provinceList"
                  :key="item"
                  :label="item"
                  :value="item"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-form-item>
        <el-form-item
          label="选择应用条件，当"
          v-show="form.ruleType == 3"
          required
        >
          <el-col :span="8">
            <el-form-item>
              <el-select
                style="width: calc(100% - 65px)"
                @change="applyChange"
                v-model="form.apply"
                size="mini"
                :popper-append-to-body="false"
                popper-class="select-popper"
              >
                <el-option label="客户" :value="'customer'"></el-option>
                <el-option label="产品" :value="'product'"></el-option>
              </el-select>
              里的字段
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item prop="fieldName">
              <el-select
                v-model="form.fieldName"
                @change="fieldChange"
                size="mini"
                :popper-append-to-body="false"
                popper-class="select-popper"
              >
                <el-option
                  v-for="item in fields"
                  :key="item.fieldName"
                  :label="item.displayName"
                  :value="item.fieldName"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item>
              <el-select
                v-model="form.equals"
                size="mini"
                :popper-append-to-body="false"
                popper-class="select-popper"
              >
                <el-option label="等于" :value="1"></el-option>
                <el-option label="不等于" :value="0"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item prop="option">
              <el-select
                style="width: calc(100% - 25px)"
                v-if="form.apply==='product' && form.fieldName==='type'"
                v-model="form.option"
                size="mini"
                :popper-append-to-body="false"
                filterable
                remote
                :remote-method="queryCatalogsByPage"
                :loading='loading'
                popper-class="select-popper"
                class="catalog-loadmore"
                v-catalog-loadmore='catalogLoadmore'
              >
                <el-option
                  v-for="item in catalogList"
                  :key="item.id"
                  :label='item.pathName'
                  :value='item.id'
                ></el-option>
              </el-select>
              <el-select
                style="width: calc(100% - 25px)"
                v-else
                v-model="form.option"
                size="mini"
                :popper-append-to-body="false"
                popper-class="select-popper"
              >
                <el-option
                  v-for="item in options"
                  :key="item"
                  :label="item"
                  :value="item"
                ></el-option>
              </el-select>
              时
            </el-form-item>
          </el-col>
        </el-form-item>
        <el-form-item label="指定可分配客服" required>
          <el-col :span="11">
            <el-form-item>
              <el-select
                size="mini"
                @change="userTypeChange"
                v-model="form.selectUserType"
                :popper-append-to-body="false"
                popper-class="select-popper"
              >
                <el-option
                  v-for="item in userTypes"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col
            :span="12"
            v-show="
              form.selectUserType == 'user' ||
              form.selectUserType == 'role' ||
              form.selectUserType == 'tag' ||
              form.selectUserType == 'tagLeader'
            "
          >
            <el-form-item
              prop="selectUser"
              v-if="form.selectUserType != 'user'"
            >
              <el-select
                size="mini"
                v-model="form.selectUser"
                filterable
                remote
                clearable
                :remote-method="getUserList"
                :popper-append-to-body="false"
                popper-class="select-popper"
                :loading="loading"
                class="select-loadmore"
                v-el-select-loadmore='loadmore'
              >
                <el-option
                  v-for="item in userList"
                  :key="item.userId || item.id"
                  :label="item.displayName || item.tagName || item.name"
                  :value="item.userId || item.id"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              prop="selectUsers"
              v-if="form.selectUserType == 'user'"
            >
              <el-select
                size="mini"
                class="select-loadmore"
                v-model="form.selectUsers"
                @change="userChange"
                multiple
                collapse-tags
                filterable
                remote
                clearable
                :remote-method="getUserList"
                :popper-append-to-body="false"
                popper-class="select-popper"
                :loading="loading"
                v-el-select-loadmore='loadmore'
              >
                <el-option
                  v-for="item in userList"
                  :key="item.userId || item.id"
                  :label="item.displayName || item.tagName || item.name"
                  :value="item.userId || item.id"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-form-item>
        <el-form-item label="客服优先顺序" required>
          <el-select
            v-model="form.distributePriority"
            size="mini"
            :popper-append-to-body="false"
            popper-class="select-popper"
          >
            <el-option label="按顺序平均分配" :value="1"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="dialogVisible = false">取 消</el-button>
        <el-button size="small" :disabled='pending' type="primary" @click="submitForm"
          >确 定</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash';
import { getRootWindow } from "@src/util/dom";
import {
  queryAllRules,
  removeDistributeRule,
  moveRule,
  modifyDistributeRule,
  saveFunc,
  queryCSByCondition,
  addDistributeRule,
  queryApplyOptions,
  queryRuleInfo,
  productConfig,
  queryCatalogsByPage,
  modifyDistributeRuleState
} from "@src/api/ProductV2Api";

export default {
  name: "product-set",
  data() {
    return {
      pending:false,
      tenantId: "",
      userId:'',
      fullscreenLoading: false,
      productSearchOnMobile: false,
      qrcodeEnabled: false,

      openType: "add",
      dialogVisible: false,
      ruleId: null,
      form: {
        ruleName: "",
        ruleType: 1,
        selectUserType: "user",
        selectUser: "",
        selectUsers: [],
        distributePriority: 1,
        include: 1,
        address: [],
        apply: "customer",
        equals: 1,
        fieldName: "",
        displayName: "",
        option: "",
        level: "",
      },
      userParams:{},
      userKeywords:'',
      hasNextPage:true,
      catalogParams:{},
      catalogKeywords:'',
      catalogHasNextPage:true,
      fields: [],
      allOptions: [],
      options: [],
      list: [],
      catalogList:[],
      userList: [],
      provinceList: [
        "北京市",
        "天津市",
        "上海市",
        "重庆市",
        "内蒙古自治区",
        "广西壮族自治区",
        "西藏自治区",
        "宁夏回族自治区",
        "新疆维吾尔自治区",
        "河北省",
        "山西省",
        "辽宁省",
        "吉林省",
        "黑龙江省",
        "江苏省",
        "浙江省",
        "安徽省",
        "福建省",
        "江西省",
        "山东省",
        "河南省",
        "湖北省",
        "湖南省",
        "广东省",
        "海南省",
        "四川省",
        "贵州省",
        "云南省",
        "陕西省",
        "甘肃省",
        "青海省",
        "香港特别行政区",
        "澳门特别行政区",
        "台湾省",
        "其他区域",
      ],
      loading: false,

      chosenUser:[],
      mulUsers:[]
    };
  },
  computed: {
    dialogTitle() {
      return this.openType == "add" ? "新建分配规则" : "编辑分配规则";
    },
    userTypes() {
      if (this.form.ruleType === 1) {
        return [
          { label: "指定人员", value: "user" },
          { label: "指定角色", value: "role" },
          { label: "指定服务团队", value: "tag" },
          { label: "指定服务团队主管", value: "tagLeader" },
        ];
      } else if (this.form.ruleType === 2) {
        return [
          { label: "指定服务团队", value: "tag" },
          { label: "指定服务团队主管", value: "tagLeader" },
          { label: "指定客户所属服务团队", value: "cusTag" },
          { label: "指定客户所属服务团队主管", value: "cusTagLeader" },
          { label: "指定客户负责人", value: "customerManager" },
        ];
      } else {
        return [
          { label: "指定人员", value: "user" },
          { label: "指定角色", value: "role" },
          { label: "指定服务团队", value: "tag" },
          { label: "指定服务团队主管", value: "tagLeader" },
          { label: "指定客户所属服务团队", value: "cusTag" },
          { label: "指定客户所属服务团队主管", value: "cusTagLeader" },
          { label: "指定客户负责人", value: "customerManager" },
        ];
      }
    },
    rules() {
      let rule = {
        ruleName: [
          { required: true, message: "请输入规则名称", trigger: "blur" },
        ],
      };
      if (this.form.ruleType == 1) {
        if (this.form.selectUserType == "user") {
          rule.selectUsers = [
            {
              type: "array",
              required: true,
              message: "请选择",
              trigger: ["blur", "change"],
            },
          ];
        } else {
          rule.selectUser = [
            { required: true, message: "请选择", trigger: ["blur", "change"] },
          ];
        }
      } else if (this.form.ruleType == 2) {
        rule.address = [
          {
            type: "array",
            required: true,
            message: "请选择",
            trigger: ["blur", "change"],
          },
        ];
        if (
          this.form.selectUserType == "role" ||
          this.form.selectUserType == "tag" ||
          this.form.selectUserType == "tagLeader"
        ) {
          rule.selectUser = [
            { required: true, message: "请选择", trigger: ["blur", "change"] },
          ];
        }
      } else {
        rule.fieldName = [
          { required: true, message: "请选择", trigger: ["blur", "change"] },
        ];
        rule.option = [
          { required: true, message: "请选择", trigger: ["blur", "change"] },
        ];
        if (this.form.selectUserType == "user") {
          rule.selectUsers = [
            {
              type: "array",
              required: true,
              message: "请选择",
              trigger: ["blur", "change"],
            },
          ];
        } else if (
          this.form.selectUserType == "role" ||
          this.form.selectUserType == "tag" ||
          this.form.selectUserType == "tagLeader"
        ) {
          rule.selectUser = [
            { required: true, message: "请选择", trigger: ["blur", "change"] },
          ];
        }
      }
      return rule;
    },
  },
  created() {
    const rootWindow = getRootWindow(window);
    const user=JSON.parse(rootWindow._init).user;
    this.tenantId = user.tenantId;
    this.userId=user.userId;
    this.userParams={
      tenantId: this.tenantId,
      pageSize: 10,
      pageNum: 1,
      searchType: '',
      keywords:''
    }
    this.catalogParams={
      tenantId:this.tenantId,
      pageNum:1,
      pageSize:10,
      keyWord:''
    }
  },
  mounted() {
    this.productConfig();
  },
  methods: {
    catalogLoadmore(){
      if(!this.catalogHasNextPage) this.queryCatalogsByPage(null,false);
    },
    loadmore(){
      if(!this.hasNextPage) this.getUserList(null,false);
    },
    // 修改产品二维码设置
    goSuperqrcodeSet(){
      this.$platform.openTab({
        id: 'superqrcodeSet',
        title: "产品二维码配置",
        close: true,
        url: '/setting/superQrcode'
      });
    },
    // 获取开关状态
    async productConfig(){
      let res=await productConfig();
      if(res.status===0){
        this.productSearchOnMobile=res.data.productConfig.productSearchOnMobile;
        this.qrcodeEnabled=res.data.productConfig.qrcodeEnabled;
        if(this.qrcodeEnabled){
          this.queryAllRules();
        }
      }else{
        this.$platform.alert(res.message);
      }
    },
    // 获取字段
    async getFields(){
      const params={
        tenantId:this.tenantId,
        applyType:this.form.apply
      }
      let res=await queryApplyOptions(params);
      if(res.code==='200'){
        this.allOptions=res.data;
        this.fields=this.allOptions.map(item=>{
          return {
            fieldName:item.fieldName,
            displayName:item.displayName
          }
        });
        if(this.form.fieldName){
          this.options=this.allOptions.find(item=>item.fieldName==this.form.fieldName).setting.dataSource;
        }
      }else{
        this.$platform.alert(res.msg);
      }
    },
    // 改变客服人员类型
    userTypeChange(val){
      this.form.selectUsers=[];
      this.form.selectUser='';
      this.userList=[];
      this.keywords='';
      if(val==='user' || val==='role' || val==='tag' || val==='tagLeader') this.getUserList();
    },
    // 改变规则类型
    ruleTypeChange(val){
      this.form.selectUsers=[];
      this.form.selectUser='';
      if(val==1 || val==3){
        this.form.selectUserType='user';
      }else{
        this.form.selectUserType='tag';
      }
      this.$nextTick(()=>{
        this.$refs.form.clearValidate();
      })
      this.getUserList();
    },
    // 改变应用条件
    applyChange(val){
      this.form.fieldName='';
      this.form.option='';
      this.getFields();
    },
    // 改变字段
    fieldChange(val){
      this.form.option='';
      this.options=this.allOptions.find(item=>item.fieldName==val).setting.dataSource;
      if(val==='type' && this.form.apply==='product'){
        this.queryCatalogsByPage();
      }
    },
    // 获取产品类型字段
    queryCatalogsByPage:_.debounce(function(keyWord='',refresh=true){
      if(keyWord){
        this.catalogKeywords=keyWord;
      }
      if(refresh){
        this.catalogParams.pageNum=1;
      }else{
        this.catalogParams.pageNum++;
      }
      this.catalogParams.keyWord=this.catalogKeywords;
      this.loading = true;
      queryCatalogsByPage(this.catalogParams).then(res=>{
        this.loading=false;
        if(res.code==='200'){
          this.catalogHasNextPage=res.data.hasNextPage;
          if(refresh) this.catalogList=res.data.list;
          else this.catalogList.push(...res.data.list);
        }else{
          this.$platform.alert(res.msg);
        }
      })
    },300),
    // 保存
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          let params=this.buildParams();
          if(this.openType=='add'){
            this.addDistributeRule(params);
          }else{
            this.modifyDistributeRule(params);
          }
        }
      });
    },
    // 新建保存
    async addDistributeRule(params){
      this.pending=true;
      let res=await addDistributeRule(params);
      this.pending=false;
      if(res.code==200){
        this.dialogVisible=false;
        this.queryAllRules();
        this.$message({
          message:res.data || '新建成功',
          type:'success'
        })
      }else{
        this.$platform.alert(res.msg)
      }
    },
    // 编辑保存
    async modifyDistributeRule(params){
      this.pending=true;
      let res=await modifyDistributeRule(params);
      this.pending=false;
      if(res.code==200){
        this.dialogVisible=false;
        this.queryAllRules();
        this.$message({
          message:res.data || '编辑成功',
          type:'success'
        })
      }else{
        this.$platform.alert(res.msg)
      }
    },
    // 构建保存的参数
    buildParams() {
      let params = {
        tenantId:this.tenantId,
        ruleName: this.form.ruleName,
        ruleType: this.form.ruleType,
        distributePriority: this.form.distributePriority,
        enabled: 1,
        level: this.form.level,
        isSystem: this.form.isSystem || 0,
      };
      if (this.openType == "add") {
        params.createUser = this.userId;
      } else {
        params.id = this.ruleId;
        params.updateUser = this.userId;
      }
      if (this.form.ruleType == 1) {
        if (this.form.selectUserType == "user") {
          params.distributeCondition = { group: "user" };
          params.candidate = { info: [] };
          this.form.selectUsers.forEach((userId) => {
            const item = this.mulUsers.find((u) => u.userId == userId);
            params.candidate.info.push({
              userId,
              userName: item.displayName,
              times: 0,
            });
          });
        } else {
          const item = this.userList.find((u) => u.id == this.form.selectUser);
          params.distributeCondition = {
            group: this.form.selectUserType,
            groupId: this.form.selectUser,
            groupName: item.name || item.tagName,
          };
          params.candidate = null;
        }
      } else if (this.form.ruleType == 2) {
        params.candidate = null;
        params.distributeCondition = {
          group: this.form.selectUserType,
          include: this.form.include,
          address: this.form.address,
        };
        if (
          this.form.selectUserType == "tag" ||
          this.form.selectUserType == "tagLeader"
        ) {
          var item = this.userList.find((u) => u.id == this.form.selectUser);
          params.distributeCondition.groupId = this.form.selectUser;
          params.distributeCondition.groupName = item.tagName;
        }
      } else {
        const fieldItem = this.fields.find(
          (item) => item.fieldName == this.form.fieldName
        );
        params.distributeCondition = {
          group: this.form.selectUserType,
          apply: this.form.apply,
          fieldName: this.form.fieldName,
          equals: this.form.equals,
          option: this.form.option,
          displayName: fieldItem.displayName,
        };
        params.candidate = null;
        if (this.form.selectUserType == "user") {
          params.candidate = { info: [] };
          this.form.selectUsers.forEach((userId) => {
            const item = this.userList.find((u) => u.userId == userId);
            params.candidate.info.push({
              userId,
              userName: item.displayName,
              times: 0,
            });
          });
        } else if (
          this.form.selectUserType == "role" ||
          this.form.selectUserType == "tag" ||
          this.form.selectUserType == "tagLeader"
        ) {
          var item = this.userList.find((u) => u.id == this.form.selectUser);
          params.distributeCondition.groupId = item.id;
          params.distributeCondition.groupName = item.tagName || item.name;
        }
      }
      return params;
    },
    // 新建打开窗口
    addRule() {
      this.getUserList("");
      this.dialogVisible = true;
      this.openType = "add";
      this.form = {
        ruleName: "",
        ruleType: 1,
        selectUserType: "user",
        selectUser: "",
        selectUsers: [],
        distributePriority: 1,
        include: 1,
        address: [],
        apply: "customer",
        equals: 1,
        fieldName: "",
        option: "",
        level: "",
      };
      this.getFields();
    },
    // 获取指定人员
    getUserList:_.debounce(function(keywords = "",refresh=true,first=false){
      this.loading = true;
      if(keywords){
        this.userKeywords=keywords;
      }
      if(refresh){
        this.userParams.pageNum=1;
      }else{
        this.userParams.pageNum++;
      }
      this.userParams.searchType=this.form.selectUserType;
      this.userParams.keywords=this.userKeywords;
      queryCSByCondition(this.userParams).then(res=>{
        this.loading = false;
        if (res.code === "200") {
          this.hasNextPage=res.data.hasNextPage;
          if (res.data && res.data.list) {
            if(refresh) this.userList = res.data.list;
            else this.userList.push(...res.data.list);

            if(first){
              if(this.form.selectUserType==='user'){
                this.chosenUser.forEach(item=>{
                  const exist=this.userList.find(user=>user.userId===item.userId);
                  if(!exist) this.userList.unshift(item);
                });
              }else{
                const exist=this.userList.find(item=>item.id===this.chosenUser[0].id);
                if(!exist) this.userList.unshift(this.chosenUser[0]);
              }
            }
          }
        } else {
          this.$platform.alert(res.msg);
        }
      })
    },300),
    // 启用/禁用 功能设置
    async saveFunc(state, flow) {
      const params = {
        state,
        flow,
      };
      let res = await saveFunc(params);
      if(res.status===0){
        if(flow==='qrcodeEnabled' && state && this.list.length===0){
          this.queryAllRules();
        }
      }else{
        this.$platform.alert(res.message);
      }
    },
    // 启用/禁用 规则
    async switchEnable(enabled, row) {
      const params = {
        id: row.id,
        enabled: enabled ? 1 : 0,
      };
      let res = await modifyDistributeRuleState(params);
      if (res.code !== "200") {
        this.$platform.alert(res.msg);
      }
    },
    // 规则移动
    async moveRule(index, direction) {
      if (index === 0 && direction === "top") {
        return;
      }
      if (index === this.list.length - 1 && direction === "down") {
        return;
      }
      let arr = this.list.map((item) => {
        return {
          id: item.id,
        };
      });
      let moveItem = arr.splice(index, 1);
      if (direction === "top") {
        arr.splice(index - 1, 0, moveItem[0]);
      } else {
        arr.splice(index + 1, 0, moveItem[0]);
      }
      arr.forEach((item, index) => {
        item.level = index + 1;
      });
      let res = await moveRule(arr);
      if (res.code === "200") {
        this.queryAllRules();
      } else {
        this.$platform.alert(res.msg);
      }
    },
    // 删除规则
    deleteRule(id, isSystem) {
      if (isSystem) {
        return this.$platform.alert("默认规则不允许删除");
      }
      this.$confirm("确认删除？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          const params = {
            id,
            tenantId: this.tenantId,
          };
          removeDistributeRule(params).then((res) => {
            if (res.code === "200") {
              this.queryAllRules();
            } else {
              this.$platform.alert(res.msg);
            }
          });
        })
        .catch(() => {});
    },
    // 编辑规则
    async editRule(id) {
      let res=await queryRuleInfo({id});
      if(res.code==='200'){
        let form=this.form;
        this.openType='edit';
        const result=res.data;
        this.ruleId=result.id;
        form.ruleName=result.ruleName;
        form.ruleType=result.ruleType;
        form.selectUserType=result.distributeCondition.group;
        form.distributePriority=result.distributePriority;
        form.level=result.level;
        form.isSystem=result.isSystem;
        if(form.selectUserType=='user'){
          this.chosenUser=result.candidate.info;
          this.chosenUser.forEach(item=>{
            item.displayName=item.userName;
          });
          this.mulUsers=this.chosenUser.map(item=>{
            return {
              userId:item.userId,
              displayName:item.displayName
            }
          });
          this.getUserList(null,true,true);
          form.selectUsers=result.candidate.info.map(item=>item.userId);
        }else if(form.selectUserType=='role' || form.selectUserType=='tag' || form.selectUserType=='tagLeader'){
          this.chosenUser=[result.distributeCondition];
          this.chosenUser.forEach(item=>{
            item.id=item.groupId;
            if(form.selectUserType=='role'){
              item.name=item.groupName;
            }else{
              item.tagName=item.groupName;
            }
          });
          form.selectUser=result.distributeCondition.groupId;
          this.getUserList(null,true,true);
        }
        form.address=result.distributeCondition.address || [];
        form.include=isNaN(result.distributeCondition.include)?1:result.distributeCondition.include;
        form.apply=result.distributeCondition.apply || 'customer';
        form.fieldName=result.distributeCondition.fieldName || '';
        form.equals=isNaN(result.distributeCondition.equals)?1:result.distributeCondition.equals;
        form.option=result.distributeCondition.option || '';
        if(form.apply==='product' && form.fieldName==='type'){
          this.catalogList=[{
            id:form.option,
            pathName:result.distributeCondition.pathName
          }];
        }

        this.getFields();
        this.dialogVisible=true;
      }else{
        this.$platform.alert(res.msg);
      }
    },
    // 人员列表选择
    userChange(val){
      let arr=[];
      val.forEach(userId=>{
        const nowExist=this.userList.find(item=>item.userId===userId);
        if(nowExist){
          arr.push({
            userId:nowExist.userId,
            displayName:nowExist.displayName
          });
        }else{
          const oldExist=this.mulUsers.find(item=>item.userId===userId);
          if(oldExist){
            arr.push({
              userId:oldExist.userId,
              displayName:oldExist.displayName
            });
          }
        }
      });
      this.mulUsers=arr;
    },
    // 获取所有规则
    async queryAllRules() {
      const params = {
        tenantId: this.tenantId,
      };
      let res = await queryAllRules(params);
      if (res.code === "200") {
        res.data.forEach((item) => {
          item.checked = item.enabled === 1 ? true : false;
        });
        this.list = res.data;
      } else {
        this.$platform.alert(res.msg);
      }
    },
    openTab() {
      window.location.href = "/setting/product/fields";
    },
    openQrcodeList() {
      this.$platform.openTab({
        id: "productQrcode",
        title: "正在加载",
        close: true,
        url: "/product/qrcode",
      });
    },
  },
  directives:{
    'el-select-loadmore':{
      bind(el,binding){
        const SELECT_DOM=el.querySelector('.select-loadmore .el-select-dropdown__wrap');
        SELECT_DOM.addEventListener('scroll',()=>{
          const condition=SELECT_DOM.scrollHeight-SELECT_DOM.scrollTop<=SELECT_DOM.clientHeight;
          if(condition){
            binding.value();
          }
        })
      }
    },
    'catalog-loadmore':{
      bind(el,binding){
        const SELECT_DOM=el.querySelector('.catalog-loadmore .el-select-dropdown__wrap');
        SELECT_DOM.addEventListener('scroll',()=>{
          const condition=SELECT_DOM.scrollHeight-SELECT_DOM.scrollTop<=SELECT_DOM.clientHeight;
          if(condition){
            binding.value();
          }
        })
      }
    }
  }
};
</script>
<style lang="scss" scoped>
/deep/ .el-form-item--small .el-form-item__label{
  padding-left: 6px;
}
/deep/ .el-table td{
  color:#333;
}
.el-radio{
  margin-right: 10px;
}
/deep/ .el-radio__label{
  padding-left: 5px;
}
.pointer {
  cursor: pointer;
}
.mar-btm-10 {
  margin-bottom: 10px;
}
.border-btm {
  padding-bottom: 8px;
  margin-bottom: 10px;
  border-bottom: 1px solid #eee;
}
.mar-top-52 {
  margin-top: 52px;
}
.mar-top-5 {
  margin-top: 5px;
}
.select-popper{
  overflow: hidden;
  text-overflow : ellipsis;
  white-space : nowrap;
}
</style>
