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
    >
    <template slot-scope="{ item, data }" class="type">
      <span> 
        {{ data.name }}
        <!-- TODO: 临时解决图标不显示方法 -->
        <template v-if="data.dist">
          <i class="iconfont icon-arrowright"> </i>
        </template>
      </span>
    </template>
    </el-cascader>
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
    try {
      this.options = await this.loadDistData();
    } catch (error) {
      console.error(error)
    }
    
  }
}
</script>

<style lang="scss">
  .location-cascader {

    .el-cascader-menu__item {
      display: flex;
      align-items: center;
      line-height: 21px;
      
      & > div {
        height: 21px;
        width: 100%;
        line-height: 21px;
        position: relative;
        padding-right: 8px;
      }

    }
    .el-cascader-menu {
      max-height: 204px;
    }

    .el-cascader-menu__item--extensible {
      font-family: "iconfont" !important;

      &::after {
        content: "";
        right: 5px;
      }

      .iconfont {
        color: #bfcbd9;
        position: absolute;
        right: -10px;
        top: 0;
      }

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
