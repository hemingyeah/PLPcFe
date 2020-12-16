<template>
  <div class="form-setting-panel form-select-setting">
    <!-- start 标题 -->
    <h3 class="form-setting-panel-title">{{field.displayName}}</h3>   
    <!-- end 标题 -->
    <p class="form-design-warning">该字段为系统内置字段，暂不支持修改、删除。</p>
    <div class="form-setting-group">
      <el-checkbox :value="field.isNull" @input="update($event, 'isNull')" :true-label="0" :false-label="1">必填</el-checkbox>
    </div>
  </div>
</template>

<script>
import SettingMixin from '@src/component/form/mixin/setting';
import { settingProps } from '@src/component/form/components/props';

export default {
  name: 'form-select-setting-customer-tags',
  mixins: [SettingMixin],
  props: {
    ...settingProps,
    /** 用于获取FormDesign实例 */
    getContext: Function
  },
  computed: {
    options(){
      return this.field.options || [];
    },
    isSystem() {
      return this.field.isSystem === 1
    }
  },
  data(){
    return {

    }
  },
  methods: {
    update(value, prop){
      this.$emit('input', {value, prop})
    },
    updateForDom(event){
      let el = event.target;
      let prop = el.dataset.prop;
      let value = el.value;
      
      this.update(value, prop)
    },
  }
}
</script>