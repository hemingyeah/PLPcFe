<template>
  <el-form label-width="90px"  :model="form" :rules="rules" ref="form" class="demo-ruleForm" label-position="right">
    <el-form-item label="备件名称:">
      <el-input type="text" placeholder="" :value="formdata.sparepart&&formdata.sparepart.name" readonly></el-input>
    </el-form-item>
    <el-form-item label="备件编号:">
      <el-input type="text" placeholder="" :value="formdata.sparepart&&formdata.sparepart.serialNumber" readonly></el-input>
    </el-form-item>
    <el-form-item>
        <span slot="label">
          <el-tooltip class="item" effect="dark" content="当前个人库中该备件的数量" placement="top-start">
            <span>个人库存<i class="el-icon-question"></i>:</span>
          </el-tooltip>
        </span>
      <el-input type="text" placeholder="" :value="applicantHoldCount" readonly></el-input>
    </el-form-item>
    <el-form-item label="备件类别:">
      <el-input type="text" placeholder="" :value="formdata.sparepart&&formdata.sparepart.type" readonly></el-input>
    </el-form-item>
    <el-form-item label="备件规格:">
      <el-input type="text" placeholder="" :value="formdata.sparepart&&formdata.sparepart.standard" readonly></el-input>
    </el-form-item>
    <el-form-item label="仓库:">
      <el-input type="text" placeholder="" :value="formdata.repertory&&formdata.repertory.name" readonly></el-input>
    </el-form-item>
    <el-form-item label="库存数:">
      <el-input type="text" placeholder="" :value="formdata.repertoryCount" readonly></el-input>
      <el-tooltip class="item" effect="dark" :content="`安全库存：${formdata.safetyStock}`" placement="top">
        <el-tag size="mini" type="danger" style="float: right" class="tag-position"
                v-if="formdata.safetyStock && (formdata.safetyStock > formdata.repertoryCount)"
        >库存提醒</el-tag>
      </el-tooltip>
    </el-form-item>
    <el-form-item label="申领数:" prop="number">
       <el-input v-model="form.number" type="number"  step="any" :min="0" :max="formdata.repertoryCount"></el-input>
    </el-form-item>
     <el-form-item label="操作类型:">
       <el-input type="text" v-model="form.type" readonly></el-input>
    </el-form-item>
    <el-form-item label="销售价:">
       <el-input :value="formdata.sparepart && formdata.sparepart.salePrice.toFixed(2)" readonly></el-input>
    </el-form-item>
    <el-form-item label="合计金额:">
       <el-input :value="totalPrice" readonly></el-input>
    </el-form-item>
    <el-form-item label="备注：" prop="remark">
      <el-input v-model="form.remark" type="textarea" :autosize="{ minRows: 2, maxRows: 4}" :maxlength="500"></el-input>
    </el-form-item>
  </el-form>
</template>

<script>
import MathUtil from '@src/util/math';

export default {
  name: 'part-apply-form',
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
  },
  data(){
    const _that = this;
    return {
      form: {
        type: '申领',
        content: '',
        remark: '',
        number: 1
      },
      applicantHoldCount: 0,
      numberValidateForm: {
        number: ''
      },
      rules: {
        remark: [
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
              } else if(_that.formdata.repertoryCount < val){
                callback(new Error('数量不能大于库存数'))
              } else if (count != -1 && count == 0) {
                callback(new Error('请填写大于0的正整数'));
              } else if (count != -1 && count != 0) {
                callback(new Error(`请填写大于0的${ count }位小数`))
              } else{
                callback();
              }
            },
            trigger: 'change',
          }
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

    totalPrice () {
      let number = this.form.number || 0;
      let price = this.formdata.sparepart && this.formdata.sparepart.salePrice ? this.$math.format(this.$math.multiply(this.$math.bignumber(this.formdata.sparepart.salePrice), this.$math.bignumber(number))) : 0;
      return Number(price).toFixed(2);
    }
  },
  methods: {
    async pack(){
      try {
        let isSucc = await this.$refs.form.validate();
        if(isSucc){
          let number = this.form.number
          if(number < this.minVariation){
            this.$platform.alert(`请填写大于${ this.minVariation }的数`)
            return
          }
          if(this.formdata.repertoryCount < number){
            this.$platform.alert('申领数不能大于库存数')
            return
          }
          let parms = {
            'sparepartId':this.formdata.sparepart.id,
            'repertoryId':this.formdata.repertory.id,
            'type':'申领',
            'variation':number,
            remark: this.form.remark
          }
          // let repertoryId = {'id':this.formdata.repertory.id}
          // return {
          //   source : 'sparepart',
          //   applyRemark : this.form.content,
          //   parms : parms
          // }
          return parms
        }
      } catch (error) {
        console.log(error)
      }

      return null;
    },
    selectOutType(ele){
      let type = ele.target.value;
      this.type = type;
    },
    getUserHoldPartCount() {
      this.$http.get(`/partV2/approve/user/getIHold/${this.formdata.sparepart.id}`)
        .then(result => {
          this.applicantHoldCount = result.data || 0;
        });
    },
    decimalNumber(num) {
      let initData = this.initData;
      let count = MathUtil.decimalNumber(num);
      let isPartV2 = initData.isSparepart2;

      if(!isPartV2 && count != 0) return 0;
      if(initData.precision >= count) return -1;
      return initData.precision;
    }
  },
  mounted(){
    this.getUserHoldPartCount();
  },
}
</script>

<style lang="scss" scoped>
.el-form-item{
  margin-bottom: 0
}
.el-form-item__error{
  position: relative;
}
.tag-position {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
}
#outType{
  width: 100%;
  height: 34px;
}
</style>
