<template>
  <div class="form-visible-setting">
    <div class="form-setting-item">
      <el-checkbox v-model="visibleConfig.visible" @change="update" :true-label="1" :false-label="0">
        可见性
        <el-tooltip content="控制部分角色对字段的查看权限，适用于字段不需要所有人查看的，需要脱敏处理的情况" placement="top">
          <i class="iconfont icon-question"></i>
        </el-tooltip>
      </el-checkbox>
    </div>
    <div class="form-setting-item" v-if="visibleConfig.visible == 1">
      <el-select v-model="visibleConfig.role" @change="update" placeholder="请选择授权角色" multiple>
        <el-option label="角色1" value="角色1"></el-option>
        <el-option label="角色2" value="角色2"></el-option>
      </el-select>
    </div>
  </div>
</template>

<script>
/* props */
import { settingProps } from '@src/component/form/components/props';

export default {
  name: 'form-visible-setting',
  props: {
    ...settingProps
  },
  computed: {
    visibleConfig() {
      return this.field.setting.visibleConfig || { visible: 0, role: [] }
    }
  },
  methods: {
    update() {
      this.$emit('input', this.visibleConfig, 'visibleConfig', true);
    }
  }
}
</script>

<style lang="scss" scoped>
.form-visible-setting {
  .form-setting-item {
    .el-select {
      width: 100%;
      padding-left: 24px;
      margin: 8px 0 4px;
    }
  }
}
</style>