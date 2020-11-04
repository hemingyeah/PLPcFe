<template>
  <el-dialog title="退回" :visible.sync="visible" width="600px">
    <el-form :model="form" :rules="rules" ref="form" 
      label-width="100px" class="common-form">
      <el-form-item label="申请人：">
        {{loginUser.user.displayName}}
        <span class="notSelf" v-if="backUser.userId!==initData.userId">非本人发起</span>
      </el-form-item>
      <el-form-item label="备件名称：">
        {{part.name}}
      </el-form-item>
      <el-form-item label="备件编号：">
        {{part.serialNumber}}
      </el-form-item>
      <el-form-item label="备件类别：">
        {{part.type}}
      </el-form-item>
      <el-form-item label="备件规格：">
        {{part.standard}}
      </el-form-item>
      <el-form-item label="退回仓库：" prop="repertoryId">
        <el-select v-model="form.repertoryId" class="srp-list-form-item">
          <el-option v-for="item in repertory" :key="item.id" :value="item.id" :label="item.name"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="持有数量：">
        {{holdNum}}
        <!-- <el-input type="text" :value="holdNum" readonly></el-input> -->
      </el-form-item>
      <el-form-item label="退回数量：" prop="count">
        <el-input type="number" step="any" :min="0" :max="holdNum" v-model.number="form.count"></el-input>
      </el-form-item>

      <el-form-item label="备注：" prop="remark">
        <el-input v-model="form.remark" type="textarea" :autosize="{ minRows: 2, maxRows: 4}"></el-input>
      </el-form-item>
      
    </el-form>

    <div slot="footer">
      <el-button @click="visible = false" :disabled="pending">关闭</el-button>
      <el-button type="primary" :disabled="pending" @click="submit" :loading="pending">{{pending ? '正在退回' : '退回'}}</el-button>
    </div>
  </el-dialog>
</template>

<script>
import MathUtil from '@src/util/math';
import { getRootWindow } from '@src/util/dom';

export default {
  name: 'part-back-form',
  inject: ['initData'],
  props: {
    repertory: {
      type: Array,
      default: []
    },
    backUser:{
      type:Object,
      default:{}
    }
  },
  data(){
    return {
      personStock: {},
      visible: false,
      pending: false,

      form: {
        repeId: '',
        count: '',
        repertoryId: '',
        remark: ''
      },

      rules: {
        count: [
          {required: true, type: 'number', message: "数量不能为空"},
          {
            validator:(rule, value, callback) => {
              let err = [];
              let max = this.holdNum || 0;
              const count = this.decimalNumber(value);

              if(value > max) err.push('数量不能大于持有数量')
              if(value < 0) err.push('数量不能小于0')
              if (count != -1 && count == 0) err.push('请填写大于0的正整数')
              if (count != -1 && count != 0) err.push(`请填写大于0的${ count }位小数`)

              callback(err)
            }
          }
        ],
        repertoryId: [
          {required: true, message: "请选择备件要退回的仓库"}
        ],
        remark: [
          {max: 500, message: '备注不能超过500字'}
        ]
      }
    }
  },
  computed:{
    loginUser(){
      let rootWindow = getRootWindow(window);
      return JSON.parse(rootWindow._init) || {};
    },
    // TODO: 支持小数 提示
    minVariation () {
      let initData = this.initData;
      return !initData || !initData.precision ? 1 : (initData.precision == 1 ? 0.1 : 0.01);
    },
    part(){
      let stock = this.personStock || {};
      return stock.sparepart || {};
    },

    holdNum () {
      if(this.personStock.repertoryCount == undefined) return 0;
      let num = this.$math.format(this.$math.subtract(this.$math.bignumber(this.personStock.repertoryCount), this.$math.bignumber(this.personStock.occupyNum)));
      return Number(num);
    }
  },
  methods: {
    numeric(field, event){
      let value = this.form[field];
      this.form[field] = '';
      this.$nextTick(() => this.form[field] = value);
    },
    open(personStock = {}){
      
      this.personStock = personStock;
      this.form.count = 1;
      this.form.repertoryId = '';
      
      this.visible = true;

      this.$nextTick(() => this.$refs.form.clearValidate());
    },
    submit(){
      this.$refs.form.validate(result => {
        if(result) this.backPart();
      })
    },
    async backPart(){
      try {
        if(!await this.$platform.confirm('确定要退回这些备件？')) return;
        
        this.pending = true;
        let params = {
          sparepartId: this.personStock.sparepart.id,
          type: '退回',
          variation: this.form.count,
          repertoryId:this.form.repertoryId,
          userId:this.backUser.userId,
          remark: this.form.remark,
          userName:this.backUser.userName
        }

        let result = await this.$http.post('/partV2/approve/apply', params)

        if(result.status == 0){
          this.$emit('success')
          this.$platform.alert('请求已提交，请等待备件库管理员处理');
          this.visible = false;
        }else{
          this.$platform.alert(result.message);
        }
      } catch (error) {
        console.log(error)
      }

      this.pending = false;
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

<style lang="scss" scoped>
.notSelf{
  display: inline-block;
  height: 22px;
  line-height: 19px;
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 11px;
  color:#FAAE14;
  background: rgba(250,174,20,.2);
  border:1px solid rgba(250,174,20,.16);
}
</style>