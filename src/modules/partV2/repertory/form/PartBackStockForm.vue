<template>
  <el-form label-width="90px"  :model="form" :rules="rules" ref="form">
    <el-form-item label="备件名称:">
      <el-input type="text" placeholder="" :value="formdata.sparepartRepertory&&formdata.sparepartRepertory.sparepart&&formdata.sparepartRepertory.sparepart.name" readonly></el-input>
    </el-form-item>
    <el-form-item label="申请时间:">
      <el-input type="text" placeholder="" :value="formdata.propserTime" readonly></el-input>
    </el-form-item>
    <el-form-item label="拒绝人:">
      <el-input type="text" placeholder="" :value="userName" readonly></el-input>
    </el-form-item> 
     <el-form-item label="拒绝说明:" prop="content">
      <el-input type="textarea" placeholder="请输入拒绝说明 [最多500字]" :autosize="{ minRows: 2, maxRows: 5}" v-model="form.content"></el-input>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: 'part-backstock-form',
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
    userId: '',
    userName: ''
  },
  data(){
    return {
      form: {
        type: '',
        number: '',
        content: ''
      },
      numberValidateForm: {
        number: '',
        repertory: ''
      },
      rules: {
        content: [
          {required: true, message: '请输入拒绝说明'},
          {max: 500, message: '拒绝说明不能超过500字'}
        ],
        number:[
          { required: true, message: '入库数不能为空'}
        ]
      }
    }
  },
  methods: {
    async pack(){
      try {
        let isSucc = await this.$refs.form.validate();
        if(isSucc){
          return {
            id : this.formdata.id,
            remark : this.form.content
          }
        }
      } catch (error) {
        console.log(error)
      }

      return null;
    },
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