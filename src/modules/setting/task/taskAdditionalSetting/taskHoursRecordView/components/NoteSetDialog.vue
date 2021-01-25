<template>
  <base-modal
    :show.sync="visible"
    width="500px"
    class="note-set-dialog"
    @closed="onClose('form')"
  >
    <div slot="title">
      <span class="el-dialog__title">设置</span>
    </div>
    <div class="base-modal-content">
      <div class="fields-name">
        <label>标题</label>
        <el-input v-model="field.displayName" placeholder="请输入标题"></el-input>
      </div>
      <el-checkbox v-model="field.isNull" :true-label="1" :false-label="0">是否必填</el-checkbox>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="onClose">取 消</el-button>
      <el-button type="primary" @click="onSubmit">确 定</el-button>
    </div>
  </base-modal>
</template>
<script>
export default {
  name: 'note-set-dialog',
  data() {
    return {
      field:{},
      placeholder:'',
      visible: false,
      isNull:0
    };
  },
  methods: {
    openDialog() {
      this.visible = true;
    },
    onClose() {
      this.visible = false;

    },
    onSubmit() {
      this.$emit('onSave', this.field)
    }
  },
};
</script>
<style lang="scss">
.note-set-dialog {
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
    .fields-name{
      margin-bottom: 19.5px;
    }
  }
}
</style>