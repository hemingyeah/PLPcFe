<template>
  <div class="form-design-setting-panel">
    <h3>基础设置</h3>
    <div class="form-design-form-group">
      <input type="text" placeholder="请输入字段标题" data-prop="displayName" :value="field.displayName" @input="update" maxlength="6">
    </div>
    <div class="form-design-form-group">
      <textarea placeholder="请在此添加描述信息" rows="3" data-prop="placeHolder" :value="field.placeHolder" @input="update"></textarea>
    </div>
    <div class="form-design-form-group">
      <label><input type="checkbox" :checked="field.isNull == 0" @input="update" data-prop="isNull">是否必填</label>
      <label title="勾选后该字段可在高级搜索中查询" v-tooltip>
        <input type="checkbox" :checked="field.isSearch == 1" @input="update" data-prop="isSearch">是否搜索
      </label>
    </div>
    <h3>
      选项设置
      <label class="form-design-isMulti">
        <input type="checkbox" :value="field.isMulti" @input="update" data-prop="isMulti">是否多选
      </label>
    </h3>
    <div>
      <div v-for="(option, index) in options" :key="index" class="form-design-select-option">
        <input type="text" v-model="option.value">
        <!-- <button>默认</button> -->
        <button @click="delOption(option, index)">删除</button>
      </div>
      <div>
        <button @click="addOption">增加选项</button>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';

export default {
  name: 'form-select-setting',
  props: {
    field: {
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
      index: this.field.options.length
    }
  },
  methods: {
    update(event){
      let el = event.target;
      let prop = el.dataset.prop;
      let value = el.value;
      
      if(prop == 'isNull') value = el.checked ? 0 : 1;
      if(prop == 'isSearch') value = el.checked ? 1 : 0;
      if(prop == 'isMulti') value = el.checked;

      this.$emit('input', {value, prop})
    },
    addOption(){
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

      let options = _.cloneDeep(this.options);
      options.splice(index, 1);

      this.$emit('input', {value: options, prop: 'options'})
    } 
  }
}
</script>

<style lang="scss">
.form-design-select-option{
  margin-bottom: 5px;
}

.form-design-isMulti{
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
</style>


