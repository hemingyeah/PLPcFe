<template>
  <div class="form-setting-panel">
    <h3>{{ isSystem ? '系统' : '基础' }}字段 -- {{setting.name}}</h3>
  </div>
</template>

<script>
import SettingMixin from '@src/component/form/mixin/setting';

export default {
  name: 'task-description-setting',
  mixins: [SettingMixin],
  props: {
    field: {
      type: Object,
      default: () => ({})
    },
    setting: {
      type: Object,
      default: () => ({})
    }
  },
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
