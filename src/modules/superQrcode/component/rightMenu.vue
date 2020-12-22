<template>
  <div class="wrapper">
    <h3 class="title">{{ title }}</h3>
    <div v-if="nowOption === 'pic'" class="pic-wrapper">
      <ul class="pic-ul">
        <li v-if="copyForm.companyImages && copyForm.companyImages[0].url">
          <img :src="copyForm.companyImages[0].url" />
        </li>
        <li v-else class="noPic">默认第一张产品图</li>
        <template v-if="copyForm.companyImages && copyForm.companyImages.length>1 && !noCatalog">
          <li v-for="(item,i) in copyForm.companyImages.slice(1)" :key="item.id">
            <img :src="item.url" />
            <div class="change-btns">
              <el-upload
                style="display:inline-block;"
                action="string"
                :show-file-list="false"
                :before-upload="onBeforeUploadImage"
                :http-request="(param,index)=>UploadImage(param,i+1)"
              >
                <i class="iconfont icon-commit1"></i>
              </el-upload>
              <i class="iconfont icon-qingkongshanchu" @click="deleteImg(i+1)"></i>
            </div>
          </li>
        </template>
        <li v-if="copyForm.companyImages && copyForm.companyImages.length < 6 && !noCatalog">
          <el-upload
            class="upload"
            ref="upload"
            action="string"
            :show-file-list="false"
            :before-upload="onBeforeUploadImage"
            :http-request="(param,index)=>UploadImage(param,copyForm.companyImages.length)"
          >
            <i class="el-icon-plus"></i>
          </el-upload>
        </li>
      </ul>
    </div>

    <div v-if="nowOption === 'intro'" style="position:relative;">
      <el-input
        type="textarea"
        :disabled='noCatalog'
        v-model="copyForm.productIntroduction"
        rows="10"
        maxlength="2000"
      ></el-input>
      <span class="summary-text">{{copyForm.productIntroduction.length}}/2000</span>
    </div>

    <div v-if="nowOption === 'contact'" class="contact-wrapper">
      <h4>客服分配规则</h4>
      <i class="iconfont icon-fdn-info"></i>
      <p class="contact-explain">此规则适用于所有目录</p>
      <div style="height:calc(100% - 70px);overflow-y:auto;">
        <el-card class="box-card" v-for="item in rules" :key="item.id">
          <span>优先级：{{item.level}}</span>
          <a href="javascript:;" @click="checkRule(item.id)">查看</a>
          <p>{{item.ruleName}}</p>
        </el-card>
      </div>
    </div>

    <div v-if="nowOption === 'service'" class="common-wrapper">
      <span>是否启用自助服务模块</span>
      <div class="fright">
        <el-switch v-model="doorOpenState" :disabled='noCatalog'></el-switch>
        <span>{{doorOpenState?'启用':'禁用'}}</span>
      </div>
      <h4 style="margin-top:20px;">关联事件模板</h4>
      <el-select style="width:100%;" @change="changeEventType" v-model="copyEventTypeIdList" multiple placeholder="请选择">
        <el-option
          v-for="item in allEventTypeList"
          :key="item.id"
          :label='item.name'
          :value='item.id'
        ></el-option>
      </el-select>
    </div>

    <div v-if="nowOption === 'proInfo'" class="pro-wrapper">
      <h4>产品信息展示</h4>
      <ul>
        <li v-for="item in showFields" :key="item.fieldName">
          <el-checkbox v-model="item.showFlag" :disabled='item.isSystem===1'>
            {{item.displayName}}
            <span class="must" v-if="item.isSystem">(必选)</span>
          </el-checkbox>
        </li>
      </ul>
    </div>

    <div v-if="nowOption === 'video'" class="common-wrapper">
      <span>是否开启产品视频</span>
      <div class="fright">
        <el-switch v-model="videoOpenState" @change="changeState"></el-switch>
        <span>{{videoOpenState?'启用':'禁用'}}</span>
      </div>
    </div>

    <div v-if="nowOption === 'knowledge'" class="common-wrapper">
      <span>是否开启关联知识库</span>
      <div class="fright">
        <el-switch v-model="knowledgeOpenState" @change="changeState"></el-switch>
        <span>{{knowledgeOpenState?'启用':'禁用'}}</span>
      </div>
    </div>
    
    <div v-if="nowOption === 'part'" class="common-wrapper">
      <span>是否开启关联备件</span>
      <div class="fright">
        <el-switch v-model="partOpenState"></el-switch>
        <span>{{partOpenState?'启用':'禁用'}}</span>
      </div>
      <p>对外仅展示已上架服务商城的备件</p>
    </div>

    <div v-if="nowOption === 'mall'" class="common-wrapper">
      <span>是否开启门户商城</span>
      <div class="fright">
        <el-switch v-model="shopOpenState" :disabled='noCatalog'></el-switch>
        <span>{{shopOpenState?'启用':'禁用'}}</span>
      </div>
    </div>

    <el-button @click="save" v-if="!noCatalog || nowOption==='proInfo'" type="primary" class="submit-btn">{{nowOption==='contact' || nowOption==='comInfo'?'下一步':'保存'}}</el-button>
    <el-tooltip v-show="showJump" placement="bottom-start" effect="dark" :content='content'>
      <i class="iconfont icon-fdn-info jump-icon"></i>
    </el-tooltip>

    <el-dialog title="查看分配规则" :visible.sync='ruleDialog'>
      <el-form :model='ruleForm' label-width="140px">
        <el-form-item label="名称" prop="ruleName" required>
          <el-input type="text" size="mini" maxlength="10" disabled v-model="ruleForm.ruleName" placeholder="规则的名称（最多10个字）"></el-input>
        </el-form-item>
        <el-form-item label="规则类型" required>
          <el-radio-group v-model="ruleForm.ruleType" disabled>
            <el-radio :label="1">唯一属性</el-radio>
            <el-radio :label="2">按照客户所在区域</el-radio>
            <el-radio :label="3">按照特定条件</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="当客户默认地址" required v-if="ruleForm.ruleType==2">
          <el-col :span="11">
            <el-form-item>
              <el-select size="mini" v-model="ruleForm.distributeCondition.include" disabled>
                <el-option label="包含" :value="1"></el-option>
                <el-option label="不包含" :value="0"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item>
              <el-tooltip effect="dark" placement="top" :content="ruleForm.distributeCondition.address && ruleForm.distributeCondition.address.join()">
                <el-select size="mini" multiple collapse-tags v-model="ruleForm.distributeCondition.address" disabled>
                  <el-option v-for="item in provinceList" :key="item" :label="item" :value="item"></el-option>
                </el-select>
              </el-tooltip>
            </el-form-item>
          </el-col>
        </el-form-item>
        <el-form-item label="选择应用条件，当" required v-if="ruleForm.ruleType==3">
          <el-col :span="8">
            <el-form-item>
              <el-select style="width:calc(100% - 65px)" v-model="ruleForm.distributeCondition.apply" size="mini" disabled>
                <el-option label="客户" :value="'customer'"></el-option>
                <el-option label="产品" :value="'product'"></el-option>
              </el-select>
              里的字段
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item>
              <el-input v-model="ruleForm.distributeCondition.displayName" size="mini" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item>
              <el-select v-model="ruleForm.distributeCondition.equals" size="mini" disabled>
                <el-option label="等于" :value="1"></el-option>
                <el-option label="不等于" :value="0"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item>
              <el-input style="width:calc(100% - 25px)" v-model="ruleForm.distributeCondition.option" size="mini" disabled></el-input>
              时
            </el-form-item>
          </el-col>
        </el-form-item>
        <el-form-item label="指定可分配客服" required>
          <el-col :span="11">
            <el-form-item>
              <el-select size="mini" v-model="ruleForm.distributeCondition.group" disabled>
                <el-option v-for="item in groupList" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span='12' v-if="ruleForm.distributeCondition.groupName">
            <el-form-item>
              <el-input v-model="ruleForm.distributeCondition.groupName" disabled v-show="ruleForm.distributeCondition.groupName"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="ruleForm.candidate">
            <el-form-item>
              <el-tooltip effect="dark" placement="top" :content="userList.join()">
                <el-select size="mini" multiple collapse-tags v-model="userList" disabled>
                  <el-option v-for="item in ruleForm.candidate.info" :key="item.userId" :label="item.userName" :value="item.userId"></el-option>
                </el-select>
              </el-tooltip>
            </el-form-item>
          </el-col>
        </el-form-item>
        <el-form-item label="客服优先顺序" required>
          <el-select size="mini" v-model="ruleForm.distributePriority" disabled>
            <el-option label="按顺序平均分配" :value="1"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import Uploader from 'packages/BaseUpload/uploader';
import { modifyProductSetting,queryRuleInfo } from '@src/api/SuperQrcode';

export default {
  name: "right-menu",
  data() {
    return {
      copyForm: {},
      doorOpenState:false,  // 是否开启自助服务
      videoOpenState:false, // 是否开启视频
      knowledgeOpenState:false, // 是否开启关联知识库
      partOpenState:false,    // 关联备件开关
      shopOpenState:false,    // 门户商城开关
      showFields:[],        // 产品信息

      ruleDialog:false,
      ruleForm:{
        distributeCondition:{}
      },
      groupList:[
        {label:'指定人员',value:'user'},
        {label:'指定角色',value:'role'},
        {label:'指定服务团队',value:'tag'},
        {label:'指定服务团队主管',value:'tagLeader'},
        {label:'指定客户所属服务团队',value:'cusTag'},
        {label:'指定客户所属服务团队主管',value:'cusTagLeader'},
        {label:'指定客户负责人',value:'customerManager'}
      ],
      provinceList:['北京','天津','上海','重庆','内蒙古','广西','西藏','宁夏','新疆','河北','山西','辽宁','吉林','黑龙江','江苏','浙江','安徽','福建','江西','山东','河南','湖北','湖南','广东','海南','四川','贵州','云南','陕西','甘肃','青海','香港','澳门','台湾'],
      userList:[],

      copyEventTypeIdList:[]
    };
  },
  props: {
    nowOption: {
      type: String,
      default: () => "",
    },
    form: {
      type: Object,
      default: () => {},
    },
    allOptions: {
      type: Array,
      default: () => [],
    },
    rules:{
      type:Array,
      default:()=>[]
    },
    eventTypeIdList:{
      type:Array,
      default:()=>[]
    },
    allEventTypeList:{
      type:Array,
      default:()=>[]
    },
    tenantId:String,
    userId:String,
    noCatalog:Boolean
  },
  mounted() {
    this.copyForm = Object.assign(this.form);

    this.doorOpenState=this.copyForm.doorOpenState===1?true:false;
    this.videoOpenState=this.copyForm.videoOpenState===1?true:false;
    this.knowledgeOpenState=this.copyForm.knowledgeOpenState===1?true:false;
    this.partOpenState=this.copyForm.partOpenState===1?true:false;
    this.shopOpenState=this.copyForm.shopOpenState===1?true:false;

    this.showFields=this.copyForm.showFields;
    this.showFields.forEach(item=>{
      item.showFlag=item.showFlag==='1'?true:false;
    });

    this.copyEventTypeIdList=[...this.eventTypeIdList];
  },
  computed: {
    title() {
      return this.allOptions.find((item) => item.type === this.nowOption).label;
    },
    showJump(){
      switch(this.nowOption){
        case 'contact':
          return true;
        case 'service':
          return true;
        case 'comInfo':
          return true;
        default:
          return false
      }
    },
    content(){
      switch(this.nowOption){
        case 'contact':
          return '请前往产品管理设置去编辑';
        case 'service':
          return '请前往门户设置去配置';
        case 'comInfo':
          return '请前往门户设置去配置';
        default:
          return ''
      }
    },
  },
  methods:{
    // 绑定事件
    changeEventType(doorEventType){
      this.copyEventTypeIdList=doorEventType;
      this.$emit('changeEventType',doorEventType);
    },
    // 查看规则详情
    async checkRule(id){
      let res=await queryRuleInfo({id});
      if(res.code==='200'){
        this.ruleDialog=true;
        this.ruleForm=res.data;
        if(this.ruleForm.candidate){
          this.userList=this.ruleForm.candidate.info.map(item=>item.userName);
        }
        const distributeCondition=this.ruleForm.distributeCondition;
        if(distributeCondition.apply==='product' && distributeCondition.fieldName==='type'){
          distributeCondition.option=distributeCondition.pathName;
        }
      }else{
        this.$message({
          message:res.msg,
          type:'error'
        })
      }
    },
    // 保存
    async save(){
      const option=this.nowOption;
      if(option==='contact' || option==='comInfo'){
        return this.$emit('save',option);
      }
      let params={
        tenantId:this.tenantId,
        userId:this.userId,
        id:this.copyForm.id
      }
      if(option==='pic'){
        params.companyImages=this.copyForm.companyImages;
        if(params.companyImages.length===1 && !params.companyImages[0].url){
          return this.$platform.alert('小宝检测到您没有配置任何企业图片，至少需要上传一张哦');
        }
      }else if(option==='intro'){
        params.productIntroduction=this.copyForm.productIntroduction;
      }else if(option==='service'){
        params.doorOpenState=this.doorOpenState?1:0;
        params.doorEventType=this.copyEventTypeIdList;
      }else if(option==='proInfo'){
        const arr=this.copyForm.showFields.map(item=>{
          return {
            displayName:item.displayName,
            fieldName:item.fieldName,
            isSystem:item.isSystem,
            showFlag:item.showFlag?'1':'0',
            formType:item.formType,
            fieldType:item.fieldType
          }
        }).filter(item=>item.showFlag==='1');
        params.showFields=arr;
      }else if(option==='video'){
        params.videoOpenState=this.videoOpenState?1:0;
      }else if(option==='knowledge'){
        params.knowledgeOpenState=this.knowledgeOpenState?1:0;
      }else if(option==='part'){
        params.partOpenState=this.partOpenState?1:0;
      }else if(option==='mall'){
        params.shopOpenState=this.shopOpenState?1:0;
      }
      let res=await modifyProductSetting(params);
      if(res.code==='200'){
        this.$message({
          message: res.data,
          duration: 1500,
          type: 'success',
        });
        this.$emit('save',option);
      }else{
        this.$notify.error({
          title: "网络错误",
          message,
          duration: 2000,
        });
      }
    },
    // 开关视频模块
    changeState(val){
      this.$emit('changeState',val);
    },
    deleteImg(index){
      this.copyForm.companyImages.splice(index,1);
      this.$emit('delPic',index+1);
    },
    onBeforeUploadImage(file) {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG/PNG 格式!');
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!');
      }
      return isJPG && isLt2M;
    },
    UploadImage(param,index) {
      Uploader.upload(param.file, '/files/upload')
        .then((result) => {
          if (result.status != 0) {
            this.$message({
              message: `${result.message}`,
              duration: 1500,
              type: 'error',
            });
            return;
          }

          let file = result.data;
          let item = {
            id: file.id,
            filename: file.fileName,
            url: file.ossUrl || file.url || `/files/get?fileId=${file.id}`,
            fileSize: file.fileSizeStr,
          };
          this.$set(this.copyForm.companyImages,index,item);
          this.$emit('addPic',this.copyForm.companyImages);
        })
        .catch((err) => {
          console.warn(err);
        })
        .finally(() => {});
    },
  }
};
</script>

<style lang="scss" scoped>
/deep/.el-upload{
  width: 100%;
  height: 100%;
}
/deep/ .el-dialog__body{
  padding:0 20px 20px 0;
}
/deep/ .el-radio-group label{
  margin-right: 10px;
}
/deep/ .el-form-item--small.el-form-item{
  margin-bottom: 0;
}
.summary-text{
  position:absolute;
  bottom:4px;
  right:10px;
  color:#9a9a9a;
  font-size:12px;
}
ul {
  padding-left: 0;
}
.wrapper {
  padding: 15px 10px;

  h3 {
    margin-bottom: 20px;
  }
  .submit-btn {
    position: absolute;
    bottom: 120px;
    left: 20px;
  }
  .jump-icon{
    position: absolute;
    bottom: 200px;
    left: 20px;
    color:$color-main;
    cursor: pointer;
    font-size: 20px;
  }

  .pic-wrapper {
    .pic-ul {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;

      li {
        position: relative;
        width: 48%;
        height: 100px;
        border: 1px dashed $color-border-l3;
        margin-bottom: 10px;
        .change-btns{
          position: absolute;
          top: 32px;
          left: 33px;

          i{
            display: inline-block;
            width: 30px;
            height: 30px;
            text-align: center;
            background: rgba(0,0,0,.2);
            border-radius: 50%;
            line-height: 30px;
            color:#fff;
            cursor: pointer;
            margin-right: 10px;
          }
        }
        img {
          width: 100%;
          height: 98px;
        }
        .upload {
          height: 100%;
          background-color: $bg-color-l3;
          text-align: center;
          line-height: 110px;
          cursor: pointer;

          i {
            font-size: 30px;
            color: $text-color-secondary;
          }
        }
      }
      .noPic {
        background: url("../../../assets/img/myShop/default.png") no-repeat
          center 20px;
        background-size: 30px 30px;
        background-color: $bg-color-l3;
        color: $text-color-gray;
        font-size: 12px;
        line-height: 140px;
        text-align: center;
        font-size: 12px;
      }
    }
    span {
      color: $text-color-secondary;
      margin-left: 5px;
    }
  }
  .contact-wrapper {
    height: calc(100% - 260px);
    h4 {
      display: inline-block;
    }
    i {
      font-size: 16px;
      color: $text-color-secondary;
    }
    .contact-explain {
      color: $text-color-secondary;
    }
    /deep/.el-card__body{
      padding: 10px;
    }
    .box-card{
      margin-bottom: 10px;
      a{
        color: $color-main;
        float: right;
        &:hover{
          text-decoration: none;
        }
      }
      p{
        margin-bottom: 0;
        font-weight: bold;
        margin-top: 5px;
      }
    }
  }
  .common-wrapper{
    span{
      font-weight: bold;
      display: inline-block;
      height: 25px;
    }
    .fright{
      float: right;
      span{
        margin-left: 5px;
        font-weight: normal;
        color: $text-color-secondary;
      }
    }
    p{
      color:$text-color-secondary;
    }
  }
  .pro-wrapper{
    height: 100%;
    ul{
      height: calc(100% - 250px);
      overflow-y: auto;
    }
    .must{
      color:$text-color-secondary;
    }
  }
}
</style>