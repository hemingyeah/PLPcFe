<template>
  <base-modal
    :show.sync="visible"
    width="420px"
    class="edit-dialog"
    @closed="onClose('form')"
  >
    <div slot="title">
      <span class="el-dialog__title">{{
        id ? "编辑组件名称" : "新建附加组件"
      }}</span>
    </div>
    <div class="base-modal-content">
      <el-form :model="form" :rules="rules" ref="form" label-width="80px" label-position="left">
        <el-form-item label="名称:" prop="name">
          <el-input
            v-model="form.name"
            placeholder="请输入名称[最多20个字]"
            maxlength="20"
          ></el-input>
        </el-form-item>
        <el-form-item label="说明:" prop="description">
          <el-input
            type="textarea"
            v-model="form.description"
            placeholder="请输入说明信息"
            maxlength="500"
          ></el-input>
        </el-form-item>
        <el-form-item prop="resource">
          <div slot="label">
            类型:
            <el-tooltip
              effect="dark"
              content="设置附加组件在单个工单中添加多次还是单次"
              placement="top"
            >
              <span><i class="el-icon-question"></i></span>
            </el-tooltip>
          </div>
          <el-radio-group v-model="form.inputType" :disabled="form.id?true:false">
            <el-radio label="single">单次</el-radio>
            <el-radio label="multiple">多次</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="onClose('form')">取 消</el-button>
      <el-button type="primary" @click="onSubmit('form')" v-if="id"
      >确 定</el-button
      >
      <el-button type="primary" @click="onSubmit('form')" v-else
      >下一步</el-button
      >
    </div>
  </base-modal>
</template>
<script>
// api
import * as SettingTaskApi from '@src/api/SettingTaskApi';

export default {
  name: 'edit-cardname-dialog',
  props: {
    id:{
      type: String,
    }
  },
  data() {
    return {
      visible: false,
      form: {
        id: '',
        name: '',
        description: '',
        inputType: 'single'
      },
      rules: {
        name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
      },
    };
  },
  methods: {
    openDialog() {
      this.visible = true;
      if(this.id) {
        this.form.id = this.id;
        this.getCardInfoReq()
      }
    },
    onClose(form) {
      this.visible = false;
      this.$refs[form].resetFields();

    },
    onSubmit(form) {
      this.$refs[form].validate((valid) => {
        if (valid) {
          if(this.form.id){
            // 修改组件
            this.onUpdateCardReq(form);
          }else{
            // 新增组件
            this.onCreatCardReq();
           
          }
          this.visible = false;
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    
    // 创建附加组件
    onCreatCardReq() {
      const params = {
        description: this.form.description,
        inputType: this.form.inputType,
        name: this.form.name,
      }
      SettingTaskApi.onCreatCard(params).then(res=>{
        const { status, message, data } = res;
        if(status == 0){
          this.$message.success('创建成功');
          setTimeout(()=>{
            let cardId = data;
            this.$platform.openTab({
              id: 'task_card_setting',
              title: '附加组件表单设置',
              url: `/setting/task/cardFormfields?cardId=${cardId}`,
              reload: true,
            });
          }, 1000)
        }else{
          this.$message.error(message);
        }
      }).catch(error=>{
        console.log(error)
      })
    },

    // 修改附加组件
    onUpdateCardReq(form) {
      const params = {
        description: this.htmlEscape(this.form.description),
        id: this.form.id,
        name: this.form.name,
      }
      SettingTaskApi.onUpdateCard(params).then(res=>{
        const { status, message, data } = res;
        if(status == 0){
          this.$message.success('修改成功');
          this.$emit('editCardSubmit');

          this.onClose(form);
        }else{
          this.$message.error(message);
        }
      }).catch(error=>{
        console.log(error)
      })
    },

    // 获取附加组件的信息
    getCardInfoReq() {
      SettingTaskApi.getCardInfo({id:this.form.id}).then(res=>{
        const { status, message, data } = res;
        if( status == 0 ){
          data.description = this.htmlUnEscape(data.description)
          this.form = data;
        }
      }).catch(error=>({}))
    },
    
    // 防止XSS的恶意脚本攻击
    htmlEscape(value){
      return value.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    },
    htmlUnEscape(value){
      if(!value) return '';
      return value.replace( /&lt;/g, '<').replace(/&gt;/g, '>');
    }

  },
};
</script>
<style lang="scss">
.edit-dialog {
  .base-modal-header {
    display: flex;
    justify-content: space-between;
    .el-dialog__title {
      font-size: 18px;
    }
    .el-tooltip {
      color: #999;
    }
  }
  .base-modal-body {
    padding: 20px;
    .el-form {
      .el-form-item {
        .el-form-item__content {
          width: 280px;
          .el-radio {
            margin-right: 24px;
          }
        }
        .el-tooltip {
            color: #999;
        }
      }
    }
  }
}
</style>