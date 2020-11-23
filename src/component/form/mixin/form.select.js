import _ from 'lodash';
import Platform from '@src/platform';
import {
  SELECT_OPTION_MAX,
  SELECT_OPTION_LENGTH_MAX
} from '@src/component/form/config'

const FORM_SELECT = {
  name: 'form-select-mixin',
  computed: {
    isSystem() {
      return this.field.isSystem === 1
    },
    options(){
      return this.field.options || [];
    },
  },
  methods: {
    addOption(){
      if(this.options.length >= SELECT_OPTION_MAX) return Platform.alert(`选项数量不能超过${SELECT_OPTION_MAX}`);

      let options = _.cloneDeep(this.options);
      this.index++;

      options.push({
        value: ``,
        isDefault: false
      })

      this.$emit('input', {value: options, prop: 'options'})
    },
    // 设置默认值(默认和取消默认可以切换)
    setDefaultOption(option){
      if(this.field.isMulti) return Platform.alert('多选暂不支持设置默认值');
      if(!option.value) return Platform.alert('请先补全选项');
      let _formState = option.isDefault;

      this.options.forEach(item => item.isDefault = false);
      option.isDefault = !_formState;

      this.$emit('input', {value: this.options, prop: 'options'})
      this.$emit('input', {value: option.value, prop: 'defaultValue'});
    },
    //下拉多级菜单
    showMultiBatchModal(option,index){   
      if(option.children.length == 0 && index > option.deep ) return this.$message.warning('请先补全上一级选项');
      
      this.optionText = option.children.map(item => item.value).join('\n');
      this.batchModalShow = true;
      this.errMessage = null;
      this.currentLevel = index;
    },
    showBatchModal(){
      this.optionText = this.field.options.map(item => item.value).join('\n');
      this.batchModalShow = true;
      this.errMessage = null;
    },
    update(value, prop, isSetting = false){
      if(prop == 'isMulti') {
        // 如果是多选，清空默认值
        this.options.forEach(item => item.isDefault = false);
        this.$emit('input', {value: this.options, prop: 'options'})
        this.$emit('input', {value: null, prop: 'defaultValue'});
      }

      this.$emit('input', {value, prop, isSetting})
    },
    updateForDom(event){
      let el = event.target;
      let prop = el.dataset.prop;
      let value = el.value;
      
      this.update(value, prop)
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
  }
}

export default FORM_SELECT;