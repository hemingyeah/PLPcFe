<template>
  <div class="base-dist-picker">
    <el-cascader
      popper-class="location-cascader"
      change-on-select
      clearable
      :props="props"
      :placeholder="placeholder"
      :options="options"
      :value="value"
      @change="handleChange"
    />
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
    .el-cascader-menu {
      max-height: 204px;
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
/** 
* @url {@link https://github.com/ElemeFE/element/pull/15611}
*/
.location-cascader .el-cascader-node .el-radio {
  display: none;
}
</style>
