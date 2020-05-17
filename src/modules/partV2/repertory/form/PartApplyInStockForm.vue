<template>
  <el-form label-width="80px"  :model="form" :rules="rules" ref="form">
     <el-form-item label="申请人:">
      <el-input type="text" placeholder="" :value="formdata.propserName" readonly></el-input>
    </el-form-item>
    <el-form-item label="申请时间:">
      <el-input type="text" placeholder="" :value="formdata.propserTime" readonly></el-input>
    </el-form-item>
    <el-form-item label="备件名称:">
      <el-input type="text" placeholder="" :value="formdata.sparepartRepertory&&formdata.sparepartRepertory.sparepart&&formdata.sparepartRepertory.sparepart.name" readonly></el-input>
    </el-form-item>
    <el-form-item label="备件编号:">
      <el-input type="text" placeholder="" :value="formdata.sparepartRepertory&&formdata.sparepartRepertory.sparepart&&formdata.sparepartRepertory.sparepart.serialNumber" readonly></el-input>
    </el-form-item>
    <el-form-item label="备件类型:">
      <el-input type="text" placeholder="" :value="formdata.sparepartRepertory&&formdata.sparepartRepertory.sparepart&&formdata.sparepartRepertory.sparepart.type" readonly></el-input>
    </el-form-item>
    <el-form-item label="备件规格:">
      <el-input type="text" placeholder="" :value="formdata.sparepartRepertory&&formdata.sparepartRepertory.sparepart&&formdata.sparepartRepertory.sparepart.standard" readonly></el-input>
    </el-form-item>

    <el-form-item label="仓库:">
      <!-- <el-input type="text" placeholder="" :value="formdata.sparepartRepertory.repertory&&formdata.sparepartRepertory.repertory.name" readonly></el-input> -->
      <el-select v-model="form.repertoryId" class="srp-list-form-item">
         <el-option v-for="item in repertory" :key="item.id" :value="item.id" :label="item.name"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="申请数:">
      <el-input type="text" placeholder="" :value="variationNum()" readonly></el-input>
    </el-form-item>
    <el-form-item label="入库数:" prop="number">
       <el-input v-model="form.number" type="number" step="any" :min="0" :max="variationNum()"></el-input>
    </el-form-item>
    <el-form-item label="备注：" prop="remark">
      <el-input v-model="form.remark" type="textarea" :autosize="{ minRows: 2, maxRows: 4}" :maxlength="500"></el-input>
    </el-form-item>
  </el-form>
</template>

<script>
import MathUtil from '@src/util/math';

export default {
  name: 'part-instock-form',
  inject: ['initData'],
  props: {
    formdata: {
      type: Object,
      default: {}
    },
    sparepartConfig: {
      type: Object,
      default: {}
    },
    repertory: {
      type: Array,
      default: []
    },
    initData: {
      type: Object,
      default: {}
    }
  },
  data(){
    const _that = this;
    let repertoryId = '';
    let status = this.formdata.sparepartRepertory;
    if(status && status.repertory && status.repertory.id && this.repertory.some(item => item.id == status.repertory.id)){
      repertoryId = status.repertory.id;
    } else if(Array.isArray(this.repertory) && this.repertory.length > 0){
      repertoryId = this.repertory[0].id;
    }

    return {
      form: {
        type: this.formdata.type,
        number: this.variationNum() || '',
        repertoryId: repertoryId,
        remark: ''
      },
      repertoryName: this.repertory[0] || '',
      numberValidateForm: {
        number: '',
        repertory: ''
      },
      rules: {
        content: [
          {required: true, message: '请输入备注内容'},
          {max: 500, message: '备注内容不能超过500字'}
        ],
        number:[
          {
            validator(rule, value, callback) {
              const val = Number(value);
              const count = _that.decimalNumber(val);
              if (value == '' || val < 0) {
                callback(new Error('数量不能为空且要大于0'))
              } else if(val > Number(_that.variationNum())) {
                callback(new Error('数量不能大于申请数'))
              } else if (count != -1 && count == 0) {
                callback(new Error('请填写大于0的正整数'));
              } else if (count != -1 && count != 0) {
                callback(new Error(`请填写大于0的${ count }位小数`))
              } else {
                callback();
              }
            },
            trigger: 'change',
          }
        ],
        // remark: [
        //   {max: 500, message: '备注不能超过500字'}
        // ]
      }
    }
  },
  computed: {
    // TODO: 支持小数 提示
    minNumber () {
      let initData = this.initData;
      return !initData || !initData.precision ? 1 : (initData.precision == 1 ? 0.1 : 0.01);
    }
  },
  methods: {
    async pack(){
      if(this.form.number <= 0){
        this.$platform.alert('入库数必须为大于0的数')
        return
      }
      if(this.form.number > Number(this.variationNum())){
        this.$platform.alert('入库数不能大于申请数');
        return
      }

      if(!this.form.repertoryId){
        this.$platform.alert('请选择要入库的仓库')
        return;
      }

      try {
        let isSucc = await this.$refs.form.validate();
        if(isSucc){
          return {
            id:this.formdata.id,
            solvedVariation:this.form.number,
            repertoryId:this.form.repertoryId,
            type: this.form.type,
            remark: this.form.remark
          }
        }
      } catch (error) {
        console.log(error)
      }

      return null;
    },
    decimalNumber(num) {
      let initData = this.initData;
      let count = MathUtil.decimalNumber(num);
      let isPartV2 = initData.isSparepart2;

      if(!isPartV2 && count != 0) return 0;
      if(initData.precision >= count) return -1;
      return initData.precision;
    },
    variationNum () {
      return this.$math.format(this.$math.subtract(this.$math.bignumber(this.formdata.variation), this.$math.bignumber(this.formdata.solvedVariation)))
    }
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
</style>