<template>
  <div class="form-visibility-setting">
    <div class="form-setting-group">
      <el-checkbox :value="field.isVisibility" @input="update" :true-label="0" :false-label="1">
        可见性
        <el-tooltip content="控制部分角色对字段的查看权限，适用于字段不需要所有人查看的，需要脱敏处理的情况" placement="top">
          <i class="iconfont icon-info"></i>
        </el-tooltip>
      </el-checkbox>
    </div>
      <div class="form-setting-group">
        <el-select v-model="field.setting.dateType" multiple collapse-tags> 
          <el-option label="角色1" value="角色1"></el-option>
          <el-option label="角色2" value="角色2"></el-option>
        </el-select>
      </div>
    
  </div>
</template>

<script>
/* config */
import * as config from '@src/component/form/config';
/* props */
import { settingProps } from '@src/component/form/components/props';

export default {
  name: 'form-visibility-setting',
  props: {
    ...settingProps
  },
  methods: {
    update(value) {
      this.$emit('input',value, 'isVisibility');
    }
  }
}
</script>

<style>

</style>