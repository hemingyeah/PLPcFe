<template>
  <div class="form-setting-panel form-select-setting">
    <h3>基础字段 -- {{setting.name}}</h3>
    <div class="form-setting-group">
      <input type="text" placeholder="[必填] 请输入字段标题" data-prop="displayName" :value="field.displayName" @input="updateForDom" :maxlength="nameMaxLength">
    </div>
    <div class="form-setting-group">
      <textarea placeholder="请在此添加描述信息" rows="3" data-prop="placeHolder" :value="field.placeHolder" @input="updateForDom" :maxlength="placeholderMaxLength"></textarea>
    </div>
    <div class="form-setting-group">
      <el-checkbox :value="field.isNull" @input="update($event, 'isNull')" :true-label="0" :false-label="1">必填</el-checkbox>
      <el-checkbox :value="field.isSearch" @input="update($event, 'isSearch')" :true-label="1" :false-label="0">搜索</el-checkbox>
    </div>
    <h3>
      选项
      <el-checkbox :disabled="!!field.id" class="form-select-setting-isMulti" :value="field.isMulti" @input="update($event, 'isMulti')">多选</el-checkbox>
    </h3>
    <div class="form-select-setting-list">
      <div v-for="(option, index) in options" :key="index" class="form-select-setting-option">
        <input type="text" :value="option.value" @input="updateOption($event, option)" :maxlength="optionMaxLength">
        <button type="button" class="btn-text form-select-setting-delete" @click="delOption(option, index)"><i class="iconfont icon-minus-fill"></i></button>
        <template v-if="!field.isMulti">
          <button 
            type="button" class="btn-text form-select-setting-default" 
            @click="setDefaultOption(option)" v-if="!option.isDefault">
            <i class="iconfont icon-check-fill"></i>
          </button>
          <span class="form-select-setting-defaultValue" v-else>默认</span>
        </template>
      </div>
    </div>
    <div class="form-setting-group form-select-setting-operation">
      <button type="button" class="btn-text" @click="addOption">增加选项</button>
      <button type="button" class="btn-text" @click="showBatchModal">批量编辑</button>
    </div>
    
    <template v-if="allowLogical">
      <h3>显示逻辑 <button type="button" class="btn-text form-select-logical-btn" @click="showLogicalModal">配置</button></h3>
      <form-select-logical :logical="logical"/>
      <logical-field-modal @submit="updateDependencies" ref="logical" />
    </template>

    <base-modal 
      title="批量编辑选项" width="520px" class="form-select-setting-modal"
      :show.sync="batchModalShow" :mask-closeable="false">
      <div class="form-select-setting-batch">
        <textarea :value="optionText" @input="updateOptionText" rows="10"></textarea>
        <div class="form-select-setting-warn" v-if="errMessage">{{errMessage}}</div>
      </div>
      <template slot="footer">
        <span class="form-select-tips">每行对应一个选项</span>
        <button type="button" class="btn btn-primary" @click="batchEdit">保存</button>
      </template>
    </base-modal>
  </div>
</template>

<script>
import {
  SELECT_OPTION_LENGTH_MAX,
  FORM_FIELD_LOGICAL_DISABLE
} from '../../config'

import _ from 'lodash';
import LogicalFieldModal from './components/LogicalFieldModal';
import SettingMixin from '@src/component/form/mixin/setting';
import FormSelectMixin from '@src/component/form/mixin/form.select';

export default {
  name: 'form-select-setting',
  mixins: [SettingMixin, FormSelectMixin],
  props: {
    field: {
      type: Object,
      default: () => ({})
    },
    setting: {
      type: Object,
      default: () => ({})
    },
    /** 用于获取FormDesign实例 */
    getContext: Function
  },
  computed: {
    /** 
     * 满足以下条件允许配置显示逻辑：
     * 1. 单选
     * 2. 不是最后一个非分割线类型的非系统字段
     */
    allowLogical(){
      if(this.field.isMulti) return false;

      let context = this.getContext();
      let fields = context.value;

      let currIndex = fields.findIndex(f => f.fieldName == this.field.fieldName);

      for(let i = fields.length - 1; i > currIndex; i--){
        let field = fields[i];
        if(field.isSystem == 0 && FORM_FIELD_LOGICAL_DISABLE.indexOf(field.formType) < 0){
          return true;
        }
      }

      return false;
    },
    /** 该字段配置的逻辑显示项 */
    logical(){
      let logical = {};

      let context = this.getContext();
      let fields = context.value;

      let fieldName = this.field.fieldName;
      let options = this.options;

      for(let i = 0; i < fields.length; i++){
        let field = fields[i];

        let dependencies = field.dependencies;
        if(_.isEmpty(dependencies)) continue;

        let depValues = dependencies[fieldName];
        if(!Array.isArray(depValues) || depValues.length == 0) continue;

        for(let j = 0; j < depValues.length; j++){
          let val = depValues[j];
          if(null == logical[val]){
            logical[val] = {index: options.findIndex(i => i.value == val), controls: []};
          }

          logical[val].controls.push(field.displayName)
        }
      }

      return logical;
    },
    optionMaxLength(){
      return SELECT_OPTION_LENGTH_MAX
    }
  },
  data(){
    return {
      index: this.field.options.length,
      batchModalShow: false, 
      optionText: '', // 批量编辑文本
      errMessage: null
    }
  },
  methods: {
    updateDependencies(val){
      this.$emit('input', {prop: 'dependencies', value: val, operate: 'update'})
    },
    showLogicalModal(){
      let context = this.getContext();
      this.$refs.logical.showModal(this.field, context.value);
    },
    updateOption(event, option){
      option.value = event.target.value;
      
      this.$emit('input', {value: this.field, prop: 'dependencies', operate: 'delete'})
    },
    delOption(option, index){
      if(this.options.length <= 1) return alert('至少保留一个选项')

      // 如果是删除默认值，清空默认值
      if(option.isDefault) this.$emit('input', {value: null, prop: 'defaultValue'});

      let options = _.cloneDeep(this.options);
      options.splice(index, 1);

      this.$emit('input', {value: options, prop: 'options'})
      this.$emit('input', {value: this.field, prop: 'dependencies', operate: 'delete'})
    },
    batchEdit(){
      let newValues = this.optionText.split('\n').filter(option => option);

      this.errMessage = this.validateOptions(newValues);
      if(this.errMessage) return;

      let newOptions = newValues.map(item => ({value: item, isDefault: false}));
      // 补全默认值
      if(!this.field.isMulti){
        let defaultValue = this.field.defaultValue;
        for(let i = 0; i < newOptions.length; i++){
          let option = newOptions[i];
          if(defaultValue == option.value){
            option.isDefault = true;
            break;
          }
        }
      }
      
      this.$emit('input', {value: newOptions, prop: 'options'})
      this.$emit('input', {value: this.field, prop: 'dependencies', operate: 'delete'})

      this.batchModalShow = false;
    }
  },
  components: {
    [LogicalFieldModal.name]: LogicalFieldModal,
    'form-select-logical': {
      name: 'form-select-logical',
      functional: true,
      props: {
        logical: {
          type: Object,
          default: () => ({})
        }
      },
      render(h, context){
        let logical = context.props.logical;
        let keys = Object.keys(logical);

        if(keys.length == 0) return (
          <p class="form-select-logical-tip">该字段尚未配置显示逻辑</p>
        );

        let controls = keys
          .sort((p, n) => logical[p].index - logical[n].index)
          .map(key => {
            let c = logical[key].controls;

            return (
              <div class="form-select-logical-item"> 
                <h4>{ key }</h4>
                { c.map(i => <p>{ i }</p>) }
              </div>
            )
          })

        return <div>{ controls }</div>
      }
    }
  }
}
</script>
