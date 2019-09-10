<template>
  <div>
    <base-modal
      :title="title"
      width="500px"
      v-if="show"
      :show.sync="show"
      class="type-modal-body">
      <el-form :model="info" :rules="rules" ref="ruleForm">
        <el-form-item label="分类名称" prop="name">
          <el-input class="title" v-model="info.name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类" class="type-form">
          <el-select v-model="info.parentId" class="type" clearable :disabled="value.parentId == null">
            <el-option v-for="item in info.options" :key="item.value" :label="item.name" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <div slot="footer" class="edit-footer">
        <p class="prompt">如果不选择父级分类，则该分类为父级分类</p>
        <button type="button" class="btn btn-primary" @click="sumbitType">确定</button>
      </div>
    </base-modal>
  </div>
</template>

<script>
export default {
  name: 'type-modal',
  props: {
    title: {
      type: String,
      default: ''
    },
    value: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      show: false,
      info: this.value,
      rules: {
        name: [
          { required: true, message: '请输入分类名称！', trigger: 'blur' },
          { max: 20, message: '标题不能超过20个字符！', trigger: 'blur' }
        ]
      },
    }
  },
  methods: {
    open () {
      this.show = true;
    },
    sumbitType () {
      this.$refs.ruleForm.validate((valid) => {
        if(valid) {
          this.show = false;
          this.$emit('sumbitType');
        }
      })
    }
  }
}
</script>

<style lang="scss">
.type-modal-body {

  .base-modal-body {
    padding: 10px 30px 0;

    .el-form-item {
      margin: 0;
      line-height: 32px;

      .el-form-item__label {
        line-height: 32px;
        text-align: right;
        width: 85px;
      }
    }

    .title {
      width: 355px;
    }

    .type-form {
      margin-top: 20px !important;
    }

    .type {
      width: 355px;
    }

  }

  .base-modal-footer {
    padding: 15px 30px 15px 45px;
  }
  .edit-footer {
    display: flex;
    justify-content: space-between;

    .prompt {
      display: inline-block;
      margin: 0;
      font-size: 12px;
      color: #999;
      margin-top: 10px;
    }
  }
}

</style>