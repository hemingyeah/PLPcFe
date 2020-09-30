<template>
  <base-modal
    title="修改账号名"
    :show.sync="visible"
    width="500px"
    class="modifyname-dialog"
  >
    <div class="base-modal-content">
      <form @submit.prevent="submit" v-if="init">
        <form-builder :fields="fields" ref="form" :value="form" @update="update"></form-builder>

        <div class="dialog-footer" slot="footer">
          <el-button @click="visible = false">关闭</el-button>
          <el-button native-type="submit" type="primary">保存</el-button>
        </div>
      </form>
    </div>
  </base-modal>
</template>
<script>
import http from '@src/util/http';
import Platform from '@src/platform'
export default {
  name: 'modifyname-dialog',
  data() {
    return {
      form: {
        userId: null,
        name: '',
      },
      init: false, // 初始化表单
      visible: false,
    };
  },
  computed: {
    fields() {
      return [
        {
          formType: 'text',
          fieldName: 'name',
          displayName: '',
          isNull: 1,
          disabled: true,
        }
      ];
    },
  },
  methods: {
    // 更新数据
    update({ field, newValue, oldValue }) {
      let { fieldName, displayName } = field;
      if (this.$appConfig.debug) {
        console.info(
          `[FormBuilder] => ${displayName}(${fieldName}) : ${JSON.stringify(
            newValue
          )}`
        );
      }
      this.$set(this.form, fieldName, newValue);
    },
    openDialog() {
      this.visible = true;
      this.init = true;
    },
    // 修改
    async submit() {
      try {
        const validateRes = await this.$refs.form.validate();
        if (!validateRes) return;
        
        const { code } = await http.post('/security/user/name',this.form,false);
        if(status == 0){
          Platform.notification({
            type: 'success',
            title: '修改成功'
          })
          this.$emit('refresh')
          this.init = false;
          this.visible = false;
        }
      } catch (e) {
        console.error('err', e);
      }
    },
  },
};
</script>
<style lang="scss">
.modifyname-dialog {
  .base-modal-body {
    padding: 10px 30px 0;
  }
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    padding-bottom: 20px;
  }
  .form-builder{
    label{
        display: none;

    }
  }
  
}
</style>