<template>
  <div class="base-dist-picker">
    <el-cascader
      clearable
      :props="props"
      :options="options"
      change-on-select
      :value="value"
      @change="handleChange"/>
  </div>
</template>

<script>
  export default {
    name: "base-dist-picker",
    data() {
      return {
        options: [],
        value: [],
        props: {
          value: 'name',
          label: 'name',
          children: 'dist',
        },
      }
    },
    props: {
      // field: {
      //   type: String,
      //   default: '',
      // }
    },
    methods: {
      clearValue() {
        this.value = [];
        this.$emit('city-selector-change', []);
      },
      handleChange(value) {
        this.$emit('city-selector-change', value);
      },
      /** 异步加载区域数据 */
      loadDistData(){
        return import(/* webpackChunkName: "dist.data" */ './city').then(_module => _module.default);
      }
    },
    async mounted(){
      this.options = await this.loadDistData();
    }
  }
</script>