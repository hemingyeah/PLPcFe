<template>
  <div class="form-setting-panel form-select-setting">
    <h3>基础字段 -- {{setting.name}}</h3>
    <div class="form-setting-group">
      <input type="text" placeholder="请输入字段标题" data-prop="displayName" :value="field.displayName" @input="updateForDom" maxlength="6">
    </div>
    <div class="form-setting-group">
      <textarea placeholder="请在此添加描述信息" rows="3" data-prop="placeHolder" :value="field.placeHolder" @input="updateForDom" maxlength="128"></textarea>
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
import _ from 'lodash';
import Platform from '@src/platform';
import LogicalFieldModal from './components/LogicalFieldModal'

const MAX_OPTION_NUM = 50;
const MAX_OPTION_TEXT_NUM = 20;
const DISABLE_LOGICAL_FIELD = ['separator']

export default {
  name: 'form-select-setting',
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
        if(field.isSystem == 0 && DISABLE_LOGICAL_FIELD.indexOf(field.formType) < 0){
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
      if(this.options.length >= MAX_OPTION_NUM) return Platform.alert(`选项数量不能超过${MAX_OPTION_NUM}`);

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
      if(options.length > MAX_OPTION_NUM){
        message.push(`选项数量不能超过${MAX_OPTION_NUM}`);
      }

      // 是否有空白项
      if(options.some(item => !item)){
        message.push('不能存在空白项');
      }

      // 验证每一项长度
      let errIndex = options.map((item, index) => item.length > MAX_OPTION_TEXT_NUM ? index + 1 : -1).filter(item => item != -1);
      if(errIndex.length > 0){
        message.push(`第${errIndex.join('，')}行字数超过${MAX_OPTION_TEXT_NUM}字`);
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

<style lang="scss">
.form-select-setting-isMulti{
  float: right;
  margin: 0 5px 0 0;
  vertical-align: middle;
  cursor: pointer;
  font-size: 14px;
  font-weight: 400;

  input[type="checkbox"]{
    margin-right: 3px;
  }
}

.form-select-setting-option{
  margin-bottom: 5px;

  input[type="text"]{
    width: 220px;
  }
}

.form-select-setting-modal{
  .form-select-setting-batch{
    padding: 10px;
    textarea{
      width: 100%;
      font-size: 12px;
    }
  }

  .base-modal-footer{
    padding: 10px;
    text-align: right;
  }
}

.form-select-setting-warn{
  padding-top: 10px;
  color: #ff8c00;
  font-size: 12px;
  white-space: pre-line;
  line-height: 16px;
}

.form-select-setting-defaultValue{
  background-color: #00ac97;
  color: #fff;
  padding: 2px 4px;
  border-radius: 2px;
  font-size: 12px;
  display: inline-block;
  vertical-align: middle;
}

.form-select-setting-operation {
  .btn-text{
    color: $color-primary;
    padding: 0;

    margin-right: 5px;
  }
}

.form-select-setting-delete,
.form-select-setting-default{
  margin: 0;
  padding: 0;
  width: 20px;
  height: 20px; 
  line-height: 20px;
  vertical-align: middle;
  i.iconfont{
    font-size: 18px;
  }
}

.form-select-setting-delete{
  color: #F56C6C;
}
.form-select-setting-default{
  color: $color-primary
}

.form-select-tips{
  float: left;
  color: $text-color-secondary;
  line-height: 32px;
}

.form-select-logical-btn{
  float: right;
  font-size: 14px;
  color: $color-primary;
  padding: 0;
}

.form-select-logical-item{
  & + .form-select-logical-item{
    margin-top: 10px;
  }

  h4{
    font-size: 14px;
    line-height: 20px;
    padding-bottom: 5px;
    background-color: #fff;
    margin: 0;
    position: relative;
    z-index: 9;
  }

  p{
    margin: 0;
    padding-left: 35px;
    position: relative;
    line-height: 24px;
    z-index: 1;
    
    &:before{
      content: '';
      position: absolute;
      top: -12px;
      left: 10px;
      border-left: 1px solid #ccc;
      border-bottom: 1px solid #ccc;
      height: 24px;
      width: 20px;
    }
  }
}
.form-select-logical-tip{
  margin-top: 10px 0 0 0;
  color: #666;
}
</style>


