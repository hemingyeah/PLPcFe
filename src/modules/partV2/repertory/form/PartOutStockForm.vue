<template>
  <el-form label-width="90px"  :model="form" :rules="rules" ref="form" v-if="!outBatch">
    <el-form-item label="备件名称:">
      <el-input type="text" placeholder="" :value="formdata.sparepart&&formdata.sparepart.name" readonly></el-input>
    </el-form-item>
    <el-form-item label="备件编号:">
      <el-input type="text" placeholder="" :value="formdata.sparepart&&formdata.sparepart.serialNumber" readonly></el-input>
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
    <el-form-item label="库存数:" style="position: relative">
      <el-input type="text" placeholder="" :value="formdata.repertoryCount" readonly></el-input>
      <el-tooltip class="item" effect="dark" :content="`安全库存：${formdata.safetyStock}`" placement="top">
        <el-tag v-if="formdata.safetyStock && (formdata.safetyStock > formdata.repertoryCount)" size="mini" type="danger" class="tag-position">库存提醒</el-tag>
      </el-tooltip>
    </el-form-item>
    <el-form-item label="出库数:" prop="number">
       <el-input v-model="form.number" type="number" step="any" :min="0" :max="formdata.repertoryCount"></el-input>
    </el-form-item>
    <el-form-item label="出库类型:">
      <!-- <select id="outType" v-model="form.type">
        <option v-for="item in sparepartConfig.outStoreType" :key="item.id" :value="item">{{item}}</option>
      </select> -->
      <el-select v-model="form.type" class="srp-list-form-item">
         <el-option v-for="item in _outStoreType" :key="item" :value="item" :label="item"></el-option>
      </el-select>
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
    formdata: '',
    sparepartConfig: {
      type: Object,
      default: {}
    },
    outBatch: {
      type: Boolean,
      default: false
    }
  },
  computed:{
    // TODO: 支持小数 提示
    minVariation () {
      let initData = this.initData;
      return !initData || !initData.precision ? 1 : (initData.precision == 1 ? 0.1 : 0.01);
    },
    _outStoreType(){
      return this.sparepartConfig.outStoreType || []
    },
  },
  data(){
    const _that = this
    return {
      form: {
        type: '',
        remark: '',
        number: 1
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
          {
            validator(rule, value, callback) {
              const val = Number(value);
              const count = _that.decimalNumber(val);
              if (value == '' || val < 0) {
                callback(new Error('数量不能为空且要大于0'))
              } else if (val > _that.formdata.repertoryCount) {
                callback(new Error('数量不能大于库存数'))
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
  methods: {
    async pack(){
      try {
        let number = this.form.number;
        if(number < this.minVariation){
          this.$platform.alert(`请填写大于${ this.minVariation }的数`);
          return
        }
        if(this.formdata.repertoryCount < number){
          this.$platform.alert('出库数不能大于库存数');
          return
        }
        let isSucc = await this.$refs.form.validate();
        if(isSucc){
          let sparepartId = {'id':this.formdata.sparepart.id};
          let repertoryId = {'id':this.formdata.repertory.id};
          return {
            sparepart : sparepartId,
            repertory : repertoryId,
            item : this.form.type,
            type : '出库',
            variation : -number,
            remark: this.form.remark
          }
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
    this.form.type = this.sparepartConfig.outStoreType[0];
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