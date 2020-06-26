<template>
  <div class="form-setting-panel">
    <h3>基础字段 -- {{ setting.name }}</h3>
    <div class="form-setting-group">
      <input type="text" placeholder="[必填] 请输入字段标题" data-prop="displayName" :value="field.displayName" @input="updateForDom" :maxlength="nameMaxLength">
    </div>
    <div class="form-setting-group">
      <textarea placeholder="请在此添加描述信息" rows="3" data-prop="placeHolder" :value="field.placeHolder" @input="updateForDom" :maxlength="placeholderMaxLength"></textarea>
    </div>
    <h3>关联项字段</h3>
    <div class="form-setting-group"> 
      <el-select v-model="selectedRelatedField">
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.displayName"
          :value="item.fieldId">
        </el-option>
      </el-select>
    </div>
    <div class="form-setting-group">
      <el-checkbox :value="field.isSearch" @input="update($event, 'isSearch')" :true-label="1" :false-label="0">搜索</el-checkbox>
    </div>
  </div>
</template>
<script>
import SettingMixin from '@src/component/form/mixin/setting'
import { settingProps } from '@src/component/form/components/props';

export default {
  name: 'form-relation-setting',
  mixins: [SettingMixin],
  props: settingProps,
  computed: {
    module () {
      return this.field.formType === 'relationCustomer' ? 'customer' : 'product';
    },
    options() {
      // TODO: 此处不是本地数据 需要从服务端获取 或 服务端塞进来数据
      let moduleOptionName = `${this.module}Fields`;
      return this[moduleOptionName];
    },
    selectedRelatedField: {
      get() {
        return this.field.setting.fieldId || '';
      },
      set(newVal) {
        const selectedField = this.options.filter(field => field.fieldId == newVal);

        if (selectedField.length) {
          const { fieldName, formType } = selectedField[0];

          this.field.setting = {
            module: this.module,
            fieldId: newVal,
            fieldName,
            formType
          }
        }
      }
    }
  },
  data() {
    return {
      customerFields: [
        {fieldId: 'serialNumber', tableName: 'customer', fieldName: 'serialNumber', 
          displayName: '客户编号', isSystem: '0', isSearch: '1', formType: 'text'},
        {fieldId: 'tags', tableName: 'customer', fieldName: 'tags', displayName: '服务团队',
          isSystem: '0', isSearch: '1', formType: 'selectMulti'},
        {fieldId: 'customerManager', tableName: 'customer', fieldName: 'customerManager',
          displayName: '客户负责人', isSystem: '0', isSearch: '1', formType: 'text'}
      ],
      productFields: [
        {fieldId: 'serialNumber', tableName: 'customer', fieldName: 'serialNumber', 
          displayName: '产品编号', isSystem: '0', isSearch: '1', formType: 'text'},
        {fieldId: 'type', tableName: 'customer', fieldName: 'type', displayName: '产品类型', 
          isSystem: '0', isSearch: '1', formType: 'select'}
      ],
    }
  },
  methods: {
    updateForDom(event) {
      let el = event.target;
      let prop = el.dataset.prop;
      let value = el.value;

      this.update(value, prop);
    },
    update(value, prop) {
      this.$emit('input', { value, prop });
    }
  }
}
</script>
