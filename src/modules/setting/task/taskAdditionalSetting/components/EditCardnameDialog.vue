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
      <el-tooltip
        class="item"
        effect="dark"
        content="每个附加组件可以有5个自定义字段"
        placement="top"
        v-if="!id"
      >
        <span><i class="el-icon-question"></i></span>
      </el-tooltip>
    </div>
    <div class="base-modal-content">
      <el-form :model="form" :rules="rules" ref="form" label-width="80px">
        <el-form-item label="名称:" prop="name">
          <el-input
            v-model="form.name"
            placeholder="请输入名称[最多20个字]"
            maxlength="20"
          ></el-input>
        </el-form-item>
        <el-form-item label="说明:">
          <el-input
            type="textarea"
            v-model="form.name"
            placeholder="请输入说明信息"
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
          <el-radio-group v-model="form.resource" :disabled="id?true:false">
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
export default {
  name: "edit-cardname-dialog",
  data() {
    return {
      visible: false,
      id: "",
      form: {
        name: "",
        resource: "single"
      },
      rules: {
        name: [{ required: true, message: "请输入名称", trigger: "blur" }],
      },
    };
  },
  methods: {
    openDialog() {
      this.visible = true;
    },
    onClose(form) {
      this.visible = false;
      this.id = "";
      this.$refs[form].resetFields();
    },
    onSubmit(form) {
      this.$refs[form].validate((valid) => {
        if (valid) {
          alert("submit!");
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
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