<template>
  <div>
    <el-table stripe
        :data="fdata"
       >
        <el-table-column v-for="column in columns" :key="column.field" :fdate='fdata'
          v-if="column.show"
          :label="column.label"
          :width="column.width"
          show-overflow-tooltip>

          <template slot-scope="scope">
             <template v-if="column.field == 'propserName'">
              <template>{{scope.row.propserName}}</template>
            </template> 
            <template v-else-if="column.field == 'type'">
              <template>{{scope.row && scope.row.type}}</template>
            </template>
            <template v-else-if="column.field == 'propserTime'">
              <template>{{scope.row.propserTime}}</template>
            </template>
            <template v-else-if="column.field == 'name'">
              <template v-if="scope.row.sparepartRepertory">{{scope.row.sparepartRepertory.sparepart&&scope.row.sparepartRepertory.sparepart.name}}</template>
            </template>
            <template v-else-if="column.field == 'serialNumber'">
              <template v-if="scope.row.sparepartRepertory">{{scope.row.sparepartRepertory.sparepart&&scope.row.sparepartRepertory.sparepart.serialNumber}}</template>
            </template>
            <template v-else-if="column.field == 'sparepart.type'">
              <template v-if="scope.row.sparepartRepertory">{{scope.row.sparepartRepertory.sparepart&&scope.row.sparepartRepertory.sparepart.type}}</template>
            </template>
            <template v-else-if="column.field == 'sparepart.standard'">
              <template v-if="scope.row.sparepartRepertory">{{scope.row.sparepartRepertory.sparepart&&scope.row.sparepartRepertory.sparepart.standard}}</template>
            </template>
            <template v-else-if="column.field == 'repertory'">
              <template v-if="scope.row.sparepartRepertory">{{scope.row.sparepartRepertory.repertory&&scope.row.sparepartRepertory.repertory.name}}</template>
            </template>
             <template v-else-if="column.field == 'variation'">
               {{variationNum(scope.row.variation, scope.row.solvedVariation)}}
            </template>
            <template v-else-if="column.field == 'passnumber'" slot-scope="scope">
               <el-input v-model="scope.row.number" type="number" step="any" :min="0" :max="variationNum(scope.row.variation, scope.row.solvedVariation)"></el-input>
            </template>
            <template v-else-if="column.field == 'enable'" slot-scope="scope">
               <template v-if="scope.row.state == 'solved'">
                  <el-button type="text" size="small" class="no-padding" style="color:#333;cursor: text;"> 已办理</el-button>
              </template>
              <template v-if="scope.row.state == 'suspending'">
                <template v-if="scope.row.type == '申领' ">
                  <el-button type="text" size="small" class="no-padding" style="color:#333;cursor: text;"> 出库</el-button>
                </template>
                <template v-if="scope.row.type == '退回' ">
                  <el-button type="text" size="small" class="no-padding" style="color:#333;cursor: text;"> 入库</el-button>
                </template>
              </template>
              
            </template>
            <template v-else>
              {{scope.row[column.field]}}
            </template>
          </template>

        </el-table-column>
      </el-table>

      <div class="in-stock-remark">
        <textarea maxlength="500" placeholder="请输入备注内容" v-model="remark"></textarea>
      </div>
  </div>
</template>

<script>
import MathUtil from '@src/util/math';

export default {
  name: 'part-applybatchin-form',
  inject: ['initData'],
  props: {
    formdata: {
      type: Array,
      default: []
    },
    sparepartConfig: {
      type: Object,
      default: {}
    },
  },
  data(){
    return {
      form: {
        type: '申领',
        content: ''
      },
      numberValidateForm: {
        number: ''
      },
      rules: {
        content: [
          {required: true, message: '请输入备注内容'},
          {max: 500, message: '备注内容不能超过500字'}
        ],
        number:[
          { required: true, message: '数量不能为空'}
        ]
      },
      columns: this.buildColumns(),
      fdata: this.initData(this.formdata),
      remark:''
    }
  },
  methods: {
    async pack(){
      try {
        let obj = this.fdata
        let parms = [];
        for(let i = 0; i < obj.length;i++){
          let count = this.decimalNumber(obj[i].number);

          if(obj[i].number > 0){
            if(count != -1){
              if(count == 0) {
                this.$platform.alert('请填写大于0的正整数')
                return
              } else {
                this.$platform.alert(`请填写大于0的${ count }位小数`)
                return
              }
            }else if(obj[i].number > Number(this.variationNum(obj[i].variation, obj[i].solvedVariation))){
              this.$platform.alert('通过数不能大于申请数')
              return
            }else{
              let parm = {}
              parm['id'] = obj[i].id
              parm['solvedVariation'] = obj[i].number
              parm['repertoryId'] = obj[i].repertoryId
              parm['type'] = obj[i].type
              parm['remark'] = this.remark
              parms.push(parm)
            }
          }else{
            let initData = this.initData;
            let msg = initData.precision ? `请填写大于0的${ initData.precision }位小数` : '请填写大于0的整数'
            this.$platform.alert(msg)
            return
          }
        }
        return parms
      } catch (error) {
        console.log(error)
      }

      return null;
    },
    selectOutType(ele){
      let type = ele.target.value;
      this.type = type;
    },
    initData(obj){
      let data = JSON.parse(JSON.stringify(obj))

      return data.map(row => {
        row.number = this.variationNum(row.variation, row.solvedVariation)
        return row;
      });
    },
    buildColumns(){
      return [
        {
          label: '申请人',
          field: 'propserName',
          show: true
        },
        {
          label: '类别',
          field: 'type',
          show: true,
          width:'50px'
        },
        {
          label: '申请时间',
          field: 'propserTime',
          show: true,
          width:'150px'
        },
        {
          label: '备件名称',
          field: 'name',
          show: true
        },
        {
          label: '备件编号',
          field: 'serialNumber',
          show: true
        },
        {
          label: '备件类别',
          field: 'sparepart.type',
          show: true
        },
        {
          label: '备件规格',
          field: 'sparepart.standard',
          show: true
        },
        {
          label: '仓库',
          field: 'repertory',
          show: true
        },
        {
          label: '申请数',
          field: 'variation',
          show: true
        },
        {
          label: '通过数',
          field: 'passnumber',
          show: true
        },
        {
          label: '操作',
          field: 'enable',
          width: '150px',
          show: true
        }
      ]
    },
    decimalNumber(num) {
      let initData = this.initData;
      let count = MathUtil.decimalNumber(num);
      let isPartV2 = initData.isSparepart2;

      if(!isPartV2 && count != 0) return 0;
      if(initData.precision >= count) return -1;
      return initData.precision;
    },
    variationNum (num1, num2) {
      if(num1 == num2) return num1;
      return this.$math.format(this.$math.subtract(this.$math.bignumber(num1), this.$math.bignumber(num2)))
    },
  },
  computed: {
    // TODO: 支持小数 提示
    minNumber () {
      let initData = this.initData;
      return !initData || !initData.precision ? 1 : (initData.precision == 1 ? 0.1 : 0.01);
    }
  },
  mounted(){
    // this.form.type = this.sparepartConfig.outStoreType[0];
  },
}
</script>

<style lang="scss">
.el-form-item{
  margin-bottom: 0
}
.el-form-item__error{
  position: relative;
}
#outType{
  width: 100%;
  height: 34px;
}

.in-stock-remark{
  width:100%;
  display:flex;
  margin:10px 0 0;
  padding:0 5px;
  textarea{
    flex:1;
    height:40px;
    min-height:40px;
    padding:10px;
    border-color:#dadada;
    &:focus{
      outline: none;
      border-color: $color-primary;
    }  
  }   
}
</style>