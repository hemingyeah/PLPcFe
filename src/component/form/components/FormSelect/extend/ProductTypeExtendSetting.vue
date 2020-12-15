<template>
  <div class="form-setting-panel form-select-setting">
    <h3> {{field.displayName}}</h3>
    <p class="form-design-warning">该字段为系统内置字段，暂不支持修改、删除。</p>
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
      </div>
    </div>
    <!-- end 校验 -->

    <div class="form-select-setting-list">
      <h4>选项</h4>
      <div v-for="(option, index) in options" :key="index" class="form-select-setting-option">
        <input type="text" :value="option.value" @input="updateOption($event, option)" maxlength="20">
        <button type="button" class="btn-text form-select-setting-delete" @click="delOption(option, index)"><i class="iconfont icon-minus-fill"></i></button>
        <template v-if="!field.isMulti">
<!--          <button -->
<!--            type="button" class="btn-text form-select-setting-default" -->
<!--            @click="setDefaultOption(option)" v-if="!option.isDefault">-->
<!--            <i class="iconfont icon-check-fill"></i>-->
<!--          </button>-->
<!--          <span class="form-select-setting-defaultValue" v-else>默认</span>-->

          <button
              type="button" :class="['btn-text', 'form-select-setting-default', option.isDefault && 'btn-active']"
              @click="setDefaultOption(option)">
            <i class="iconfont icon-check-fill"></i>
          </button>
          <span class="form-select-setting-defaultValue" v-if="option.isDefault">默认</span>

        </template>
      </div>
    </div>
    <div class="form-setting-group form-select-setting-operation">
      <button type="button" class="btn-text" @click="addOption">增加选项</button>
      <div class="btn-divider"></div>
      <button type="button" class="btn-text" @click="showBatchModal">批量编辑</button>
    </div> 

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
  </div>
</template>

<script>
import _ from 'lodash';
import SettingMixin from '@src/component/form/mixin/setting';
import FormSelectMixin from '@src/component/form/mixin/form.select';
import { settingProps } from '@src/component/form/components/props';
import Platform from "@src/platform";

export default {
  name: 'form-select-setting-product-type',
  mixins: [SettingMixin, FormSelectMixin],
  props: {
    ...settingProps,
    /** 用于获取FormDesign实例 */
    getContext: Function
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
   batchEdit(){
      let newValues = this.optionText.split('\n').filter(option => option);
      if(!newValues.length) {
        Platform.alert("至少要有一个选项");
        return false;
      }

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
    },
    delOption(option, index){
      if(this.options.length <= 1) return alert('至少保留一个选项')

      // 如果是删除默认值，清空默认值
      if(option.isDefault) this.$emit('input', {value: null, prop: 'defaultValue'});

      let options = _.cloneDeep(this.options);
      options.splice(index, 1);

      this.$emit('input', {value: options, prop: 'options'})
    },
    updateOption(event, option){
      option.value = event.target.value;
    },
  }
}
</script>