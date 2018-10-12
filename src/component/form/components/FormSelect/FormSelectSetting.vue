<template>
  <div class="form-setting-panel form-select-setting">
    <h3>基础设置 -- {{setting.name}}</h3>
    <div class="form-setting-group">
      <input type="text" placeholder="请输入字段标题" data-prop="displayName" :value="field.displayName" @input="update" maxlength="6">
    </div>
    <div class="form-setting-group">
      <textarea placeholder="请在此添加描述信息" rows="3" data-prop="placeHolder" :value="field.placeHolder" @input="update"></textarea>
    </div>
    <div class="form-setting-group">
      <label><input type="checkbox" :checked="field.isNull == 0" @input="update" data-prop="isNull"> 必填</label>
      <label title="勾选后该字段可在高级搜索中查询" v-tooltip>
        <input type="checkbox" :checked="field.isSearch == 1" @input="update" data-prop="isSearch"> 搜索
      </label>
    </div>
    <h3>
      选项设置
      <label class="form-select-setting-isMulti">
        <input type="checkbox" :checked="field.isMulti" @input="update" data-prop="isMulti"> 多选
      </label>
    </h3>
    <div>
      <div class="form-select-setting-list">
        <div v-for="(option, index) in options" :key="index" class="form-select-setting-option">
          <input type="text" v-model="option.value" maxlength="30">
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
      <div class="form-select-setting-operation">
        <button type="button" class="btn-text" @click="addOption">增加选项</button>
        <button type="button" class="btn-text" @click="showBatchModal">批量编辑</button>
      </div>
    </div>

    <base-modal 
      title="批量编辑选项" width="480px" class="form-select-setting-modal"
      :show.sync="batchModalShow" :mask-closeable="false">
      <div class="form-select-setting-batch">
        <textarea :value="optionText" @input="updateOptionText" rows="8"></textarea>
        <div class="form-select-setting-warn" v-if="errMessage">{{errMessage}}</div>
      </div>
      <template slot="footer">
        <span class="pull-left">每行对应一个选项</span>
        <button type="button" class="btn btn-primary" @click="batchEdit">保存</button>
      </template>
    </base-modal>

  </div>
</template>

<script>
import _ from 'lodash';
import Platform from '@src/platform';

const MAX_OPTION_NUM = 100;

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
    }
  },
  computed: {
    options(){
      return this.field.options || [];
    }
  },
  data(){
    return {
      index: this.field.options.length,
      batchModalShow: false, 
      optionText: '', //批量编辑文本
      errMessage: null
    }
  },
  methods: {
    update(event){
      let el = event.target;
      let prop = el.dataset.prop;
      let value = el.value;
      
      if(prop == 'isNull') value = el.checked ? 0 : 1;
      if(prop == 'isSearch') value = el.checked ? 1 : 0;
      if(prop == 'isMulti') {
        value = el.checked;
        //如果是多选，清空默认值
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
        value: '选项' + this.index,
        isDefault: false
      })

      this.$emit('input', {value: options, prop: 'options'})
    },
    delOption(option, index){
      if(this.options.length <= 1) return alert('至少保留一个选项')

      //如果是删除默认值，清空默认值
      if(option.isDefault) this.$emit('input', {value: null, prop: 'defaultValue'});

      let options = _.cloneDeep(this.options);
      options.splice(index, 1);

      this.$emit('input', {value: options, prop: 'options'})
    },
    //设置默认值
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
    validateOptions(options){
      if(!options[options.length - 1]) options = options.slice(0, -1);

      let message = [];
      //验证数量
      if(options.length > MAX_OPTION_NUM){
        message.push(`选项数量不能超过${MAX_OPTION_NUM}`);
      }

      //是否有空白项
      if(options.some(item => !item)){
        message.push(`不能存在空白项`);
      }

      //验证每一项长度
      let errIndex = options.map((item, index) => item.length > 30 ? index + 1 : -1).filter(item => item != -1);
      if(errIndex.length > 0){
        message.push(`第${errIndex.join('，')}行字数超过30字`);
      }

      return message.length > 0 ? message.join('\n') : null;
    },
    batchEdit(){
      let newValues = this.optionText.split('\n');
      this.errMessage = this.validateOptions(newValues);
      if(this.errMessage) return;

      let newOptions = newValues.map(item => ({value: item, isDefault: false}));
      //补全默认值
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

.form-select-setting-list{
  max-height: 420px;
  overflow: auto;
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
}

.form-select-setting-operation .btn-text{
  color: $color-primary;
}

.form-select-setting-delete,
.form-select-setting-default{
  margin: 0;
  padding: 0;
  width: 20px;
  height: 20px; 
}

.form-select-setting-delete{
  color: #F56C6C;
}
.form-select-setting-default{
  color: $color-primary
}
</style>


