<template>
  <div class="base-dist-picker">
    <el-cascader
      popper-class="location-cascader"
      clearable
      :props="props"
      :placeholder="placeholder"
      :options="options"
      change-on-select
      :value="value"
      @change="handleChange"/>
  </div>
</template>

<script>
export default {
  name: 'base-dist-picker',
  data() {
    return {
      options: [],
      props: {
        value: 'name',
        label: 'name',
        children: 'dist',
      },
    }
  },
  props: {
    value: {
      type: Array,
      default: () => ([]),
    },
    placeholder: {
      type: String,
      default: '请选择'
    }
  },
  methods: {
    clearValue() {
      this.$emit('input', []);
    },
    handleChange(value) {
      this.$emit('input', value);
    },
    /** 异步加载区域数据 */
    loadDistData(){
      return import(/* webpackChunkName: "dist.data" */ './city')
        .then(_module => _module.default)
        .catch(err => console.error('err', err));
    }
  },
  async mounted(){
    this.options = await this.loadDistData();
  }
}
</script>

<style lang="scss">
  .location-cascader {
    .el-cascader-menu__item--extensible:after {
      right: 5px;
    }
    .el-cascader-menu__list {
      max-height: 300px;
    }
  }

.base-dist-picker{
  .el-cascader__label{
    padding-left: 10px;
  }

  &:hover .el-input__inner{
    border-color: $input-border-hover-color;
  }
}
</style>
