//TODO: 拖拽排序
//TODO: 拖拽添加
//TODO: 数据转换工具
import FormField from './FormField';
import {
  Modes, 
  FormFieldMap,
  PreivewComponents, 
  SettingComponents
} from './components';

/** 返回一个随机key */
function genRandomKey(){
  let random = Math.random() * 100000000 >> 0;
  return random.toString(16);
} 

const FormDesign = {
  name: 'form-design',
  props: {
    mode: {
      type: String,
      default: 'base'
    },
    value: {
      type: Array,
      default: () => []
    }
  },
  data(){
    let mode = Modes[this.mode];
    let modeFields = mode.fields || [];

    return {
      availableFields: modeFields.map(formType => FormFieldMap.get(formType)), //当前模式下可用字段
      currField: null //当前选择的字段
    }
  },
  methods: {
    /** 添加新字段 */
    addField(event, option){
      //TODO: 限制字段数量
      let newField = new FormField(option.formType);

      this.currField = newField;
      this.value.push(newField);
      this.$emit('input', this.value); 
    },
    /** 编辑选择的字段 */
    editField(event, field){
      this.currField = field;
    },
    deleteField(event, item){
      let value = this.value; 
      let index = value.indexOf(item);

      if(index >= 0){
        value.splice(index, 1);
        this.$emit('input', value)
      }
    }
  },
  mounted(){
    //console.log(this.mode)
  },
  render(h){
    //可用字段列表
    let fieldList = this.availableFields.map(field => {
      return <div class="form-design-field" onClick={e => this.addField(e, field)}>{field.name}</div>
    });
    
    //当前已选字段列表
    let previewList = this.value.map(currField => { 
      let formType = currField.formType;
      let comp = FormFieldMap.get(formType);

      let data = {
        props: {
          field: currField
        },
        on: {
          chooseField: event => this.editField(event, currField)
        }
      };
      let fieldPreview = h(comp.preview, data);

      return (
        <div class={{'form-design-preview-item': true,'form-design-preview-selected': currField == this.currField}}>
          <div style="width: 2px; background-color: #ddd;"></div>
          {fieldPreview}
          <button type="button" onClick={e => this.deleteField(e, currField)}>删除</button>
        </div>
      )
    });
    
    //字段设置
    let fieldSetting = null;
    if(this.currField){
      let formType = this.currField.formType;
      let comp = FormFieldMap.get(formType);

      let data = {
        key: genRandomKey(),
        props: {
          field: this.currField
        },
        on: {
          input: event => {
            let {prop, value} = event;
            this.currField[prop] = value;
          }
        }
      }

      fieldSetting = h(comp.setting, data)
    }

    return (
      <div class="form-design">
        <div class="form-design-panel">{fieldList}</div>
        <div class="form-design-main">
          <div class="form-design-preview">{previewList}</div>
        </div>
        <div class="form-design-setting">{fieldSetting}</div>
      </div>
    );
  },
  components: {...PreivewComponents, ...SettingComponents}
};

export default FormDesign;