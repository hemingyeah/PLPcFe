<template>
  <div class="base-dist-picker">
    <el-cascader
      clearable
      :props="props"
      :options="options"
      change-on-select
      :value="value"
      @change="handleChange"
    ></el-cascader>

  </div>
</template>

<script>
  import city from './city';

  export default {
    name: "base-dist-picker",
    data() {
      return {
        options: city,
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
    }
  }
</script>

<style scoped>

</style>