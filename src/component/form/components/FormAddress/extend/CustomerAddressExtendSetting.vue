<template>
  <div class="form-setting-panel">
    <!-- start 标题 -->
    <h3 class="form-setting-panel-title">{{field.displayName}}</h3>   
    <!-- end 标题 -->
    <p class="form-design-warning">该字段为系统内置字段，暂不支持修改、删除。</p>
    <div class="form-setting-group">
      <el-checkbox :value="field.isNull" @input="update($event, 'isNull')" :true-label="0" :false-label="1">必填</el-checkbox>
    </div>

    <!-- TODO: 支持设置默认地址 -->
    <h3>默认地址</h3>
    <base-dist-picker @input="changeDefaultVal" :value="distValue" placeholder="请选择区域"/>
    <p class="address-tip">新建客户时默认选中的地址</p>
  </div>
</template>

<script>
import SettingMixin from '@src/component/form/mixin/setting';
import { settingProps } from '@src/component/form/components/props';

export default {
  name: 'customer-address-extend-setting',
  mixins: [SettingMixin],
  props: settingProps,
  computed: {
    distValue() {
      const {adProvince, adCity, adDist} = this.field.setting.customerAddressConfig;

      return [adProvince, adCity, adDist].filter(a => !!a);
    }
  },
  methods: {
    changeDefaultVal(val) {
      const [adProvince, adCity, adDist] = val || [];

      this.update({
        adProvince: adProvince || '',
        adCity: adCity || '',
        adDist: adDist || ''
      }, 'customerAddressConfig', true)
    },
    updateForDom(event){
      let el = event.target;
      let prop = el.dataset.prop;
      let value = el.value;
      
      this.update(value, prop)
    },
    update(value, prop, isSetting){
      this.$emit('input', {value, prop, isSetting})
    }
  }
}
</script>

<style lang="scss">
  .base-dist-picker  .el-cascader {
    width: 100%;
  }

  .address-tip {
    margin: 0;
    line-height: 30px;
    color: $text-color-secondary;
    font-size: $font-size-small;
  }

</style>