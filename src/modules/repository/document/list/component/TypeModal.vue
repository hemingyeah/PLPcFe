<template>
  <div>
    <base-modal
      :title="title"
      width="500px"
      :show.sync="show">
      <el-form>
        <el-form-item label="分类名称">
          <input class="title" v-model="info.newType" />
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader 
            :options="info.options" 
            clearable 
            class="type" 
            v-model="info.parentType"></el-cascader>
        </el-form-item>
      </el-form>

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
  created () {
    console.log(this.info);
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
</style>