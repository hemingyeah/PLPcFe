<template>
  <div class="form-cascader">
    <el-cascader 
      :options="options" 
      :props="props" 
      :value="value"
      @blur="cascaderBlurHandler"
      @focus="cascaderFocusHandler"
      @input="inputForValueWithCascader"
      clearable/>
  </div>
</template>

<script>
import form from '../../mixin/form';
/* utils */
import { addClass, removeClass } from '@src/util/dom';
/* constants */
const CascaderFocusClassName = 'body-for-cascader';

export default {
  name: 'form-cascader',
  mixins: [form],
  props: {
    value: {
      type: Array,
      default: () => []
    }
  },
  data(){
    return {
      props: {
        value: 'value',
        label: 'value',
        children: 'children',
      },
      options: this.field.setting.dataSource || []
    }
  },
  methods: {
    cascaderFocusHandler() {
      addClass(document.body, CascaderFocusClassName);
    },
    cascaderBlurHandler() { 
      removeClass(document.body, CascaderFocusClassName);
    },
    inputForValueWithCascader(value) {
      this.cascaderBlurHandler();
      this.inputForValue(value);
    }
  }
}
</script>

<style lang="scss">
.form-cascader .el-cascader{
  width: 100%;
}

.body-for-cascader {
  .el-cascader-menu {
    .el-cascader-menu__item {
      display: flex;
      align-items: center;
      line-height: 21px;
        
      & > div {
        height: 21px;
        width: 100%;
        line-height: 21px;
        position: relative;
      }

    }
  }
}
</style>

