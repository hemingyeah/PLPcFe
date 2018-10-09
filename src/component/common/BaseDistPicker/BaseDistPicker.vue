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
      }
    },
    methods: {
      clearValue() {
        this.value = [];
        this.$emit('input', []);
      },
      handleChange(value) {
        this.$emit('input', value);

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