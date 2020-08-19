<template>
  <div>
    <div class="customer-list-base-search-group">
      <el-input v-model="keyWord" placeholder="根据备件信息搜索" style="width:300px;">
        <i slot="prefix" class="el-input__icon el-icon-search"></i>
      </el-input>
      <base-button
        type="primary"
        @event="search()"
        native-type="submit"
      >搜索</base-button>
      <base-button type="ghost" @event="reset()">重置</base-button>
    </div>
    <el-table
      class="mar-b-10 mar-t-15"
      :data='tableData'
      stripe
      :key="mulHandleKey"
      style="width: 100%"
      max-height="350"
      ref='selectTable'
      @select="tableSelect"
      @select-all="selectAll"
    >
      <el-table-column type='selection' width="50"></el-table-column>
      <el-table-column label='办理数量' width="100">
        <template slot-scope="scope">
          <el-input v-model="scope.row.handleNum" :disabled="!scope.row.checked" type='number' :max='scope.row.max' :min='0'></el-input>
        </template>
      </el-table-column>
      <el-table-column label='已办数量/申请量' width="130">
        <template slot-scope="scope">
          {{scope.row.solvedVariation}}/{{scope.row.variation}}
        </template>
      </el-table-column>
      <el-table-column label='目标仓库' prop='targetName' width="100"></el-table-column>
      <el-table-column label='申请人' prop='propserName' width="100"></el-table-column>
      <el-table-column label='申请编号' prop='approveNo' width="140"></el-table-column>
      <el-table-column label='申请类型' prop='type' width="100"></el-table-column>
      <el-table-column label='申请日期' prop='propserTime' width="160"></el-table-column>
      <el-table-column label='备件名称' prop='name' width="120"></el-table-column>
      <el-table-column label='编号' prop='serialNumber' width="100"></el-table-column>
      <el-table-column label='类别' prop='sType' width="100"></el-table-column>
      <el-table-column label='规格' prop='standard' width="120"></el-table-column>
      <el-table-column label='单位' prop='unit' width="60"></el-table-column>
      <el-table-column label='原始仓库' prop='sourceName' width="120"></el-table-column>
      <el-table-column label='原仓库存' prop='repertoryCount' width="90"></el-table-column>
    </el-table>
    <div>
      <div class="mar-b-15 font-w-500">办理意见</div>
      <el-input
        type="textarea"
        maxlength="500"
        resize="none"
        :autosize="{ minRows: 2, maxRows: 6 }"
        placeholder="请输入办理意见[500个字以内]"
        v-model="remark"
      ></el-input>
    </div>
  </div>
</template>

<script>
export default {
  name:'MulHandleForm',
  data(){
    return {
      allTableData:[],
      tableData:[],
      remark:'',
      keyWord:'',
      selected:[]
    }
  },
  props:{
    formdata:{
      type:Array,
      default:[]
    },
    mulHandleKey:{
      type:Number,
      default:1
    }
  },
  watch:{
    mulHandleKey(newVal){
       this.$nextTick(()=>{
         if(this.$refs.selectTable){
            this.keyWord='';
            this.tableData=JSON.parse(JSON.stringify(this.formdata));
            this.allTableData=JSON.parse(JSON.stringify(this.formdata));
            this.selected=[];
         }
      })
    }
  },
  mounted(){
    this.tableData=JSON.parse(JSON.stringify(this.formdata));
    this.allTableData=JSON.parse(JSON.stringify(this.formdata));
  },
  methods:{
    // 单个选择
    tableSelect(selection,row){
      this.selected=[...selection];
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
        const leftArr=selection.filter(item=>!this.selected.find(sItem=>sItem.id===item.id));
        leftArr.forEach(item=>{
          const decimals=Math.max(this.countDecimals(item.variation),this.countDecimals(item.solvedVariation));
          item.checked=true;
          item.max=(item.variation-item.solvedVariation).toFixed(decimals);
          item.handleNum=(item.variation-item.solvedVariation).toFixed(decimals);
        });
      }else{
        this.tableData.forEach(item=>{
          item.checked=false;
          item.handleNum='';
        });
      }
      this.selected=[...selection];
    },
    // 获取小数位数
    countDecimals(num){
      if(Math.floor(num)===num) return 0;
      return num.toString().split('.')[1].length || 0;
    },
    // 搜索
    search(){
      this.tableData=this.allTableData.filter(item=>{
        return item.name.toString().indexOf(this.keyWord)>-1
          || item.serialNumber.toString().indexOf(this.keyWord)>-1
          || item.standard.toString().indexOf(this.keyWord)>-1
          || item.sType.toString().indexOf(this.keyWord)>-1
      });
      this.tableData.forEach(item=>{
        item.checked=false;
        item.handleNum='';
      });
      this.selected=[];
    },
    // 重置
    reset(){
      this.keyWord='';
      this.tableData=JSON.parse(JSON.stringify(this.formdata));
    }
  }
}
</script>

<style lang="scss" scoped>
.mar-b-10 {
  margin-bottom: 10px;
}
.mar-b-15 {
  margin-bottom: 15px;
}
.mar-t-15{
  margin-top: 15px;
}
.font-w-500{
  font-weight: 500;
}
</style>