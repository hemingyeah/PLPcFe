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
          @change="saveFunc($event,'productSearchOnMobile')"
        ></el-switch>
        {{productSearchOnMobile?'启用':'禁用'}}
      </div>
    </div>
    <div class="flex-x box-12 bg-w">
      <div class="flex-1">
        <div class="font-16 font-w-600 border-btm">产品二维码管理</div>
        <div class="font-w-600">启用产品二维码功能</div>
        <div class="font-12 mar-top-5">通过二维码标识唯一信息，并支持客户扫码提交服务事件</div>
      </div>
      <div class="mar-top-52">
        <el-switch
          v-model="qrcodeEnabled"
        ></el-switch>
        {{qrcodeEnabled?'启用':'禁用'}}
      </div>
    </div>

    <div class="flex-x box-12 bg-w mar-btm-10">
      <div class="flex-1">
        <div class="font-w-600">产品二维码管理</div>
        <div class="font-12 mar-top-5">生成并管理二维码</div>
      </div>
      <el-button type="primary" @click="openQrcodeList">前往</el-button>
    </div>

    <div class="flex-x box-12 bg-w">
      <div class="flex-1">
        <div class="font-w-600">分配规则</div>
      </div>
      <el-button type="primary" @click="openQrcodeList">新建</el-button>
    </div>
    <div class="flex-x box-12 bg-w">
      <el-table
        border
        stripe
        :data='list'
      >
        <el-table-column prop="level" width="100" label="优先级"></el-table-column>
        <el-table-column prop="ruleName" label="规则名称"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <i class="el-icon-edit pointer" @click="editRule(scope.row.id)"></i>
            <i class="el-icon-delete pointer" @click="deleteRule(scope.row.id,scope.row.isSystem)"></i>
            <i class="iconfont icon-paixuxia pointer" @click="moveRule(scope.$index,'top')"></i>
            <i class="iconfont icon-paixuxia1 pointer" @click="moveRule(scope.$index,'down')"></i>
          </template>
        </el-table-column>
        <el-table-column label='启用/禁用'>
          <template slot-scope="scope">
            <el-switch :disabled='scope.row.isSystem===1' @change="switchEnable($event,scope.row)" v-model="scope.row.checked"></el-switch>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { getRootWindow } from '@src/util/dom';
import {
  queryAllRules,
  removeDistributeRule,
  moveRule,
  modifyDistributeRule,
  saveFunc
} from "@src/api/ProductV2Api";

export default {
  name:'product-set',
  data() {
    return {
      tenantId:'',
      fullscreenLoading: false,
      productSearchOnMobile:true,
      qrcodeEnabled:true,
      list:[],  // 规则列表
    };
  },
  created() {
    const rootWindow = getRootWindow(window);
    this.tenantId=JSON.parse(rootWindow._init).user.tenantId;
  },
  mounted() {
    this.queryAllRules();
  },
  methods:{
    // 启用/禁用 功能设置
    async saveFunc(state,flow){
      const params={
        state,
        flow
      }
      let res=await saveFunc(params);
      console.log(res);
    },
    // 启用/禁用 规则
    async switchEnable(enabled,row){
      const params={
        id:row.id,
        enabled:enabled?1:0
      }
      let res=await modifyDistributeRule(params);
      if(res.code!=='200'){
        this.$platform.alert(res.msg);
      }
    },
    // 规则移动
    async moveRule(index,direction){
      if(index===0 && direction==='top'){
        return
      }
      if(index===this.list.length-1 && direction==='down'){
        return
      }
      let arr=this.list.map(item=>{
        return {
          id:item.id
        }
      });
      let moveItem=arr.splice(index,1);
      if(direction==='top'){
        arr.splice(index-1,0,moveItem[0]);
      }else{
        arr.splice(index+1,0,moveItem[0]);
      }
      arr.forEach((item,index)=>{
        item.level=index+1;
      });
      let res=await moveRule(arr);
      if(res.code==='200'){
        this.queryAllRules();
      }else{
        this.$platform.alert(res.msg);
      }
    },
    // 删除规则
    deleteRule(id,isSystem){
      if(isSystem){
        return this.$platform.alert('默认规则不允许删除');
      }
      this.$confirm('确认删除？','提示',{
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(()=>{
        const params={
          id,
          tenantId:this.tenantId
        }
        removeDistributeRule(params).then(res=>{
          if(res.code==='200'){
            this.queryAllRules();
          }else{
            this.$platform.alert(res.msg);
          }
        })
      }).catch(()=>{})
    },
    // 编辑规则
    editRule(id){
      console.log(id);
    },
    // 获取所有规则
    async queryAllRules(){
      const params={
        tenantId:this.tenantId
      }
      let res=await queryAllRules(params);
      if(res.code==='200'){
        res.data.forEach(item=>{
          item.checked=item.enabled===1?true:false;
        });
        this.list=res.data;
      }else{
        this.$platform.alert(res.msg);
      }
    },
    openTab(){
      window.location.href='/setting/product/fields';
    },
    openQrcodeList(){
      this.$platform.openTab({
        id: 'productQrcode',
        title: '正在加载',
        close: true,
        url: '/product/qrcode',
      })
    }
  }
};
</script>
<style lang="scss" scoped>
.pointer{
  cursor: pointer;
}
.mar-btm-10{
  margin-bottom:10px;
}
.border-btm{
  padding-bottom: 8px;
  margin-bottom: 10px;
  border-bottom:1px solid #eee;
}
.mar-top-52{
  margin-top: 52px;
}
.mar-top-5{
  margin-top: 5px;
}
</style>
