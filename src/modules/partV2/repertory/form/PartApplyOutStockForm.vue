<template>
  <el-form label-width="90px"  :model="form" :rules="rules" ref="form" class="part-apply-out-stock-form">
    <el-form-item label="申请人:">
      <el-input type="text" placeholder="" :value="formdata.propserName" readonly></el-input>
    </el-form-item>
    <el-form-item label="申请时间:">
      <el-input type="text" placeholder="" :value="formdata.propserTime" readonly></el-input>
    </el-form-item>
    <el-form-item label="申请人库存:">
      <el-input type="text" placeholder="" :value="partCount" readonly></el-input>
    </el-form-item>
    <el-form-item label="备件名称:">
      <el-input type="text" placeholder="" :value="formdata.sparepartRepertory&&formdata.sparepartRepertory.sparepart&&formdata.sparepartRepertory.sparepart.name" readonly></el-input>
    </el-form-item>
    <el-form-item label="备件编号:">
      <el-input type="text" placeholder="" :value="formdata.sparepartRepertory&&formdata.sparepartRepertory.sparepart&&formdata.sparepartRepertory.sparepart.serialNumber" readonly></el-input>
    </el-form-item>
    <el-form-item label="备件类别:">
      <el-input type="text" placeholder="" :value="formdata.sparepartRepertory&&formdata.sparepartRepertory.sparepart&&formdata.sparepartRepertory.sparepart.type" readonly></el-input>
    </el-form-item>
    <el-form-item label="备件规格:">
      <el-input type="text" placeholder="" :value="formdata.sparepartRepertory&&formdata.sparepartRepertory.sparepart&&formdata.sparepartRepertory.sparepart.standard" readonly></el-input>
    </el-form-item>
    <el-form-item label="仓库:">
      <el-input type="text" placeholder="" :value="formdata.sparepartRepertory&&formdata.sparepartRepertory.repertory&&formdata.sparepartRepertory.repertory.name" readonly></el-input>
    </el-form-item>
    <!-- <el-form-item label="安全库存:">
      <el-input type="text" placeholder="" :value="formdata.sparepartRepertory&&formdata.sparepartRepertory.safetyStock || ''" readonly></el-input>
    </el-form-item> -->
    <el-form-item label="库存数:" style="position: relative">
      <el-input type="text" placeholder="" :value="formdata.sparepartRepertory.repertoryCount" readonly></el-input>
      <el-tooltip class="item" effect="dark" :content="`安全库存：${formdata.sparepartRepertory.safetyStock}`" placement="top">
        <el-tag v-if="formdata.sparepartRepertory.safetyStock && (formdata.sparepartRepertory.safetyStock > formdata.sparepartRepertory.repertoryCount)" size="mini" type="danger" class="tag-position">库存提醒</el-tag>
      </el-tooltip>
    </el-form-item>
    <el-form-item label="申请数:">
      <el-input type="text" placeholder="" :value="variationNum()" readonly></el-input>
    </el-form-item>
    <el-form-item label="出库数:" prop="number">
      <el-input v-model="form.number" type="number" step="any" :min="0" :max="variationNum()"></el-input>
    </el-form-item>
    <el-form-item label="金额:">
      <span>销售总价：{{saleTotalPrice}}</span>
      <span v-if="initData.auths.VIP_SPAREPART_VIEW && initData.auths.VIP_SPAREPART_EDIT" style="display: inline-block; margin-left: 30px">出库总价：{{costTotalPrice}}</span>
    </el-form-item>
    <el-form-item label="备注：" prop="remark">
      <el-input v-model="form.remark" type="textarea" :autosize="{ minRows: 2, maxRows: 4}" :maxlength="500"></el-input>
    </el-form-item>
  </el-form>
</template>

<script>
import MathUtil from '@src/util/math';

export default {
  name: 'part-outstock-form',
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
    initData: {
      type: Object,
      default: {}
    }
  },
  data(){
    const _that = this;
    return {
      form: {
        type: this.formdata.type,
        number: this.variationNum() || 0,
        remark:'',
      },
      numberValidateForm: {
        number: ''
      },
      partCount: `持有该备件：${this.formdata.holdCount || 0}
            持有全部备件：${this.formdata.holdCountSum || 0}
       `,
      rules: {
        remark: [
          {required: true, message: '请输入备注内容', trigger: 'blur'},
          {max: 500, message: '备注内容不能超过500字'}
        ],
        number:[
          {
            validator(rule, value, callback) {
              const val = Number(value);
              const count = _that.decimalNumber(val);
              if (value == '' || val < 0) {
                callback(new Error('数量不能为空且要大于0'))
              } else if (val > Number(_that.variationNum())) {
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
      }
    }
  },
  computed: {
    saleTotalPrice () {
      if(!this.formdata.sparepartRepertory.sparepart.salePrice || !this.form.number) return 0;
      let price = this.$math.format(this.$math.multiply(this.$math.bignumber(this.form.number), this.$math.bignumber(this.formdata.sparepartRepertory.sparepart.salePrice)));
      return Number(price).toFixed(2);
    },
    costTotalPrice () {
      if(!this.formdata.sparepartRepertory.sparepart.costPrice || !this.form.number) return 0;
      let price = this.$math.format(this.$math.multiply(this.$math.bignumber(this.form.number), this.$math.bignumber(this.formdata.sparepartRepertory.sparepart.costPrice)));
      return Number(price).toFixed(2);
    },
    // TODO: 支持小数 提示
    minNumber () {
      let initData = this.initData;
      return !initData || !initData.precision ? 1 : (initData.precision == 1 ? 0.1 : 0.01);
    },
  },
  methods: {
    
    async pack(){
      if(this.form.number <= 0){
        this.$platform.alert('出库数必须为大0的数')
        return
      }
      if(this.form.number > Number(this.variationNum())){
        this.$platform.alert('出库数不能大于申请数');
        return
      }
      try {
        let isSucc = await this.$refs.form.validate();
        if(isSucc){
          return {
            id:this.formdata.id,
            solvedVariation:this.form.number,
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
.part-apply-out-stock-form {
  .tag-position {
    position: absolute;
    top: 50%;
    right: 0px;
    -webkit-transform: translateY(-50%);
    transform: translateY(-50%);
  }
}
</style>