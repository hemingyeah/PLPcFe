<template>
  <div class="form-setting-panel">
    <h3>{{ isSystem ? '系统' : '基础' }}字段 -- {{setting.name}}</h3>
  </div>
</template>

<script>
import SettingMixin from '@src/component/form/mixin/setting';
import { settingProps } from '@src/component/form/components/props';

export default {
  name: 'task-description-setting',
  mixins: [SettingMixin],
  props: settingProps,
  computed: {
    isSystem() {
      return this.field.isSystem === 1
    },
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
