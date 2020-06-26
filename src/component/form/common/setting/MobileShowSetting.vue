<template>
  <div class="mobile-show-setting">
    <el-checkbox :value="field.isAppShow" @input="update" :true-label="1" :false-label="0">
      移动端展示
      
    </el-checkbox>
  </div>
</template>

<script>
import { settingProps } from '@src/component/form/components/props';

export default {
  name: 'mobile-show-setting',
  props: {
    ...settingProps
  },
  methods: {
    update(value) {
      this.$emit('input', value, 'isAppShow' );
    }
  }
}
</script>

<style>

</style>