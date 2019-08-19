<template>
  <div>
    <base-modal
      :title="title"
      width="500px"
      :show.sync="show">
      <el-form>
        <el-form-item label="分类名称">
          <input class="title" v-model="info.name" />
        </el-form-item>
        <el-form-item label="父级分类">
          <el-select v-model="info.parentId" class="type" clearable>
            <el-option v-for="item in info.options" :key="item.value" :label="item.name" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <p class="prompt">如果不选择父级分类，则该分类为一级分类</p>

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
      info: this.value
    }
  },
  methods: {
    open () {
      this.show = true;
    },
    sumbitType () {
      this.show = false;
      this.$emit('sumbitType');
    }
  }
}
</script>

<style lang="scss">
.base-modal-body {
  padding: 10px 30px 0;

  .el-form-item {
    margin: 0;
  }

  .title, .type {
    width: 370px;
  }

}
.edit-footer {
  display: flex;
  justify-content: flex-end;
}

.prompt {
  margin: 0;
  font-size: 12px;
  color: red;
} 
</style>