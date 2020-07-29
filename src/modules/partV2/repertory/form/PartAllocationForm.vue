<template>
  <el-form label-width="80px"  :model="form" :rules="rules" ref="form">
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
    <el-form-item label="现仓库:">
      <el-input type="text" :value="formdata.repertory&&formdata.repertory.name" readonly></el-input>
    </el-form-item>
    <el-form-item label="目标库:">
      <el-select v-model="form.toRepertory" @change="changeRepertory">
         <el-option v-for="item in repertory" :key="item.id" :value="item.id" :label="item.name"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item v-if="needApproval">
      <div class="need-approval" v-html="needApproval"></div>
    </el-form-item>
    <el-form-item label="库存数:" style="position: relative">
      <el-input type="text" zzplaceholder="" :value="formdata.repertoryCount" readonly></el-input>
      <!--<el-tooltip class="item" effect="dark" :content="`安全库存：${formdata.safetyStock}`" placement="top">-->
        <el-tag v-if="formdata.safetyStock && (formdata.safetyStock > formdata.repertoryCount)" size="mini" type="danger" class="tag-position">库存提醒</el-tag>
      <!--</el-tooltip>-->
      <el-tooltip v-if="formdata.safetyStock" class="item" effect="dark" :content="`安全库存：${formdata.safetyStock || 0}`" placement="top">
        <div class="tag-position shadow"></div>
      </el-tooltip>
    </el-form-item>

    <el-form-item label="调拨数:" prop="number">
       <el-input v-model="form.number" type="number" step="any" :min="0" :max="formdata.repertoryCount"></el-input>
    </el-form-item>
     <el-form-item label="操作类型:">
       <el-input type="text" v-model="form.type" readonly></el-input>
    </el-form-item>
     <!-- <el-form-item label="备注:">
      <el-input type="textarea" placeholder="请输入备注内容 [最多500字]" :autosize="{ minRows: 2, maxRows: 5}" v-model="form.content"></el-input>
    </el-form-item> -->

    <el-form-item label="备注：" prop="remark">
      <el-input v-model="form.remark" type="textarea" :autosize="{ minRows: 2, maxRows: 4}" :maxlength="500"></el-input>
    </el-form-item>
  </el-form>
</template>

<script>
import MathUtil from '@src/util/math';

export default {
  name: 'part-allocation-form',
  inject: ['initData'],
  data(){
    const _that = this;
    return {
      formdata: {},
      sparepartConfig: {},
      repertory: [],
      userId: '',
      needApproval: '',

      form: {
        type: '调拨',
        content: '',
        toRepertory: '',
        remark: '',
        number: 1
      },
      // numberValidateForm: {
      //   number: ''
      // },
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
        ],
      }
    }
  },
  computed:{
    // TODO: 支持小数 提示
    minVariation () {
      let initData = this.initData;
      return !initData || !initData.precision ? 1 : (initData.precision == 1 ? 0.1 : 0.01);
    },
    _inStoreType(){
      return this.sparepartConfig.inStoreType || []
    }
  },
  methods: {
    changeRepertory(val) {
      const targetId = val;
      if (!targetId || targetId && !this.repertory.filter(r => r.id === targetId).length) return this.needApproval = '';
      const targetRepertory = this.repertory.filter(r => r.id === targetId)[0] || {};
      const managers = targetRepertory.manager || [];
      if (managers.some(m => m.userId === this.userId)) return this.needApproval = '';
      this.needApproval = `需要<span>${managers.map(m => m.displayName).slice(0, 3).join('，')}</span>等人办理入库`;
    },
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
            this.$platform.alert('调拨数不能大于库存数')
            return
          }
          if(!this.form.toRepertory){
            this.$platform.alert('请选择目标库')
            return ;
          } 

          return {
            repertoryId: this.formdata.repertory.id,
            targetId: this.form.toRepertory,
            sparepartId: this.formdata.sparepart.id,
            variation : Number(number),
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
    init(formdata, repertory, sparepartConfig, userId){

      this.formdata = formdata;
      this.repertory = repertory.filter(item => item.id != formdata.repertory.id);
      this.sparepartConfig = sparepartConfig;
      this.userId = userId;

      if(this.repertory.length > 0){
        this.form.toRepertory = this.repertory[0].id;
        this.changeRepertory(this.form.toRepertory);
      }
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
.el-form-item__error{
  position: relative;
}

.need-approval {
  color: #666;
  font-size: 12px;
  span {
    color: #f56c6c;
  }
}

.tag-position {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
}
.shadow {
  width: 60px;
  height: 20px;
}

#outType{
  width: 100%;
  height: 34px;
}
</style>