<template>
  <div class="base-dist-picker">
    <el-cascader
      :props="props"
      :options="options"
      change-on-select
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
      field: {
        type: String,
        default: '',
      }
    },
    methods: {
      handleChange(value) {
        this.$emit('city-selector-change', {
          value,
          field: this.field,
        });
      },
    }
  }
</script>

<style scoped>

</style>