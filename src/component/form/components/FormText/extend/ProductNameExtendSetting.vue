<template>
  <div class="form-setting-panel">
    <!-- start 标题 -->
    <h3 class="form-setting-panel-title">{{field.displayName}}</h3>   
    <!-- end 标题 -->
    <p class="form-design-warning">该字段为系统内置字段，暂不支持修改、删除。</p>
    <!-- start 描述信息 -->
    <form-describe-setting
      :field="field"
      @input="updateForDom"
    ></form-describe-setting>
    <!-- end 描述信息 -->
  </div>
</template>

<script>
import SettingMixin from '@src/component/form/mixin/setting';
import { settingProps } from '@src/component/form/components/props';

export default {
  name: 'product-name-extend-setting',
  mixins: [SettingMixin],
  props: settingProps,
  computed: {
    isSystem() {
      return this.field.isSystem === 1;
    }
  },
  methods: {
    updateForDom(event){
      let el = event.target;
      let prop = el.dataset.prop;
      let value = el.value;
      
      this.update(value, prop)
    },
    update(value, prop){
      this.$emit('input', {value, prop})
    }
  }
}
</script>