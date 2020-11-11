<template>
  <div class="normal-box">
    <!-- 仅看数据展示 start -->
    <div class="flex-x only-see-box">
      <div class="form-only-see flex-x" v-for="(item,index) in formArr" :key="index">
        <div class="form-only-see-title">{{item.lable}}</div>
        <div v-if="item.lable==='办理状态'" :class='"form-only-see-state form-only-see-"+item.state'>{{item.value}}</div>
        <div v-else-if="item.lable==='目标仓库'" class="form-only-see-input">
          {{item.value}}
          <el-popover
            v-if="propData.data.type==='退回' && (propData.data.state==='suspending' || propData.data.state==='dealing')"
            width="50%"
            trigger="click"
            v-model="show"
            placement="right"
          >
            <div>
              <p>修改目标仓库</p>
              <p class="popover-line"></p>
              <div>
                <span>目标仓库：</span>
                <el-select
                  filterable
                  v-model="targetId"
                >
                  <el-option
                    v-for="item in targetList"
                    :key='item.id'
                    :label='item.name'
                    :value='item.id'
                  ></el-option>
                </el-select>
                <p class="popover-line" style="margin-top:12px;"></p>
                <base-button
                  type="primary"
                  style="float:right;"
                  @event="submitEditTarget"
                >确 定</base-button>
                <base-button
                  class="mar-r-15"
                  type="ghost"
                  style="float:right;"
                  @event="show=false"
                >取 消</base-button>
              </div>
            </div>
            <i slot="reference" @click="editTargetRepertory" class="iconfont icon-bianji"></i>
          </el-popover>
        </div>
        <div v-else-if="item.lable==='申请人'">
          {{item.value}}
          <span v-if="propData.data.type==='退回' && loginUserId!==propData.arr[0].propser" class="form-only-see-state form-only-see-suspending">非本人发起</span>
        </div>
        <div v-else class="form-only-see-input">{{item.value}}</div>
      </div>
    </div>
    <!-- 仅看数据展示 end -->

    <!-- 备注 start-->

    <div class="flex-x mar-b-20 al-start">
      <div class="form-only-see-title mar-r-15">申请备注</div>
      <div>{{propData.data.remark}}</div>
    </div>
    <!-- 备注 end -->

    <!-- 备件清单 start-->
    <div class="mar-b-20" v-if="propData.data.state!=='suspending' && propData.data.state!=='dealing'">
      <div class="mar-b-15 font-w-500">备件清单</div>
      <el-table border :data="propData.arr" stripe :key="partDealKey" style="width: 100%" max-height="350">
        <el-table-column type='index' label='序号' width='50px'></el-table-column>
        <el-table-column
          v-for="(item,index) in tableColumnReadonly"
          :key="index"
          :prop="item.prop"
          :label="item.lable"
          :min-width="item.width"
          :fixed="item.fixed"
        >
          <template slot-scope="scope">
            <template v-if="item.field==='price'">{{countPrice(scope.row)}}</template>
            <template v-else-if="item.field==='sourceTargetName'">{{propData.data.sourceTargetName}}</template>
            <template v-else-if="item.field==='child_2'">{{scope.row.sparepart[item.prop]}}</template>
            <template v-else>{{scope.row[item.prop]}}</template>
          </template>
        </el-table-column>
      </el-table>
      <p class="total">合计：￥{{total}}</p>
    </div>
    <div class="mar-b-20" v-else>
      <div class="mar-b-15 font-w-500">备件清单</div>
      <el-table
        :key="partDealKey"
        border
        @select="tableSelect"
        @select-all="selectAll"
        :data="propData.arr"
        ref="selectTable"
        stripe
        style="width: 100%"
        max-height="350"
      >
        <el-table-column type='selection' width='50px'></el-table-column>
        <el-table-column
          v-for="(item,index) in tableColumn"
          :key="index"
          :prop="item.prop"
          :label="item.lable"
          :min-width="item.width"
          :fixed="item.fixed"
          :align='item.align'
          :show-overflow-tooltip='true'
        >
          <template slot-scope="scope">
            <template v-if="item.normalType==='controler'">
              <input
                type='number'
                style="width:100%;"
                :max='scope.row.max'
                :min='0'
                :disabled="!scope.row.checked"
                v-model="scope.row.handleNum"
                oninput="value = value.replace(/[^\d.]/g, '').replace(/\.{2,}/g, '.').replace('.', '$#$').replace(/\./g, '').replace('$#$', '.').replace(/^(-)*(\d+)\.(\d\d).*$/, '$1$2.$3').replace(/^\./g, '')"
              />
            </template>
            <template v-else-if="item.field==='price'">{{countPrice(scope.row)}}</template>
            <template v-else-if="item.field==='mulNumber'">{{scope.row.solvedVariation}}/{{scope.row.variation}}</template>
            <template v-else-if="item.field==='child_2'">{{scope.row.sparepart[item.prop]}}</template>
            <template v-else-if="item.field==='sourceTargetName'">{{propData.data.sourceTargetName}}</template>
            <template v-else>{{scope.row[item.prop]}}</template>
          </template>
        </el-table-column>
      </el-table>
      <p class="total">合计：￥{{total}}</p>
    </div>
    
    <!-- 备件清单 end-->
    <div>
      <!-- <div v-if="inputonlyread===false && propData.data.approved">
        <div class="mar-b-15 font-w-500">办理意见</div>

        <el-input
          type="textarea"
          maxlength="500"
          resize="none"
          :autosize="{ minRows: 2, maxRows: 6 }"
          :placeholder="inputonlyread?'':'请输入办理意见[500个字以内]'"
          v-model="suggestion"
          :readonly="inputonlyread"
        ></el-input>
      </div> -->
      <div v-if="propData.data.state==='suspending' || propData.data.state==='dealing'">
        <div class="mar-b-15 font-w-500">办理意见</div>
        <el-input
          type="textarea"
          maxlength="500"
          resize="none"
          :autosize="{ minRows: 2, maxRows: 6 }"
          placeholder="请输入办理意见[500个字以内]"
          v-model="suggestion"
        ></el-input>
      </div>
    </div>

    <!-- 办理日志 start -->
    <div class="mar-b-20" style="margin-top:20px;">
      <div class="mar-b-15 font-w-500">办理日志</div>
      <p class="partP" v-for="item in logs" :key='item.id'>
        <span style="width:180px;" :title="item.executorName">办理人：{{item.executorName}}</span>
        <span style="width:230px;">办理时间：{{formmatTime(item.createTime)}}</span>
        <!-- <span style="width:230px;">出入库编号：
          <span style="color:#55b7b4;cursor:pointer;" @click="toWareRecord(item.approveNo)">{{item.approveNo}}</span>
        </span> -->
        <span style="width:calc(100% - 430px);" :title='item.remark'>办理意见：{{item.remark}}</span>
      </p>
    </div>
    <!-- 办理日志 end -->
  </div>
</template>
<script>
import { mathMul, mathAccSub } from "@src/util/math";
import { forEach } from 'lodash';
import { updateBackTarget } from '@src/api/SparePart';

export default {
  name: "part-deal-with-form",
  props: {
    propData: {
      type: Object
    },
    partDealKey:{
      type:Number
    },
    targetList:Array,
    loginUserId:String
  },
  watch:{
    partDealKey(newVal){
       this.$nextTick(()=>{
         if(this.$refs.selectTable){
            this.selects=[];
            this.$refs.selectTable.toggleAllSelection();
         }
        this.formArr=[
          { lable: "申请日期", value: this.propData.data.prosperTime },
          { lable: "申请编号", value: this.propData.data.approveNo },
          { lable: "申请类型", value: this.propData.data.type },
          { lable: "申请人", value: this.propData.data.prosperName },
          { lable: "目标仓库", value: this.propData.data.targetName },
          { lable: "办理状态", value: this.getStateText(this.propData.data.state),state:this.propData.data.state }
        ];
         this.formArr[4].value=this.propData.data.targetName;
      })
    }
  },
  mounted(){
    this.$nextTick(()=>{
        if(this.$refs.selectTable){
          this.selects=[];
          this.$refs.selectTable.toggleAllSelection();
        }
    })
  },
  computed: {
    // formArr() {
    //   let arr = [
    //     { lable: "申请日期", value: this.propData.data.prosperTime },
    //     { lable: "申请编号", value: this.propData.data.approveNo },
    //     { lable: "申请类型", value: this.propData.data.type },
    //     { lable: "申请人", value: this.propData.data.prosperName },
    //     { lable: "目标仓库", value: this.propData.data.targetName },
    //     { lable: "办理状态", value: this.getStateText(this.propData.data.state),state:this.propData.data.state }
    //   ];
    //   return arr;
    // },
    total(){
      let price=0;
      this.propData.arr.forEach(item=>{
        price+=mathMul(item.variation, item.sparepart.salePrice)
      });
      return price.toFixed(2);
    },
    logs(){
      return this.propData.progress.filter(item=>item.state!==0)
    }
  },
  data() {
    let validateNumber = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入数量"));
      } else if (value < 0) {
        callback(new Error("请输入大于或等于0的数"));
      } else if (
        !/^(([0-9][0-9]*)|(([0]\.\d{1,2}|[0-9][0-9]*\.\d{1,2})))$/.test(value)
      ) {
        callback(new Error("最多保留两位小数"));
      } else {
        callback();
      }
    };
    let tableColumnReadonly=[
      {
        field: "child_2",
        prop: "serialNumber",
        lable: "备件编号",
        width: "100"
      },
      {
        field: "child_2",
        prop: "name",
        lable: "备件名称",
        width: "120"
      },
      {
        field: "child_2",
        prop: "standard",
        lable: "规格",
        width: "120"
      },
      {
        field: "child_2",
        prop: "unit",
        lable: "单位",
        width: "60"
      },
      {
        field: "variation",
        prop: "variation",
        lable: "申请数量",
        width: "70"
      },
      {
        field: "solvedVariation",
        prop: "solvedVariation",
        lable: "办理数量",
        width: "100"
      },
      {
        field: "sourceTargetName",
        prop: "sourceTargetName",
        lable: "原仓库",
        width: "120"
      },
      {
        field: "price",
        prop: "data1",
        lable: "金额(¥)",
        width: "100"
      },
    ];
    let tableColumn = [
      {
        normalType: "controler",
        lable: "办理数量",
        width: "100",
        prop:'solvedVariation',
        fixed: "left"
      },
      {
        field: "mulNumber",
        prop: "mulNumber",
        lable: "已办理量/申请量",
        fixed: "left",
        width: "130",
        align:'center'
      },
      {
        field: "child_2",
        prop: "name",
        lable: "备件名称",
        width: "120"
      },
      {
        field: "child_2",
        prop: "serialNumber",
        lable: "编号",
        width: "100"
      },
      {
        field: "child_2",
        prop: "standard",
        lable: "规格",
        width:'120'
      },
      {
        field: "child_2",
        prop: "unit",
        lable: "单位",
        width: "60"
      },
      {
        field: "sourceTargetName",
        prop: "sourceTargetName",
        lable: "原仓库",
        width: "120"
      },
      {
        field: "repertoryCount",
        prop: "repertoryCount",
        lable: "原仓库存",
        width: "90"
      },
      {
        field: "price",
        prop: "data1",
        lable: "金额(¥)",
        width: "100"
      }
    ];
    let inputonlyread = this.propData.data.state !== "suspending";
    let selects=[];
    return {
      input: "测试数据",
      rules: {
        number: [{ validator: validateNumber, trigger: "change" }]
      },
      suggestion: "",
      tableColumn,
      tableColumnReadonly,
      inputonlyread,
      selects,
      show:false,
      targetId:'',
      formArr:[
        { lable: "申请日期", value: this.propData.data.prosperTime },
        { lable: "申请编号", value: this.propData.data.approveNo },
        { lable: "申请类型", value: this.propData.data.type },
        { lable: "申请人", value: this.propData.data.prosperName },
        { lable: "目标仓库", value: this.propData.data.targetName },
        { lable: "办理状态", value: this.getStateText(this.propData.data.state),state:this.propData.data.state }
      ]
    };
  },
  methods: {
    // 确认修改目标仓库
    submitEditTarget(){
      if(!this.targetId){
        return this.$platform.alert('请选择目标仓库');
      }
      const params={
        approveNo:this.propData.data.approveNo,
        repertoryId:this.targetId
      }
      updateBackTarget(params).then(res=>{
        if(res.code===0){
          this.show=false;
          this.$emit('updateDetail',this.propData.data);
        }else{
          this.$platform.alert(res.message);
        }
      });
    },
    // 修改目标仓库 弹出
    editTargetRepertory(){
      this.show=true;
      const exist=this.targetList.find(item=>item.id===this.propData.data.targetId);
      if(exist){
        this.targetId=this.propData.data.targetId;
      }else{
        this.targetId='';
      }
    },
    // 跳转到出入库记录
    toWareRecord(data){
      this.$platform.openTab({
        url:'/partV2/repertory/record?fromId='+data,
        title: '正在加载',
        close: true,
      })
    },
    // 单个选择
    tableSelect(selection,row){
      this.selects=[...selection];
      const exist=selection.find(item=>item.id===row.id);
      if(exist){
        const decimals=Math.max(this.countDecimals(row.variation),this.countDecimals(row.solvedVariation));
        row.max=(row.variation-row.solvedVariation).toFixed(decimals);
        row.checked=true;
        row.handleNum=(row.variation-row.solvedVariation).toFixed(decimals);
      }else{
        row.checked=false;
        row.handleNum='';
      }
    },
    // 全选
    selectAll(selection){
      if(selection.length>0){
        const leftArr=selection.filter(item=>!this.selects.find(sItem=>sItem.id===item.id));
        leftArr.forEach(item=>{
          const decimals=Math.max(this.countDecimals(item.variation),this.countDecimals(item.solvedVariation));
          item.checked=true;
          item.max=(item.variation-item.solvedVariation).toFixed(decimals);
          item.handleNum=(item.variation-item.solvedVariation).toFixed(decimals);
        });
      }else{
        // if((this.propData.data.type==='调拨' || this.propData.data.type==='分配') && this.propData.data.state==='suspending'){
        //   this.propData.arr.forEach(item=>{
        //     item.checked=true;
        //     item.disabled=true;
        //     const decimals=Math.max(this.countDecimals(item.variation),this.countDecimals(item.solvedVariation));
        //     item.handleNum=(item.variation-item.solvedVariation).toFixed(decimals);
        //     this.$refs.selectTable.toggleRowSelection(item,true);
        //   });
        // }else{
        //   this.propData.arr.forEach(item=>{
        //     item.checked=false;
        //     item.handleNum='';
        //   });
        // }
        this.propData.arr.forEach(item=>{
          item.checked=false;
          item.handleNum='';
        });
      }
      this.selects=[...selection];
    },
    // 获取小数位数
    countDecimals(num){
      if(Math.floor(num)===num) return 0;
      return num.toString().split('.')[1].length || 0;
    },
    formmatTime(time){
      const t=new Date(time);
      const year=t.getFullYear();
      const month=(t.getMonth()+1).toString().padStart(2,'0');
      const day=(t.getDate()).toString().padStart(2,'0');
      const hour=(t.getHours()).toString().padStart(2,'0');
      const minute=(t.getMinutes()).toString().padStart(2,'0');
      const second=(t.getSeconds()).toString().padStart(2,'0');
      return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    },
    getStateText(state){
      switch(state){
        case 'solved':
          return '已办理'
        case 'suspending':
          return '待办理'
        case 'dealing':
          return '办理中'
        case 'cancel':
          return '已取消'
        case 'rejected':
          return '已拒绝'
        case 'revoked':
          return '已撤回'
        default:
          return ''
      }
    },
    countPrice(obj) {
      return mathMul(obj.variation, obj.sparepart.salePrice);
    },
    getData() {
      return this.validator();
    },
    validator() {
      return new Promise((resolves, rejects) => {
        // let func_arr = [];

        // for (let index = 0; index < this.propData.arr.length; index++) {
        //   const func = new Promise((resolve, reject) => {
        //     this.$refs["ruleForm"][index].validate((valid, obj) => {
        //       let keys = Object.keys(this.rules);
        //       if (valid) resolve();
        //       keys.forEach(item => {
        //         if (obj.hasOwnProperty(item) === true) {
        //           reject(obj[item]);
        //           return false;
        //         }
        //       });
        //     });
        //   });
        //   func_arr.push(func);
        // }

        let type = (this.propData.data && this.propData.data.type) || '';
        let isApply = type === '申领';

        const noCheck=this.propData.arr.find(item=>item.checked);
        if(!noCheck){
          rejects(new Error('请选择办理项'));
          return false
        }
        const checks=this.propData.arr.filter(item=>item.checked);
        checks.forEach(item=>{
          // 只处理申领
          if(item.handleNum*1>item.repertoryCount && isApply){
            rejects(
              new Error(
                `"${
                  item.sparepart.name.length > 10
                    ? `${item.sparepart.name.slice(0, 9)}...`
                    : item.sparepart.name
                }"的库存数量不足`
              )
            );
            return false
          }
          if(item.handleNum*1>mathAccSub(item.variation,item.solvedVariation)){
            rejects(
              new Error(
                `"${
                  item.sparepart.name.length > 10
                    ? `${item.sparepart.name.slice(0, 9)}...`
                    : item.sparepart.name
                }"的办理数量不得大于可办理数量`
              )
            );
            return false;
          }
        });
        let { suggestion, propData } = this;
        resolves({
          suggestion,
          propData
        });

        // Promise.all(func_arr)
        //   .then(res => {
        //     this.propData.arr.forEach(element => {
        //       // 只处理申请情况
        //       if (element.number * 1 > element.repertoryCount && isApply) {
        //         rejects(
        //           new Error(
        //             `"${
        //               element.sparepart.name.length > 10
        //                 ? `${element.sparepart.name.slice(0, 9)}...`
        //                 : element.sparepart.name
        //             }"的库存数量不足`
        //           )
        //         );
        //         return false;
        //       }
        //       if (
        //         element.number * 1 >
        //         mathAccSub(element.variation, element.solvedVariation)
        //       ) {
        //         rejects(
        //           new Error(
        //             `"${
        //               element.sparepart.name.length > 10
        //                 ? `${element.sparepart.name.slice(0, 9)}...`
        //                 : element.sparepart.name
        //             }"的办理数量不得大于可办理数量`
        //           )
        //         );
        //         return false;
        //       }
        //     });
        //     let { suggestion, propData } = this;
        //     resolves({
        //       suggestion,
        //       propData
        //     });
        //   })
        //   .catch(obj => {
        //     rejects(obj[0]);
        //   });
      });
    },
    resetData() {
      this.suggestion = "";
    }
  }
};
</script>

<style lang="scss" scoped>
.popover-line{
  border-top: 1px solid $color-border-l4;
  position: relative;
  left: -12px;
  width: calc(100% + 24px);
}

.icon-bianji{
  color:$color-primary;
  cursor: pointer;
}
.total{
  text-align: right;
  margin-top: 10px;
}
.normal-box {
  padding: 10px;
  box-sizing: border-box;
}
.flex-x {
  display: flex;
  align-items: center;
}
.flex-1 {
  flex: 1;
}
.mar-r-15 {
  margin-right: 15px;
}
.mar-b-15 {
  margin-bottom: 15px;
}
.mar-b-20 {
  margin-bottom: 20px;
}
.font-w-500 {
  font-weight: 500;
}
.form-only-see {
  width: 33.3%;
  margin-bottom: 15px;
  .form-only-see-input {
    width: 180px;
  }

  .form-only-see-state{
    border-radius: 14px;
    padding: 3px 10px;
  }
  // 已办理
  .form-only-see-solved{
    color:#67C23A;
    background: rgba(103,194,58,.2);
    border:1px solid rgba(103,194,58,.16);
  }
  // 待办理，办理中
  .form-only-see-suspending,.form-only-see-dealing{
    color:#FAAE14;
    background: rgba(250,174,20,.2);
    border:1px solid rgba(250,174,20,.16);
  }
  // 已取消
  .form-only-see-cancel{
    color:#999999;
    background: rgba(153,153,153,.2);
    border:1px solid rgba(153,153,153,.16);
  }
  // 已拒绝
  .form-only-see-rejected{
    color:#F56C6C;
    background: rgba(245,108,108,.2);
    border:1px solid rgba(245,108,108,.16);
  }
  // 已撤回
  .form-only-see-revoked{
    color:#999999;
    background: rgba(153,153,153,.2);
    border:1px solid rgba(153,153,153,.16);
  }
}

.form-only-see-title {
  min-width: 56px;
  margin-right: 15px;
  font-weight: bold;
}
.only-see-box {
  flex-wrap: wrap;
}
.overHideCon-1 {
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
  overflow: hidden;
}
.al-start {
  align-items: flex-start;
}

.partP{
  span{
    display: inline-block;
    // overflow: hidden;
    // text-overflow:ellipsis;
    // white-space: nowrap;
  }
}
</style>
