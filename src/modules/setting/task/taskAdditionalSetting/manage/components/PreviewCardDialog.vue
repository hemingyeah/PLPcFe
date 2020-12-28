<template>
  <base-modal
    :show.sync="visible"
    width="420px"
    class="preview-dialog"
    @closed="onClose('form')"
  >
    <div slot="title">
      <span class="el-dialog__title">预览</span>
    </div>
    <div class="base-modal-content">
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="onClose">取 消</el-button>
      <el-button type="primary" @click="onClose">确 定</el-button>
    </div>
  </base-modal>
</template>
<script>
export default {
  name: "preview-card-dialog",
  props: {
  },
  data() {
    return {
      visible: false,
    };
  },
  methods: {
    openDialog() {
      this.visible = true;
    },
    onClose() {
      this.visible = false;

    },
  },
};
</script>
<style lang="scss">
.preview-dialog {
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
  }
}
</style>