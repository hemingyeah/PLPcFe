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
    <el-dropdown :hide-on-click="false" trigger="click" :show-timeout="150" style="position:absolute;top:50px;right:30px;">
      <span class="el-dropdown-link el-dropdown-btn customize-el-dropdown-btn">
        选择列
        <i class="iconfont icon-nav-down"></i>
      </span>

      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item v-for="(column,index) in columns" :key="column.field">
          <el-checkbox
            :value="column.show"
            :disabled="column.disabled"
            @input="chooseColnum(column,index)"
          >{{column.label}}</el-checkbox>
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
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
      <el-table-column type='selection' fixed width="50"></el-table-column>

      <el-table-column
        v-for="column in columns.filter(item=>item.show)"
        :key='column.field'
        :prop="column.field"
        :label="column.label"
        :width="column.width"
        :min-width="column.minWidth"
        :fixed="column.fixed"
      >
        <template slot-scope="scope">
          <template v-if="column.field==='handleNum'">
            <input
              v-model="scope.row.handleNum"
              @change="handleNumChange(scope.$index,scope.row)"
              :disabled="!scope.row.checked"
              type='number'
              style="width:100%;"
              oninput="value = value.replace(/[^\d.]/g, '').replace(/\.{2,}/g, '.').replace('.', '$#$').replace(/\./g, '').replace('$#$', '.').replace(/^(-)*(\d+)\.(\d\d).*$/, '$1$2.$3').replace(/^\./g, '')"
              :max='scope.row.max'
              :min='0'
            />
          </template>
          <template v-else-if="column.field==='number'">
            {{scope.row.solvedVariation}}/{{scope.row.variation}}
          </template>
          <template v-else>
            {{scope.row[column.field]}}
          </template>
        </template>
      </el-table-column>
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
import StorageUtil from '@src/util/storageUtil';

const STORAGE_MULHANDLE_KEY = 'shb_mul_handle_column';

export default {
  name:'MulHandleForm',
  data(){
    return {
      allTableData:[],
      tableData:[],
      remark:'',
      keyWord:'',
      selected:[],
      columns:this.buildColumns(),
      pending:false
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
            this.remark='';
            this.tableData=JSON.parse(JSON.stringify(this.formdata));
            this.allTableData=JSON.parse(JSON.stringify(this.formdata));
            this.selected=[];
         }
      })
    },
    tableData:{
      handler(val){
        this.allTableData.forEach(item=>{
          const exist=val.find(v=>v.id===item.id);
          if(exist){
            item.handleNum=exist.handleNum;
            item.checked=exist.checked;
          }
        })
      },
      deep:true
    }
  },
  mounted(){
    this.buildColumns();
    this.tableData=JSON.parse(JSON.stringify(this.formdata));
    this.allTableData=JSON.parse(JSON.stringify(this.formdata));
  },
  methods:{
    handleNumChange(index,row){
      this.pending=true;
      const decimals=Math.max(this.countDecimals(row.variation),this.countDecimals(row.solvedVariation));
      if(!(row.handleNum>=0 && row.handleNum<=(row.variation-row.solvedVariation).toFixed(decimals))){
        this.$message({
          type:'warning',
          message:'办理数量需为满足 大于0且小于等于申请量-已办数量 的数字'
        });
        row.handleNum=(row.variation-row.solvedVariation).toFixed(decimals);
      }
      this.$nextTick(()=>{
        this.pending=false;
      })
    },
    buildColumns(){
      let localData = StorageUtil.get(STORAGE_MULHANDLE_KEY) || {};
      let columns=[
        {
          field:'handleNum',
          label:'办理数量',
          minWidth:'100',
          show:true,
          fixed:true,
          disabled:true
        },{
          field:'number',
          label:'已办数量/申请量',
          minWidth:'130',
          show:true,
          fixed:true,
          disabled:true
        },{
          field:'targetName',
          label:'目标仓库',
          show:true,
          minWidth:'100',
        },{
          field:'propserName',
          label:'申请人',
          show:true,
          minWidth:'100',
        },{
          field:'approveNo',
          label:'申请编号',
          show:true,
          minWidth:'140',
        },{
          field:'type',
          label:'申请类型',
          show:true,
          minWidth:'100',
        },{
          field:'propserTime',
          label:'申请日期',
          show:true,
          minWidth:'160',
        },{
          field:'name',
          label:'备件名称',
          show:true,
          minWidth:'120',
        },{
          field:'serialNumber',
          label:'编号',
          show:true,
          minWidth:'100',
        },{
          field:'sType',
          label:'类别',
          show:true,
          minWidth:'100',
        },{
          field:'standard',
          label:'规格',
          show:true,
          minWidth:'120',
        },{
          field:'unit',
          label:'单位',
          show:true,
          minWidth:'60',
        },{
          field:'sourceName',
          label:'原始仓库',
          show:true,
          minWidth:'120',
        },{
          field:'repertoryCount',
          label:'原仓库存',
          show:true,
          minWidth:'90',
        }
      ];
      columns.forEach(column => {
        let isShow = localData[column.field];
        if (typeof isShow == 'boolean') column.show = isShow;
      });
      return columns;
    },
    // 单个选择
    tableSelect(selection,row){
      if(selection.length>20){
        this.$message({
          message:'单次办理数量不能超过20条',
          type:'error'
        })
        for(let i=20;i<selection.length;i++){
          this.$refs.selectTable.toggleRowSelection(selection[i],false);
        }
        return
      }
      if(selection.length){
        let exist=this.selected.find(item=>item.id===row.id);
        if(exist){
          row.checked=false;
          row.handleNum='';
          this.selected=this.selected.filter(item=>item.id!==row.id);
        }else{
          const max=(row.variation-row.solvedVariation).toFixed(decimals);
          const decimals=Math.max(this.countDecimals(row.variation),this.countDecimals(row.solvedVariation));
          row.max=max;
          row.checked=true;
          row.handleNum=max;
          this.selected.push(row);
        }
      }else{
        row.checked=false;
        row.handleNum='';
        this.selected=[];
      }
    },
    // 全选
    selectAll(selection){
      let selections=[];
      if(selection.length>20){
        this.$platform.confirm('单次办理数量不能超过20条，是否选择前20条进行办理？').then(res=>{
          if(res){
            for(let i=selection.length-1;i>=20;i--){
              this.$refs.selectTable.toggleRowSelection(selection[i],false);
            }
            selections=selection.slice(0,20);
            this.selectChange(selections);
          }else{
            this.$refs.selectTable.clearSelection();
          }
        });
      }else if(selection.length>0){
        selections=[...selection];
        this.selectChange(selections);
      }else{
        this.tableData.forEach(item=>{
          item.checked=false;
          item.handleNum='';
        });
        this.selected=this.selected.filter(item=>!this.tableData.find(t=>t.id===item.id));
      }
    },
    selectChange(selections){
      if(selections.length>0){
        const leftArr=selections.filter(item=>!this.selected.find(sItem=>sItem.id===item.id));
        leftArr.forEach(item=>{
          const decimals=Math.max(this.countDecimals(item.variation),this.countDecimals(item.solvedVariation));
          const max=(item.variation-item.solvedVariation).toFixed(decimals);
          item.checked=true;
          item.max=max;
          item.handleNum=max;
        });
      }else{
        this.tableData.forEach(item=>{
          item.checked=false;
          item.handleNum='';
        });
      }
      this.selected=[...selections,...this.selected];
    },
    // 获取小数位数
    countDecimals(num){
      if(Math.floor(num)===num) return 0;
      return num.toString().split('.')[1].length || 0;
    },
    // 选择列
    chooseColnum(column,index){
      this.$tdOnEvent('pc：办理出入库-批量办理-选择列事件');

      column.show = !column.show;
      let data = {};
      this.columns.forEach(item => (data[item.field] = item.show));
      StorageUtil.save(STORAGE_MULHANDLE_KEY, data);
    },
    // 搜索
    search(){
      this.tableData=this.allTableData.filter(item=>{
        return item.name.toString().indexOf(this.keyWord)>-1
          || item.serialNumber.toString().indexOf(this.keyWord)>-1
          || item.standard.toString().indexOf(this.keyWord)>-1
          || item.sType.toString().indexOf(this.keyWord)>-1
          || item.approveNo.toString().indexOf(this.keyWord)>-1
      });
      this.tableData.forEach(item=>{
        if(item.checked){
          this.$nextTick(()=>{
            this.$refs.selectTable.toggleRowSelection(item,true);
          })
        }
      })
    },
    // 重置
    reset(){
      this.keyWord='';
      this.search();
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