<template>
  <div class="form-setting-panel form-select-setting">
    <h3>{{ isSystem ? '系统' : '基础' }}字段 -- {{field.displayName}}</h3>
    <div class="form-select-setting-list">
      <div v-for="(option, index) in options" :key="index" class="form-select-setting-option">
        <input type="text" :value="option.value" @input="updateOption($event, option)" maxlength="20">
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
  SELECT_OPTION_MAX,
  SELECT_OPTION_LENGTH_MAX
} from '@src/component/form/config'

import _ from 'lodash';
import Platform from '@src/platform';
import SettingMixin from '@src/component/form/mixin/setting';

export default {
  name: 'form-select-setting-product-type',
  mixins: [SettingMixin],
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
    options(){
      return this.field.options || [];
    },
    isSystem() {
      return this.field.isSystem == 1
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
    updateForDom(event){
      let el = event.target;
      let prop = el.dataset.prop;
      let value = el.value;
      
      this.update(value, prop)
    },
    update(value, prop){
      if(prop == 'isMulti') {
        // 如果是多选，清空默认值
        this.options.forEach(item => item.isDefault = false);
        this.$emit('input', {value: this.options, prop: 'options'})
        this.$emit('input', {value: null, prop: 'defaultValue'});
      }

      this.$emit('input', {value, prop})
    },
    addOption(){
      if(this.options.length >= SELECT_OPTION_MAX) return Platform.alert(`选项数量不能超过${SELECT_OPTION_MAX}`);

      let options = _.cloneDeep(this.options);
      this.index++;

      options.push({
        value: `选项${ this.index }`,
        isDefault: false
      })

      this.$emit('input', {value: options, prop: 'options'})
    },
    updateOption(event, option){
      option.value = event.target.value;
    },
    delOption(option, index){
      if(this.options.length <= 1) return alert('至少保留一个选项')

      // 如果是删除默认值，清空默认值
      if(option.isDefault) this.$emit('input', {value: null, prop: 'defaultValue'});

      let options = _.cloneDeep(this.options);
      options.splice(index, 1);

      this.$emit('input', {value: options, prop: 'options'})
    },
    // 设置默认值
    setDefaultOption(option){
      if(this.field.isMulti) return Platform.alert('多选暂不支持设置默认值');
      if(!option.value) return Platform.alert('请先补全选项');

      this.options.forEach(item => item.isDefault = false);
      option.isDefault = true;

      this.$emit('input', {value: this.options, prop: 'options'})
      this.$emit('input', {value: option.value, prop: 'defaultValue'});
    },
    showBatchModal(){
      this.optionText = this.field.options.map(item => item.value).join('\n');
      this.batchModalShow = true;
      this.errMessage = null;
    },
    updateOptionText(event){
      this.optionText = event.target.value;

      let newOption = this.optionText.split('\n');
      this.errMessage = this.validateOptions(newOption);
    },
    validateOptions(opts){
      let options = opts[opts.length - 1] == null ? opts.slice(0, -1) : opts;
      let message = [];

      // 验证数量
      if(options.length > SELECT_OPTION_MAX){
        message.push(`选项数量不能超过${SELECT_OPTION_MAX}`);
      }

      // 是否有空白项
      if(options.some(item => !item)){
        message.push('不能存在空白项');
      }

      // 验证每一项长度
      let errIndex = options.map((item, index) => item.length > SELECT_OPTION_LENGTH_MAX ? index + 1 : -1).filter(item => item != -1);
      if(errIndex.length > 0){
        message.push(`第${errIndex.join('，')}行字数超过${SELECT_OPTION_LENGTH_MAX}个`);
      }

      return message.length > 0 ? message.join('\n') : null;
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
      this.batchModalShow = false;
    }
  }
}
</script>