<template>
  <div class="form-select">
    <el-select
      :id="`form_${field.fieldName}`"
      :placeholder="placeholder"
      clearable
      :multiple="isMulti"
      :value="value" @change="input">
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.text"
        :value="item.value">
      </el-option>
    </el-select>
  </div>
</template>

<script>
export default {
  name: 'form-select',
  props: {
    field: {
      type: Object,
      default: () => ({})
    },
    placeholder: {
      type: String,
      default: ''
    },
    value: [String, Array],
    source: {
      type: Array
    }
  },
  computed: {
    isMulti(){
      let setting = this.field.setting || {};
      return setting.isMulti;
    },
    options(){
      let setting = this.field.setting || {};
      let dataSource = setting.dataSource || [];

      dataSource = dataSource.map(d => {
        if (typeof d === 'string') {
          return {
            text: d,
            value: d,
          }
        }
        return d;
      });

      return this.source || dataSource || [];
    }
  },
  methods: {
    input(newValue){
      let oldValue = null;
      this.$emit('input', {newValue, oldValue, field: this.field});

      this.$el.dispatchEvent(new CustomEvent('form.validate', {bubbles: true}));
    },
    getValue(){
      return this.value;
    }
  },
  mounted(){
    //触发注册事件，用于注册字段到外层formitem组件，和formbuilder组件
    let params = {value: this.getValue, fieldName: this.field.fieldName};
    let event = new CustomEvent('form.add.field', {detail: params, bubbles: true});
    this.$nextTick(() => this.$el.dispatchEvent(event));
  },
  destroyed(){
    //注册解绑事件，用于解绑组件
    let params = {fieldName: this.field.fieldName}
    let event = new CustomEvent('form.remove.field', {detail: params, bubbles: true});
    this.$el.dispatchEvent(event)
  }
}
</script>


<style lang="scss">
.form-select{
  width: 100%;

  .el-select{
    width: 100%;

    .el-input__inner{
      padding-left: 10px;
    }
  }
}
</style>
