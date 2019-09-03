<template>
  <div>
    <base-modal
      :title="title"
      width="500px"
      :show.sync="show"
      class="type-modal-body">
      <el-form :model="info" :rules="rules" ref="ruleForm">
        <el-form-item label="分类名称" prop="name">
          <el-input class="title" v-model="info.name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类" class="type-form">
          <el-select v-model="info.parentId" class="type" clearable :disabled="value.title == 1">
            <el-option v-for="item in info.options" :key="item.value" :label="item.name" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <p class="prompt">如果不选择父级分类，则该分类为父级分类</p>

      <div slot="footer" class="edit-footer">
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
        name: [{
          required: true,
          message: '请输入分类名称',
          trigger: 'blur'
        }]
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
    }

    .title {
      width: 340px;
    }

    .type-form {
      margin-top: 20px !important;
    }

    .type {
      width: 340px;
    }

  }
  .edit-footer {
    display: flex;
    justify-content: flex-end;
  }

  .prompt {
    margin: 0;
    font-size: 12px;
    color: #F56C6C;
  } 
}

</style>