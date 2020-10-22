<template>
  <div class="form-setting-panel">
    <!-- start 标题 -->
    <form-title-setting
      :field="field"
      :setting="setting"
      @input="updateForDom"
    ></form-title-setting>
    <!-- end 标题 -->

    <!-- start 描述信息 -->
    <form-describe-setting
      :field="field"
      @input="updateForDom"
    ></form-describe-setting>
    <!-- end 描述信息 -->

  <!-- start 校验 -->
    <div class="form-setting-group form-setting-item">
      <h4 class="form-item-title">校验</h4>
      <div class="form-item-box">
        <!-- 必填 -->
        <form-required-setting :field="field" @input="update"></form-required-setting>
        <!-- 不允许重复值 -->
        <form-repeat-setting :field="field" @input="update"></form-repeat-setting>
      </div>
    </div>
    <!-- end 校验 -->

    <!-- start 选项 -->
    <div class="form-setting-options">
      <h4>选项<el-checkbox :disabled="!!field.id" class="form-select-setting-isMulti" :value="field.isMulti" @input="update($event, 'isMulti')">多选</el-checkbox> </h4>
      <div class="form-select-setting-list">
        <draggable tag="div" class="list-group" :list="options" :options="{animation:380}" handle=".handle">
            <div v-for="(option, index) in options" :key="index" class="form-select-setting-option">
              <button type="button" class="btn-text handle"> <i class="iconfont icon-tuozhuaipaixu"></i></button>
              <input type="text" :value="option.value" @input="updateOption($event, option)" :maxlength="optionMaxLength">
              <button type="button" class="btn-text form-select-setting-delete" @click="delOption(option, index)"><i class="iconfont icon-minus-fill"></i></button>
              <template v-if="!field.isMulti">
                <button type="button" :class="['btn-text', 'form-select-setting-default',option.isDefault && 'btn-active']" @click="setDefaultOption(option)"> <i class="iconfont icon-check-fill"></i></button>
                <span class="form-select-setting-defaultValue" v-if="option.isDefault">默认</span>
              </template>
            </div>
        </draggable> 
      </div>
      <div class="form-setting-group form-select-setting-operation">
        <button type="button" class="btn-text" @click="addOption">增加选项</button>
        <div class="btn-divider"></div>
        <button type="button" class="btn-text" @click="showBatchModal">批量编辑</button>
      </div>
    </div>
    <!-- end 选项 -->

    <!-- start 显示逻辑 -->
    <div v-if="allowLogical">
      <h4>显示逻辑 <button type="button" class="btn-text form-select-logical-btn" @click="showLogicalModal">配置</button></h4>
      <form-select-logical :logical="logical"/>
      <logical-field-modal @submit="updateDependencies" ref="logical" />
    </div>
    <!-- end 显示逻辑 -->

    <!-- start 选项显示模式 -->
    <form-displaymode-setting :field="field" @input="update"></form-displaymode-setting>
    <!-- end 选项显示模式 -->

    <!-- start 字段权限 -->
    <div class="form-setting-group form-setting-item">
      <h4 class="form-item-title">字段权限</h4>
      <div class="form-item-box">
        <!-- 移动端列表展示 -->
        <mobile-show-setting v-if="isTaskMode" :field="field" :fields="fields" @input="update"></mobile-show-setting>
        <!-- 可见性 -->
        <form-visible-setting :field="field" @input="update"></form-visible-setting>
        <!-- 支持高级搜索 -->
        <form-search-setting :field="field" @input="update"></form-search-setting>
      </div>
    </div>
    <!-- end 字段权限 -->
   
    <!-- start 批量编辑选项 -->
    <base-modal 
      title="批量编辑选项" width="520px" class="form-select-setting-modal"
      :show.sync="batchModalShow" :mask-closeable="false">
      <div class="form-select-setting-batch">
        <textarea :value="optionText" @input="updateOptionText" rows="10"></textarea>
        <div class="form-select-setting-warn" v-if="errMessage">{{errMessage}}</div>
      </div>
      <div slot="footer" class="dialog-footer">
        <span class="form-select-tips">每行对应一个选项</span>
        <el-button @click="batchModalShow = false">取 消</el-button>
        <el-button type="primary" @click="batchEdit">保 存</el-button>
      </div>
    </base-modal>
    <!-- end 批量编辑选项 -->
  </div>
</template>

<script>
import {
  SELECT_OPTION_LENGTH_MAX,
  FORM_FIELD_LOGICAL_DISABLE, SELECT_OPTION_MAX
} from '../../config'

import _ from 'lodash';
import draggable from 'vuedraggable';
import LogicalFieldModal from './components/LogicalFieldModal';
import SettingMixin from '@src/component/form/mixin/setting';
import FormSelectMixin from '@src/component/form/mixin/form.select';
import { settingProps } from '@src/component/form/components/props';
import Platform from "@src/platform";


export default {
  name: 'form-select-setting',
  mixins: [SettingMixin, FormSelectMixin],
  props: {
    ...settingProps,
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
  created() {
    console.log("options")
    console.log(this.field)
    console.log(this.options);
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
      if(!newValues.length) {
        Platform.alert("至少要有一个选项");
        return false;
      }

      this.errMessage = this.validateOptions(newValues);
      if(this.errMessage) return false;

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
    draggable,
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
