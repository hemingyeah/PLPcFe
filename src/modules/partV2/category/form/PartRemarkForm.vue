<template>
  <el-form :model="form" :rules="rules" ref="form" label-width="80px">
    <el-form-item label="内容：" prop="content">
      <el-input type="textarea" placeholder="请输入备注内容 [最多500字]" :autosize="{ minRows: 2, maxRows: 5}" v-model="form.content"></el-input>
    </el-form-item>
    <el-form-item label="附件：" class="no-margin">
      <base-upload :value="form.attachments" @input="upload" @remove="remove"></base-upload>
    </el-form-item>
    <el-form-item :show-message="false">
      <el-checkbox v-model="form.showInOwn" :true-label="1" :false-label="0">仅自己可见</el-checkbox>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: 'part-remark-form',
  data(){
    return {
      form: {
        attachments: [],
        showInOwn: 0,
        content: ''
      },
    
      rules: {
        content: [
          {required: true, message: '请输入备注内容'},
          {max: 500, message: '备注内容不能超过500字'}
        ]
      }
    }
  },
  methods: {
    upload(queue){
      this.form.attachments = queue;
    },
    async remove(file){
      if(!await this.$platform.confirm('确定要删除该附件？')) return;

      let index = -1;
      for(let i = 0; i < this.form.attachments.length; i++){
        let f = this.form.attachments[i];
        if(f.url == file.url){
          index = i;
          break;
        }
      }
      if(index >= 0) this.form.attachments.splice(index, 1);
    },
    async pack(){
      let form = this.form;

      try {
        let isSucc = await this.$refs.form.validate();
        if(isSucc){
          return {
            showInOwn: form.showInOwn,
            attachments: form.attachments,
            content: {
              updateType: 'partRecord',
              updateContent: form.content
            }
          }
        }
      } catch (error) {
        console.log(error)
      }

      return null;
    } 
  }
}
</script>
