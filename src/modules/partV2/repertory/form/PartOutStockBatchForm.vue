<template>
  <div class="part-batchIn-form">
    <el-table :data="form" empty-text="请点击下方按钮添加要出库的数据">
      <el-table-column label="名称" width="150px">
        <el-autocomplete
          slot-scope="scope"
          popper-class="batch-in-part"
          v-model="scope.row.sparepartName"
          :fetch-suggestions="fetchSparepart"
          placeholder="请输入内容"
          @select="choosePart($event,scope.row)">

          <div class="bacth-in-part-item" slot-scope="scope">
            <p>名称：{{scope.item.sparepart&&scope.item.sparepart.name}}</p>
            <p>编号：{{scope.item.sparepart&&scope.item.sparepart.serialNumber}}</p>
            <p>规格：{{scope.item.sparepart&&scope.item.sparepart.standard}}</p>
          </div>
        </el-autocomplete>
      </el-table-column>
      <el-table-column label="编号" prop="serialNumber" width="100px"></el-table-column>
      <el-table-column label="类别" prop="sparepartType" width="100px"></el-table-column>
      <el-table-column label="备件规格" prop="standard" width="100px"></el-table-column>
      <el-table-column label="仓库" prop="repertory" width="100px"></el-table-column>
      <el-table-column label="类型" width="150px">
        <el-select v-model="scope.row.type" slot-scope="scope">
          <el-option v-for="option in sparepartConfig.outStoreType" :key="option" :label="option" :value="option"></el-option>
        </el-select>
      </el-table-column>
      <el-table-column label="库存数" prop="repertoryCount" width="150px">
        <template slot-scope="scope">
          {{scope.row.repertoryCount}}
          <el-tooltip class="item" effect="dark" :content="`安全库存：${scope.row.safetyStock}`" placement="top">
            <el-tag v-if="scope.row.safetyStock && (scope.row.safetyStock > scope.row.repertoryCount)" size="mini" type="danger">库存提醒</el-tag>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="数量" width="80px">
        <el-input slot-scope="scope" v-model="scope.row.variation" type="number" step="any" :min="0" :max="parseInt(scope.row.repertoryCount)"></el-input>
      </el-table-column>
      <el-table-column label="操作" width="45px" fixed="right">
        <el-button type="text" @click="remove(scope.row)" slot-scope="scope">删除</el-button>
      </el-table-column>
    </el-table>

    <div class="out-stock-remark" v-if="form.length > 0">
      <textarea :maxlength="500" placeholder="请输入备注内容" v-model="remark"></textarea>
    </div>

    <div class="part-batchIn-footer">
      <el-button type="text" @click="add" icon="el-icon-plus"> 添加</el-button>
    </div>
  </div>
</template>

<script>
import MathUtil from '@src/util/math';

export default {
  name: 'part-outstock-batch-form',
  inject: ['initData'],
  props: {
    sparepartConfig: Object
  },
  data(){
    return {
      userId: '',
      form: [],
      remark:'',
      partOptions: [],
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
      }
      
    }
  },
  computed: {
    // TODO: 支持小数 提示
    minVariation () {
      let initData = this.initData;
      return !initData || !initData.precision ? 1 : (initData.precision == 1 ? 0.1 : 0.01);
    },
  },
  methods: {
    remove(row){
      let index = -1;
      for(let i = 0; i < this.form.length; i++){
        if(this.form[i] == row){
          index = i;
          break;
        }
      }

      if(index >= 0) this.form.splice(index, 1);
    },
    add(row = {}){
      if (this.form.length > 19) {
        return this.$message({
          showClose: true,
          message: '最多添加20个备件',
          type: 'error'
        });
      }

      let config = this.sparepartConfig || {};
      let types = config.outStoreType || [];

      let repertory = row.repertory || {};
      let sparepart = row.sparepart || {};

      this.form.push({
        id: row.id,
        sparepart: sparepart.id || '',
        sparepartName: sparepart.name || '',
        serialNumber: sparepart.serialNumber || '',
        sparepartType: sparepart.type || '',
        standard: sparepart.standard || '',
        repertory: repertory.name || '',
        repertoryId: repertory.id || '',
        type: types[0],
        repertoryCount: row.repertoryCount,
        safetyStock: row.safetyStock || null,
        variation: 1
      })
      console.log(this.form)
    },
    hasRow(row){
      return this.form.some(item => item.id == row.id)
    },
    fetchSparepart(keyword, cb){
      let model = {
        keyWord: keyword,
        pageSize: 50,
        pageNum: 1,
        enable: 1,
        managers: [this.userId]
      }

      this.$http.get('/partV2/repertory/list', model)
        .then(result => cb(result.list))
        .catch(err => console.log(err))
    },
    choosePart(value, row){
      if(this.hasRow(value)) {
        this.$platform.toast('该记录已存在！', 'warning');
        return
      }

      row.id = value.id;
      row.sparepart = value.sparepart.id;
      row.sparepartName = value.sparepart.name;
      row.serialNumber = value.sparepart.serialNumber;
      row.sparepartType = value.sparepart.type;
      row.standard = value.sparepart.standard;
      row.repertory = value.repertory.name;
      row.repertoryId = value.repertory.id;
      row.repertoryCount = value.repertoryCount;
      row.safetyStock = value.safetyStock || null;
    },
    async pack(){
      let form = this.form;
      try {
        let message = '';
        let initData = this.initData;
        form.forEach((item, index) => {
          let count = this.decimalNumber(item.variation);
          if(!item.sparepart || !item.repertory || !item.type || !item.variation || item.variation > item.repertoryCount || item.variation <= 0 || count != -1){
            message = '仓库、备件、目标库不能为空；出库数不可大于库存数；';
            message += initData.precision == 0 ? '数量为大于0的正整数' : `数量大于0，支持${ initData.precision }位小数`;
          }
        })

        if(message){
          this.$platform.alert(message)
          return null;
        } 

        return form.map(item => ({
          sparepart: {
            id: item.sparepart,
          },
          repertory: {
            id: item.repertoryId
          },
          item: item.type,
          type: '出库',
          variation: -item.variation,
          remark: this.remark
        }));
      } catch (error) {
        console.log(error)
      }
      return null;
    },
    receive(data = [], userId = ''){
      if (data.length > 20){
        return this.$platform.alert('单次最多支持入库20个备件');
      }

      data.forEach(item => this.add(item));

      this.userId = userId;
    },
    decimalNumber(num) {
      let initData = this.initData;
      let count = MathUtil.decimalNumber(num);
      let isPartV2 = initData.isSparepart2;

      if(!isPartV2 && count != 0) return 0;
      if(initData.precision >= count) return -1;
      return initData.precision;
    }
  }
}
</script>

<style lang="scss">
.el-form-item{
  margin-bottom: 0
}

.part-batchIn-form{
  td,th{
    padding: 5px 0;
  }
  .cell {
    padding: 0 5px;
  }
}

.part-batchIn-footer{
  padding-top: 10px;
  text-align: center;
}

.batch-in-part{
  width: 200px !important;

  li{
    padding: 5px;
    margin: 0 10px;
    border-bottom: 1px solid #f0f0f0;
    overflow: hidden;

    &:last-child{
      border-color: transparent;
    }
  }
}

.bacth-in-part-item{

  p{
    width:100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    line-height: 24px;
    margin: 0;
  }
}

.out-stock-remark{
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