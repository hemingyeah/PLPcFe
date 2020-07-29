
<template>
  <div class="part-batchIn-form">
    <el-table :data="form" empty-text="请点击下方按钮添加要调拨的数据">
      <el-table-column label="仓库" width="140px">
        <el-select v-model="scope.row.repertoryId" slot-scope="scope" @input="chooseRepertory($event,scope.row)">
          <el-option v-for="(option, index) in manageRepertories" :key="index + option.id" :label="option.name" :value="option.id"></el-option>
        </el-select>
      </el-table-column>

      <el-table-column label="名称" width="150px">
        <div slot-scope="scope" :class="{'error-column': submitted && scope.row && !scope.row.sparepart}">
          <el-autocomplete
            popper-class="batch-in-part"
            :value="scope.row.sparepartName"
            :fetch-suggestions="searchPart(scope.row)"
            placeholder="请选择备件"
            @select="choosePart($event,scope.row)">

            <div class="bacth-in-part-item" slot-scope="scope">
              <p>名称：{{scope.item.sparepart&&scope.item.sparepart.name}}</p>
              <p>编号：{{scope.item.sparepart&&scope.item.sparepart.serialNumber}}</p>
              <p>规格：{{scope.item.sparepart&&scope.item.sparepart.standard}}</p>
            </div>
          </el-autocomplete>
        </div>
      </el-table-column>
      <el-table-column label="编号" prop="serialNumber"></el-table-column>
      <el-table-column label="规格" prop="standard"></el-table-column>
      <el-table-column label="类别" :formatter="() => '调拨'"></el-table-column>
      <!--<el-table-column label="现仓库" prop="repertoryName" width="100px"></el-table-column>-->

      <el-table-column label="库存数" width="120px" min-width="80px">
        <template slot-scope="scope">
          {{scope.row.repertoryCount}}
          <el-tooltip v-if="scope.row.safetyStock && (Number(scope.row.safetyStock) > scope.row.repertoryCount)" class="item" effect="dark" :content="`安全库存：${scope.row.safetyStock}`" placement="top">
            <el-tag size="mini" type="danger" class="tag-position">库存提醒</el-tag>
          </el-tooltip>
        </template>
      </el-table-column>


      <el-table-column label="目标库">
        <template slot-scope="scope">
          <template v-if="!scope.row.index">
            <el-select v-model="targetRepertoryId" :class="{'error-column': submitted && !targetRepertoryId,}">
              <el-option v-for="option in repertory" :key="option.id" :label="option.name" :value="option.id"></el-option>
            </el-select>
          </template>
          <template v-else>
            {{targetRepertory.name}}
          </template>
        </template>
      </el-table-column>
      <el-table-column label="调拨数:" width="80px">
        <el-input slot-scope="scope" v-model="scope.row.variation" type="number" step="any" :min="0" :max="parseInt(scope.row.repertoryCount)" :class="{'error-column': submitted && (scope.row.variation < minVariation || scope.row.variation > scope.row.repertoryCount),}"></el-input>
      </el-table-column>
      <el-table-column label="操作" width="45px">
        <el-button type="text" @click="remove(scope.row)" slot-scope="scope">删除</el-button>
      </el-table-column>
    </el-table>
    <div v-if="needApproval" class="in-stock-remark">
      <div class="need-approval" v-html="needApproval"></div>
    </div>
    <div class="in-stock-remark" v-if="form.length > 0">
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
  name: 'part-batch-transfer',
  inject: ['initData'],
  props: {
    sparepartConfig: Object,
    repertory: Array // 可见仓库
  },
  data(){
    return {
      form: [],
      remark:'',
      userId: '',
      targetRepertoryId: '',
      submitted: false,
    }
  },
  computed: {
    // TODO: 支持小数 提示
    minVariation () {
      let initData = this.initData;
      return !initData || !initData.precision ? 1 : (initData.precision == 1 ? 0.1 : 0.01);
    },
    targetRepertory() {
      return this.repertory.filter(r => r.id === this.targetRepertoryId)[0] || {};
    },
    needApproval() {
      const managers = this.targetRepertory.manager || [];
      if (!managers.length) return '';
      if (managers.some(m => m.userId === this.userId)) return '';
      return `需要<span>${managers.map(m => m.displayName).slice(0, 3).join('，')}</span>等人办理入库`;
    },
    /**
       * 所有可操作的仓库
       *
       * 以下情况能够进行出入库操作
       * 1. 管理员为空
       * 2. 管理员中包含自己
       */
    manageRepertories(){
      let arr = Array.isArray(this.repertory) ? this.repertory : [];

      return arr.filter(item => {
        return null == item.manager
            || item.manager.length == 0
            || item.manager.some(item => item.userId == this.userId);
      })
    },
  },
  methods: {
    async chooseRepertory(val, row) {
      const repertory = this.repertory.filter(r => r.id === val)[0] || {};
      row.sparepartName = '';
      row.id = '';
      row.sparepart = '';
      row.sparepartName = '';
      row.serialNumber = '';
      row.sparepartType = '';
      row.standard = '';
      row.repertoryCount = '';
      row.safetyStock = '';
      row.repertory = repertory;
      row.repertoryId = repertory.id;
      row.repertoryName = repertory.name;
    },
    remove(row){
      let index = -1;
      for(let i = 0; i < this.form.length; i++){
        if(this.form[i] == row){
          index = i;
          break;
        }
      }
      if(index >= 0) this.form.splice(index, 1);
      this.form.map((item, index) => item.index = index);
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

      let repertory = row.repertory || this.manageRepertories[0] || {};
      let sparepart = row.sparepart || {};

      this.form.push({
        id: row.id,
        sparepart: sparepart.id || '',
        sparepartName: sparepart.name || '',
        serialNumber: sparepart.serialNumber || '',
        sparepartType: sparepart.type || '',
        standard: sparepart.standard || '',
        repertory: repertory || {},
        repertoryName: repertory.name || '',
        repertoryId: repertory.id || '',
        type: types[0],
        repertoryCount: row.repertoryCount,
        safetyStock: row.safetyStock || null,
        variation: 1
      });

      this.form.map((item, index) => item.index = index);
    },
    // searchPart
    searchPart(row){
      let that = this
      return function(keyword, cb){
        that.fetchSparepart(keyword, cb, row)
      }
    },
    fetchSparepart(keyword, cb, row){
      let model = {
        keyWord: keyword,
        pageSize: 50,
        pageNum: 1,
        enable: 1,
        managers: [this.userId],
        repertoryId: row.repertoryId,
      }

      this.$http.get('/partV2/repertory/list', model)
        .then(result => {
          const list = (result.list || []).filter(row => row.repertoryCount);
          cb(list);
        })
        .catch(err => console.log(err))
    },
    hasRow(value){
      return this.form.some(item => item.id == value)
    },
    choosePart(value, row){
      if(this.hasRow(value.id)) {
        this.$platform.toast('该记录已存在！', 'warning');
        return
      }

      row.id = value.id;
      row.sparepart = value.sparepart.id;
      row.sparepartName = value.sparepart.name;
      row.serialNumber = value.sparepart.serialNumber;
      row.sparepartType = value.sparepart.type;
      row.standard = value.sparepart.standard;
      row.repertoryName = value.repertory.name;
      row.repertory = value.repertory;
      row.repertoryId = value.repertory.id;
      row.repertoryCount = value.repertoryCount;
      row.safetyStock = value.safetyStock || null;
    },
    async pack(){
      let form = this.form;
      this.submitted = true;
      try {
        let message = '';
        let initData = this.initData;
        form.forEach((item, index) => {
          let count = this.decimalNumber(item.variation);
          if(!item.sparepart || !item.repertory || !item.type || !this.targetRepertoryId || !item.variation || item.variation <= 0 || item.variation > item.repertoryCount || !item.repertoryCount || count != -1){
            message = '仓库、备件、目标库不能为空；调拨数不可大于库存数；';
            message += initData.precision == 0 ? '数量为大于0的正整数' : `数量大于0，支持${ initData.precision }位小数`;
          }
        });

        if(message){
          this.$platform.alert(message)
          return null;
          // let initData = this.initData;
          // let msg = initData.precision ? `${ initData.precision }位小数` : '整数'
          // this.$platform.toast(`表单数据有误，请仔细检查是否选择了备件、目标库以及调拨数是否正确（调拨数应是大于0的${ msg }且小于等于该备件的库存数）`, 'error', { duration: 5000});
          // return null;
        }

        return form.map(item => ({
          repertoryId: item.repertory.id,
          sparepartId: item.sparepart,
          variation: item.variation,
          targetId: this.targetRepertoryId,
          remark:this.remark
        }))
        //
      } catch (error) {
        console.log(error)
      }
      return null;
    },
    receive(data = [], userId = ''){
      if(data.length > 50){
        return this.$platform.alert('单次最多支持调拨50个备件');
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

  .error-column {
    input {
      border-color: #f56c6c;
    }

  }

  .need-approval {
    color: #666;
    font-size: 12px;
    span {
      color: #f56c6c;
    }
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
        border-color: #409EFF;
      }
    }
  }
</style>
